import { Metadata } from 'next';
import { db } from '@/lib/db/db';
import { categories, websites, websiteCategories } from '@/lib/db/schema';
import { isNull, eq, sql } from 'drizzle-orm';
import CategoriesListPage from '@/components/category/categories-list-page';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'AI Tool Territories - Navigate by Purpose | AI Magellan',
  description: 'Explore AI tools mapped by territories and use cases. Chart your course through categorized AI solutions with expert guidance.',
  openGraph: {
    title: 'AI Tool Territories - Navigate by Purpose',
    description: 'Navigate through AI tool territories organized by category and purpose',
  },
};

export default async function CategoriesPage() {
  // 并行查询：分类树 + 所有分类的网站计数
  const [categoriesData, allCounts] = await Promise.all([
    db.query.categories.findMany({
      where: isNull(categories.parentId),
      with: {
        children: {
          orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
        },
      },
      orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
    }),
    db
      .select({
        categoryId: websiteCategories.categoryId,
        count: sql<number>`count(distinct ${websiteCategories.websiteId})`,
      })
      .from(websiteCategories)
      .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
      .where(eq(websites.status, 'approved'))
      .groupBy(websiteCategories.categoryId),
  ]);

  const countMap = new Map(allCounts.map(c => [c.categoryId, Number(c.count)]));

  const categoriesWithCounts = categoriesData.map((category) => {
    const subcategories = category.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      toolCount: countMap.get(child.id) || 0,
      description: `${child.name}相关的AI工具`,
    }));

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      sort_order: category.sortOrder,
      toolCount: subcategories.reduce((sum, sub) => sum + sub.toolCount, 0),
      subcategories,
    };
  });

  return <CategoriesListPage categories={categoriesWithCounts} />;
}
