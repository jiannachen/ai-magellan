import { auth } from '@/lib/auth';
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminPageClient } from "@/components/admin/admin-page-client";
import { db } from "@/lib/db/db";
import { websites, categories } from "@/lib/db/schema";
import { desc, eq, sql, and } from "drizzle-orm";

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

// 检查是否为管理员邮箱
function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

async function getWebsitesPaginated(status: string, page: number) {
  const offset = (page - 1) * PAGE_SIZE;

  const [websitesList, countResult] = await Promise.all([
    db.query.websites.findMany({
      where: eq(websites.status, status),
      with: {
        websiteCategories: {
          with: {
            category: true,
          },
        },
        submitter: true,
      },
      orderBy: (websites, { desc }) => [desc(websites.createdAt)],
      limit: PAGE_SIZE,
      offset,
    }),
    db.select({ count: sql<number>`count(*)::int` })
      .from(websites)
      .where(eq(websites.status, status)),
  ]);

  return {
    websites: websitesList as any,
    total: countResult[0]?.count ?? 0,
  };
}

async function getStatusCounts() {
  const result = await db
    .select({
      status: websites.status,
      count: sql<number>`count(*)::int`,
    })
    .from(websites)
    .groupBy(websites.status);

  const counts: Record<string, number> = { pending: 0, approved: 0, rejected: 0 };
  for (const row of result) {
    counts[row.status] = row.count;
  }
  return counts;
}

async function getCategories() {
  const categoriesList = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });
  return categoriesList;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
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

  const params = await searchParams;
  const status = params.status || 'pending';
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  // 获取网站和分类数据
  const [{ websites: websitesData, total }, statusCounts, categoriesData] = await Promise.all([
    getWebsitesPaginated(status, page),
    getStatusCounts(),
    getCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminPageClient
      initialWebsites={websitesData}
      initialCategories={categoriesData}
      statusCounts={statusCounts}
      currentStatus={status}
      currentPage={page}
      totalPages={totalPages}
      total={total}
    />
  );
}
