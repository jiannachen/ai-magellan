'use client';

import { useTranslations } from 'next-intl';
import Link from "next/link";
import { Button } from "@/ui/common/button";
import { cn } from "@/lib/utils/utils";
import { ArrowRight, Compass, Map, Crown, TrendingUp, CheckCircle, Clock } from "lucide-react";
import type { Website } from "@/lib/types";
import { WebsiteGrid } from "./website-grid";

// Icon mapping
const iconMap = {
  crown: Crown,
  trendingUp: TrendingUp,
  checkCircle: CheckCircle,
  clock: Clock,
} as const;

type IconName = keyof typeof iconMap;

interface RankingSectionProps {
  title: string;
  description: string;
  websites: Website[];
  iconName: IconName;
  viewAllLink: string;
  variant?: 'default' | 'muted';
}

/**
 * Ranking Section - Client Component
 * 排行榜区域,主要是静态内容,网站卡片网格是客户端组件
 */
export function RankingSection({
  title,
  description,
  websites,
  iconName,
  viewAllLink,
  variant = 'default'
}: RankingSectionProps) {
  const tLanding = useTranslations('landing');
  const Icon = iconMap[iconName];

  return (
    <section className={cn(
      "py-16 px-4 relative",
      variant === 'muted' && "bg-muted/30"
    )}>
      {/* 海域背景装饰 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-magellan-teal/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* 海域标题区 - 航海日志风格 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* 海域图标 - 罗盘风格 */}
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-primary/15 to-magellan-teal/10",
              "border border-primary/20 shadow-lg",
              "relative group"
            )}>
              <Icon className="h-6 w-6 text-primary subtle-scale" />
              {/* 发光效果 */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="space-y-1">
              <h2 className={cn(
                "text-atlassian-h3 font-semibold text-foreground",
                "flex items-center gap-2"
              )}>
                🗺️ {title}
              </h2>
              <p className="text-atlassian-body text-muted-foreground flex items-center gap-2">
                <Compass className="h-4 w-4 text-magellan-teal" />
                {description}
              </p>
            </div>
          </div>

          {/* 探索更多按钮 - 航海风格 */}
          <Link href={viewAllLink} className="hidden md:block">
            <Button
              variant="ghost"
              className={cn(
                "flex items-center gap-2 group",
                "px-4 py-2 rounded-xl",
                "bg-gradient-to-r from-transparent to-primary/5",
                "border border-primary/20 hover:border-primary/40",
                "text-primary hover:bg-primary/10",
                "subtle-hover",
                "shadow-md hover:shadow-lg"
              )}
            >
              <Map className="h-4 w-4 group-hover:rotate-6 transition-transform duration-300 professional-rotate" />
              {tLanding('sections.view_all')}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>

        {/* 网站网格 - 客户端组件 */}
        <WebsiteGrid websites={websites.slice(0, 12)} />

        {/* 移动端探索按钮 */}
        <div className="mt-10 text-center md:hidden">
          <Link href={viewAllLink}>
            <Button
              size="lg"
              className={cn(
                "w-full max-w-sm",
                "bg-gradient-to-r from-primary to-magellan-teal",
                "hover:from-primary/90 hover:to-magellan-teal/90",
                "text-white rounded-xl px-6 py-4",
                "shadow-lg hover:shadow-xl",
                "subtle-hover",
                "border border-primary/20"
              )}
            >
              <Map className="h-5 w-5 mr-2" />
              {tLanding('sections.explore_more')} {title}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
