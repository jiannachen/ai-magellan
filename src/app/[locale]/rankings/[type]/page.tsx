import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
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
    sortField: 'quality_score',
    sortOrder: 'desc' as const
  },
  'trending': {
    sortField: 'likes',
    sortOrder: 'desc' as const
  },
  'free': {
    sortField: 'quality_score',
    sortOrder: 'desc' as const,
    filter: 'free' as const
  },
  'new': {
    sortField: 'created_at',
    sortOrder: 'desc' as const
  },
  'monthly-hot': {
    sortField: 'visits',
    sortOrder: 'desc' as const
  },
  'category-leaders': {
    sortField: 'quality_score',
    sortOrder: 'desc' as const
  }
} as const;

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

  // Build where condition
  const whereCondition: { status: string; category_id?: number | { in: number[] }; OR?: Array<{ pricing_model?: string; has_free_version?: boolean }> } = {
    status: 'approved'
  };

  // Add category filter if specified
  if (categorySlug) {
    const allCategories = await prisma.category.findMany({
      include: { children: true }
    });

    const selectedCategory = allCategories.find(cat => cat.slug === categorySlug);
    if (selectedCategory) {
      // 如果是一级分类，包含该分类及其所有子分类
      if (!selectedCategory.parent_id) {
        const categoryIds = [selectedCategory.id];
        if (selectedCategory.children) {
          categoryIds.push(...selectedCategory.children.map(child => child.id));
        }
        whereCondition.category_id = { in: categoryIds };
      } else {
        // 如果是二级分类，只筛选该分类
        whereCondition.category_id = selectedCategory.id;
      }
    }
  }

  // Add pricing filter for free tools
  if ('filter' in rankingType && rankingType.filter === 'free') {
    whereCondition.OR = [
      { pricing_model: 'free' },
      { has_free_version: true }
    ];
  }

  // Get websites with sorting
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
    orderBy: {
      [rankingType.sortField]: rankingType.sortOrder
    },
    take: 100 // Limit to top 100
  });

  return websites;
}

async function getCategories() {
  // 获取所有分类，包括父子关系
  const allCategories = await prisma.category.findMany({
    include: {
      children: true
    },
    orderBy: [
      { sort_order: 'asc' },
      { name: 'asc' }
    ]
  });

  // 只返回一级分类（parent_id为null），它们的children已经通过include自动包含
  return allCategories.filter(cat => !cat.parent_id);
}

export default async function RankingTypePage({ params, searchParams }: PageProps) {
  const { type } = await params;
  const { category } = await searchParams;
  
  const rankingType = RANKING_TYPES[type as keyof typeof RANKING_TYPES];
  
  if (!rankingType) {
    notFound();
  }

  const [websites, categories] = await Promise.all([
    getRankingData(type, category),
    getCategories()
  ]);

  if (!websites) {
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
        websites={websites}
        categories={categories}
        selectedCategory={category}
      />
    </Suspense>
  );
}
