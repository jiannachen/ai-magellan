import { NextResponse } from "next/server";
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from "@/lib/db/db";
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
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        websites: {
          select: {
            id: true,
            title: true,
            url: true,
            status: true,
            created_at: true,
            category: {
              select: {
                name: true,
                slug: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        },
        _count: {
          select: {
            websites: true,
            likes: true,
            favorites: true,
            reviews: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        AjaxResponse.fail("User not found"),
        { status: 404 }
      );
    }

    return NextResponse.json(AjaxResponse.ok(user));
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
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(status && { status }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      }
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