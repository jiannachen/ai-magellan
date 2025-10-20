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
  // 优化：使用单次查询获取所有分类及其网站数量统计
  const categories = await prisma.category.findMany({
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
          websiteCategories: {
            where: {
              website: {
                status: 'approved'
              }
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
              websiteCategories: {
                where: {
                  website: {
                    status: 'approved'
                  }
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

  // 转换数据结构以匹配组件需求
  const categoriesWithCounts = categories.map(category => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    sort_order: category.sort_order,
    toolCount: category._count.websiteCategories,
    subcategories: category.children.map(child => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      toolCount: child._count.websiteCategories,
      description: `${child.name}相关的AI工具`
    }))
  }));

  return <CategoriesListPage categories={categoriesWithCounts} />;
}