import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { websites, categories, websiteCategories } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;
    const db = getDB();
    const { searchParams } = new URL(request.url);

    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // 获取分类信息
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
      columns: { id: true, name: true, slug: true },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    // 并行查询：网站列表和总数
    const [websitesList, countResult] = await Promise.all([
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
        .limit(limit)
        .offset(offset),

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

    const total = Number(countResult[0].count);
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      success: true,
      data: {
        websites: websitesList,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore,
        },
      },
    });
  } catch (error) {
    console.error('Category websites API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch category websites' },
      { status: 500 }
    );
  }
}
