import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { categories } from '@/lib/db/schema';
import { isNull, asc } from 'drizzle-orm';

export async function GET() {
  try {
    // 只获取一级分类，并包含子分类
    const categoriesList = await db.query.categories.findMany({
      where: isNull(categories.parentId),
      with: {
        children: {
          orderBy: (categories, { asc }) => [asc(categories.sortOrder)]
        }
      },
      orderBy: (categories, { asc }) => [asc(categories.sortOrder)]
    });

    return NextResponse.json(categoriesList);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
