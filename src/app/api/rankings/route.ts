import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { websites, categories, users, websiteCategories } from '@/lib/db/schema';
import { eq, and, or, sql, desc, asc, inArray, gte } from 'drizzle-orm';


// 优化：减少查询复杂度，避免 Cloudflare 10ms CPU 限制
export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'popular';
    const category = searchParams.get('category');
    const priceFilter = searchParams.get('priceFilter') || 'all';
    const timeRange = searchParams.get('timeRange') || 'all';
    const searchQuery = searchParams.get('searchQuery');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // 限制最大 50
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

    // Add category filter - 优化：使用子查询替代先查询所有分类
    if (category && category !== 'all') {
      // 单次查询获取分类及其子分类 ID
      const categoryRecord = await db.query.categories.findFirst({
        where: eq(categories.slug, category),
        columns: { id: true, parentId: true },
      });

      if (categoryRecord) {
        // 获取子分类 ID（如果是父分类）
        let categoryIds = [categoryRecord.id];
        if (!categoryRecord.parentId) {
          const children = await db.query.categories.findMany({
            where: eq(categories.parentId, categoryRecord.id),
            columns: { id: true },
          });
          categoryIds = [categoryRecord.id, ...children.map(c => c.id)];
        }

        // 使用子查询获取网站 ID
        const websiteIds = await db
          .select({ websiteId: websiteCategories.websiteId })
          .from(websiteCategories)
          .where(inArray(websiteCategories.categoryId, categoryIds));

        if (websiteIds.length > 0) {
          conditions.push(inArray(websites.id, websiteIds.map(w => w.websiteId)));
        } else {
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

    // Special handling for category leaders - 优化：简化查询，避免深层嵌套
    if (type === 'category-leaders') {
      // 获取一级分类列表（不带嵌套）
      const categoriesList = await db.query.categories.findMany({
        where: sql`${categories.parentId} IS NULL`,
        columns: { id: true, name: true, slug: true },
        orderBy: asc(categories.sortOrder),
        limit: 10, // 限制分类数量
      });

      // 单次查询获取所有分类的 top 3 网站
      const categoryIds = categoriesList.map(c => c.id);

      // 使用 window function 获取每个分类的 top 3
      const topWebsites = await db
        .select({
          websiteId: websiteCategories.websiteId,
          categoryId: websiteCategories.categoryId,
        })
        .from(websiteCategories)
        .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
        .where(
          and(
            inArray(websiteCategories.categoryId, categoryIds),
            eq(websites.status, 'approved')
          )
        )
        .orderBy(desc(websites.qualityScore))
        .limit(30); // 10 分类 × 3 = 30

      // 按分类分组，取前 3
      const websiteIdsByCategory = new Map<number, number[]>();
      for (const row of topWebsites) {
        const ids = websiteIdsByCategory.get(row.categoryId) || [];
        if (ids.length < 3) {
          ids.push(row.websiteId);
          websiteIdsByCategory.set(row.categoryId, ids);
        }
      }

      // 获取网站详情（简化字段，不带嵌套关联）
      const allWebsiteIds = Array.from(websiteIdsByCategory.values()).flat();
      const websitesData = allWebsiteIds.length > 0
        ? await db.query.websites.findMany({
            where: inArray(websites.id, allWebsiteIds),
            columns: {
              id: true, title: true, slug: true, url: true, description: true,
              thumbnail: true, logoUrl: true, visits: true, likes: true,
              qualityScore: true, isFeatured: true, pricingModel: true,
            },
          })
        : [];

      const websiteMap = new Map(websitesData.map(w => [w.id, w]));

      // 构建结果
      const categoryLeaders = categoriesList.flatMap(cat => {
        const ids = websiteIdsByCategory.get(cat.id) || [];
        return ids.map((id, index) => ({
          ...websiteMap.get(id),
          categoryRank: index + 1,
          categoryName: cat.name,
        })).filter(w => w.id);
      });

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

    // Get websites with pagination - 优化：简化查询，减少关联数据
    const websitesList = await db.query.websites.findMany({
      where: and(...conditions),
      columns: {
        id: true, title: true, slug: true, url: true, description: true, tagline: true,
        thumbnail: true, logoUrl: true, visits: true, likes: true,
        qualityScore: true, isFeatured: true, isTrusted: true, pricingModel: true,
        hasFreeVersion: true, createdAt: true, categoryId: true,
      },
      orderBy: (websites, { desc }) => [orderByClause],
      limit: limit,
      offset: (page - 1) * limit,
    });

    // 单独获取分类信息（如果需要）
    const websiteIds = websitesList.map(w => w.id);
    const categoryData = websiteIds.length > 0
      ? await db
          .select({
            websiteId: websiteCategories.websiteId,
            categoryId: websiteCategories.categoryId,
            categoryName: categories.name,
            categorySlug: categories.slug,
          })
          .from(websiteCategories)
          .innerJoin(categories, eq(websiteCategories.categoryId, categories.id))
          .where(inArray(websiteCategories.websiteId, websiteIds))
      : [];

    // 构建分类映射
    const categoryMap = new Map<number, Array<{ id: number; name: string; slug: string }>>();
    for (const row of categoryData) {
      const cats = categoryMap.get(row.websiteId) || [];
      cats.push({ id: row.categoryId, name: row.categoryName, slug: row.categorySlug });
      categoryMap.set(row.websiteId, cats);
    }

    // 合并数据
    const websitesWithCategories = websitesList.map(website => ({
      ...website,
      websiteCategories: (categoryMap.get(website.id) || []).map(cat => ({
        category: cat,
      })),
    }));

    // Calculate trending score for monthly hot rankings
    let processedWebsites: typeof websitesWithCategories = websitesWithCategories;
    if (type === 'monthly-hot') {
      processedWebsites = websitesWithCategories.map(website => ({
        ...website,
        trendingScore: (website.visits * 0.7) + (website.likes * 0.3)
      })).sort((a, b) => ((b as any).trendingScore || 0) - ((a as any).trendingScore || 0));
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
