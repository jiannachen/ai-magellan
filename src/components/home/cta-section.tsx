import { getTranslations } from 'next-intl/server';
import Link from "next/link";
import { Button } from "@/ui/common/button";
import { Compass, Plus, ArrowRight, Search, ExternalLink, Users, Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils/utils";

/**
 * CTA Section - Server Component
 * 行动号召区域,主要是静态内容
 */
export async function CTASection() {
  const tLanding = await getTranslations('landing');

  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ backgroundColor: 'var(--magellan-depth-50)' }}>
      {/* AM.md 专业级背景装饰 - 遵循6-8%透明度标准 */}
      <div className="absolute inset-0 opacity-6 pointer-events-none professional-decoration">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl professional-float"
          style={{ background: 'linear-gradient(135deg, var(--magellan-primary) 0%, var(--magellan-teal) 50%, var(--magellan-coral) 100%)' }}></div>
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-bl from-magellan-mint/4 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-tr from-magellan-gold/3 to-transparent rounded-full blur-3xl professional-decoration active"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="space-y-8">
          {/* AM.md 航海探索徽章 */}
          <div className={cn(
            "inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full",
            "bg-gradient-to-r from-magellan-primary/10 to-magellan-teal/10",
            "border border-magellan-primary/20 backdrop-blur-sm",
            "professional-glow"
          )}>
            <div className="relative">
              <Compass className="h-4 w-4 text-magellan-primary professional-compass" />
              <div className="absolute inset-0 rounded-full bg-magellan-primary/20 professional-glow"></div>
            </div>
            <span className="text-sm font-medium text-magellan-primary">
              🚀 {tLanding('sections.final_cta.badge')}
            </span>
            <div className="w-2 h-2 rounded-full bg-magellan-mint professional-glow"></div>
          </div>

          {/* AM.md 航海主题标题系统 */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-magellan-depth-900">
              <span className="inline-flex items-center gap-2">
                ⚓ {tLanding('sections.final_cta.title')}
              </span>
            </h2>
            <p className="text-lg md:text-xl text-magellan-depth-600 max-w-2xl mx-auto leading-relaxed">
              🌊 {tLanding('sections.final_cta.description')}
            </p>
          </div>

          {/* AM.md 航海统计指示器 - 探索数据 */}
          <div className="flex justify-center gap-8 flex-wrap my-12">
            <div className="flex items-center gap-3 group">
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                "bg-gradient-to-br from-magellan-mint/10 to-magellan-mint/5",
                "border border-magellan-mint/20 group-hover:border-magellan-mint/40",
                "group-hover:bg-magellan-mint/15"
              )}>
                <Users className="h-4 w-4 text-magellan-mint" />
              </div>
              <span className="font-semibold text-magellan-depth-700">
                {tLanding('sections.final_cta.stats.active_explorers')}
              </span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                "bg-gradient-to-br from-magellan-gold/10 to-magellan-gold/5",
                "border border-magellan-gold/20 group-hover:border-magellan-gold/40",
                "group-hover:bg-magellan-gold/15"
              )}>
                <Crown className="h-4 w-4 text-magellan-gold" />
              </div>
              <span className="font-semibold text-magellan-depth-700">
                {tLanding('sections.final_cta.stats.discoveries_made')}
              </span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                "bg-gradient-to-br from-magellan-coral/10 to-magellan-coral/5",
                "border border-magellan-coral/20 group-hover:border-magellan-coral/40",
                "group-hover:bg-magellan-coral/15"
              )}>
                <Shield className="h-4 w-4 text-magellan-coral" />
              </div>
              <span className="font-semibold text-magellan-depth-700">
                {tLanding('sections.final_cta.stats.verified_treasures')}
              </span>
            </div>
          </div>

          {/* AM.md 专业级航海行动按钮系统 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            {/* 主要行动按钮 - 标记发现 */}
            <Link href="/submit" className="w-full sm:w-auto">
              <Button
                size="lg"
                className={cn(
                  "w-full group min-h-[48px] relative overflow-hidden",
                  "bg-gradient-to-r from-magellan-primary to-magellan-teal",
                  "hover:from-magellan-primary/90 hover:to-magellan-teal/90",
                  "text-white rounded-xl px-8 py-4 font-semibold",
                  "shadow-lg hover:shadow-xl transition-all duration-300",
                  "border border-magellan-primary/20 hover:border-magellan-primary/40",
                  "subtle-scale professional-glow"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                ⚓ {tLanding('sections.final_cta.chart_discovery')}
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>

            {/* 次要行动按钮 - 探索海域 */}
            <Link href="/categories" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "w-full group min-h-[48px] relative",
                  "bg-magellan-depth-50 hover:bg-magellan-depth-100",
                  "border-2 border-magellan-primary/30 hover:border-magellan-primary",
                  "text-magellan-primary hover:text-magellan-primary",
                  "rounded-xl px-8 py-4 font-semibold",
                  "shadow-md hover:shadow-lg transition-all duration-300",
                  "subtle-hover"
                )}
              >
                <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                🗺️ {tLanding('sections.final_cta.explore_territories')}
                <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </Button>
            </Link>
          </div>

          {/* AM.md 底部航海装饰线 */}
          <div className="mt-16 flex justify-center">
            <div className={cn(
              "h-0.5 w-32 rounded-full",
              "bg-gradient-to-r from-transparent via-magellan-primary/30 to-transparent"
            )}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
