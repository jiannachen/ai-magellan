import { getTranslations } from 'next-intl/server';
import { Map, Compass, Crown, Users } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { HeroSearch } from "./hero-search";
import { HeroActions } from "./hero-actions";

interface HeroSectionProps {
  websiteCount: number;
  categoryCount: number;
}

/**
 * Hero Section - Server Component
 * 首页顶部区域,主要是静态内容,仅搜索框是客户端组件
 */
export async function HeroSection({ websiteCount, categoryCount }: HeroSectionProps) {
  const tLanding = await getTranslations('landing');

  return (
    <section className="relative py-24 px-4 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
      {/* 海洋装饰背景元素 - 专业级低调版本 */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-primary/4 to-transparent rounded-full blur-3xl professional-float"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-magellan-teal/3 to-transparent rounded-full blur-3xl professional-decoration"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-magellan-coral/2 to-magellan-gold/2 rounded-full blur-2xl professional-decoration active"></div>
      </div>

      <div className="container mx-auto text-center relative z-10">
        <div className="space-y-8">
          {/* 探险徽章 - AI Magellan 主题 */}
          <div className={cn(
            "inline-flex items-center gap-3",
            "px-4 py-2",
            "rounded-full",
            "bg-gradient-to-r from-primary/10 to-magellan-teal/10",
            "border border-primary/20",
            "font-medium text-sm",
            "text-primary",
            "backdrop-blur-sm"
          )}>
            <Compass className="h-4 w-4 professional-compass" />
            <span>🚀 {tLanding('hero.badge')}</span>
            <div className="w-2 h-2 rounded-full bg-magellan-mint professional-glow"></div>
          </div>

          {/* 主标题 - 探险家精神 */}
          <div className="space-y-6">
            <h1 className={cn(
              "font-bold text-5xl md:text-6xl lg:text-7xl leading-tight",
              "max-w-5xl mx-auto"
            )}>
              {tLanding('hero.title_start')}
              <br />
              <span className="bg-gradient-to-r from-primary via-magellan-teal to-magellan-coral bg-clip-text text-transparent">
                {tLanding('hero.title_highlight')}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              🌊 {tLanding('hero.description')}
              <br />
              <span className="text-primary font-medium">{tLanding('hero.description_highlight')}</span>
            </p>
          </div>
        </div>

        {/* 搜索框 - 客户端组件 */}
        <div className="mt-12">
          <HeroSearch />
        </div>

        {/* 探索统计 - 航海数据 */}
        <div className="mt-16 flex justify-center gap-8 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-2 group">
            <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Map className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">{websiteCount}+ {tLanding('hero.stats.islands')}</span>
          </div>
          <div className="flex items-center gap-2 group">
            <div className="p-2 rounded-full bg-magellan-teal/10 group-hover:bg-magellan-teal/20 transition-colors">
              <Compass className="h-4 w-4 text-magellan-teal" />
            </div>
            <span className="font-medium">{categoryCount} {tLanding('hero.stats.territories')}</span>
          </div>
          <div className="flex items-center gap-2 group">
            <div className="p-2 rounded-full bg-magellan-gold/10 group-hover:bg-magellan-gold/20 transition-colors">
              <Crown className="h-4 w-4 text-magellan-gold" />
            </div>
            <span className="font-medium">{tLanding('hero.stats.curated_treasures')}</span>
          </div>
          <div className="flex items-center gap-2 group">
            <div className="p-2 rounded-full bg-magellan-mint/10 group-hover:bg-magellan-mint/20 transition-colors">
              <Users className="h-4 w-4 text-magellan-mint" />
            </div>
            <span className="font-medium">{tLanding('hero.stats.explorers')}</span>
          </div>
        </div>

        {/* 行动按钮 - 客户端组件 */}
        <div className="mt-10">
          <HeroActions />
        </div>
      </div>
    </section>
  );
}
