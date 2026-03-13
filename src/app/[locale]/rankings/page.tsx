import { Suspense } from 'react';
import { db } from '@/lib/db/db';
import { websites, categories, websiteCategories } from '@/lib/db/schema';
import { eq, isNull, asc, desc, or, sql, and } from 'drizzle-orm';
import RankingsHomePage from '@/components/rankings/rankings-home-page';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'AI Tools Expedition Rankings | AI Magellan',
  description: 'Comprehensive expedition rankings of AI tools by discovery success, quality, and explorer engagement. Navigate to the best-charted AI territories.',
};

const rankingWith = {
  websiteCategories: {
    with: {
      category: true,
    },
  },
  submitter: {
    columns: {
      id: true as const,
      name: true as const,
    },
  },
} as const;

async function getRankingsData() {
  const approvedCondition = eq(websites.status, 'approved');

  // Run all ranking queries + categories + total count in parallel
  const [popular, topRated, trending, free, newest, categoriesList, [{ total }]] = await Promise.all([
    db.query.websites.findMany({
      where: approvedCondition,
      with: rankingWith,
      orderBy: [desc(websites.visits)],
      limit: 20,
    }),
    db.query.websites.findMany({
      where: approvedCondition,
      with: rankingWith,
      orderBy: [desc(websites.qualityScore)],
      limit: 20,
    }),
    db.query.websites.findMany({
      where: approvedCondition,
      with: rankingWith,
      orderBy: [desc(websites.likes)],
      limit: 20,
    }),
    db.query.websites.findMany({
      where: and(
        approvedCondition,
        or(eq(websites.pricingModel, 'free'), eq(websites.hasFreeVersion, true))
      ),
      with: rankingWith,
      orderBy: [desc(websites.qualityScore)],
      limit: 20,
    }),
    db.query.websites.findMany({
      where: approvedCondition,
      with: rankingWith,
      orderBy: [desc(websites.createdAt)],
      limit: 20,
    }),
    // Categories with children
    db.query.categories.findMany({
      where: isNull(categories.parentId),
      with: {
        children: {
          orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
        },
      },
      orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
    }),
    // Total approved count
    db.select({ total: sql<number>`count(*)` }).from(websites).where(approvedCondition),
  ]);

  // Single query to get counts for all categories at once (replaces N+1)
  const categoryCounts = await db
    .select({
      categoryId: websiteCategories.categoryId,
      count: sql<number>`count(*)`,
    })
    .from(websiteCategories)
    .innerJoin(websites, and(
      eq(websiteCategories.websiteId, websites.id),
      approvedCondition
    ))
    .groupBy(websiteCategories.categoryId);

  const countMap = new Map(categoryCounts.map(c => [c.categoryId, Number(c.count)]));

  const categoriesWithCounts = categoriesList.map(cat => ({
    ...cat,
    _count: { websites: countMap.get(cat.id) || 0 },
    toolCount: countMap.get(cat.id) || 0,
    children: cat.children.map(child => ({
      ...child,
      _count: { websites: countMap.get(child.id) || 0 },
    })),
  }));

  return {
    rankings: { popular, topRated, trending, free, newest },
    categories: categoriesWithCounts,
    totalTools: Number(total),
  };
}

export default async function RankingsPage() {
  const data = await getRankingsData();
  const tRank = await getTranslations('pages.rankings');

  return (
    <Suspense fallback={<div>{tRank('loading')}</div>}>
      <RankingsHomePage {...data} />
    </Suspense>
  );
}
