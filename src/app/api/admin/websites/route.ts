import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { websites } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/utils/admin';

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.success) {
      return NextResponse.json({ error: adminCheck.message }, { status: adminCheck.status });
    }

    const db = getDB();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const countsOnly = searchParams.get('counts') === 'true';

    // 优化：单次请求获取所有状态的计数
    if (countsOnly) {
      const counts = await db
        .select({
          status: websites.status,
          count: sql<number>`count(*)`,
        })
        .from(websites)
        .groupBy(websites.status);

      const statusCounts: Record<string, number> = { pending: 0, approved: 0, rejected: 0 };
      counts.forEach(({ status, count }) => {
        statusCounts[status] = count;
      });

      return NextResponse.json({ counts: statusCounts });
    }

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
