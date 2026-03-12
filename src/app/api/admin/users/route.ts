import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { getDB } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and, or, ilike, sql } from "drizzle-orm";
import { AjaxResponse } from "@/lib/utils";

// GET /api/admin/users - 获取用户列表（分页）
export async function GET(request: NextRequest) {
  try {
    const db = getDB();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        AjaxResponse.fail("Unauthorized"),
        { status: 401 }
      );
    }

    const currentDbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true },
    });

    if (!currentDbUser || currentDbUser.role !== 'admin') {
      return NextResponse.json(
        AjaxResponse.fail("Access denied"),
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')));
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [];
    if (role !== 'all') {
      conditions.push(eq(users.role, role));
    }
    if (status !== 'all') {
      conditions.push(eq(users.status, status));
    }
    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )!
      );
    }

    const whereClause = conditions.length > 0
      ? (conditions.length > 1 ? and(...conditions) : conditions[0])
      : undefined;

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);

    // Get paginated users
    const usersList = await db.query.users.findMany({
      where: whereClause,
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
      limit: pageSize,
      offset,
    });

    const usersWithCounts = usersList.map(user => ({
      ...user,
      _count: {
        websites: 0,
        likes: 0,
        favorites: 0,
        reviews: 0,
      },
    }));

    return NextResponse.json(AjaxResponse.ok({
      users: usersWithCounts,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      AjaxResponse.fail("Failed to fetch users"),
      { status: 500 }
    );
  }
}
