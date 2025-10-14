"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/ui/common/tabs";
import { ListFilter, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export function AdminHeader() {
  const pathname = usePathname();
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background/30 backdrop-blur-sm p-6 rounded-xl border border-border/40">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
          后台管理
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          管理网站内容和系统设置
        </p>
      </div>
  <Tabs value={pathname === "/admin/users" ? "users" : pathname === "/admin/feedback" ? "feedback" : "websites"} className="w-full sm:w-auto">
    <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-background/50">
          <TabsTrigger
            value="websites"
            asChild
            className="flex items-center gap-2 data-[state=active]:bg-background/60"
          >
            <Link href="/admin">
              <ListFilter className="w-4 h-4" />
              网站管理
            </Link>
          </TabsTrigger>
      <TabsTrigger 
        value="users" 
        asChild
        className="flex items-center gap-2 data-[state=active]:bg-background/60"
      >
        <Link href="/admin/users">
          <Users className="w-4 h-4" />
          用户管理
        </Link>
      </TabsTrigger>
      <TabsTrigger
        value="feedback"
        asChild
        className="flex items-center gap-2 data-[state=active]:bg-background/60"
      >
        <Link href="/admin/feedback">
          <MessageSquare className="w-4 h-4" />
          反馈管理
        </Link>
      </TabsTrigger>
    </TabsList>
  </Tabs>
    </div>
  );
}
