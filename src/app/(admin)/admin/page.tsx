import { auth } from '@/lib/auth';
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminPageClient } from "@/components/admin/admin-page-client";
import { db } from "@/lib/db/db";
import { websites, categories } from "@/lib/db/schema";
import { desc, asc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

// 检查是否为管理员邮箱
function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

async function getWebsites() {
  const websitesList = await db.query.websites.findMany({
    with: {
      websiteCategories: {
        with: {
          category: true,
        },
      },
      submitter: true,
    },
    orderBy: (websites, { desc }) => [desc(websites.createdAt)],
  });
  // Type assertion for compatibility with Website interface
  return websitesList as any;
}

async function getCategories() {
  const categoriesList = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });
  return categoriesList;
}

export default async function AdminPage() {
  // 验证管理员权限
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // 获取用户信息
  const userEmail = session.user.email;

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
  const [websitesData, categoriesData] = await Promise.all([
    getWebsites(),
    getCategories()
  ]);

  return <AdminPageClient initialWebsites={websitesData} initialCategories={categoriesData} />;
}
