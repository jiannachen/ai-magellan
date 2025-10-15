import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminPageClient } from "@/components/admin/admin-page-client";
import { prisma } from "@/lib/db/db";

export const dynamic = 'force-dynamic';

// 检查是否为管理员邮箱
function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

async function getWebsites() {
  const websites = await prisma.website.findMany({
    include: {
      category: true,
      submitter: true,
    },
    orderBy: {
      created_at: 'desc'
    }
  });
  // Type assertion for compatibility with Website interface
  return websites as any;
}

async function getCategories() {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  });
  return categories;
}

export default async function AdminPage() {
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

  // 获取网站和分类数据
  const [websites, categories] = await Promise.all([
    getWebsites(),
    getCategories()
  ]);

  return <AdminPageClient initialWebsites={websites} initialCategories={categories} />;
}