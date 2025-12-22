import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { websites, categories, users, websiteCategories } from '@/lib/db/schema';
import { eq, and, or, sql, desc, asc, inArray, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'popular';
    const category = searchParams.get('category');
    const priceFilter = searchParams.get('priceFilter') || 'all';
    const timeRange = searchParams.get('timeRange') || 'all';
    const searchQuery = searchParams.get('searchQuery');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Calculate date ranges
    const now = new Date();
    let dateFilter: Date | null = null;

    switch (timeRange) {
      case 'today':
        dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateFilter = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        dateFilter = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        dateFilter = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        break;
    }

    // Build where conditions
    const conditions = [eq(websites.status, 'approved')];

    // Add time filter
    if (dateFilter && timeRange !== 'all') {
      conditions.push(gte(websites.createdAt, dateFilter));
    }

    // Add category filter (use websiteCategories many-to-many table)
    if (category && category !== 'all') {
      const allCategories = await db.query.categories.findMany({
        with: { children: true },
      });

      const categoryRecord = allCategories.find(cat => cat.slug === category);
      if (categoryRecord) {
        // If parent category, include all child categories
        const categoryIds = !categoryRecord.parentId && categoryRecord.children && categoryRecord.children.length > 0
          ? [categoryRecord.id, ...categoryRecord.children.map((child: any) => child.id)]
          : [categoryRecord.id];

        // Use websiteCategories many-to-many table for querying
        const websiteIds = await db
          .select({ websiteId: websiteCategories.websiteId })
          .from(websiteCategories)
          .where(inArray(websiteCategories.categoryId, categoryIds));

        if (websiteIds.length > 0) {
          conditions.push(inArray(websites.id, websiteIds.map(w => w.websiteId)));
        } else {
          // No websites in this category, return empty
          conditions.push(sql`false`);
        }
      }
    }

    // Add pricing filter (user selection has priority over type='free')
    if (priceFilter && priceFilter !== 'all') {
      if (priceFilter === 'free') {
        conditions.push(
          or(
            eq(websites.pricingModel, 'free'),
            eq(websites.hasFreeVersion, true)
          )!
        );
      } else if (priceFilter === 'paid') {
        conditions.push(
          and(
            eq(websites.pricingModel, 'paid'),
            eq(websites.hasFreeVersion, false)
          )!
        );
      } else if (priceFilter === 'freemium') {
        conditions.push(eq(websites.pricingModel, 'freemium'));
      }
    } else if (type === 'free') {
      // If no user price filter, apply type='free' default
      conditions.push(
        or(
          eq(websites.pricingModel, 'free'),
          eq(websites.hasFreeVersion, true)
        )!
      );
    }

    // Add search query filter
    if (searchQuery && searchQuery.trim()) {
      conditions.push(
        or(
          sql`${websites.title} ILIKE ${`%${searchQuery}%`}`,
          sql`${websites.description} ILIKE ${`%${searchQuery}%`}`,
          sql`${websites.tagline} ILIKE ${`%${searchQuery}%`}`
        )!
      );
    }

    // Special handling for category leaders
    if (type === 'category-leaders') {
      const categoriesList = await db.query.categories.findMany({
        with: {
          websiteCategories: {
            with: {
              website: {
                with: {
                  websiteCategories: {
                    with: {
                      category: true,
                    },
                  },
                  submitter: {
                    columns: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
            limit: 3,
          },
        },
      });

      const categoryLeaders = categoriesList.flatMap(cat =>
        cat.websiteCategories
          .filter(wc => wc.website && wc.website.status === 'approved')
          .sort((a, b) => (b.website?.qualityScore || 0) - (a.website?.qualityScore || 0))
          .slice(0, 3)
          .map((wc, index) => ({
            ...wc.website,
            categoryRank: index + 1,
            categoryName: cat.name
          }))
      );

      return NextResponse.json({
        success: true,
        data: {
          websites: categoryLeaders,
          pagination: {
            page: 1,
            limit: categoryLeaders.length,
            total: categoryLeaders.length,
            pages: 1
          },
          meta: {
            type,
            category,
            timeRange,
            totalTools: categoryLeaders.length,
            groupedByCategory: true
          }
        }
      });
    }

    // Get total count
    const [{ count: total }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(websites)
      .where(and(...conditions));

    // Determine order by
    let orderByClause;
    switch (type) {
      case 'popular':
        orderByClause = desc(websites.visits);
        break;
      case 'top-rated':
        orderByClause = desc(websites.qualityScore);
        break;
      case 'trending':
        orderByClause = desc(websites.likes);
        break;
      case 'newest':
        orderByClause = desc(websites.createdAt);
        break;
      case 'monthly-hot':
        orderByClause = desc(websites.visits);
        break;
      default:
        orderByClause = desc(websites.qualityScore);
    }

    // Get websites with pagination
    const websitesList = await db.query.websites.findMany({
      where: and(...conditions),
      with: {
        websiteCategories: {
          with: {
            category: true,
          },
        },
        submitter: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (websites, { desc }) => [orderByClause],
      limit: limit,
      offset: (page - 1) * limit,
    });

    // Calculate trending score for monthly hot rankings
    let processedWebsites = websitesList;
    if (type === 'monthly-hot') {
      processedWebsites = websitesList.map(website => ({
        ...website,
        trendingScore: (website.visits * 0.7) + (website.likes * 0.3)
      })).sort((a, b) => (b as any).trendingScore - (a as any).trendingScore);
    }

    return NextResponse.json({
      success: true,
      data: {
        websites: processedWebsites,
        pagination: {
          page,
          limit,
          total: Number(total),
          pages: Math.ceil(Number(total) / limit)
        },
        meta: {
          type,
          category,
          timeRange,
          totalTools: Number(total),
          dateRange: dateFilter ? {
            from: dateFilter.toISOString(),
            to: now.toISOString()
          } : null
        }
      }
    });

  } catch (error) {
    console.error('Rankings API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch rankings' },
      { status: 500 }
    );
  }
}
