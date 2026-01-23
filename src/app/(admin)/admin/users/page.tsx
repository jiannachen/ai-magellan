import { Metadata } from "next";
import { UserManagementClient } from "@/components/admin/user-management-client";
import Link from "next/link";
import { ListFilter, Users, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "用户管理 - AI Magellan Admin",
  description: "管理用户账户、角色和提交内容"
};

// Force dynamic rendering but minimize SSR work
export const dynamic = 'force-dynamic';

// Simple page component - authentication is handled by middleware
// Data fetching is done on the client side to reduce CPU time
export default function AdminUsersPage() {
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

      {/* Content - Client component fetches data */}
      <div className="rounded-xl border border-border/40 bg-background/30 shadow-sm overflow-hidden backdrop-blur-sm">
        <UserManagementClient initialUsers={[]} />
      </div>
    </div>
  );
}
