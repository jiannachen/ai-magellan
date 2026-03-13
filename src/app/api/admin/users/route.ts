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

    const usersList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        status: users.status,
        locale: users.locale,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        websitesCount: sql<number>`(SELECT count(*) FROM websites WHERE submitted_by = ${users.id})`,
        likesCount: sql<number>`(SELECT count(*) FROM website_likes WHERE user_id = ${users.id})`,
        favoritesCount: sql<number>`(SELECT count(*) FROM website_favorites WHERE user_id = ${users.id})`,
        reviewsCount: sql<number>`(SELECT count(*) FROM website_reviews WHERE user_id = ${users.id})`,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    const usersWithCounts = usersList.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      status: user.status,
      locale: user.locale,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      _count: {
        websites: Number(user.websitesCount || 0),
        likes: Number(user.likesCount || 0),
        favorites: Number(user.favoritesCount || 0),
        reviews: Number(user.reviewsCount || 0),
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