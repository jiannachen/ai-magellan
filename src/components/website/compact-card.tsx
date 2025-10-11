"use client";

import { Card } from "@/ui/common/card";
import { Button } from "@/ui/common/button";
import { Badge } from "@/ui/common/badge";
import { ExternalLink, Star, Eye, Heart, Compass, Map } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { Website } from "@/lib/types";
import { WebsiteThumbnail } from "./website-thumbnail";
import Link from "next/link";
import { useTranslations } from 'next-intl';

interface CompactCardProps {
  website: Website;
  onVisit: (website: Website) => void;
  className?: string;
}

export function CompactCard({ website, onVisit, className }: CompactCardProps) {
  const t = useTranslations();
  
  return (
    <div className={cn("group", className)}>
      <Card
        className={cn(
          "relative flex flex-col overflow-hidden cursor-pointer",
          "bg-card/95 backdrop-blur-sm border border-primary/10",
          "rounded-xl shadow-sm", 
          // 极其微妙的hover效果
          "transition-all duration-200 ease-out",
          "hover:shadow-md hover:border-primary/20",
          "subtle-hover",
          // Focus 状态
          "focus-within:outline-none focus-within:ring-1 focus-within:ring-primary/50"
        )}
      >
        {/* 微妙的背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/1 via-transparent to-magellan-coral/1 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
        
        {/* 探索状态指示器 */}
        {website.is_featured && (
          <div className="absolute top-2 left-2 z-[3]">
            <div className="flex items-center gap-1 px-2 py-1 bg-magellan-gold/20 text-magellan-gold rounded-full text-xs font-medium border border-magellan-gold/30">
              <Star className="h-3 w-3 fill-current" />
              <span>{t('island.treasure_mark')}</span>
            </div>
          </div>
        )}

        {/* 整个卡片的点击区域 - 跳转到详情页 */}
        <Link href={`/tools/${website.id}`} className="absolute inset-0 z-[1]" />

        {/* 访问按钮 - 航海风格 */}
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
              "h-9 w-9 p-0 rounded-xl",
              "bg-background/90 hover:bg-primary/10 backdrop-blur-sm",
              "text-muted-foreground hover:text-primary",
              "border border-primary/20 hover:border-primary/40",
              "shadow-md hover:shadow-lg",
              "transition-all duration-200 subtle-scale",
              // 添加微妙的罗盘效果
              "group/btn"
            )}
            title={t('island.explore_island')}
          >
            <Compass className="h-4 w-4 group-hover/btn:rotate-45 transition-transform duration-300" />
          </Button>
        </div>

        {/* 卡片内容 - 岛屿信息展示 */}
        <div className="relative p-5 flex items-start gap-4">
          {/* 岛屿缩略图 - 增强视觉效果 */}
          <div className="relative group/thumb">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-magellan-coral/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <WebsiteThumbnail
              url={website.url}
              thumbnail={website.thumbnail}
              title={website.title}
              className="relative w-14 h-14 rounded-xl flex-shrink-0 border border-primary/10 group-hover:border-primary/30 transition-all duration-300" 
            />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {/* 岛屿名称 */}
            <h3 className={cn(
              "text-sm font-semibold text-foreground line-clamp-1",
              "group-hover:text-primary transition-colors duration-300"
            )}>
              {website.title || t('island.unnamed_island')}
            </h3>
            
            {/* 岛屿描述 */}
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {website.description || t('island.mysterious_island')}
            </p>

            {/* 岛屿标签和统计 */}
            <div className="flex items-center justify-between mt-3">
              {/* 价格标签 */}
              <div className="flex items-center gap-2">
                {website.pricing_model === 'free' ? (
                  <Badge variant="secondary" className="text-xs bg-magellan-mint/10 text-magellan-mint border-magellan-mint/20">
                    🆓 {t('island.free_territory')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    💎 {t('island.premium_territory')}
                  </Badge>
                )}
              </div>

              {/* 探索数据 */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{website.visits || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{website.likes || 0}</span>
                </div>
                {website.quality_score && website.quality_score > 0 && (
                  <div className="flex items-center gap-1 text-magellan-gold">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{website.quality_score}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部探索按钮条 */}
        <div className="relative p-3 pt-0">
          <Button 
            size="sm" 
            className="w-full bg-gradient-to-r from-primary/90 to-magellan-teal/90 hover:from-primary hover:to-magellan-teal text-white rounded-lg font-medium transition-all duration-200 subtle-hover"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onVisit(website);
            }}
          >
            <Map className="h-4 w-4 mr-2" />
            {t('island.set_sail')}
            <ExternalLink className="h-3 w-3 ml-2 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
