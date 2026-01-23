import { Metadata } from 'next';
import { getDB } from '@/lib/db';
import { categories, websites, websiteCategories } from '@/lib/db/schema';
import { isNull, eq, sql } from 'drizzle-orm';
import CategoriesListPage from '@/components/category/categories-list-page';

// 使用 ISR 策略：缓存页面60秒，减少重复数据库查询
export const revalidate = 60;

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

  // 优化：使用 Promise.all 并行执行两个独立查询，避免 N+1 问题
  const [categoriesData, allCategoryCounts] = await Promise.all([
    // 1. 获取所有一级分类及其子分类
    db.query.categories.findMany({
      where: isNull(categories.parentId),
      with: {
        children: {
          orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
        },
      },
      orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
    }),

    // 2. 一次性获取所有分类的网站数量（避免 N+1 查询）
    db
      .select({
        categoryId: websiteCategories.categoryId,
        count: sql<number>`count(distinct ${websiteCategories.websiteId})`.as('count'),
      })
      .from(websiteCategories)
      .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
      .where(eq(websites.status, 'approved'))
      .groupBy(websiteCategories.categoryId),
  ]);

  // 创建分类计数 Map，O(1) 查找
  const countMap = new Map(
    allCategoryCounts.map(item => [item.categoryId, Number(item.count)])
  );

  // 在内存中组装数据，无额外数据库查询
  const categoriesWithCounts = categoriesData.map((category) => {
    const subcategories = category.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      toolCount: countMap.get(child.id) || 0,
      description: `${child.name}相关的AI工具`,
    }));

    // 一级分类的工具数量 = 所有子分类的工具数量之和
    const mainCount = subcategories.reduce((sum, sub) => sum + sub.toolCount, 0);

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      sort_order: category.sortOrder,
      toolCount: mainCount,
      subcategories,
    };
  });

  return <CategoriesListPage categories={categoriesWithCounts} />;
}
