"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { websitesAtom, categoriesAtom } from "@/lib/atoms";
import { CompactCard } from "@/components/website/compact-card";
import { Button } from "@/ui/common/button";
import { Input } from "@/ui/common/input";
import { cn } from "@/lib/utils/utils";
import {
  Search,
  TrendingUp,
  Users,
  ExternalLink,
  ArrowRight,
  Clock,
  Shield,
  CheckCircle,
  ChevronDown,
  Plus,
  Rocket,
  Globe,
  Crown,
  Compass,
  Map,
  Route,
  MessageSquare
} from "lucide-react";
import type { Website, Category } from "@/lib/types";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { ValuePropCard } from "@/components/ui/value-prop-card";

interface SimplifiedHomePageProps {
  initialWebsites: Website[];
  initialCategories: Category[];
}

export default function SimplifiedHomePage({
  initialWebsites,
  initialCategories,
}: SimplifiedHomePageProps) {
  const tLanding = useTranslations('landing');
  const router = useRouter();
  const [websites, setWebsites] = useAtom(websitesAtom);
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [searchQuery, setSearchQuery] = useState('');
  const [topRatedWebsites, setTopRatedWebsites] = useState<Website[]>([]);
  const [mostPopularWebsites, setMostPopularWebsites] = useState<Website[]>([]);
  const [recentWebsites, setRecentWebsites] = useState<Website[]>([]);
  const [topFreeWebsites, setTopFreeWebsites] = useState<Website[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // 搜索处理函数
  const handleSearch = (query: string) => {
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set('q', query.trim());
      router.push(`/search?${params.toString()}`);
    }
  };

  // FAQ data - 融入 Magellan 探索精神
  const faqs = [
    {
      question: tLanding('sections.faq.questions.what_makes_different.question'),
      answer: tLanding('sections.faq.questions.what_makes_different.answer')
    },
    {
      question: tLanding('sections.faq.questions.quality_assurance.question'),
      answer: tLanding('sections.faq.questions.quality_assurance.answer')
    },
    {
      question: tLanding('sections.faq.questions.free_tools.question'),
      answer: tLanding('sections.faq.questions.free_tools.answer')
    },
    {
      question: tLanding('sections.faq.questions.submit_tool.question'),
      answer: tLanding('sections.faq.questions.submit_tool.answer')
    },
    {
      question: tLanding('sections.faq.questions.update_frequency.question'),
      answer: tLanding('sections.faq.questions.update_frequency.answer')
    },
    {
      question: tLanding('sections.faq.questions.account_required.question'),
      answer: tLanding('sections.faq.questions.account_required.answer')
    }
  ];

  // Value propositions - 融入 Magellan 探索主题
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

  // Initialize data
  useEffect(() => {
    setWebsites(initialWebsites);
    setCategories(initialCategories);
  }, [initialWebsites, initialCategories, setWebsites, setCategories]);

  // Process websites for different rankings
  useEffect(() => {
    const approvedWebsites = websites;

    // Top rated by quality score
    const topRated = [...approvedWebsites]
      .sort((a, b) => (b.qualityScore ?? 50) - (a.qualityScore ?? 50))
      .slice(0, 12);
    setTopRatedWebsites(topRated);

    // Most popular by visits
    const mostPopular = [...approvedWebsites]
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 12);
    setMostPopularWebsites(mostPopular);

    // Recent websites
    const recent = [...approvedWebsites]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 12);
    setRecentWebsites(recent);

    // Top free tools
    const topFree = approvedWebsites
      .filter(w => w.pricingModel === 'free' || w.hasFreeVersion)
      .sort((a, b) => (b.qualityScore ?? 50) - (a.qualityScore ?? 50))
      .slice(0, 12);
    setTopFreeWebsites(topFree);
  }, [websites]);

  const handleVisit = async (website: Website) => {
    try {
      await fetch(`/api/websites/${website.id}/visit`, { method: "POST" });
      setWebsites(prev => prev.map(w => 
        w.id === website.id ? { ...w, visits: w.visits + 1 } : w
      ));
    } catch (error) {
      console.error('Failed to track visit:', error);
    }
    window.open(website.url, "_blank");
  };

  const WebsiteCard = ({ website }: { website: Website }) => (
    <CompactCard website={website} onVisit={handleVisit} />
  );

  const RankingSection = ({ 
    title, 
    description, 
    websites, 
    icon: Icon, 
    viewAllLink 
  }: { 
    title: string; 
    description: string; 
    websites: Website[]; 
    icon: any; 
    viewAllLink: string; 
  }) => (
    <section className="py-16 px-4 relative"> {/* 海洋章节分隔 */}
      {/* 海域背景装饰 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-magellan-teal/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-2xl"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        {/* 海域标题区 - 航海日志风格 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.15, 1, 0.3, 1] }}
          className="flex items-center justify-between mb-8"
        >
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
          <Link href={viewAllLink}>
            <Button 
              variant="ghost" 
              className={cn(
                "hidden md:flex items-center gap-2 group",
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
        </motion.div>

        {/* 岛屿网格 - 探索发现 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {websites.slice(0, 12).map((website, index) => (
            <motion.div
              key={website.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.08, // 增加延迟创造波浪效果
                ease: [0.15, 1, 0.3, 1] // Atlassian entrance缓动
              }}
              className="group"
            >
              <WebsiteCard website={website} />
            </motion.div>
          ))}
        </div>

        {/* 移动端探索按钮 - 航海CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-10 text-center md:hidden"
        >
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
              <Route className="h-5 w-5 mr-2" />
              {tLanding('sections.explore_more')} {title}
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-background mobile-safe-bottom">
      {/* Hero Section - AI Magellan 海洋探险主题 */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        {/* 海洋装饰背景元素 - 专业级低调版本 */}
        <div className="absolute inset-0 opacity-8 pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-primary/4 to-transparent rounded-full blur-3xl professional-float"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-magellan-teal/3 to-transparent rounded-full blur-3xl professional-decoration"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-magellan-coral/2 to-magellan-gold/2 rounded-full blur-2xl professional-decoration active"></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.15, 1, 0.3, 1] // Atlassian entrance缓动
            }}
            className="space-y-8"
          >
            {/* 探险徽章 - AI Magellan 主题 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.3,
                delay: 0.2,
                ease: [0.15, 1, 0.3, 1]
              }}
              className={cn(
                "inline-flex items-center gap-3",
                "px-4 py-2", 
                "rounded-full",
                "bg-gradient-to-r from-primary/10 to-magellan-teal/10",
                "border border-primary/20",
                "font-medium text-sm",
                "text-primary",
                "backdrop-blur-sm"
              )}
            >
              <Compass className="h-4 w-4 professional-compass" />
              <span>🚀 {tLanding('hero.badge')}</span>
              <div className="w-2 h-2 rounded-full bg-magellan-mint professional-glow"></div>
            </motion.div>

            {/* 主标题 - 探险家精神 */}
            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.3,
                  ease: [0.15, 1, 0.3, 1]
                }}
                className={cn(
                  "font-bold text-5xl md:text-6xl lg:text-7xl leading-tight",
                  "max-w-5xl mx-auto"
                )}
              >
                {tLanding('hero.title_start')}
                <br />
                <span className="bg-gradient-to-r from-primary via-magellan-teal to-magellan-coral bg-clip-text text-transparent">
                  {tLanding('hero.title_highlight')}
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.5 
                }}
                className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              >
                🌊 {tLanding('hero.description')}
                <br />
                <span className="text-primary font-medium">{tLanding('hero.description_highlight')}</span>
              </motion.p>
            </div>
          </motion.div>

          {/* 罗盘搜索框 - 海洋主题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.4,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="mt-12 max-w-2xl mx-auto"
          >
            <div className="relative group professional-compass-search">
              {/* 专业级罗盘外环装饰 */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/8 via-magellan-coral/8 to-magellan-teal/8 rounded-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-500"></div>
              
              <div className="relative">
                <Input
                  placeholder={tLanding('hero.search_placeholder')}
                  className={cn(
                    "pl-6 pr-6 h-14 text-lg",
                    "rounded-xl border border-primary/15",
                    "bg-background/90 backdrop-blur-sm",
                    "focus:border-primary focus:bg-background",
                    "shadow-sm hover:shadow-md transition-all duration-300",
                    "placeholder:text-muted-foreground/70"
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      handleSearch(searchQuery);
                    }
                  }}
                />
                
                {/* 搜索按钮 */}
                <Button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg"
                  onClick={() => handleSearch(searchQuery)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* 探索统计 - 航海数据 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.6
            }}
            className="mt-16 flex justify-center gap-8 text-sm text-muted-foreground flex-wrap"
          >
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Map className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">{websites.length}+ {tLanding('hero.stats.islands')}</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-full bg-magellan-teal/10 group-hover:bg-magellan-teal/20 transition-colors">
                <Compass className="h-4 w-4 text-magellan-teal" />
              </div>
              <span className="font-medium">{categories.length} {tLanding('hero.stats.territories')}</span>
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
          </motion.div>

          {/* 探索行动按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.7,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/categories">
              <Button 
                size="lg" 
                className={cn(
                  "w-full sm:w-auto",
                  "bg-primary hover:bg-primary/90 text-white",
                  "rounded-xl px-8 py-4 text-base font-semibold",
                  "shadow-lg hover:shadow-xl transition-shadow duration-200",
                  "subtle-scale"
                )}
              >
                <Map className="h-5 w-5 mr-2" />
                🗺️ {tLanding('hero.buttons.explore_territories')}
              </Button>
            </Link>
            <Link href="/submit">
              <Button 
                size="lg" 
                variant="outline"
                className={cn(
                  "w-full sm:w-auto",
                  "border-primary/30 hover:border-primary hover:bg-primary/5",
                  "rounded-xl px-8 py-4 text-base font-semibold",
                  "transition-colors duration-200 subtle-hover"
                )}
              >
                <Compass className="h-5 w-5 mr-2" />
                ⚓ {tLanding('hero.buttons.mark_discovery')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Rankings Sections */}
      <RankingSection
        title={tLanding('sections.ranking_sections.premier_discoveries.title')}
        description={tLanding('sections.ranking_sections.premier_discoveries.description')}
        websites={topRatedWebsites}
        icon={Crown}
        viewAllLink="/rankings/top-rated"
      />

      <div className="bg-muted/30">
        <RankingSection
          title={tLanding('sections.ranking_sections.trending_expeditions.title')}
          description={tLanding('sections.ranking_sections.trending_expeditions.description')}
          websites={mostPopularWebsites}
          icon={TrendingUp}
          viewAllLink="/rankings/popular"
        />
      </div>

      <RankingSection
        title={tLanding('sections.ranking_sections.free_territory.title')}
        description={tLanding('sections.ranking_sections.free_territory.description')}
        websites={topFreeWebsites}
        icon={CheckCircle}
        viewAllLink="/rankings/free"
      />

      <div className="bg-muted/30">
        <RankingSection
          title={tLanding('sections.ranking_sections.new_horizons.title')}
          description={tLanding('sections.ranking_sections.new_horizons.description')}
          websites={recentWebsites}
          icon={Clock}
          viewAllLink="/rankings/recent"
        />
      </div>

      {/* AM.md Optimized Expert Navigation Section - 专业航海探索指南 */}
      <section className="py-24 px-4 relative overflow-hidden" style={{backgroundColor: 'var(--magellan-depth-50)'}}>
        {/* AM.md 专业级海洋背景装饰 - 6-8%透明度标准 */}
        <div className="absolute inset-0 opacity-6 pointer-events-none professional-decoration">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl professional-float" 
               style={{background: 'linear-gradient(135deg, var(--magellan-teal) 0%, var(--magellan-mint) 50%, var(--magellan-primary) 100%)'}}></div>
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-bl from-magellan-gold/4 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-tr from-magellan-coral/3 to-transparent rounded-full blur-3xl professional-decoration active"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          {/* AM.md 航海探索标题区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4,
              ease: [0.15, 1, 0.3, 1] // AM.md 专业级缓动
            }}
            className="text-center mb-16"
          >
            {/* 航海探索徽章 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.3,
                delay: 0.1,
                ease: [0.15, 1, 0.3, 1]
              }}
              className={cn(
                "inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full",
                "bg-gradient-to-r from-magellan-teal/10 to-magellan-mint/10",
                "border border-magellan-teal/20 backdrop-blur-sm",
                "professional-glow"
              )}
            >
              <div className="relative">
                <Compass className="h-4 w-4 text-magellan-teal professional-compass" />
                <div className="absolute inset-0 rounded-full bg-magellan-teal/20 professional-glow"></div>
              </div>
              <span className="text-sm font-medium text-magellan-teal">
                🧭 {tLanding('sections.value_props.badge')}
              </span>
              <div className="w-2 h-2 rounded-full bg-magellan-mint professional-glow"></div>
            </motion.div>

            {/* 航海主题标题 */}
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.2,
                ease: [0.15, 1, 0.3, 1]
              }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-magellan-depth-900 mb-4"
            >
              <span className="inline-flex items-center gap-2">
                ⚓ {tLanding('sections.value_props.title')}
              </span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.3
              }}
              className="text-lg text-magellan-depth-600 max-w-3xl mx-auto leading-relaxed"
            >
              🌊 {tLanding('sections.value_props.description')}
            </motion.p>
          </motion.div>

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

          {/* AM.md 航海探索统计 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.8
            }}
            className="mt-16 flex justify-center gap-8 flex-wrap"
          >
           
          </motion.div>
        </div>
      </section>

      {/* AM.md Optimized FAQ Section - 专业航海探索指南 */}
      <div className="bg-muted/30">
        <section className="py-24 px-4 relative overflow-hidden">
        {/* AM.md 专业级背景装饰 - 6-8%透明度标准 */}
        <div className="absolute inset-0 opacity-6 pointer-events-none professional-decoration">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl professional-float" 
               style={{background: 'linear-gradient(135deg, var(--magellan-coral) 0%, var(--magellan-gold) 100%)'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-tr from-magellan-mint/4 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-magellan-primary/3 to-transparent rounded-full blur-3xl professional-decoration active"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          {/* AM.md 航海问答标题区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4,
              ease: [0.15, 1, 0.3, 1] // AM.md 专业级缓动
            }}
            className="text-center mb-16"
          >
            {/* 航海问答徽章 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.3,
                delay: 0.1,
                ease: [0.15, 1, 0.3, 1]
              }}
              className={cn(
                "inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full",
                "bg-gradient-to-r from-magellan-coral/10 to-magellan-gold/10",
                "border border-magellan-coral/20 backdrop-blur-sm",
                "professional-glow"
              )}
            >
              <div className="relative">
                <MessageSquare className="h-4 w-4 text-magellan-coral professional-compass" />
                <div className="absolute inset-0 rounded-full bg-magellan-coral/20 professional-glow"></div>
              </div>
              <span className="text-sm font-medium text-magellan-coral">
                💬 {tLanding('sections.faq.badge')}
              </span>
              <div className="w-2 h-2 rounded-full bg-magellan-gold professional-glow"></div>
            </motion.div>

            {/* 航海问答标题 */}
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.2,
                ease: [0.15, 1, 0.3, 1]
              }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-magellan-depth-900 mb-4"
            >
              <span className="inline-flex items-center gap-2">
                🗣️ {tLanding('sections.faq.title')}
              </span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.3
              }}
              className="text-lg text-magellan-depth-600 max-w-3xl mx-auto leading-relaxed"
            >
              🧭 {tLanding('sections.faq.description')}
            </motion.p>
          </motion.div>

          {/* AM.md 专业级问答列表 */}
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.08,
                  ease: [0.15, 1, 0.3, 1] // AM.md 专业级缓动
                }}
              >
                <div className={cn(
                  "group overflow-hidden transition-all duration-300",
                  "bg-magellan-depth-50 hover:bg-white",
                  "border border-magellan-primary/15 hover:border-magellan-primary/30",
                  "rounded-xl shadow-sm hover:shadow-md",
                  "professional-glow"
                )}>
                  <div className="p-0">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className="w-full text-left p-6 flex items-center justify-between group/btn transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* 航海序号指示器 */}
                        <div className={cn(
                          "p-3 rounded-xl transition-all duration-300 flex items-center justify-center",
                          "bg-gradient-to-br from-magellan-primary/10 to-magellan-teal/10",
                          "border border-magellan-primary/20 group-hover/btn:border-magellan-primary/40",
                          "group-hover/btn:bg-gradient-to-br group-hover/btn:from-magellan-primary/15 group-hover/btn:to-magellan-teal/15",
                          "min-w-[48px] h-12"
                        )}>
                          <span className="font-bold text-magellan-primary text-sm">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        </div>

                        {/* 问题标题 */}
                        <h3 className={cn(
                          "font-semibold text-magellan-depth-900 transition-colors duration-300",
                          "group-hover/btn:text-magellan-primary text-base md:text-lg"
                        )}>
                          {faq.question}
                        </h3>
                      </div>

                      {/* 展开指示器 */}
                      <div className={cn(
                        "flex-shrink-0 p-2 rounded-lg transition-all duration-300",
                        "bg-magellan-depth-100 group-hover/btn:bg-magellan-primary/10",
                        "border border-magellan-primary/10 group-hover/btn:border-magellan-primary/20",
                        openFaqIndex === index ? 'rotate-180' : 'rotate-0'
                      )}>
                        <ChevronDown className="h-5 w-5 text-magellan-depth-600 group-hover/btn:text-magellan-primary transition-colors" />
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {openFaqIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ 
                            duration: 0.3,
                            ease: [0.15, 1, 0.3, 1] // AM.md 专业级缓动
                          }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6">
                            <div className="pl-16"> {/* 调整左边距以适配序号 */}
                              <div className={cn(
                                "pl-4 py-4 rounded-lg",
                                "bg-gradient-to-r from-magellan-primary/5 to-magellan-teal/5",
                                "border-l-4 border-magellan-primary/30"
                              )}>
                                <p className="text-magellan-depth-700 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AM.md 底部航海支持信息 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.8
            }}
            className="mt-16 text-center"
          >
          </motion.div>
        </div>
      </section>
      </div>

      {/* AM.md Optimized CTA/GTA Section - 专业级行动号召区域 */}
      <section className="py-24 px-4 relative overflow-hidden" style={{backgroundColor: 'var(--magellan-depth-50)'}}>
        {/* AM.md 专业级背景装饰 - 遵循6-8%透明度标准 */}
        <div className="absolute inset-0 opacity-6 pointer-events-none professional-decoration">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl professional-float" 
               style={{background: 'linear-gradient(135deg, var(--magellan-primary) 0%, var(--magellan-teal) 50%, var(--magellan-coral) 100%)'}}></div>
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-bl from-magellan-mint/4 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-tr from-magellan-gold/3 to-transparent rounded-full blur-3xl professional-decoration active"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4,
              ease: [0.15, 1, 0.3, 1] // AM.md 专业级缓动
            }}
            className="space-y-8"
          >
            {/* AM.md 航海探索徽章 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.3,
                delay: 0.1,
                ease: [0.15, 1, 0.3, 1]
              }}
              className={cn(
                "inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full",
                "bg-gradient-to-r from-magellan-primary/10 to-magellan-teal/10",
                "border border-magellan-primary/20 backdrop-blur-sm",
                "professional-glow"
              )}
            >
              <div className="relative">
                <Compass className="h-4 w-4 text-magellan-primary professional-compass" />
                <div className="absolute inset-0 rounded-full bg-magellan-primary/20 professional-glow"></div>
              </div>
              <span className="text-sm font-medium text-magellan-primary">
                🚀 {tLanding('sections.final_cta.badge')}
              </span>
              <div className="w-2 h-2 rounded-full bg-magellan-mint professional-glow"></div>
            </motion.div>
            
            {/* AM.md 航海主题标题系统 */}
            <div className="space-y-6">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.2,
                  ease: [0.15, 1, 0.3, 1]
                }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-magellan-depth-900"
              >
                <span className="inline-flex items-center gap-2">
                  ⚓ {tLanding('sections.final_cta.title')}
                </span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.3
                }}
                className="text-lg md:text-xl text-magellan-depth-600 max-w-2xl mx-auto leading-relaxed"
              >
                🌊 {tLanding('sections.final_cta.description')}
              </motion.p>
            </div>
            
            {/* AM.md 航海统计指示器 - 探索数据 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: 0.4
              }}
              className="flex justify-center gap-8 flex-wrap my-12"
            >
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
            </motion.div>
            
            {/* AM.md 专业级航海行动按钮系统 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: 0.5
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto"
            >
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
            </motion.div>

            {/* AM.md 底部航海装饰线 */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.6,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              className="mt-16 flex justify-center"
            >
              <div className={cn(
                "h-0.5 w-32 rounded-full",
                "bg-gradient-to-r from-transparent via-magellan-primary/30 to-transparent"
              )}></div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
