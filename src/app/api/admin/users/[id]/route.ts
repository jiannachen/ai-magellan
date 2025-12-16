import { NextResponse } from "next/server";
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from "@/lib/db/db";
import { users, websites, categories } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { AjaxResponse } from "@/lib/utils";

// 检查是否为管理员邮箱
function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

// GET /api/admin/users/[id] - 获取特定用户详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // 验证管理员权限
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        AjaxResponse.fail("Unauthorized"),
        { status: 401 }
      );
    }

    // 获取Clerk用户信息
    let clerkUser;
    let userEmail;
    
    try {
      clerkUser = await currentUser();
      userEmail = clerkUser?.emailAddresses[0]?.emailAddress;
    } catch (error) {
      console.error('Error fetching Clerk user:', error);
      return NextResponse.json(
        AjaxResponse.fail("Authentication service error"),
        { status: 500 }
      );
    }

    if (!userEmail || !isAdminEmail(userEmail)) {
      return NextResponse.json(
        AjaxResponse.fail("Access denied"),
        { status: 403 }
      );
    }

    // 获取用户详情，包含提交的网站列表
    const user = await db.query.users.findFirst({
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
    });

    if (!user) {
      return NextResponse.json(
        AjaxResponse.fail("User not found"),
        { status: 404 }
      );
    }

    // Get counts separately
    const [websitesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(websites)
      .where(eq(websites.submittedBy, id));

    const userWithCount = {
      ...user,
      _count: {
        websites: Number(websitesCount?.count || 0),
        likes: 0,
        favorites: 0,
        reviews: 0,
      },
    };

    return NextResponse.json(AjaxResponse.ok(userWithCount));
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        AjaxResponse.fail("Unauthorized"),
        { status: 401 }
      );
    }

    // 获取Clerk用户信息
    let clerkUser;
    let userEmail;
    
    try {
      clerkUser = await currentUser();
      userEmail = clerkUser?.emailAddresses[0]?.emailAddress;
    } catch (error) {
      console.error('Error fetching Clerk user:', error);
      return NextResponse.json(
        AjaxResponse.fail("Authentication service error"),
        { status: 500 }
      );
    }

    if (!userEmail || !isAdminEmail(userEmail)) {
      return NextResponse.json(
        AjaxResponse.fail("Access denied - Only admins can update users"),
        { status: 403 }
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
    if (id === userId) {
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