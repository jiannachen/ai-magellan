import { Suspense } from 'react';
import { getDB } from '@/lib/db';
import { websites, categories, websiteCategories } from '@/lib/db/schema';
import { eq, isNull, asc, desc, or, sql, inArray } from 'drizzle-orm';
import RankingsHomePage from '@/components/rankings/rankings-home-page';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'AI Tools Expedition Rankings | AI Magellan',
  description: 'Comprehensive expedition rankings of AI tools by discovery success, quality, and explorer engagement. Navigate to the best-charted AI territories.',
};

// 使用 ISR 策略：60秒缓存，减少重复数据库查询
export const revalidate = 60;

// 优化：移除深层嵌套的 with 关联，减少 CPU 时间消耗
async function getRankingsData() {
  const db = getDB();

  // 使用简化的查询，只获取必要字段，不带关联
  const websiteColumns = {
    id: true, title: true, slug: true, url: true, description: true, tagline: true,
    thumbnail: true, logoUrl: true, visits: true, likes: true,
    qualityScore: true, isFeatured: true, isTrusted: true, pricingModel: true,
    hasFreeVersion: true, createdAt: true, categoryId: true,
  } as const;

  const [
    popularWebsites,
    topRatedWebsites,
    trendingWebsites,
    freeWebsites,
    newestWebsites,
    categoriesList,
    totalToolsResult
  ] = await Promise.all([
    // Popular - 按访问量排序（不带关联）
    db.query.websites.findMany({
      where: eq(websites.status, 'approved'),
      columns: websiteColumns,
      orderBy: [desc(websites.visits)],
      limit: 10, // 减少到 10 条
    }),

    // Top Rated - 按质量分数排序
    db.query.websites.findMany({
      where: eq(websites.status, 'approved'),
      columns: websiteColumns,
      orderBy: [desc(websites.qualityScore)],
      limit: 10,
    }),

    // Trending - 按点赞数排序
    db.query.websites.findMany({
      where: eq(websites.status, 'approved'),
      columns: websiteColumns,
      orderBy: [desc(websites.likes)],
      limit: 10,
    }),

    // Free - 免费工具按质量分数排序
    db.query.websites.findMany({
      where: or(
        eq(websites.pricingModel, 'free'),
        eq(websites.hasFreeVersion, true)
      ),
      columns: websiteColumns,
      orderBy: [desc(websites.qualityScore)],
      limit: 10,
    }),

    // Newest - 按创建时间排序
    db.query.websites.findMany({
      where: eq(websites.status, 'approved'),
      columns: websiteColumns,
      orderBy: [desc(websites.createdAt)],
      limit: 10,
    }),

    // Get categories (只获取一级分类，并包含子分类)
    db.query.categories.findMany({
      where: isNull(categories.parentId),
      with: {
        children: {
          orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
        },
      },
      orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
    }),

    // Get total count
    db.select({ count: sql<number>`count(*)` })
      .from(websites)
      .where(eq(websites.status, 'approved'))
      .then(result => result[0].count)
  ]);

  // 收集所有唯一的网站 ID
  const allWebsiteIds = [...new Set([
    ...popularWebsites.map(w => w.id),
    ...topRatedWebsites.map(w => w.id),
    ...trendingWebsites.map(w => w.id),
    ...freeWebsites.map(w => w.id),
    ...newestWebsites.map(w => w.id),
  ])];

  // 批量获取分类信息
  const [categoryData, categoryCounts] = await Promise.all([
    // 获取网站的分类关联
    allWebsiteIds.length > 0
      ? db
          .select({
            websiteId: websiteCategories.websiteId,
            categoryId: websiteCategories.categoryId,
            categoryName: categories.name,
            categorySlug: categories.slug,
          })
          .from(websiteCategories)
          .innerJoin(categories, eq(websiteCategories.categoryId, categories.id))
          .where(inArray(websiteCategories.websiteId, allWebsiteIds))
      : Promise.resolve([]),

    // 获取分类计数
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

  // 构建分类映射
  const categoryMap = new Map<number, Array<{ id: number; name: string; slug: string }>>();
  for (const row of categoryData) {
    const cats = categoryMap.get(row.websiteId) || [];
    cats.push({ id: row.categoryId, name: row.categoryName, slug: row.categorySlug });
    categoryMap.set(row.websiteId, cats);
  }

  // 添加分类信息到网站
  const addCategoriesToWebsites = (websiteList: typeof popularWebsites) =>
    websiteList.map(website => ({
      ...website,
      websiteCategories: (categoryMap.get(website.id) || []).map(cat => ({
        category: cat,
      })),
    }));

  const countMap = new Map(
    categoryCounts.map(item => [item.categoryId, Number(item.count)])
  );

  // Build categories with counts
  const categoriesWithCounts = categoriesList.map(cat => ({
    ...cat,
    _count: {
      websites: countMap.get(cat.id) || 0,
    },
    toolCount: countMap.get(cat.id) || 0,
    children: cat.children.map(child => ({
      ...child,
      _count: {
        websites: countMap.get(child.id) || 0,
      },
    })),
  }));

  return {
    rankings: {
      popular: addCategoriesToWebsites(popularWebsites),
      topRated: addCategoriesToWebsites(topRatedWebsites),
      trending: addCategoriesToWebsites(trendingWebsites),
      free: addCategoriesToWebsites(freeWebsites),
      newest: addCategoriesToWebsites(newestWebsites),
    },
    categories: categoriesWithCounts,
    totalTools: Number(totalToolsResult),
  };
}

export default async function RankingsPage() {
  const data = await getRankingsData();
  const tRank = await getTranslations('pages.rankings');

  return (
    <Suspense fallback={<div>{tRank('loading')}</div>}>
      <RankingsHomePage {...data} />
    </Suspense>
  );
}
