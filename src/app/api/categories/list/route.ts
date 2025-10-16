import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 只获取一级分类，并包含子分类
    const categories = await prisma.category.findMany({
      where: {
        parent_id: null
      },
      include: {
        children: {
          orderBy: { sort_order: 'asc' }
        }
      },
      orderBy: { sort_order: 'asc' }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}