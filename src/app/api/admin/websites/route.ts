import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

// Check if user is admin
function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses[0]?.emailAddress;

    if (!userEmail || !isAdminEmail(userEmail)) {
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

    const db = getDB();
    const offset = (page - 1) * pageSize;

    // Build query conditions
    let whereConditions: any = { status };
    if (categoryId && categoryId !== 'all') {
      whereConditions.categoryId = parseInt(categoryId);
    }

    // Get total count for pagination
    const totalCountResult = await db.query.websites.findMany({
      where: (websites, { eq, and }) => {
        const conditions = [eq(websites.status, status as any)];
        if (categoryId && categoryId !== 'all') {
          conditions.push(eq(websites.categoryId, parseInt(categoryId)));
        }
        return conditions.length > 1 ? and(...conditions) : conditions[0];
      }
    });
    const totalCount = totalCountResult.length;

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
