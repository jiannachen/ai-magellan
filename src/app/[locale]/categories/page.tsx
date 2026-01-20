import { Metadata } from 'next';
import { getDB } from '@/lib/db';
import { categories, websites, websiteCategories } from '@/lib/db/schema';
import { isNull, eq, and, sql } from 'drizzle-orm';
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
  const db = getDB();
  // 获取所有一级分类及其子分类
  const categoriesData = await db.query.categories.findMany({
    where: isNull(categories.parentId),
    with: {
      children: {
        orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
      },
    },
    orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
  });

  // 获取每个分类的网站数量
  const categoriesWithCounts = await Promise.all(
    categoriesData.map(async (category) => {
      // 获取子分类及其网站数量
      const subcategories = await Promise.all(
        category.children.map(async (child) => {
          const result = await db
            .select({ count: sql<number>`count(distinct ${websiteCategories.websiteId})` })
            .from(websiteCategories)
            .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
            .where(
              and(
                eq(websiteCategories.categoryId, child.id),
                eq(websites.status, 'approved')
              )
            );

          const childCount = result[0]?.count || 0;

          return {
            id: child.id,
            name: child.name,
            slug: child.slug,
            toolCount: Number(childCount),
            description: `${child.name}相关的AI工具`,
          };
        })
      );

      // 一级分类的工具数量 = 所有子分类的工具数量之和
      const mainCount = subcategories.reduce((sum, sub) => sum + sub.toolCount, 0);

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        sort_order: category.sortOrder,
        toolCount: Number(mainCount),
        subcategories,
      };
    })
  );

  return <CategoriesListPage categories={categoriesWithCounts} />;
}
