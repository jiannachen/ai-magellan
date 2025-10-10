"use client";

import { motion } from "framer-motion";
import { Card } from "@/ui/common/card";
import { Button } from "@/ui/common/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import {
  cardHoverVariants,
  sharedLayoutTransition,
} from "@/ui/animation/variants/animations";
import type { Website } from "@/lib/types";
import { WebsiteThumbnail } from "./website-thumbnail";
import { useCardTilt } from "@/hooks/use-card-tilt";
import Link from "next/link";

interface CompactCardProps {
  website: Website;
  onVisit: (website: Website) => void;
  className?: string; // 添加样式自定义支持
}

export function CompactCard({ website, onVisit, className }: CompactCardProps) {
  const { cardRef, tiltProps } = useCardTilt({
    maxTiltDegree: 8, // 减少倾斜角度，更符合Atlassian的克制风格
    scale: 1.01,      // 减少缩放，保持精致感
    transitionZ: 8,   // 减少3D效果
  });

  return (
    <div
      ref={cardRef}
      {...tiltProps}
      className={cn("card-container", className)}
      style={{ cursor: "pointer" }}
    >
      <motion.div
        variants={cardHoverVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        layoutId={`website-${website.id}`}
        transition={sharedLayoutTransition}
      >
        <Card
          className={cn(
            "group relative flex flex-col overflow-hidden",
            "bg-card border border-border/60 hover:border-primary/30",
            "rounded-lg shadow-sm hover:shadow-md", 
            "transition-all duration-200"
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
                "h-8 w-8 p-0 rounded-md",
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
              className="w-12 h-12 rounded-lg flex-shrink-0" // 稍微增大尺寸，使用8px圆角
            />
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-sm font-medium text-foreground truncate",
                "group-hover:text-primary transition-all duration-200"
              )}>
                {website.title || 'No Title'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {website.description || 'No Description'}
              </p>
              {/* 统计信息 */}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-current opacity-60" />
                  {website.visits || 0} 访问
                </span>
                {(website.likes || 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-current opacity-60" />
                    {website.likes} 点赞
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
