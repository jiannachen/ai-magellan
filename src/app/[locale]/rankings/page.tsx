import { Suspense } from 'react';
import { getDB } from '@/lib/db';
import { websites, categories } from '@/lib/db/schema';
import { eq, isNull, asc, desc, or, sql } from 'drizzle-orm';
import RankingsHomePage from '@/components/rankings/rankings-home-page';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'AI Tools Expedition Rankings | AI Magellan',
  description: 'Comprehensive expedition rankings of AI tools by discovery success, quality, and explorer engagement. Navigate to the best-charted AI territories.',
};

async function getRankingsData() {
  const db = getDB();
  // Get approved websites for different rankings
  const websitesList = await db.query.websites.findMany({
    where: eq(websites.status, 'approved'),
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
  });

  // Get categories with tool counts (只获取一级分类，并包含子分类)
  const categoriesList = await db.query.categories.findMany({
    where: isNull(categories.parentId),
    with: {
      children: {
        orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
      },
    },
    orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
  });

  // Get counts for each category
  const categoriesWithCounts = await Promise.all(
    categoriesList.map(async (cat) => {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(websites)
        .where(
          eq(websites.categoryId, cat.id)
        );

      // Get counts for children
      const childrenWithCounts = await Promise.all(
        cat.children.map(async (child) => {
          const [{ count: childCount }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(websites)
            .where(
              eq(websites.categoryId, child.id)
            );

          return {
            ...child,
            _count: {
              websites: Number(childCount),
            },
          };
        })
      );

      return {
        ...cat,
        _count: {
          websites: Number(count),
        },
        children: childrenWithCounts,
      };
    })
  );

  // Calculate different rankings
  const rankings = {
    popular: [...websitesList]
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 20),
    topRated: [...websitesList]
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 20),
    trending: [...websitesList]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 20),
    free: websitesList
      .filter(w => w.pricingModel === 'free' || w.hasFreeVersion)
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 20),
    newest: [...websitesList]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20),
  };

  return {
    rankings,
    categories: categoriesWithCounts.map(cat => ({
      ...cat,
      toolCount: cat._count.websites,
    })),
    totalTools: websitesList.length,
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
