import { prisma } from '@/lib/db/db';

interface SearchParams {
  q?: string;
  category?: string;
  pricingModel?: string[];
  minQualityScore?: number;
  isTrusted?: boolean;
  isFeatured?: boolean;
  hasFreePlan?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  websites: {
    id: number;
    title: string;
    url: string;
    description: string;
    category_id: number;
    thumbnail: string | null;
    visits: number;
    likes: number;
    quality_score: number;
    is_featured: boolean;
    is_trusted: boolean;
    created_at: Date;
    pricing_model: string;
    has_free_version: boolean;
    tags: string | null;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  searchParams: SearchParams;
}

export async function searchWebsites(params: SearchParams): Promise<{
  success: boolean;
  data?: SearchResult;
  error?: string;
  message?: string;
}> {
  try {
    // 设置默认值
    const searchParams = {
      page: params.page || 1,
      limit: params.limit || 20,
      sortBy: params.sortBy || 'quality_score',
      sortOrder: params.sortOrder || 'desc' as 'desc',
      ...params
    };

    // 构建Prisma查询条件
    const where: any = {
      status: 'approved', // 只返回已批准的工具
      active: 1 // 只返回活跃的工具
    };

    // 全文搜索 - 搜索标题、描述、标签
    if (searchParams.q && searchParams.q.trim()) {
      const searchTerm = searchParams.q.trim();
      where.OR = [
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          tags: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        }
      ];
    }

    // 分类过滤
    if (searchParams.category) {
      where.category_id = parseInt(searchParams.category);
    }

    // 定价模型过滤
    if (searchParams.pricingModel && searchParams.pricingModel.length > 0) {
      where.pricing_model = {
        in: searchParams.pricingModel
      };
    }

    // 质量评分过滤
    if (searchParams.minQualityScore && searchParams.minQualityScore > 0) {
      where.quality_score = {
        gte: searchParams.minQualityScore
      };
    }

    // 特性过滤
    if (searchParams.isTrusted) {
      where.is_trusted = true;
    }

    if (searchParams.isFeatured) {
      where.is_featured = true;
    }

    if (searchParams.hasFreePlan) {
      where.has_free_version = true;
    }

    // 排序逻辑
    let orderBy: any = [];
    switch (searchParams.sortBy) {
      case 'created_at':
        orderBy = [{ created_at: searchParams.sortOrder }];
        break;
      case 'visits':
        orderBy = [{ visits: searchParams.sortOrder }];
        break;
      case 'likes':
        orderBy = [{ likes: searchParams.sortOrder }];
        break;
      case 'title':
        orderBy = [{ title: searchParams.sortOrder }];
        break;
      case 'quality_score':
      default:
        // 默认排序：精选优先，然后按质量评分
        orderBy = [
          { is_featured: 'desc' },
          { quality_score: 'desc' }
        ];
        break;
    }

    // 计算分页
    const skip = (searchParams.page - 1) * searchParams.limit;

    // 执行搜索查询
    const [websites, totalCount] = await Promise.all([
      prisma.website.findMany({
        where,
        orderBy,
        skip,
        take: searchParams.limit,
        select: {
          id: true,
          title: true,
          url: true,
          description: true,
          category_id: true,
          thumbnail: true,
          visits: true,
          likes: true,
          quality_score: true,
          is_featured: true,
          is_trusted: true,
          created_at: true,
          pricing_model: true,
          has_free_version: true,
          tags: true
        }
      }),
      prisma.website.count({ where })
    ]);

    // 计算分页信息
    const totalPages = Math.ceil(totalCount / searchParams.limit);
    const hasNextPage = searchParams.page < totalPages;
    const hasPrevPage = searchParams.page > 1;

    return {
      success: true,
      data: {
        websites,
        pagination: {
          page: searchParams.page,
          limit: searchParams.limit,
          total: totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        searchParams
      }
    };

  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: 'Internal server error',
      message: 'Failed to perform search'
    };
  }
}