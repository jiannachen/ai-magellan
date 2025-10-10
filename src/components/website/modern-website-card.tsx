"use client";

import { motion } from "framer-motion";
import { Card } from "@/ui/common/card";
import { Button } from "@/ui/common/button";
import { Badge } from "@/ui/common/badge";
import Link from "next/link";
import {
  Heart,
  ExternalLink,
  Bookmark,
  BarChart3,
  Star,
  TrendingUp,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { Website, Category } from "@/lib/types";
import { useState, useEffect } from "react";
import { WebsiteThumbnail } from "./website-thumbnail";
import { toast } from "@/hooks/use-toast";
import { useUser } from '@clerk/nextjs';
import { useAtom } from 'jotai';
import { compareListAtom } from '@/lib/atoms/index';

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

interface ModernWebsiteCardProps {
  website: Website;
  category?: Category;
  isAdmin: boolean;
  onVisit: (website: Website) => void;
  onStatusUpdate: (id: number, status: Website["status"]) => void;
}

export function ModernWebsiteCard({
  website,
  category,
  isAdmin,
  onVisit,
  onStatusUpdate,
}: ModernWebsiteCardProps) {
  const [likes, setLikes] = useState(website.likes);
  const [isFavorited, setIsFavorited] = useState(false);
  const [compareList, setCompareList] = useAtom(compareListAtom);
  const { isSignedIn } = useUser();

  const isInCompareList = compareList.includes(website.id);

  // 检查是否已收藏
  useEffect(() => {
    if (isSignedIn) {
      checkFavoriteStatus();
    }
  }, [isSignedIn, website.id]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/user/favorites/check?websiteId=${website.id}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleLike = async () => {
    const key = `website-${website.id}-liked`;
    const lastLiked = localStorage.getItem(key);
    const now = new Date().getTime();

    if (lastLiked) {
      const lastLikedTime = parseInt(lastLiked);
      const oneDay = 24 * 60 * 60 * 1000;

      if (now - lastLikedTime < oneDay) {
        toast({
          title: "已点赞",
          description: "每天只能点赞一次哦，明天再来吧 (｡•́︿•̀｡)",
        });
        return;
      }
    }

    const method = "POST";
    fetch(`/api/websites/${website.id}/like`, { method });
    localStorage.setItem(key, now.toString());
    setLikes(likes + 1);
  };

  const handleToggleCompare = () => {
    if (isInCompareList) {
      setCompareList(prev => prev.filter(id => id !== website.id))
      toast({
        title: "已移除",
        description: `已从对比列表移除 ${website.title}`,
      })
    } else {
      if (compareList.length >= 4) {
        toast({
          title: "对比列表已满",
          description: "最多只能对比4个工具，请先移除一些再添加",
        })
        return
      }
      setCompareList(prev => [...prev, website.id])
      toast({
        title: "已添加",
        description: `已将 ${website.title} 添加到对比列表`,
      })
    }
  }

  const handleFavorite = async () => {
    if (!isSignedIn) {
      toast({
        title: "需要登录",
        description: "请先登录再收藏",
      });
      return;
    }

    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const url = isFavorited 
        ? `/api/user/favorites?websiteId=${website.id}`
        : '/api/user/favorites';
      
      const body = isFavorited ? undefined : JSON.stringify({ websiteId: website.id });
      
      const response = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body,
      });

      if (response.ok) {
        setIsFavorited(!isFavorited);
        toast({
          title: isFavorited ? "已取消收藏" : "已添加收藏",
          description: isFavorited ? "已从收藏中移除" : "已添加到收藏列表",
        });
      } else {
        throw new Error('操作失败');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "操作失败",
        description: "请稍后重试",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -6,
        transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
      }}
      className="group relative h-full"
    >
      <Card
        className={cn(
          "relative h-full overflow-hidden bg-gradient-to-br from-background to-background/95",
          "border border-border/60 hover:border-primary/40",
          "shadow-sm hover:shadow-xl transition-all duration-300",
          "rounded-2xl backdrop-blur-sm",
          "dark:from-card dark:to-card/95 dark:border-border/40 dark:hover:border-primary/30"
        )}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* 顶部装饰条 */}
        <div className="relative h-1 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 opacity-80" />
        
        {/* 主要内容区域 - 可点击跳转详情页 */}
        <Link href={`/tools/${website.id}`} className="block h-full">
          <div className="relative p-4 h-full flex flex-col">
            {/* 头部区域 */}
            <div className="flex items-start gap-3 mb-3">
              {/* 工具图标 */}
              <div className="relative flex-shrink-0">
                <WebsiteThumbnail
                  url={website.url}
                  thumbnail={website.thumbnail}
                  title={website.title}
                  className="w-12 h-12 rounded-xl ring-2 ring-white shadow-sm"
                />
                {website.is_featured && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Star className="w-2 h-2 text-white fill-current" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* 工具信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {website.title}
                  </h3>
                  {website.quality_score && (
                    <div className="flex items-center gap-0.5 bg-primary/10 text-primary text-xs font-medium px-1.5 py-0.5 rounded-md flex-shrink-0">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>{website.quality_score}</span>
                    </div>
                  )}
                </div>
                
                {/* 分类标签 */}
                <Badge 
                  variant="secondary" 
                  className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 text-xs px-2 py-0.5"
                >
                  {category?.name || "未分类"}
                </Badge>
              </div>
            </div>
            
            {/* 描述 */}
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
              {website.description}
            </p>
            
            {/* 统计信息 */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{website.visits}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{likes}</span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground/70 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{website.created_at ? new Date(website.created_at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) : '未知'}</span>
              </div>
            </div>
          </div>
        </Link>
        
        {/* 悬浮操作按钮 */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
          {/* 外部链接按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onVisit(website);
            }}
            className="h-6 w-6 p-0 bg-background/90 backdrop-blur-sm border border-border/50 hover:bg-background hover:border-primary/30 hover:text-primary shadow-sm"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
          
          {/* 收藏按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite();
            }}
            className={cn(
              "h-6 w-6 p-0 bg-background/90 backdrop-blur-sm border border-border/50 shadow-sm",
              isFavorited 
                ? "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" 
                : "hover:bg-background hover:border-blue-300 hover:text-blue-600"
            )}
          >
            <Bookmark className={cn("h-3 w-3", isFavorited && "fill-current")} />
          </Button>
          
          {/* 对比按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleCompare();
            }}
            className={cn(
              "h-6 w-6 p-0 bg-background/90 backdrop-blur-sm border border-border/50 shadow-sm",
              isInCompareList 
                ? "bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400" 
                : "hover:bg-background hover:border-purple-300 hover:text-purple-600"
            )}
          >
            <BarChart3 className={cn("h-3 w-3", isInCompareList && "fill-current")} />
          </Button>
          
          {/* 点赞按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            className="h-6 w-6 p-0 bg-background/90 backdrop-blur-sm border border-border/50 hover:bg-background hover:border-red-300 hover:text-red-500 shadow-sm"
          >
            <Heart className="h-3 w-3" />
          </Button>
        </div>
        
        {/* 底部装饰条 */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </motion.div>
  );
}