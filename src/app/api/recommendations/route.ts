import { db } from '@/lib/db/db';
import { websites } from '@/lib/db/schema';
import { eq, and, or, gte, ne, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

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

    return NextResponse.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
    });

  } catch (error) {
    console.error('获取推荐失败:', error);
    return NextResponse.json(
      { error: '获取推荐失败' },
      { status: 500 }
    );
  }
}

// 记录用户行为用于改进推荐算法
export async function POST(request: NextRequest) {
  try {
    const { websiteId, action, categoryId } = await request.json();
    
    // 这里可以记录用户行为，用于改进推荐算法
    // 比如记录用户点击、喜欢、分享等行为
    
    // 暂时只是简单地增加访问量
    if (action === 'visit' && websiteId) {
      await db
        .update(websites)
        .set({ visits: sql`${websites.visits} + 1` })
        .where(eq(websites.id, websiteId));
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('记录用户行为失败:', error);
    return NextResponse.json(
      { error: '记录失败' },
      { status: 500 }
    );
  }
}