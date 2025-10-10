import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import RankingPage from '@/components/rankings/ranking-page';
import { Metadata } from 'next';

interface PageProps {
  params: {
    type: string;
  };
  searchParams: {
    category?: string;
  };
}

// Valid ranking types
const RANKING_TYPES = {
  'popular': {
    title: 'Most Popular AI Tools',
    description: 'AI tools ranked by user visits and engagement',
    sortField: 'visits',
    sortOrder: 'desc' as const
  },
  'top-rated': {
    title: 'Top Rated AI Tools',
    description: 'Highest quality AI tools based on our comprehensive review system',
    sortField: 'quality_score',
    sortOrder: 'desc' as const
  },
  'trending': {
    title: 'Trending AI Tools',
    description: 'AI tools gaining momentum and popularity recently',
    sortField: 'likes',
    sortOrder: 'desc' as const
  },
  'free': {
    title: 'Best Free AI Tools',
    description: 'Top-quality AI tools that are completely free to use',
    sortField: 'quality_score',
    sortOrder: 'desc' as const,
    filter: 'free'
  },
  'new': {
    title: 'Newest AI Tools',
    description: 'Recently added AI tools to our curated collection',
    sortField: 'created_at',
    sortOrder: 'desc' as const
  },
  'monthly-hot': {
    title: 'Monthly Hot AI Tools',
    description: 'Trending AI tools this month based on visits and engagement',
    sortField: 'visits',
    sortOrder: 'desc' as const
  },
  'category-leaders': {
    title: 'Category Leaders',
    description: 'Top performing AI tools in each category',
    sortField: 'quality_score',
    sortOrder: 'desc' as const
  }
};

export async function generateStaticParams() {
  return Object.keys(RANKING_TYPES).map((type) => ({
    type,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const rankingType = RANKING_TYPES[type as keyof typeof RANKING_TYPES];
  
  if (!rankingType) {
    return {
      title: 'Rankings Not Found',
    };
  }

  return {
    title: `${rankingType.title} | AI Navigation`,
    description: rankingType.description,
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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RankingPage
        type={type}
        rankingType={rankingType}
        websites={websites}
        categories={categories}
        selectedCategory={category}
      />
    </Suspense>
  );
}