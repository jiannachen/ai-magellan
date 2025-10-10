import { Metadata } from 'next';
import { prisma } from '@/lib/db/db';
import CategoriesListPage from '@/components/category/categories-list-page';

export const metadata: Metadata = {
  title: 'AI Tools Categories - Browse by Use Case',
  description: 'Explore AI tools organized by categories. Find the perfect AI tool for your specific needs.',
  openGraph: {
    title: 'AI Tools Categories',
    description: 'Browse AI tools by category - Chat, Art, Writing, Coding and more',
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