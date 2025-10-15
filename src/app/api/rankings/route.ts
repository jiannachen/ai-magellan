import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'popular';
    const category = searchParams.get('category');
    const timeRange = searchParams.get('timeRange') || 'all'; // all, today, week, month, quarter, year
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Calculate date ranges
    const now = new Date();
    let dateFilter: any = {};
    
    switch (timeRange) {
      case 'today':
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFilter = { gte: startOfDay };
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { gte: weekAgo };
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        dateFilter = { gte: monthAgo };
        break;
      case 'quarter':
        const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        dateFilter = { gte: quarterAgo };
        break;
      case 'year':
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        dateFilter = { gte: yearAgo };
        break;
      default:
        // 'all' - no date filter
        break;
    }

    // Define ranking types with advanced time-based sorting
    const rankingConfigs = {
      popular: { 
        orderBy: { visits: 'desc' as const },
        timeBasedField: 'created_at'
      },
      'top-rated': { 
        orderBy: { quality_score: 'desc' as const },
        timeBasedField: 'created_at'
      },
      trending: { 
        orderBy: { likes: 'desc' as const },
        timeBasedField: 'created_at'
      },
      newest: { 
        orderBy: { created_at: 'desc' as const },
        timeBasedField: 'created_at'
      },
      'monthly-hot': {
        orderBy: [
          { visits: 'desc' as const },
          { likes: 'desc' as const }
        ],
        timeBasedField: 'created_at'
      },
      'category-leaders': {
        orderBy: { quality_score: 'desc' as const },
        timeBasedField: 'created_at',
        groupByCategory: true
      },
      free: { 
        orderBy: { quality_score: 'desc' as const },
        timeBasedField: 'created_at',
        where: {
          OR: [
            { pricing_model: 'free' },
            { has_free_version: true }
          ]
        }
      }
    };

    const config = rankingConfigs[type as keyof typeof rankingConfigs];
    if (!config) {
      return NextResponse.json(
        { success: false, message: 'Invalid ranking type' },
        { status: 400 }
      );
    }

    // Build where condition
    const whereCondition: any = {
      status: 'approved',
      ...('where' in config ? config.where : {})
    };

    // Add time range filter if specified
    if (timeRange !== 'all' && config.timeBasedField) {
      whereCondition[config.timeBasedField] = dateFilter;
    }

    // Add category filter if specified
    if (category) {
      const allCategories = await prisma.category.findMany({
        include: { children: true }
      });

      const categoryRecord = allCategories.find(cat => cat.slug === category);
      if (categoryRecord) {
        // 如果是一级分类，包含该分类及其所有子分类
        if (!categoryRecord.parent_id) {
          const categoryIds = [categoryRecord.id];
          if (categoryRecord.children) {
            categoryIds.push(...categoryRecord.children.map((child: any) => child.id));
          }
          whereCondition.category_id = { in: categoryIds };
        } else {
          // 如果是二级分类，只筛选该分类
          whereCondition.category_id = categoryRecord.id;
        }
      }
    }

    // Special handling for category leaders
    if (type === 'category-leaders') {
      const categories = await prisma.category.findMany({
        include: {
          websites: {
            where: whereCondition,
            include: {
              category: true,
              submitter: {
                select: {
                  id: true,
                  name: true,
                }
              }
            },
            orderBy: config.orderBy,
            take: 3 // Top 3 per category
          }
        }
      });

      const categoryLeaders = categories.flatMap(cat => 
        cat.websites.map((website, index) => ({
          ...website,
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

    // Get total count for pagination
    const total = await prisma.website.count({
      where: whereCondition
    });

    // Get websites with pagination
    const websites = await prisma.website.findMany({
      where: whereCondition,
      include: {
        category: true,
        submitter: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: config.orderBy,
      take: limit,
      skip: (page - 1) * limit
    });

    // Calculate trending score for monthly hot rankings
    let processedWebsites = websites;
    if (type === 'monthly-hot') {
      processedWebsites = websites.map(website => ({
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
          total,
          pages: Math.ceil(total / limit)
        },
        meta: {
          type,
          category,
          timeRange,
          totalTools: total,
          dateRange: timeRange !== 'all' ? {
            from: dateFilter.gte?.toISOString(),
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