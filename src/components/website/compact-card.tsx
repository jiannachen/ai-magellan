"use client";

import { Card } from "@/ui/common/card";
import { Button } from "@/ui/common/button";
import { Badge } from "@/ui/common/badge";
import { ExternalLink, Star } from "lucide-react";
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
  const tLanding = useTranslations('landing');
  
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
        
        {/* 探索状态指示器 - 与访问按钮垂直对齐 */}
        {website.is_featured && (
          <div className="absolute top-3 right-14 z-[3]">
            <div className="flex items-center gap-1 px-2 py-1 bg-magellan-gold/20 text-magellan-gold rounded-full text-xs font-medium border border-magellan-gold/30">
              <Star className="h-3 w-3 fill-current" />
              <span>{tLanding('island.treasure_mark')}</span>
            </div>
          </div>
        )}

        {/* 整个卡片的点击区域 - 跳转到详情页 */}
        <Link href={`/tools/${website.id}`} className="absolute inset-0 z-[1]" />

        {/* 访问按钮 - 外部链接图标，hover时显示，大小缩小一半 */}
        <div className="absolute top-3 right-3 z-[2] opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onVisit(website);
            }}
            className={cn(
              "h-7 w-7 p-0 rounded-md",
              "bg-background/90 hover:bg-primary/10 backdrop-blur-sm",
              "text-muted-foreground hover:text-primary",
              "shadow-md hover:shadow-lg",
              "transition-all duration-200 subtle-scale",
              "group/btn",
              "min-h-7 min-w-7 max-h-7 max-w-7",
              "flex items-center justify-center"
            )}
            title={tLanding('island.explore_island')}
          >
            <ExternalLink className="h-3 w-3 group-hover/btn:scale-110 transition-transform duration-300" />
          </Button>
        </div>

        {/* 卡片内容 - 岛屿信息展示 */}
        <div className="relative p-5 flex flex-col gap-4">
          {/* 上半部分：缩略图和基本信息 */}
          <div className="flex items-start gap-4">
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
                {website.title || tLanding('island.unnamed_island')}
              </h3>
              
              {/* 岛屿描述 */}
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {website.description || tLanding('island.mysterious_island')}
              </p>

              {/* 岛屿标签 */}
              <div className="flex items-center mt-3">
                {/* 免费价格标签 */}
                {website.pricing_model === 'free' && (
                  <Badge variant="secondary" className="text-xs bg-magellan-mint/10 text-magellan-mint border-magellan-mint/20">
                    🆓 {tLanding('island.free_territory')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* 下半部分：底部标签区域 */}
          <div className="flex flex-wrap gap-1.5">
            {/* 定价模式标签 - 优先显示 */}
            {website.pricing_model && (
              <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                {website.pricing_model === 'free' ? '免费' : 
                 website.pricing_model === 'freemium' ? '免费增值' :
                 website.pricing_model === 'subscription' ? '订阅制' :
                 website.pricing_model === 'one_time' ? '一次性付费' : 
                 website.pricing_model === 'tiered' ? '分层定价' :
                 website.pricing_model === 'custom' ? '定制定价' :
                 website.pricing_model === 'usage_based' ? '按量付费' :
                 website.pricing_model === 'open_source' ? '开源' :
                 website.pricing_model}
              </Badge>
            )}

            {/* API可用性标签 - 作为补充信息 */}
            {website.api_available && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                API
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
