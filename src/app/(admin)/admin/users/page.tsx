import { Metadata } from "next";
import { UserManagementClient } from "@/components/admin/user-management-client";
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDB } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ListFilter, Users, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "用户管理 - AI Magellan Admin",
  description: "管理用户账户、角色和提交内容"
};

// 检查是否为管理员邮箱
function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

async function getUsers() {
  const db = getDB();
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

  // Convert Date objects to strings for client component
  return usersList.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    _count: {
      websites: 0,
      likes: 0,
      favorites: 0,
      reviews: 0,
    },
  }));
}

export default async function AdminUsersPage() {
  // 验证管理员权限
  const { userId } = await auth();
  if (!userId) {
    redirect("/auth/signin");
  }

  // 获取Clerk用户信息
  let clerkUser;
  let userEmail;
  
  try {
    clerkUser = await currentUser();
    userEmail = clerkUser?.emailAddresses[0]?.emailAddress;
  } catch (error) {
    console.error('Error fetching Clerk user:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">认证服务错误</h1>
          <p className="text-muted-foreground">无法连接到认证服务</p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">访问受限</h1>
          <p className="text-muted-foreground">无法获取用户邮箱信息</p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  // 检查是否为管理员邮箱
  if (!isAdminEmail(userEmail)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">访问受限</h1>
          <p className="text-muted-foreground">
            您需要管理员权限才能访问此页面
          </p>
          <p className="text-sm text-muted-foreground">
            邮箱: {userEmail}<br/>
            如需管理员权限，请联系系统管理员
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  // 确保数据库中用户记录存在且为管理员
  const db = getDB();
  let adminUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true },
  });

  // 如果用户不存在或角色不是管理员，则创建或更新
  if (!adminUser || adminUser.role !== 'admin') {
    try {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (existingUser) {
        await db
          .update(users)
          .set({
            role: 'admin',
            status: 'active',
            name: clerkUser?.fullName || clerkUser?.firstName || 'Admin',
            image: clerkUser?.imageUrl,
          })
          .where(eq(users.id, userId));
      } else {
        await db.insert(users).values({
          id: userId,
          email: userEmail,
          name: clerkUser?.fullName || clerkUser?.firstName || 'Admin',
          image: clerkUser?.imageUrl,
          role: 'admin',
          status: 'active',
        });
      }

      adminUser = { role: 'admin' };
    } catch (error) {
      console.error('Error creating/updating admin user:', error);
    }
  }

  const usersData = await getUsers();

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 min-h-[calc(100vh-4rem)] space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background/30 backdrop-blur-sm p-6 rounded-xl border border-border/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            后台管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理网站内容和系统设置
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <div className="grid w-full sm:w-auto grid-cols-3 bg-background/50 rounded-lg p-1">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-background/60"
            >
              <ListFilter className="w-4 h-4" />
              网站管理
            </Link>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-background/60 text-foreground">
              <Users className="w-4 h-4" />
              用户管理
            </div>
            <Link
              href="/admin/feedback"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-background/60"
            >
              <MessageSquare className="w-4 h-4" />
              反馈管理
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-border/40 bg-background/30 shadow-sm overflow-hidden backdrop-blur-sm">
        <UserManagementClient initialUsers={usersData} />
      </div>
    </div>
  );
}