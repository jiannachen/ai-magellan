import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getDB } from '@/lib/db';
import { categories, websites, websiteCategories } from '@/lib/db/schema';
import { eq, and, desc, sql, like, or } from 'drizzle-orm';
import CategoryPage from '@/components/category/category-page';

// 使用 ISR 策略：保持缓存优势，同时定期更新数据
export const revalidate = 60; // 60秒重新验证
export const dynamicParams = true;

export async function generateStaticParams() {
  // For Cloudflare deployment, skip static generation at build time
  // Pages will be generated dynamically on first request (ISR with revalidate)
  // This avoids database connection issues during build
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    console.log('[Build] Skipping static param generation for categories (Cloudflare mode)');
    return [];
  }

  try {
    const db = getDB();
    const categoriesList = await db.query.categories.findMany({
      columns: { slug: true },
    });

    return categoriesList.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.warn('Failed to generate static params for categories:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = getDB();

  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
    columns: { name: true, slug: true },
  });

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} AI Territory - Explore ${category.name} Tools | AI Magellan`,
    description: `Navigate the ${category.name} AI territory. Discover and chart the best ${category.name} tools verified by our exploration team.`,
    openGraph: {
      title: `${category.name} AI Territory - AI Magellan`,
      description: `Best ${category.name} AI tools charted and verified by expert navigators`,
    },
  };
}

export default async function CategoryPageRoute({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const db = getDB();

  // 分页配置：每页20条，减少CPU时间消耗
  const pageSize = 20;
  const currentPage = page ? parseInt(page) : 1;
  const offset = (currentPage - 1) * pageSize;

  // 获取分类信息（必须先执行，后续查询依赖此结果）
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
    columns: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
    },
  });

  if (!category) {
    redirect(`/categories#${slug}`);
  }

  // 优化：使用 Promise.all 并行执行所有独立查询，减少总 CPU 时间
  const [
    websitesList,
    countResult,
    allCategoriesData,
    websiteCounts,
    parentCatData,
  ] = await Promise.all([
    // 1. 获取该分类下的网站列表
    db
      .select()
      .from(websites)
      .innerJoin(websiteCategories, eq(websites.id, websiteCategories.websiteId))
      .where(
        and(
          eq(websiteCategories.categoryId, category.id),
          eq(websites.status, 'approved')
        )
      )
      .orderBy(desc(websites.isFeatured), desc(websites.qualityScore))
      .limit(pageSize)
      .offset(offset),

    // 2. 获取总数用于分页
    db
      .select({ count: sql<number>`count(*)` })
      .from(websiteCategories)
      .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
      .where(
        and(
          eq(websiteCategories.categoryId, category.id),
          eq(websites.status, 'approved')
        )
      ),

    // 3. 获取所有分类（用于导航）
    db.query.categories.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
      },
      orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
    }),

    // 4. 获取所有分类的网站数量
    db
      .select({
        categoryId: websiteCategories.categoryId,
        count: sql<number>`count(distinct ${websiteCategories.websiteId})`.as('count'),
      })
      .from(websiteCategories)
      .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
      .where(eq(websites.status, 'approved'))
      .groupBy(websiteCategories.categoryId),

    // 5. 如果是子分类，获取父分类信息
    category.parentId
      ? db.query.categories.findFirst({
          where: eq(categories.id, category.parentId),
          columns: { id: true, name: true, slug: true },
        })
      : Promise.resolve(null),
  ]);

  // Extract websites from join result
  const websitesData = websitesList.map(row => row.websites);

  // 计算分页
  const count = countResult[0].count;
  const totalPages = Math.ceil(Number(count) / pageSize);

  // 创建分类计数 Map
  const countMap = new Map(
    websiteCounts.map(item => [item.categoryId, Number(item.count)])
  );

  // 合并分类和计数
  const categoriesWithCounts = allCategoriesData.map(cat => ({
    ...cat,
    _count: {
      websites: countMap.get(cat.id) || 0,
    },
  }));

  // 构建父分类信息（如果有）
  let parentCategory = null;
  if (parentCatData) {
    // 从 allCategoriesData 中获取子分类，避免额外查询
    const children = allCategoriesData
      .filter(cat => cat.parentId === parentCatData.id)
      .map(child => ({
        ...child,
        _count: {
          websites: countMap.get(child.id) || 0,
        },
      }));

    parentCategory = {
      ...parentCatData,
      children,
    };
  }

  return (
    <CategoryPage
      category={category}
      websites={websitesData}
      allCategories={categoriesWithCounts}
      parentCategory={parentCategory}
      pagination={{
        currentPage,
        totalPages,
        pageSize,
        total: Number(count),
      }}
    />
  );
}
