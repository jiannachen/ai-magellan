"use client";

import { Card } from "@/ui/common/card";
import { Button } from "@/ui/common/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { Website } from "@/lib/types";
import { WebsiteThumbnail } from "./website-thumbnail";
import Link from "next/link";

interface CompactCardProps {
  website: Website;
  onVisit: (website: Website) => void;
  className?: string;
}

export function CompactCard({ website, onVisit, className }: CompactCardProps) {
  return (
    <div className={cn("group", className)}>
      <Card
        className={cn(
          "relative flex flex-col overflow-hidden cursor-pointer",
          "bg-card border border-border",
          "rounded-lg shadow-atlassian-100", // 使用现有的 Atlassian 阴影令牌
          // Atlassian 标准 hover 效果：轻微位移 + 阴影提升
          "transition-all duration-200 ease-in-out",
          "hover:shadow-atlassian-300 hover:-translate-y-0.5",
          "hover:border-primary/20",
          // Focus 状态
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
        )}
      >
        {/* 整个卡片的点击区域 - 跳转到详情页 */}
        <Link href={`/tools/${website.id}`} className="absolute inset-0 z-[1]" />

        {/* 访问按钮 - 右上角 */}
        <div className="absolute top-3 right-3 z-[2]">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onVisit(website);
            }}
            className={cn(
              "h-8 w-8 p-0 rounded-md", // 4px 圆角
              "bg-background/90 hover:bg-background",
              "text-muted-foreground hover:text-foreground",
              "border border-border/40 hover:border-border",
              "shadow-sm hover:shadow-md",
              "transition-all duration-200"
            )}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* 卡片内容 - Atlassian风格布局 */}
        <div className="relative p-4 flex items-center gap-3">
          <WebsiteThumbnail
            url={website.url}
            thumbnail={website.thumbnail}
            title={website.title}
            className="w-12 h-12 rounded-lg flex-shrink-0" // 8px 圆角
          />
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-sm font-medium text-foreground truncate",
              "group-hover:text-primary transition-colors duration-200" // 只改变颜色，保持简洁
            )}>
              {website.title || 'No Title'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {website.description || 'No Description'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
