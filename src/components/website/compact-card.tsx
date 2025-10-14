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
          // 专业级基础样式 - 遵循AM.md商业可用性标准
          "bg-background/95 backdrop-blur-sm border border-border/40",
          "rounded-xl shadow-sm", 
          // 专业级微妙hover效果 - 按照AM.md规范减少视觉干扰
          "transition-all duration-300 ease-out",
          "hover:shadow-lg hover:border-magellan-primary/30",
          "hover:bg-background/98",
          // 专业级轻微浮动效果 - 按照AM.md规范，2px浮动提升专业感
          "md:hover:-translate-y-[2px]",
          "active:scale-[0.98] md:active:scale-100",
          // 可访问性Focus状态 - 符合AM.md WCAG AA标准
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-magellan-primary/50 focus-within:ring-offset-2"
        )}
      >
        {/* 专业级装饰效果 - 按照AM.md规范，降低强度到6-8%透明度 */}
        <div className="absolute inset-0 bg-gradient-to-br from-magellan-primary/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>

        {/* 整个卡片的点击区域 - 跳转到详情页 */}
        <Link href={`/tools/${website.id}`} className="absolute inset-0 z-[1]" />

        {/* 专业级宝藏探索按钮 - 符合AM.md航海主题，商业可用性优先 */}
        <div className="absolute top-3 right-3 z-[2] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onVisit(website);
            }}
            className={cn(
              "h-8 w-8 p-0 rounded-lg",
              // 专业级商业按钮样式
              "bg-background/90 hover:bg-magellan-primary/10 backdrop-blur-sm",
              "text-muted-foreground hover:text-magellan-primary",
              "shadow-sm hover:shadow-md",
              "transition-all duration-200",
              "border border-border/40 hover:border-magellan-primary/30",
              "flex items-center justify-center"
            )}
            title={tLanding('island.explore_island')}
          >
            <ExternalLink className="h-4 w-4 transition-transform duration-200" />
          </Button>
        </div>

        {/* 专业级信息展示区域 - 减少内边距，充分利用空间 */}
        <div className="relative p-3 flex flex-col gap-2.5">
          {/* 上半部分：岛屿缩略图和基本信息 */}
          <div className="flex items-start gap-2.5">
            {/* 岛屿缩略图 - 宝藏岛风格，调整为与文本内容高度匹配 */}
            <div className="relative">
              <WebsiteThumbnail
                url={website.url}
                thumbnail={website.thumbnail}
                title={website.title}
                className={cn(
                  "relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-lg flex-shrink-0",
                  "border border-border/40 group-hover:border-magellan-primary/40",
                  "transition-all duration-200",
                  "group-hover:shadow-md"
                )}
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between h-16 sm:h-18 md:h-20">
              {/* 专业级标题 - 微妙主题点缀 */}
              <h3 className={cn(
                "text-base font-semibold text-foreground line-clamp-1 leading-tight",
                "group-hover:text-magellan-primary transition-colors duration-200"
              )}>
                {website.title || tLanding('island.unnamed_island')}
              </h3>
              
              {/* 专业级描述 - 严格限制为两行，优化行间距 */}
              <p className="text-sm text-muted-foreground line-clamp-2 leading-[1.4] flex-1 max-h-[2.8rem] overflow-hidden">
                {website.description || tLanding('island.mysterious_island')}
              </p>
            </div>
          </div>

          {/* 底部标签区域 - 超紧凑设计 */}
          <div className="flex items-center justify-between pt-1.5 border-t border-border/20">
            <div className="flex items-center gap-1">
              {/* 安全港标签 - 超简约设计 */}
              {website.pricing_model === 'free' && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 h-5 bg-magellan-mint/8 text-magellan-mint border-magellan-mint/30",
                    "rounded font-medium"
                  )}
                >
                  免费
                </Badge>
              )}
              {/* 定价模式标签 - 超简约设计 */}
              {website.pricing_model && website.pricing_model !== 'free' && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 h-5 bg-magellan-primary/6 text-magellan-primary border-magellan-primary/30",
                    "hover:bg-magellan-primary/8 transition-colors duration-200",
                    "rounded font-medium"
                  )}
                >
                  {website.pricing_model}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
