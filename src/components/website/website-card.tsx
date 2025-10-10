"use client";

import { motion } from "framer-motion";
import { Card } from "@/ui/common/card";
import { Button } from "@/ui/common/button";
import { Badge } from "@/ui/common/badge";
import Link from "next/link";
import {
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import {
  cardHoverVariants,
  sharedLayoutTransition,
} from "@/ui/animation/variants/animations";
import type { Website, Category } from "@/lib/types";
import { useState, useEffect } from "react";
import { WebsiteThumbnail } from "./website-thumbnail";
import { toast } from "@/hooks/use-toast";
import { useCardTilt } from "@/hooks/use-card-tilt";
import { useUser } from '@clerk/nextjs';

// 判断是否应该传递权重的逻辑
function shouldFollowLink(website: Website): boolean {
  // 基础条件：必须是已通过审核且活跃的网站
  if (website.status !== "approved" || !website.active) {
    return false;
  }
  
  // 如果明确标记为可信站点，直接传递权重
  if (website.is_trusted) {
    return true;
  }
  
  // 质量评分高于70分的网站
  if (website.quality_score && website.quality_score >= 70) {
    return true;
  }
  
  // 高访问量且高点赞的网站
  if (website.visits >= 50 && website.likes >= 20) {
    return true;
  }
  
  // 精选网站
  if (website.is_featured) {
    return true;
  }
  
  // SSL安全且响应时间快的网站
  if (website.ssl_enabled && website.response_time && website.response_time < 2000) {
    return true;
  }
  
  // 默认不传递权重（安全策略）
  return false;
}

interface WebsiteCardProps {
  website: Website;
  category?: Category;
  isAdmin: boolean;
  onVisit: (website: Website) => void;
  onStatusUpdate: (id: number, status: Website["status"]) => void;
}

export function WebsiteCard({
  website,
  category,
  isAdmin,
  onVisit,
  onStatusUpdate,
}: WebsiteCardProps) {
  const [likes, setLikes] = useState(website.likes);
  const [isFavorited, setIsFavorited] = useState(false);
  const [compareList, setCompareList] = useAtom(compareListAtom);
  const { cardRef, tiltProps } = useCardTilt();
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

  const statusColors: Record<Website["status"], string> = {
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    approved: "bg-green-500/10 text-green-600 dark:text-green-400",
    rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
    all: "",
  };

  const statusText: Record<Website["status"], string> = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已拒绝",
    all: "",
  };

  const handleLike = async () => {
    const key = `website-${website.id}-liked`;
    const lastLiked = localStorage.getItem(key);
    const now = new Date().getTime();

    if (lastLiked) {
      const lastLikedTime = parseInt(lastLiked);
      const oneDay = 24 * 60 * 60 * 1000; // 24小时的毫秒数

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
    <div
      ref={cardRef}
      onMouseMove={tiltProps.onMouseMove}
      onMouseEnter={tiltProps.onMouseEnter}
      onMouseLeave={tiltProps.onMouseLeave}
      className="card-container relative [perspective:1000px]"
    >
      <motion.div
        variants={cardHoverVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        layoutId={`website-${website.id}`}
        transition={sharedLayoutTransition}
        className="h-full"
      >
        <Card
          className={cn(
            "group relative flex flex-col overflow-hidden h-full",
            "bg-card border-border hover:border-primary/20",
            "transition-apple card-hover",
            "rounded-xl shadow-apple-1 hover:shadow-apple-2"
          )}
        >
          {/* 整个卡片的点击区域 */}
          <Link href={`/tools/${website.id}`} className="absolute inset-0 z-[2]" />

          {/* Apple风格访问按钮 */}
          <div className="absolute top-3 right-3 z-[4]">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onVisit(website);
              }}
              className="h-8 w-8 p-0 rounded-full bg-fill-quaternary/80 hover:bg-fill-tertiary text-label-secondary hover:text-label-primary transition-apple"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          {/* Apple风格状态指示 */}
          {website.is_featured && (
            <div className="absolute top-3 left-3 z-[3]">
              <Badge className="bg-primary text-primary-foreground border-0 rounded-full px-2 py-1 text-caption2 font-medium">
                精选
              </Badge>
            </div>
          )}

          {/* Background Gradient - 简化 */}
          <div className="absolute inset-0 z-[1]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>

          {/* 卡片内容 - 不再需要单独的点击处理 */}
          <div className="relative z-[3] flex flex-col h-full">
            {/* 工具图标和基本信息 */}
            <div className="p-4 flex items-center gap-3">
              <WebsiteThumbnail
                url={website.url}
                thumbnail={website.thumbnail}
                title={website.title}
                className="w-12 h-12 rounded-xl"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-headline font-semibold text-label-primary truncate group-hover:text-primary transition-apple">
                  {website.title}
                </h3>
                <p className="text-subhead text-label-secondary mt-1 line-clamp-2">
                  {website.description}
                </p>
              </div>
            </div>

            {/* 分类标签 - Apple风格 */}
            <div className="px-4 pb-4">
              <Badge
                variant="outline"
                className="text-caption1 font-medium bg-fill-quaternary text-label-secondary border-0 rounded-full"
              >
                {category?.name || "未分类"}
              </Badge>
            </div>

            {/* Apple风格统计和操作区域 */}
            <div className="relative z-[3] px-4 pb-4 flex items-center justify-between mt-auto">
              {/* 简化的统计信息 */}
              <div className="flex items-center gap-4 text-caption1 text-label-tertiary">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{likes}</span>
                </div>
                <span>{website.visits} 访问</span>
              </div>

              {/* 管理员操作按钮 */}
              {isAdmin && (
                <div className="flex items-center gap-2">
                  {website.status !== "approved" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onStatusUpdate(website.id, "approved");
                      }}
                      className="h-8 w-8 p-0 rounded-full text-label-tertiary hover:text-color-green transition-apple"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                  )}

                  {website.status !== "rejected" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onStatusUpdate(website.id, "rejected");
                      }}
                      className="h-8 w-8 p-0 rounded-full text-label-tertiary hover:text-color-red transition-apple"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
