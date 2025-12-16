'use client';

import { useTranslations } from 'next-intl';
import { Compass, Map, Route, Shield, Globe, Rocket } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { ValuePropCard } from "@/components/ui/value-prop-card";

/**
 * Value Props Section - Client Component
 * 价值主张区域,完全静态内容
 */
export function ValuePropsSection() {
  const tLanding = useTranslations('landing');

  const valueProps = [
    {
      icon: Compass,
      title: tLanding('sections.value_props.expert_navigation.title'),
      description: tLanding('sections.value_props.expert_navigation.description')
    },
    {
      icon: Map,
      title: tLanding('sections.value_props.charted_territory.title'),
      description: tLanding('sections.value_props.charted_territory.description')
    },
    {
      icon: Route,
      title: tLanding('sections.value_props.optimal_routes.title'),
      description: tLanding('sections.value_props.optimal_routes.description')
    },
    {
      icon: Shield,
      title: tLanding('sections.value_props.verified_quality.title'),
      description: tLanding('sections.value_props.verified_quality.description')
    },
    {
      icon: Globe,
      title: tLanding('sections.value_props.global_discovery.title'),
      description: tLanding('sections.value_props.global_discovery.description')
    },
    {
      icon: Rocket,
      title: tLanding('sections.value_props.pioneer_access.title'),
      description: tLanding('sections.value_props.pioneer_access.description')
    }
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden" style={{ backgroundColor: 'var(--magellan-depth-50)' }}>
      {/* AM.md 专业级海洋背景装饰 - 6-8%透明度标准 */}
      <div className="absolute inset-0 opacity-6 pointer-events-none professional-decoration">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl professional-float"
          style={{ background: 'linear-gradient(135deg, var(--magellan-teal) 0%, var(--magellan-mint) 50%, var(--magellan-primary) 100%)' }}></div>
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-bl from-magellan-gold/4 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-tr from-magellan-coral/3 to-transparent rounded-full blur-3xl professional-decoration active"></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* AM.md 航海探索标题区域 */}
        <div className="text-center mb-16">
          {/* 航海探索徽章 */}
          <div className={cn(
            "inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full",
            "bg-gradient-to-r from-magellan-teal/10 to-magellan-mint/10",
            "border border-magellan-teal/20 backdrop-blur-sm",
            "professional-glow"
          )}>
            <div className="relative">
              <Compass className="h-4 w-4 text-magellan-teal professional-compass" />
              <div className="absolute inset-0 rounded-full bg-magellan-teal/20 professional-glow"></div>
            </div>
            <span className="text-sm font-medium text-magellan-teal">
              🧭 {tLanding('sections.value_props.badge')}
            </span>
            <div className="w-2 h-2 rounded-full bg-magellan-mint professional-glow"></div>
          </div>

          {/* 航海主题标题 */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-magellan-depth-900 mb-4">
            <span className="inline-flex items-center gap-2">
              ⚓ {tLanding('sections.value_props.title')}
            </span>
          </h2>

          <p className="text-lg text-magellan-depth-600 max-w-3xl mx-auto leading-relaxed">
            🌊 {tLanding('sections.value_props.description')}
          </p>
        </div>

        {/* AM.md 专业级航海能力网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => (
            <div key={index} className="group">
              <ValuePropCard
                icon={prop.icon}
                title={prop.title}
                description={prop.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
