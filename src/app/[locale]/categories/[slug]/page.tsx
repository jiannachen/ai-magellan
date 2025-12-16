import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/db';
import { categories, websites, websiteCategories } from '@/lib/db/schema';
import { eq, and, desc, sql, isNull, asc } from 'drizzle-orm';
import CategoryPage from '@/components/category/category-page';

// 此页面依赖运行时数据库查询，强制动态渲染避免构建期静态化导致的 DYNAMIC_SERVER_USAGE 错误
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateStaticParams() {
  try {
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

  // Get website counts for categories
  const categoriesWithCounts = await Promise.all(
    allCategoriesData.map(async (cat) => {
      const [{ count }] = await db
        .select({ count: sql<number>`count(distinct ${websiteCategories.websiteId})` })
        .from(websiteCategories)
        .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
        .where(
          and(
            eq(websiteCategories.categoryId, cat.id),
            eq(websites.status, 'approved')
          )
        );

      return {
        ...cat,
        _count: {
          websites: Number(count),
        },
      };
    })
  );

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
      // Get children manually
      const children = await db.query.categories.findMany({
        where: eq(categories.parentId, parentCat.id),
        columns: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: (table, { asc }) => [asc(table.sortOrder)],
      });

      // Get counts for children
      const childrenWithCounts = await Promise.all(
        children.map(async (child) => {
          const [{ count }] = await db
            .select({ count: sql<number>`count(distinct ${websiteCategories.websiteId})` })
            .from(websiteCategories)
            .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
            .where(
              and(
                eq(websiteCategories.categoryId, child.id),
                eq(websites.status, 'approved')
              )
            );

          return {
            ...child,
            _count: {
              websites: Number(count),
            },
          };
        })
      );

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
