import { NextResponse } from "next/server";
import { requireAdmin } from '@/lib/utils/admin';
import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { AjaxResponse } from "@/lib/utils";

// GET /api/admin/users/[id] - 获取特定用户详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // 验证管理员权限
    const adminCheck = await requireAdmin()
    if (!adminCheck.success) {
      return NextResponse.json(
        AjaxResponse.fail(adminCheck.message),
        { status: adminCheck.status }
      );
    }

    const [user, [counts]] = await Promise.all([
      db.query.users.findFirst({
        where: eq(users.id, id),
        with: {
          submittedWebsites: {
            columns: {
              id: true,
              title: true,
              url: true,
              status: true,
              createdAt: true,
            },
            with: {
              websiteCategories: {
                with: {
                  category: {
                    columns: {
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
            orderBy: (websites, { desc }) => [desc(websites.createdAt)],
          },
        },
      }),
      db.select({
        websites: sql<number>`(SELECT count(*) FROM websites WHERE submitted_by = ${id})`,
        likes: sql<number>`(SELECT count(*) FROM website_likes WHERE user_id = ${id})`,
        favorites: sql<number>`(SELECT count(*) FROM website_favorites WHERE user_id = ${id})`,
        reviews: sql<number>`(SELECT count(*) FROM website_reviews WHERE user_id = ${id})`,
      }).from(users).where(eq(users.id, id)),
    ]);

    if (!user) {
      return NextResponse.json(
        AjaxResponse.fail("User not found"),
        { status: 404 }
      );
    }

    // Transform submittedWebsites to match frontend expected structure
    const { submittedWebsites, ...userInfo } = user;
    const websites = (submittedWebsites || []).map(w => ({
      id: w.id,
      title: w.title,
      url: w.url,
      status: w.status,
      createdAt: w.createdAt,
      category: w.websiteCategories?.[0]?.category || { name: 'Uncategorized', slug: 'uncategorized' },
    }));

    return NextResponse.json(AjaxResponse.ok({
      ...userInfo,
      websites,
      _count: {
        websites: Number(counts?.websites || 0),
        likes: Number(counts?.likes || 0),
        favorites: Number(counts?.favorites || 0),
        reviews: Number(counts?.reviews || 0),
      },
    }));
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      AjaxResponse.fail("Failed to fetch user"),
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - 更新用户信息
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // 验证管理员权限
    const adminCheck = await requireAdmin()
    if (!adminCheck.success) {
      return NextResponse.json(
        AjaxResponse.fail(adminCheck.message),
        { status: adminCheck.status }
      );
    }

    // 解析请求数据
    const { role, status } = await request.json();

    // 验证数据
    const validRoles = ['user', 'admin', 'moderator'];
    const validStatuses = ['active', 'banned', 'suspended'];

    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        AjaxResponse.fail("Invalid role"),
        { status: 400 }
      );
    }

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        AjaxResponse.fail("Invalid status"),
        { status: 400 }
      );
    }

    // 防止管理员修改自己的角色或状态
    if (id === adminCheck.userId) {
      return NextResponse.json(
        AjaxResponse.fail("Cannot modify your own account"),
        { status: 400 }
      );
    }

    // 更新用户
    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        status: users.status,
        locale: users.locale,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return NextResponse.json(AjaxResponse.ok(updatedUser));
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      AjaxResponse.fail("Failed to update user"),
      { status: 500 }
    );
  }
}