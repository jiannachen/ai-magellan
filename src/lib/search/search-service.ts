import { db } from '@/lib/db/db';
import { websites } from '@/lib/db/schema';
import { eq, and, or, gte, like, inArray, sql } from 'drizzle-orm';

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
    slug: string;
    url: string;
    description: string;
    categoryId: number | null;
    thumbnail?: string;
    logoUrl?: string;
    visits: number;
    likes: number;
    qualityScore: number;
    isFeatured: boolean;
    isTrusted: boolean;
    createdAt: Date;
    pricingModel: string;
    hasFreeVersion: boolean;
    tags: string[];
    active: number;
    status: "pending" | "approved" | "rejected";
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
      sortBy: params.sortBy || 'qualityScore',
      sortOrder: params.sortOrder || 'desc' as 'desc',
      ...params
    };

    // 构建查询条件
    const conditions = [
      eq(websites.status, 'approved'),
      eq(websites.active, 1)
    ];

    // 全文搜索 - 搜索标题、描述、标签
    if (searchParams.q && searchParams.q.trim()) {
      const searchTerm = `%${searchParams.q.trim()}%`;
      conditions.push(
        or(
          like(websites.title, searchTerm),
          like(websites.description, searchTerm),
          like(websites.tags, searchTerm)
        )!
      );
    }

    // 分类过滤
    if (searchParams.category) {
      conditions.push(eq(websites.categoryId, parseInt(searchParams.category)));
    }

    // 定价模型过滤
    if (searchParams.pricingModel && searchParams.pricingModel.length > 0) {
      conditions.push(inArray(websites.pricingModel, searchParams.pricingModel));
    }

    // 质量评分过滤
    if (searchParams.minQualityScore && searchParams.minQualityScore > 0) {
      conditions.push(gte(websites.qualityScore, searchParams.minQualityScore));
    }

    // 特性过滤
    if (searchParams.isTrusted) {
      conditions.push(eq(websites.isTrusted, true));
    }

    if (searchParams.isFeatured) {
      conditions.push(eq(websites.isFeatured, true));
    }

    if (searchParams.hasFreePlan) {
      conditions.push(eq(websites.hasFreeVersion, true));
    }

    // 计算分页
    const skip = (searchParams.page - 1) * searchParams.limit;

    // 获取总数
    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(websites)
      .where(and(...conditions));

    // 执行搜索查询
    const websitesList = await db.query.websites.findMany({
      where: and(...conditions),
      columns: {
        id: true,
        title: true,
        slug: true,
        url: true,
        description: true,
        categoryId: true,
        thumbnail: true,
        logoUrl: true,
        visits: true,
        likes: true,
        qualityScore: true,
        isFeatured: true,
        isTrusted: true,
        createdAt: true,
        pricingModel: true,
        hasFreeVersion: true,
        tags: true,
        active: true,
        status: true,
      },
      limit: searchParams.limit,
      offset: skip,
    });

    // 计算分页信息
    const totalPages = Math.ceil(Number(totalCount) / searchParams.limit);
    const hasNextPage = searchParams.page < totalPages;
    const hasPrevPage = searchParams.page > 1;

    return {
      success: true,
      data: {
        websites: websitesList.map(website => ({
          ...website,
          thumbnail: website.thumbnail ?? undefined,
          logoUrl: website.logoUrl ?? undefined,
          status: website.status as "pending" | "approved" | "rejected"
        })),
        pagination: {
          page: searchParams.page,
          limit: searchParams.limit,
          total: Number(totalCount),
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
