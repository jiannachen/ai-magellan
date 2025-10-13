import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import RankingsHomePage from '@/components/rankings/rankings-home-page';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'AI Tools Expedition Rankings | AI Magellan',
  description: 'Comprehensive expedition rankings of AI tools by discovery success, quality, and explorer engagement. Navigate to the best-charted AI territories.',
};

async function getRankingsData() {
  // Get approved websites for different rankings
  const websites = await prisma.website.findMany({
    where: {
      status: 'approved'
    },
    include: {
      category: true,
      submitter: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });

  // Get categories with tool counts (只获取一级分类)
  const categories = await prisma.category.findMany({
    where: {
      parent_id: null
    },
    include: {
      _count: {
        select: {
          websites: {
            where: {
              status: 'approved'
            }
          }
        }
      }
    },
    orderBy: { sort_order: 'asc' }
  });

  // Calculate different rankings
  const rankings = {
    popular: websites
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 20),
    topRated: websites
      .sort((a, b) => b.quality_score - a.quality_score)
      .slice(0, 20),
    trending: websites
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 20),
    free: websites
      .filter(w => w.pricing_model === 'free' || w.has_free_version)
      .sort((a, b) => b.quality_score - a.quality_score)
      .slice(0, 20),
    newest: websites
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)
  };

  return {
    rankings,
    categories: categories.map(cat => ({
      ...cat,
      toolCount: cat._count.websites
    })),
    totalTools: websites.length
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
