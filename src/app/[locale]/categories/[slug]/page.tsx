import { cache } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/db';
import { categories, websites, websiteCategories } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import CategoryPage from '@/components/category/category-page';

// 使用 ISR 策略：保持缓存优势，同时定期更新数据
export const revalidate = 60; // 60秒重新验证
export const dynamicParams = true;

// 使用 React.cache 去重 generateMetadata 和页面的分类查询
const getCategory = cache(async (slug: string) => {
  return db.query.categories.findFirst({
    where: eq(categories.slug, slug),
    columns: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
    },
  });
});

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
  const category = await getCategory(slug);

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

  const category = await getCategory(slug);

  if (!category) {
    redirect(`/categories#${slug}`);
  }

  // 只查询 CompactCard 和客户端过滤/排序需要的字段，避免传输大量 JSON 数据
  const websitesList = await db
    .select({
      id: websites.id,
      title: websites.title,
      slug: websites.slug,
      url: websites.url,
      description: websites.description,
      tagline: websites.tagline,
      thumbnail: websites.thumbnail,
      logoUrl: websites.logoUrl,
      pricingModel: websites.pricingModel,
      hasFreeVersion: websites.hasFreeVersion,
      qualityScore: websites.qualityScore,
      isTrusted: websites.isTrusted,
      isFeatured: websites.isFeatured,
      sslEnabled: websites.sslEnabled,
      visits: websites.visits,
      likes: websites.likes,
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
    .orderBy(desc(websites.isFeatured), desc(websites.qualityScore));

  return (
    <CategoryPage
      category={category}
      websites={websitesList}
    />
  );
}
