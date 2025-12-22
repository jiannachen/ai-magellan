import { notFound } from 'next/navigation';
import { db } from '@/lib/db/db';
import { websites, websiteCategories } from '@/lib/db/schema';
import { eq, and, or, desc, gte, inArray, sql, like } from 'drizzle-orm';
import RankingPage from '@/components/rankings/ranking-page';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{
    type: string;
  }>;
  searchParams: Promise<{
    category?: string;
    price?: string;
    timeRange?: string;
    search?: string;
    page?: string;
  }>;
}

// Valid ranking types - 融入 Magellan 探索主题
const RANKING_TYPES = {
  'popular': {
    sortField: 'visits',
    sortOrder: 'desc' as const
  },
  'top-rated': {
    sortField: 'qualityScore',
    sortOrder: 'desc' as const
  },
  'trending': {
    sortField: 'likes',
    sortOrder: 'desc' as const
  },
  'free': {
    sortField: 'qualityScore',
    sortOrder: 'desc' as const,
    filter: 'free' as const
  },
  'new': {
    sortField: 'createdAt',
    sortOrder: 'desc' as const
  },
  'monthly-hot': {
    sortField: 'visits',
    sortOrder: 'desc' as const
  },
  'category-leaders': {
    sortField: 'qualityScore',
    sortOrder: 'desc' as const
  }
} as const;

export const dynamicParams = true;
// 使用 ISR 策略：60秒缓存，支持动态参数
export const revalidate = 60;

export async function generateStaticParams() {
  return Object.keys(RANKING_TYPES).map((type) => ({
    type,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const base = RANKING_TYPES[type as keyof typeof RANKING_TYPES];
  const tRank = await getTranslations('pages.rankings');

  if (!base) {
    return {
      title: 'Rankings Not Found',
    };
  }

  const title = tRank(`types.${type}.title`);
  const description = tRank(`types.${type}.description`);

  return {
    title: `${title} | AI Magellan`,
    description
  };
}

interface RankingDataParams {
  type: string;
  category?: string;
  priceFilter?: string;
  timeRange?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

async function getRankingData({
  type,
  category,
  priceFilter = 'all',
  timeRange = 'all',
  searchQuery,
  page = 1,
  limit = 20,
}: RankingDataParams) {
  const rankingType = RANKING_TYPES[type as keyof typeof RANKING_TYPES];

  if (!rankingType) {
    return null;
  }

  // Build where conditions
  const conditions = [eq(websites.status, 'approved')];

  // Add pricing filter (user selection has priority over ranking type filter)
  if (priceFilter && priceFilter !== 'all') {
    // User explicitly selected a price filter
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
  } else if ('filter' in rankingType && rankingType.filter === 'free') {
    // No user price filter, use ranking type default (for /rankings/free)
    conditions.push(
      or(
        eq(websites.pricingModel, 'free'),
        eq(websites.hasFreeVersion, true)
      )!
    );
  }

  // Add time range filter
  if (timeRange && timeRange !== 'all') {
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
    }

    if (dateFilter) {
      conditions.push(gte(websites.createdAt, dateFilter));
    }
  }

  // Add category filter
  if (category && category !== 'all') {
    const allCategories = await db.query.categories.findMany({
      with: { children: true },
    });

    const categoryRecord = allCategories.find(cat => cat.slug === category);
    if (categoryRecord) {
      // 如果是父分类，包含所有子分类
      if (!categoryRecord.parentId && categoryRecord.children && categoryRecord.children.length > 0) {
        const categoryIds = [categoryRecord.id, ...categoryRecord.children.map((child: any) => child.id)];
        // 使用 websiteCategories 表进行多对多查询
        const websiteIds = await db
          .select({ websiteId: websiteCategories.websiteId })
          .from(websiteCategories)
          .where(inArray(websiteCategories.categoryId, categoryIds));

        if (websiteIds.length > 0) {
          conditions.push(inArray(websites.id, websiteIds.map(w => w.websiteId)));
        }
      } else {
        // 单个分类筛选
        const websiteIds = await db
          .select({ websiteId: websiteCategories.websiteId })
          .from(websiteCategories)
          .where(eq(websiteCategories.categoryId, categoryRecord.id));

        if (websiteIds.length > 0) {
          conditions.push(inArray(websites.id, websiteIds.map(w => w.websiteId)));
        }
      }
    }
  }

  // Add search filter
  if (searchQuery && searchQuery.trim()) {
    conditions.push(
      or(
        like(websites.title, `%${searchQuery}%`),
        like(websites.description, `%${searchQuery}%`),
        like(websites.tagline, `%${searchQuery}%`)
      )!
    );
  }

  // Get total count for pagination
  const [{ count: total }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(websites)
    .where(and(...conditions));

  // Get order by clause
  let orderByClause;
  if (type === 'popular') {
    orderByClause = desc(websites.visits);
  } else if (type === 'top-rated') {
    orderByClause = desc(websites.qualityScore);
  } else if (type === 'trending') {
    orderByClause = desc(websites.likes);
  } else if (type === 'new') {
    orderByClause = desc(websites.createdAt);
  } else {
    orderByClause = desc(websites.qualityScore);
  }

  // Get websites with sorting and pagination
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
    orderBy: [orderByClause],
    limit: limit,
    offset: (page - 1) * limit,
  });

  return {
    websites: websitesList,
    pagination: {
      page,
      limit,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / limit),
      hasMore: page * limit < Number(total),
    },
  };
}

async function getCategories() {
  // 获取所有分类，包括父子关系
  const allCategories = await db.query.categories.findMany({
    with: {
      children: true,
    },
    orderBy: (categories, { asc }) => [asc(categories.sortOrder), asc(categories.name)],
  });

  // 只返回一级分类（parentId为null），它们的children已经通过with自动包含
  return allCategories.filter(cat => !cat.parentId);
}

export default async function RankingTypePage({ params, searchParams }: PageProps) {
  const { type } = await params;
  const { category, price, timeRange, search, page } = await searchParams;

  const rankingType = RANKING_TYPES[type as keyof typeof RANKING_TYPES];

  if (!rankingType) {
    notFound();
  }

  // 并行获取数据
  const [rankingData, categoriesList] = await Promise.all([
    getRankingData({
      type,
      category,
      priceFilter: price,
      timeRange,
      searchQuery: search,
      page: page ? parseInt(page) : 1,
      limit: 20,
    }),
    getCategories()
  ]);

  if (!rankingData) {
    notFound();
  }

  const tRank = await getTranslations('pages.rankings');

  const rankingTypeInfo = {
    title: tRank(`types.${type}.title`),
    description: tRank(`types.${type}.description`)
  };

  return (
    <RankingPage
      type={type}
      rankingType={rankingTypeInfo}
      websites={rankingData.websites}
      categories={categoriesList}
      pagination={rankingData.pagination}
      initialFilters={{
        category: category || 'all',
        price: price || 'all',
        timeRange: timeRange || 'all',
        search: search || '',
      }}
    />
  );
}
