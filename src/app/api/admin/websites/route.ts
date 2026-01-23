import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { users, websites } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const db = getDB();

    // Only use auth() - avoid expensive currentUser() call
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user from database to check admin role
    const currentDbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true },
    });

    if (!currentDbUser || currentDbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status') || 'pending';
    const categoryId = searchParams.get('categoryId');

    // Validate parameters
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const offset = (page - 1) * pageSize;

    // Build where conditions
    const buildConditions = () => {
      const conditions = [eq(websites.status, status as any)];
      if (categoryId && categoryId !== 'all') {
        conditions.push(eq(websites.categoryId, parseInt(categoryId)));
      }
      return conditions;
    };

    const whereConditions = buildConditions();

    // Get total count for pagination - 优化：使用 count(*) 避免获取所有记录
    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(websites)
      .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0]);

    // Get paginated websites
    const websitesList = await db.query.websites.findMany({
      where: (websites, { eq, and }) => {
        const conditions = [eq(websites.status, status as any)];
        if (categoryId && categoryId !== 'all') {
          conditions.push(eq(websites.categoryId, parseInt(categoryId)));
        }
        return conditions.length > 1 ? and(...conditions) : conditions[0];
      },
      with: {
        websiteCategories: {
          with: {
            category: true,
          },
        },
        submitter: true,
      },
      orderBy: (websites, { desc }) => [desc(websites.createdAt)],
      limit: pageSize,
      offset: offset,
    });

    return NextResponse.json({
      websites: websitesList,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching websites:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
