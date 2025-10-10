import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import RankingsHomePage from '@/components/rankings/rankings-home-page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Tools Rankings | AI Navigation',
  description: 'Comprehensive rankings of AI tools by popularity, quality, and user engagement. Find the best AI tools ranked across different categories.',
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

  // Get categories with tool counts
  const categories = await prisma.category.findMany({
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
    orderBy: { name: 'asc' }
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

  return (
    <Suspense fallback={<div>Loading rankings...</div>}>
      <RankingsHomePage {...data} />
    </Suspense>
  );
}