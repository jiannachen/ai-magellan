"use client";

import { Card } from "@/ui/common/card";
import { Button } from "@/ui/common/button";
import { Badge } from "@/ui/common/badge";
import { ExternalLink } from "lucide-react";
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
          // 岛屿卡片基础样式 - 海洋色彩系统
          "bg-card/95 backdrop-blur-sm border border-magellan-primary/10",
          "rounded-lg sm:rounded-xl shadow-sm", 
          // 专业级微妙hover效果 - 根据AM.md规范调整
          "transition-all duration-300 ease-out",
          "hover:shadow-lg hover:border-magellan-primary/20",
          "hover:bg-card/98",
          // 专业级轻微浮动效果 - 2px而非8px
          "hover:-translate-y-[2px]",
          // Focus 状态
          "focus-within:outline-none focus-within:ring-1 focus-within:ring-magellan-primary/50"
        )}
      >
        {/* 岛屿发现背景效果 - 使用海洋渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-magellan-primary/3 via-transparent to-magellan-coral/3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
        
        {/* 微妙的装饰元素 - 岛屿光晕 */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-magellan-teal/2 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>

        {/* 整个卡片的点击区域 - 跳转到详情页 */}
        <Link href={`/tools/${website.id}`} className="absolute inset-0 z-[1]" />

        {/* 探索按钮 - 航海风格外部链接 */}
        <div className="absolute top-3 right-3 z-[2] opacity-0 group-hover:opacity-100 transition-all duration-300">
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
              // 航海风格按钮样式
              "bg-magellan-depth-50/90 hover:bg-magellan-primary/10 backdrop-blur-sm",
              "text-magellan-depth-600 hover:text-magellan-primary",
              "shadow-md hover:shadow-lg",
              "transition-all duration-300",
              "group/btn border border-magellan-primary/20",
              "min-h-7 min-w-7 max-h-7 max-w-7",
              "flex items-center justify-center"
            )}
            title={tLanding('island.explore_island')}
          >
            <ExternalLink className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
          </Button>
        </div>

        {/* 岛屿信息展示区域 */}
        <div className="relative p-4 flex flex-col gap-3">
          {/* 上半部分：岛屿缩略图和基本信息 */}
          <div className="flex items-start gap-3">
            {/* 岛屿缩略图 - 宝藏岛风格 */}
            <div className="relative group/thumb">
              {/* 宝藏光晕效果 - 专业级微妙 */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-magellan-primary/15 to-magellan-coral/15 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <WebsiteThumbnail
                url={website.url}
                thumbnail={website.thumbnail}
                title={website.title}
                className={cn(
                  "relative w-20 h-20 rounded-lg flex-shrink-0",
                  "border border-magellan-primary/15 group-hover:border-magellan-primary/30",
                  "transition-all duration-300",
                  "group-hover:shadow-lg"
                )}
              />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              {/* 岛屿名称 - 发现高亮效果 */}
              <h3 className={cn(
                "text-sm font-semibold text-foreground line-clamp-1",
                "group-hover:text-magellan-primary transition-colors duration-300",
                "group-hover:font-bold"
              )}>
                {website.title || tLanding('island.unnamed_island')}
              </h3>
              
              {/* 岛屿描述 - 探险日志风格 */}
              <p className="text-xs text-magellan-depth-600 line-clamp-2 leading-relaxed">
                {website.description || tLanding('island.mysterious_island')}
              </p>

              {/* 岛屿状态标签 */}
              <div className="flex items-center pt-1">
                {/* 安全港标签 - 免费工具 */}
                {website.pricing_model === 'free' && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs bg-magellan-mint/10 text-magellan-mint border-magellan-mint/30",
                      "shadow-sm"
                    )}
                  >
                    🆓 {tLanding('island.free_territory')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* 下半部分：航海标签区域 */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {/* 航线标签 - 定价模式 */}
            {website.pricing_model && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs bg-magellan-primary/5 text-magellan-primary border-magellan-primary/30",
                  "hover:bg-magellan-primary/10 transition-colors duration-200"
                )}
              >
                {website.pricing_model}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
