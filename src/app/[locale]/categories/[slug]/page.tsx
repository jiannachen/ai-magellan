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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = getDB();

  // 获取分类信息
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

  // 获取该分类下的网站（使用多分类关系）
  const websitesList = await db
    .select()
    .from(websites)
    .innerJoin(websiteCategories, eq(websites.id, websiteCategories.websiteId))
    .where(
      and(
        eq(websiteCategories.categoryId, category.id),
        eq(websites.status, 'approved')
      )
    )
    .orderBy(desc(websites.isFeatured), desc(websites.qualityScore));

  // Extract websites from join result
  const websitesData = websitesList.map(row => row.websites);

  // 获取所有分类（用于导航）
  const allCategoriesData = await db.query.categories.findMany({
    columns: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
    },
    orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
  });

  // 使用单次查询获取所有分类的网站数量，避免 N+1 问题
  const websiteCounts = await db
    .select({
      categoryId: websiteCategories.categoryId,
      count: sql<number>`count(distinct ${websiteCategories.websiteId})`.as('count'),
    })
    .from(websiteCategories)
    .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
    .where(eq(websites.status, 'approved'))
    .groupBy(websiteCategories.categoryId);

  // 创建一个 Map 用于快速查找
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

  // 如果是子分类，获取父分类信息
  let parentCategory = null;
  if (category.parentId) {
    const parentCat = await db.query.categories.findFirst({
      where: eq(categories.id, category.parentId),
      columns: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (parentCat) {
      // Get children
      const children = await db.query.categories.findMany({
        where: eq(categories.parentId, parentCat.id),
        columns: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: (table, { asc }) => [asc(table.sortOrder)],
      });

      // 使用已经获取的 countMap 来添加计数，避免额外查询
      const childrenWithCounts = children.map(child => ({
        ...child,
        _count: {
          websites: countMap.get(child.id) || 0,
        },
      }));

      parentCategory = {
        ...parentCat,
        children: childrenWithCounts,
      };
    }
  }

  return (
    <CategoryPage
      category={category}
      websites={websitesData}
      allCategories={categoriesWithCounts}
      parentCategory={parentCategory}
    />
  );
}
