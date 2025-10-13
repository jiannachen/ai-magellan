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
  // Get all categories with their subcategories and website counts
  const categoriesWithCounts = await prisma.category.findMany({
    where: {
      parent_id: null  // 只获取一级分类
    },
    select: {
      id: true,
      name: true,
      slug: true,
      sort_order: true,
      _count: {
        select: {
          websites: {
            where: {
              status: 'approved'
            }
          }
        }
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          sort_order: true,
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
          sort_order: 'asc'
        }
      }
    },
    orderBy: {
      sort_order: 'asc'
    }
  });

  // Transform to match component structure
  const categoriesWithSubcategories = categoriesWithCounts.map(category => ({
    ...category,
    toolCount: category._count.websites,
    subcategories: category.children.map(child => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      toolCount: child._count.websites,
      description: `${child.name}相关的AI工具`
    }))
  }));

  return <CategoriesListPage categories={categoriesWithSubcategories} />;
}