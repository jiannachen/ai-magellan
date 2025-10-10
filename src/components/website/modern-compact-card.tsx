"use client";

import { motion } from "framer-motion";
import { Card } from "@/ui/common/card";
import { Button } from "@/ui/common/button";
import { Badge } from "@/ui/common/badge";
import Link from "next/link";
import {
  Heart,
  ExternalLink,
  Star,
  TrendingUp,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { Website } from "@/lib/types";
import { useState } from "react";
import { WebsiteThumbnail } from "./website-thumbnail";
import { toast } from "@/hooks/use-toast";

// 判断是否应该传递权重的逻辑
function shouldFollowLink(website: Website): boolean {
  if (website.status !== "approved" || !website.active) {
    return false;
  }
  
  if (website.is_trusted) return true;
  if (website.quality_score && website.quality_score >= 70) return true;
  if (website.visits >= 50 && website.likes >= 20) return true;
  if (website.is_featured) return true;
  if (website.ssl_enabled && website.response_time && website.response_time < 2000) return true;
  
  return false;
}

interface ModernCompactCardProps {
  website: Website;
  onVisit: (website: Website) => void;
}

export function ModernCompactCard({ website, onVisit }: ModernCompactCardProps) {
  const [likes, setLikes] = useState(website.likes);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `website-${website.id}-liked`;
    if (localStorage.getItem(key)) {
      toast({
        title: "已点赞",
        description: "你已经点赞了，请过段时间再来吧 (｡•́︿•̀｡)",
      });
      return;
    }
    const method = "POST";
    const response = await fetch(`/api/websites/${website.id}/like`, {
      method,
    });
    if (response.ok) {
      localStorage.setItem(key, "true");
      setLikes(likes + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -3,
        transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
      }}
      className="group relative h-full"
    >
      <Card
        className={cn(
          "relative h-full overflow-hidden bg-gradient-to-br from-background to-background/95",
          "border border-border/60 hover:border-primary/50",
          "shadow-sm hover:shadow-lg transition-all duration-300",
          "rounded-xl backdrop-blur-sm",
          "dark:from-card dark:to-card/95 dark:border-border/40 dark:hover:border-primary/40"
        )}
      >
        {/* 顶部装饰线 */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />
        
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* 主要内容区域 - 可点击跳转详情页 */}
        <Link href={`/tools/${website.id}`} className="block h-full">
          <div className="relative p-3 h-full flex flex-col">
            <div className="flex items-center gap-3 flex-1">
              {/* 工具图标 */}
              <div className="relative flex-shrink-0">
                <WebsiteThumbnail
                  url={website.url}
                  thumbnail={website.thumbnail}
                  title={website.title}
                  className="w-10 h-10 rounded-lg ring-1 ring-white shadow-sm"
                />
                {website.is_featured && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Star className="w-1.5 h-1.5 text-white fill-current" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* 工具信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                      {website.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {website.description}
                    </p>
                  </div>
                  
                  {/* 评分 */}
                  {website.quality_score && (
                    <div className="flex items-center gap-0.5 bg-primary/10 text-primary text-xs font-medium px-1 py-0.5 rounded flex-shrink-0">
                      <Star className="w-2 h-2 fill-current" />
                      <span className="text-xs">{website.quality_score}</span>
                    </div>
                  )}
                </div>
                
                {/* 统计信息 */}
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />
                    <span>{website.visits}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Heart className="w-2.5 h-2.5" />
                    <span>{likes}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>{website.created_at ? new Date(website.created_at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) : '未知'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
        
        {/* 悬浮操作按钮 */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          {/* 外部链接按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onVisit(website);
            }}
            className="h-5 w-5 p-0 bg-background/90 backdrop-blur-sm border border-border/50 hover:bg-background hover:border-primary/50 hover:text-primary shadow-sm rounded"
          >
            <ExternalLink className="h-2.5 w-2.5" />
          </Button>
          
          {/* 点赞按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="h-5 w-5 p-0 bg-background/90 backdrop-blur-sm border border-border/50 hover:bg-background hover:border-red-300 hover:text-red-500 shadow-sm rounded"
          >
            <Heart className="h-2.5 w-2.5" />
          </Button>
        </div>
        
        {/* 底部装饰 */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </motion.div>
  );
}