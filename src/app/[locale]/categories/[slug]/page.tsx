import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getDB } from '@/lib/db';
import { categories, websites, websiteCategories } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
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

  // 优化：只执行必要的查询，移除未使用的 allCategories 相关查询
  // 只选择 CompactCard 和客户端过滤所需的字段，避免传递大量不必要的数据
  const [
    websitesList,
    countResult,
  ] = await Promise.all([
    // 1. 获取该分类下的网站列表（分页）- 只选择必要字段
    db
      .select({
        id: websites.id,
        title: websites.title,
        slug: websites.slug,
        url: websites.url,
        description: websites.description,
        thumbnail: websites.thumbnail,
        logoUrl: websites.logoUrl,
        pricingModel: websites.pricingModel,
        hasFreeVersion: websites.hasFreeVersion,
        qualityScore: websites.qualityScore,
        isFeatured: websites.isFeatured,
        isTrusted: websites.isTrusted,
        sslEnabled: websites.sslEnabled,
        visits: websites.visits,
        likes: websites.likes,
        tagline: websites.tagline,
        createdAt: websites.createdAt,
      })
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
  ]);

  // websitesList 已经是扁平结构，不再需要 map
  const websitesData = websitesList;

  // 计算分页
  const count = countResult[0].count;
  const totalPages = Math.ceil(Number(count) / pageSize);

  // 如果是子分类，获取父分类及兄弟分类信息（用于导航）
  let parentCategory = null;
  if (category.parentId) {
    // 并行获取父分类信息和兄弟分类
    const [parentCatData, siblingCategories, siblingCounts] = await Promise.all([
      db.query.categories.findFirst({
        where: eq(categories.id, category.parentId),
        columns: { id: true, name: true, slug: true },
      }),
      // 获取同级子分类
      db.query.categories.findMany({
        where: eq(categories.parentId, category.parentId),
        columns: { id: true, name: true, slug: true, parentId: true },
        orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
      }),
      // 只获取同级分类的网站计数（而非所有分类）
      db
        .select({
          categoryId: websiteCategories.categoryId,
          count: sql<number>`count(distinct ${websiteCategories.websiteId})`.as('count'),
        })
        .from(websiteCategories)
        .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
        .innerJoin(categories, eq(websiteCategories.categoryId, categories.id))
        .where(
          and(
            eq(categories.parentId, category.parentId),
            eq(websites.status, 'approved')
          )
        )
        .groupBy(websiteCategories.categoryId),
    ]);

    if (parentCatData) {
      const countMap = new Map(
        siblingCounts.map(item => [item.categoryId, Number(item.count)])
      );

      parentCategory = {
        ...parentCatData,
        children: siblingCategories.map(child => ({
          ...child,
          _count: {
            websites: countMap.get(child.id) || 0,
          },
        })),
      };
    }
  }

  return (
    <CategoryPage
      category={category}
      websites={websitesData}
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
