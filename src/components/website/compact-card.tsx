"use client";

import { Card } from "@/ui/common/card";
import { Button } from "@/ui/common/button";
import { Badge } from "@/ui/common/badge";
import { ExternalLink } from "lucide-react";
import { cn, addRefParam } from "@/lib/utils/utils";
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
  const tPricing = useTranslations('pricing_models');

  // 处理访问时添加ref参数
  const handleVisit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const urlWithRef = addRefParam(website.url);
    window.open(urlWithRef, '_blank');
    // 调用原始的onVisit回调用于统计
    onVisit(website);
  };

  return (
    <div className={cn("group", className)}>
      <Card
        className={cn(
          // 基础样式 - 统一8px圆角
          "relative flex flex-col overflow-hidden cursor-pointer",
          "bg-background rounded-lg",
          // 简化的hover效果 - 仅边框和阴影
          "border border-border/40",
          "hover:border-ocean-primary/30 hover:shadow-ocean-md",
          "transition-all duration-200",
          // 移除复杂的位移效果，仅保留微妙缩放
          "md:hover:scale-[1.01]",
          // 可访问性
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ocean-primary/50 focus-within:ring-offset-2"
        )}
      >
        {/* 整个卡片的点击区域 - 跳转到详情页 */}
        <Link href={`/tools/${website.slug}`} className="absolute inset-0 z-[1]" />

        {/* 外部链接按钮 */}
        <div className="absolute top-3 right-3 z-[2] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleVisit}
            className={cn(
              "h-8 w-8 rounded-lg",
              "bg-background/90 hover:bg-ocean-primary/10",
              "text-muted-foreground hover:text-ocean-primary",
              "shadow-sm border border-border/40 hover:border-ocean-primary/30"
            )}
            title={tLanding('island.explore_island')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* 卡片内容 */}
        <div className="relative p-4 flex flex-col gap-3">
          {/* 上半部分：缩略图和基本信息 */}
          <div className="flex items-start gap-3">
            {/* 缩略图 */}
            <div className="relative flex-shrink-0">
              <WebsiteThumbnail
                url={website.url}
                thumbnail={website.thumbnail}
                logoUrl={website.logoUrl}
                title={website.title}
                className={cn(
                  "w-16 h-16 rounded-lg",
                  "border border-border/40",
                  "group-hover:border-ocean-primary/40",
                  "transition-all duration-200"
                )}
              />
            </div>

            {/* 标题和信息 */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              {/* 标题 */}
              <h3 className={cn(
                "text-base font-semibold text-foreground line-clamp-1",
                "group-hover:text-ocean-primary transition-colors duration-200"
              )}>
                {website.title || tLanding('island.unnamed_island')}
              </h3>

              {/* 定价标签 */}
              <div className="flex items-center gap-1.5">
                {website.pricingModel === 'free' && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-ocean-success/10 text-ocean-success border-ocean-success/20"
                  >
                    {tPricing('free')}
                  </Badge>
                )}
                {website.pricingModel && website.pricingModel !== 'free' && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0.5 bg-ocean-primary/5 text-ocean-primary border-ocean-primary/20"
                  >
                    {tPricing(website.pricingModel)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* 描述 */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {website.description || tLanding('island.mysterious_island')}
          </p>
        </div>
      </Card>
    </div>
  );
}
