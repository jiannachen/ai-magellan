import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db/db";
import { feedbacks } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { FeedbackList } from "@/components/admin/feedback-list";
import { ListFilter, Users, MessageSquare } from "lucide-react";

export const dynamic = 'force-dynamic';

function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

async function getFeedbacks() {
  const list = await db.query.feedbacks.findMany({
    orderBy: (feedbacks, { desc }) => [desc(feedbacks.createdAt)],
    limit: 200,
  });
  return list;
}

export default async function AdminFeedbackPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/auth/signin");
  }

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
          <Link href="/" className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">返回首页</Link>
        </div>
      </div>
    );
  }

  if (!userEmail || !isAdminEmail(userEmail)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">访问受限</h1>
          <p className="text-muted-foreground">您需要管理员权限才能访问此页面</p>
          <Link href="/" className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">返回首页</Link>
        </div>
      </div>
    );
  }

  const items = await getFeedbacks();

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 min-h-[calc(100vh-4rem)] space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background/30 backdrop-blur-sm p-6 rounded-xl border border-border/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">后台管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理网站内容和系统设置</p>
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
            <Link
              href="/admin/users"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-background/60"
            >
              <Users className="w-4 h-4" />
              用户管理
            </Link>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-background/60 text-foreground">
              <MessageSquare className="w-4 h-4" />
              反馈管理
            </div>
          </div>
        </div>
      </div>

      <FeedbackList items={items} />
    </div>
  );
}
