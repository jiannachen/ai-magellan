import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db/db';
import { websites, categories } from '@/lib/db/schema';
import { eq, and, or, isNull, asc, desc, inArray } from 'drizzle-orm';
import RankingPage from '@/components/rankings/ranking-page';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{
    type: string;
  }>;
  searchParams: Promise<{
    category?: string;
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
export const dynamic = 'force-dynamic'; // Force dynamic rendering due to searchParams usage
export const revalidate = 0; // No caching for dynamic pages

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

async function getRankingData(type: string, categorySlug?: string) {
  const rankingType = RANKING_TYPES[type as keyof typeof RANKING_TYPES];

  if (!rankingType) {
    return null;
  }

  // Build where conditions
  const conditions = [eq(websites.status, 'approved')];

  // Add category filter if specified
  if (categorySlug) {
    const allCategories = await db.query.categories.findMany({
      with: { children: true },
    });

    const selectedCategory = allCategories.find(cat => cat.slug === categorySlug);
    if (selectedCategory) {
      // 如果是一级分类，包含该分类及其所有子分类
      if (!selectedCategory.parentId) {
        const categoryIds = [selectedCategory.id];
        if (selectedCategory.children) {
          categoryIds.push(...selectedCategory.children.map(child => child.id));
        }
        conditions.push(inArray(websites.categoryId, categoryIds));
      } else {
        // 如果是二级分类，只筛选该分类
        conditions.push(eq(websites.categoryId, selectedCategory.id));
      }
    }
  }

  // Add pricing filter for free tools
  if ('filter' in rankingType && rankingType.filter === 'free') {
    conditions.push(
      or(
        eq(websites.pricingModel, 'free'),
        eq(websites.hasFreeVersion, true)
      )!
    );
  }

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

  // Get websites with sorting
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
    limit: 100,
  });

  return websitesList;
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
  const { category } = await searchParams;

  const rankingType = RANKING_TYPES[type as keyof typeof RANKING_TYPES];

  if (!rankingType) {
    notFound();
  }

  const [websitesList, categoriesList] = await Promise.all([
    getRankingData(type, category),
    getCategories()
  ]);

  if (!websitesList) {
    notFound();
  }

  const tRank = await getTranslations('pages.rankings');

  const rankingTypeInfo = {
    title: tRank(`types.${type}.title`),
    description: tRank(`types.${type}.description`)
  };

  return (
    <Suspense fallback={<div>{tRank('loading')}</div>}>
      <RankingPage
        type={type}
        rankingType={rankingTypeInfo}
        websites={websitesList}
        categories={categoriesList}
        selectedCategory={category}
      />
    </Suspense>
  );
}
