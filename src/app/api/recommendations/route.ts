import { db } from '@/lib/db/db';
import { websites } from '@/lib/db/schema';
import { eq, and, or, gte, ne } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { AjaxResponse } from '@/lib/utils';

// 获取网站推荐
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '6');
    const excludeId = searchParams.get('exclude');

    // Build where conditions
    const conditions = [
      eq(websites.status, 'approved'),
      eq(websites.active, 1),
    ];

    if (categoryId) {
      conditions.push(eq(websites.categoryId, parseInt(categoryId)));
    }

    if (excludeId) {
      conditions.push(ne(websites.id, parseInt(excludeId)));
    }

    // Add quality filters
    conditions.push(
      or(
        eq(websites.isFeatured, true),
        gte(websites.qualityScore, 70),
        and(
          gte(websites.visits, 50),
          gte(websites.likes, 10)
        )!
      )!
    );

    // 获取推荐网站（基于质量分数和受欢迎程度）
    const recommendations = await db.query.websites.findMany({
      where: and(...conditions),
      columns: {
        id: true,
        title: true,
        url: true,
        description: true,
        thumbnail: true,
        categoryId: true,
        visits: true,
        likes: true,
        qualityScore: true,
        isFeatured: true,
      },
      limit: limit,
    });

    return NextResponse.json(AjaxResponse.ok(recommendations));

  } catch (error) {
    console.error('获取推荐失败:', error);
    return NextResponse.json(AjaxResponse.fail('获取推荐失败'), { status: 500 });
  }
}