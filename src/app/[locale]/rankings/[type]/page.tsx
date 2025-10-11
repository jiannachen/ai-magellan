import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import RankingPage from '@/components/rankings/ranking-page';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: {
    type: string;
  };
  searchParams: {
    category?: string;
  };
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
  let whereCondition: any = {
    status: 'approved'
  };

  // Add category filter if specified
  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug }
    });
    if (category) {
      whereCondition.category_id = category.id;
    }
  }

  // Add pricing filter for free tools
  if (rankingType.filter === 'free') {
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
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
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
