import { NextResponse } from "next/server";
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from "@/lib/db/db";
import { AjaxResponse } from "@/lib/utils";

// 检查是否为管理员邮箱
function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

// GET /api/admin/users - 获取所有用户列表
export async function GET() {
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

    // 获取用户列表，包含提交网站数量
    const users = await prisma.user.findMany({
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
        _count: {
          select: {
            websites: true,
            likes: true,
            favorites: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(AjaxResponse.ok(users));
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      AjaxResponse.fail("Failed to fetch users"),
      { status: 500 }
    );
  }
}