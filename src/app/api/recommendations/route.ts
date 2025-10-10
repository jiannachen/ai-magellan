import { prisma } from '@/lib/db/db';
import { NextRequest, NextResponse } from 'next/server';

// 获取网站推荐
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '6');
    const excludeId = searchParams.get('exclude');

    // 获取推荐网站（基于质量分数和受欢迎程度）
    const recommendations = await prisma.website.findMany({
      where: {
        status: 'approved',
        active: 1,
        ...(categoryId && { category_id: parseInt(categoryId) }),
        ...(excludeId && { id: { not: parseInt(excludeId) } }),
        OR: [
          { is_featured: true },
          { quality_score: { gte: 70 } },
          { 
            AND: [
              { visits: { gte: 50 } },
              { likes: { gte: 10 } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        url: true,
        description: true,
        thumbnail: true,
        category_id: true,
        visits: true,
        likes: true,
        quality_score: true,
        is_featured: true,
      },
      orderBy: [
        { is_featured: 'desc' },
        { quality_score: 'desc' },
        { visits: 'desc' },
        { likes: 'desc' }
      ],
      take: limit,
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
      await prisma.website.update({
        where: { id: websiteId },
        data: { visits: { increment: 1 } }
      });
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