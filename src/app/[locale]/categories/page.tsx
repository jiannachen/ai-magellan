import { Metadata } from 'next';
import { prisma } from '@/lib/db/db';
import CategoriesListPage from '@/components/category/categories-list-page';

export const metadata: Metadata = {
  title: 'AI Tool Territories - Navigate by Purpose | AI Magellan',
  description: 'Explore AI tools mapped by territories and use cases. Chart your course through categorized AI solutions with expert guidance.',
  openGraph: {
    title: 'AI Tool Territories - Navigate by Purpose',
    description: 'Navigate through AI tool territories organized by category and purpose',
  },
};

export default async function CategoriesPage() {
  // Get all categories with tool counts
  const categoriesWithCounts = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
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
    orderBy: {
      name: 'asc'
    }
  });

  // Get featured tools from each category
  const featuredByCategory = await Promise.all(
    categoriesWithCounts.map(async (category) => {
      const tools = await prisma.website.findMany({
        where: {
          category_id: category.id,
          status: 'approved',
          is_featured: true
        },
        select: {
          id: true,
          title: true,
          thumbnail: true,
          tagline: true,
          quality_score: true
        },
        take: 3,
        orderBy: {
          quality_score: 'desc'
        }
      });

      return {
        ...category,
        featuredTools: tools,
        toolCount: category._count.websites
      };
    })
  );

  return <CategoriesListPage categories={featuredByCategory} />;
}