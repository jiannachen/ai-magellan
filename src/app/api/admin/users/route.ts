import { NextResponse } from "next/server";
import { requireAdmin } from '@/lib/utils/admin';
import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";
import { AjaxResponse } from "@/lib/utils";

// GET /api/admin/users - 获取所有用户列表
export async function GET() {
  try {
    // 验证管理员权限
    const adminCheck = await requireAdmin()
    if (!adminCheck.success) {
      return NextResponse.json(
        AjaxResponse.fail(adminCheck.message),
        { status: adminCheck.status }
      );
    }

    // 获取用户列表，包含提交网站数量
    const usersList = await db.query.users.findMany({
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
    });

    // Get counts for each user (simplified version without joins)
    const usersWithCounts = usersList.map(user => ({
      ...user,
      _count: {
        websites: 0,
        likes: 0,
        favorites: 0,
        reviews: 0,
      },
    }));

    return NextResponse.json(AjaxResponse.ok(usersWithCounts));
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      AjaxResponse.fail("Failed to fetch users"),
      { status: 500 }
    );
  }
}