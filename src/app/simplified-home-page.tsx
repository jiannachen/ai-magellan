"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import { websitesAtom, categoriesAtom, searchQueryAtom, selectedCategoryAtom } from "@/lib/atoms";
import { SearchManager } from "@/components/search/search-manager";
import { CompactCard } from "@/components/website/compact-card";
import { Button } from "@/ui/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/common/card";
import { Badge } from "@/ui/common/badge";
import { Input } from "@/ui/common/input";
import { cn } from "@/lib/utils/utils";
import { 
  Search, 
  TrendingUp, 
  Star,
  Users,
  ExternalLink,
  ArrowRight,
  Heart,
  Bookmark,
  Eye,
  Clock,
  Award,
  Shield,
  Zap,
  Target,
  CheckCircle,
  ChevronDown,
  Plus,
  Minus,
  BarChart3,
  Rocket,
  Globe,
  Lightbulb,
  Crown,
  Calendar,
  ThumbsUp,
  Grid3X3,
  Compass,
  Map,
  Route
} from "lucide-react";
import type { Website, Category } from "@/lib/types";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { useUser } from '@clerk/nextjs';

interface SimplifiedHomePageProps {
  initialWebsites: Website[];
  initialCategories: Category[];
}

export default function SimplifiedHomePage({
  initialWebsites,
  initialCategories,
}: SimplifiedHomePageProps) {
  const t = useTranslations();
  const { user } = useUser();
  const [websites, setWebsites] = useAtom(websitesAtom);
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [selectedCategory] = useAtom(selectedCategoryAtom);
  const [filteredWebsites, setFilteredWebsites] = useState<Website[]>([]);
  const [topRatedWebsites, setTopRatedWebsites] = useState<Website[]>([]);
  const [mostPopularWebsites, setMostPopularWebsites] = useState<Website[]>([]);
  const [recentWebsites, setRecentWebsites] = useState<Website[]>([]);
  const [topFreeWebsites, setTopFreeWebsites] = useState<Website[]>([]);
  const [topPaidWebsites, setTopPaidWebsites] = useState<Website[]>([]);
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
  const [userFavorites, setUserFavorites] = useState<Set<number>>(new Set());
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // FAQ data - 融入 Magellan 探索精神
  const faqs = [
    {
      question: t('home.faq.questions.what_makes_different.question'),
      answer: t('home.faq.questions.what_makes_different.answer')
    },
    {
      question: t('home.faq.questions.quality_assurance.question'),
      answer: t('home.faq.questions.quality_assurance.answer')
    },
    {
      question: t('home.faq.questions.free_tools.question'),
      answer: t('home.faq.questions.free_tools.answer')
    },
    {
      question: t('home.faq.questions.submit_tool.question'),
      answer: t('home.faq.questions.submit_tool.answer')
    },
    {
      question: t('home.faq.questions.update_frequency.question'),
      answer: t('home.faq.questions.update_frequency.answer')
    },
    {
      question: t('home.faq.questions.account_required.question'),
      answer: t('home.faq.questions.account_required.answer')
    }
  ];

  // Value propositions - 融入 Magellan 探索主题
  const valueProps = [
    {
      icon: Compass,
      title: t('home.value_props.expert_navigation.title'),
      description: t('home.value_props.expert_navigation.description')
    },
    {
      icon: Map,
      title: t('home.value_props.charted_territory.title'),
      description: t('home.value_props.charted_territory.description')
    },
    {
      icon: Route,
      title: t('home.value_props.optimal_routes.title'),
      description: t('home.value_props.optimal_routes.description')
    },
    {
      icon: Shield,
      title: t('home.value_props.verified_quality.title'),
      description: t('home.value_props.verified_quality.description')
    },
    {
      icon: Globe,
      title: t('home.value_props.global_discovery.title'),
      description: t('home.value_props.global_discovery.description')
    },
    {
      icon: Rocket,
      title: t('home.value_props.pioneer_access.title'), 
      description: t('home.value_props.pioneer_access.description')
    }
  ];

  // Initialize data
  useEffect(() => {
    setWebsites(initialWebsites);
    setCategories(initialCategories);
  }, [initialWebsites, initialCategories, setWebsites, setCategories]);

  // Load user interactions if logged in
  useEffect(() => {
    if (user) {
      Promise.all([
        fetch('/api/user/likes/check').then(res => res.ok ? res.json() : { data: [] }),
        fetch('/api/user/favorites/check').then(res => res.ok ? res.json() : { data: [] })
      ]).then(([likesRes, favoritesRes]) => {
        if (likesRes.data) {
          setUserLikes(new Set(likesRes.data.map((item: any) => item.websiteId)));
        }
        if (favoritesRes.data) {
          setUserFavorites(new Set(favoritesRes.data.map((item: any) => item.websiteId)));
        }
      }).catch(console.error);
    }
  }, [user]);

  // Process websites for different rankings
  useEffect(() => {
    // 直接使用传入的websites，因为在page.tsx中已经过滤了approved状态
    const approvedWebsites = websites;
    console.log('=== DEBUGGING WEBSITE DATA ===');
    console.log('Processing websites - total:', websites.length);
    console.log('Sample website data:', websites[0]);
    
    // 检查数据质量
    const hasQualityScore = websites.filter(w => w.quality_score != null && w.quality_score > 0);
    const hasVisits = websites.filter(w => w.visits > 0);
    const hasCreatedAt = websites.filter(w => w.created_at != null);
    const hasPricingModel = websites.filter(w => w.pricing_model != null);
    
    console.log('Data quality check:');
    console.log('- With quality_score > 0:', hasQualityScore.length);
    console.log('- With visits > 0:', hasVisits.length); 
    console.log('- With created_at:', hasCreatedAt.length);
    console.log('- With pricing_model:', hasPricingModel.length);

    // Top rated by quality score
    const topRated = [...approvedWebsites]
      .sort((a, b) => (b.quality_score ?? 50) - (a.quality_score ?? 50))
      .slice(0, 12);
    console.log('Top rated websites:', topRated.length, topRated.map(w => `${w.title}: ${w.quality_score}`));
    setTopRatedWebsites(topRated);

    // Most popular by visits
    const mostPopular = [...approvedWebsites]
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 12);
    console.log('Most popular websites:', mostPopular.length, mostPopular.map(w => `${w.title}: ${w.visits} visits`));
    setMostPopularWebsites(mostPopular);

    // Recent websites
    const recent = [...approvedWebsites]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 12);
    console.log('Recent websites:', recent.length, recent.map(w => `${w.title}: ${w.created_at}`));
    setRecentWebsites(recent);

    // Top free tools
    const topFree = approvedWebsites
      .filter(w => w.pricing_model === 'free' || w.has_free_version)
      .sort((a, b) => (b.quality_score ?? 50) - (a.quality_score ?? 50))
      .slice(0, 12);
    console.log('Top free websites:', topFree.length, 'filtered from', approvedWebsites.length);
    setTopFreeWebsites(topFree);

    // Top paid tools
    const topPaid = approvedWebsites
      .filter(w => w.pricing_model !== 'free' && !w.has_free_version)
      .sort((a, b) => (b.quality_score ?? 50) - (a.quality_score ?? 50))
      .slice(0, 12);
    console.log('Top paid websites:', topPaid.length);
    setTopPaidWebsites(topPaid);
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

  const handleLike = async (websiteId: number) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/websites/${websiteId}/like`, { method: "POST" });
      if (response.ok) {
        const isLiked = userLikes.has(websiteId);
        setUserLikes(prev => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.delete(websiteId);
          } else {
            newSet.add(websiteId);
          }
          return newSet;
        });
        
        setWebsites(prev => prev.map(w => 
          w.id === websiteId 
            ? { ...w, likes: isLiked ? w.likes - 1 : w.likes + 1 }
            : w
        ));
      }
    } catch (error) {
      console.error('Failed to like website:', error);
    }
  };

  const handleFavorite = async (websiteId: number) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/user/favorites', {
        method: userFavorites.has(websiteId) ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId })
      });
      
      if (response.ok) {
        setUserFavorites(prev => {
          const newSet = new Set(prev);
          if (userFavorites.has(websiteId)) {
            newSet.delete(websiteId);
          } else {
            newSet.add(websiteId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to favorite website:', error);
    }
  };

  const WebsiteCard = ({ website, rank }: { website: Website; rank?: number }) => (
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
    <section className="py-12 px-4"> {/* 减少padding，更精简 */}
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6"> {/* 减少margin-bottom */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center", // 使用8px圆角
              "bg-primary/10 border border-primary/20"
            )}>
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-atlassian-h3 font-medium text-foreground">{title}</h2>
              <p className="text-atlassian-body text-muted-foreground">{description}</p>
            </div>
          </div>
          <Link href={viewAllLink}>
            <Button 
              variant="ghost" 
              className={cn(
                "hidden md:flex items-center gap-2 text-primary",
                "hover:bg-primary/5 transition-atlassian-standard",
                "rounded-md px-3 py-2" // Atlassian风格的按钮
              )}
            >
              {t('home.view_all')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"> {/* 调整为3-4列布局 */}
          {websites.slice(0, 12).map((website, index) => (
            <motion.div
              key={website.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3, // 缩短动画时间
                delay: index * 0.03, // 减少延迟间隔
                ease: [0.25, 0.1, 0.25, 1] // 使用Atlassian缓动曲线
              }}
            >
              <WebsiteCard website={website} rank={index + 1} />
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Button - Atlassian风格 */}
        <div className="mt-6 text-center md:hidden">
          <Link href={viewAllLink}>
            <Button 
              variant="secondary" 
              className={cn(
                "w-full max-w-sm",
                "rounded-md border border-border",
                "hover:bg-muted transition-atlassian-standard"
              )}
            >
              {t('home.view_all')} {title}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Atlassian风格 */}
      <section className="relative py-20 px-4 bg-background"> {/* 减少垂直间距 */}
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.15, 1, 0.3, 1] // Atlassian entrance缓动
            }}
            className="space-y-6" // 减少间距
          >
            {/* Badge - Atlassian Design System */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 100, // ds-motion-duration-fast
                delay: 100,
                ease: [0.15, 1, 0.3, 1] // ds-motion-easing-entrance
              }}
              className={cn(
                "inline-flex items-center gap-2",
                "px-3 py-1.5", 
                "rounded-[4px]", // ds-border-radius-100
                "bg-[color:var(--ds-background-brand-bold)] bg-opacity-10", 
                "border border-[color:var(--ds-background-brand-bold)] border-opacity-20",
                "font-medium",
                "text-[11px] leading-4 tracking-[0.5px]", // ds-caption typography
                "text-[color:var(--ds-background-brand-bold)]"
              )}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{t('home.badge')}</span>
            </motion.div>

            {/* Main Title - Atlassian Design System Typography */}
            <div className="space-y-[var(--ds-space-300)]"> {/* ds-space-300: 24px */}
              <h1 className={cn(
                "font-[var(--ds-font-family-sans)]",
                "text-[48px] leading-[56px] font-medium tracking-[-0.02em]", // ds-heading-display
                "md:text-[48px] md:leading-[56px]",
                "max-w-4xl mx-auto"
              )}>
                {t('home.title')}{" "}
                <span className="text-[color:var(--ds-background-brand-bold)]">
                  AI Tools
                </span>
                <br />
                <span className="text-[24px] leading-[32px] font-medium tracking-[-0.01em] text-[color:var(--ds-text-subtle)] font-normal">
                  {t('home.subtitle')}
                </span>
              </h1>

              {/* Subtitle - Atlassian Design System */}
              <p className="text-[16px] leading-[24px] font-normal text-[color:var(--ds-text-subtle)] max-w-2xl mx-auto">
                {t('home.description')}
                <br className="hidden md:block" />
                {t('home.description_continued')}
              </p>
            </div>
          </motion.div>

          {/* Search - Atlassian风格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.2,
              ease: [0.25, 0.1, 0.25, 1] // Atlassian standard缓动
            }}
            className="mt-8 max-w-xl mx-auto" // 减少上边距
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('home.search_placeholder')}
                className={cn(
                  "pl-10 pr-4 h-12", // 调整高度符合Atlassian
                  "text-atlassian-body rounded-md", // 使用4px圆角和Atlassian字体
                  "border-2 border-border focus-visible:border-primary",
                  "bg-background shadow-atlassian-100 focus-visible:shadow-atlassian-200",
                  "transition-atlassian-standard"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <p className="text-atlassian-caption text-muted-foreground mt-2">
              {t('home.search_suggestions')}
            </p>
          </motion.div>

          {/* Quick Stats - Atlassian风格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.3,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto" // 减少gap
          >
            <div className="text-center">
              <div className="text-atlassian-h4 font-medium text-primary mb-1">{websites.length}+</div>
              <div className="text-atlassian-caption text-muted-foreground font-medium">{t('home.stats.charted_tools')}</div>
            </div>
            <div className="text-center">
              <div className="text-atlassian-h4 font-medium text-primary mb-1">100K+</div>
              <div className="text-atlassian-caption text-muted-foreground font-medium">{t('home.stats.explorers')}</div>
            </div>
            <div className="text-center">
              <div className="text-atlassian-h4 font-medium text-primary mb-1">{t('home.stats.daily')}</div>
              <div className="text-atlassian-caption text-muted-foreground font-medium">{t('home.stats.discoveries')}</div>
            </div>
            <div className="text-center">
              <div className="text-atlassian-h4 font-medium text-primary mb-1">{t('home.stats.expert')}</div>
              <div className="text-atlassian-caption text-muted-foreground font-medium">{t('home.stats.verified')}</div>
            </div>
          </motion.div>

          {/* CTA Buttons - Atlassian风格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.4,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center" // 减少间距
          >
            <Link href="/categories">
              <Button 
                size="lg" 
                className={cn(
                  "w-full sm:w-auto",
                  "btn-atlassian-primary",
                  "rounded-md px-6 py-3", // Atlassian按钮尺寸
                  "text-atlassian-body font-medium"
                )}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                {t('home.cta_buttons.explore_categories')}
              </Button>
            </Link>
            <Link href="/submit">
              <Button 
                size="lg" 
                variant="secondary" 
                className={cn(
                  "w-full sm:w-auto",
                  "btn-atlassian-secondary",
                  "rounded-md px-6 py-3",
                  "text-atlassian-body font-medium"
                )}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('home.cta_buttons.chart_new_tool')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Rankings Sections */}
      <RankingSection
        title={t('home.ranking_sections.premier_discoveries.title')}
        description={t('home.ranking_sections.premier_discoveries.description')}
        websites={topRatedWebsites}
        icon={Crown}
        viewAllLink="/rankings/top-rated"
      />

      <div className="bg-muted/30">
        <RankingSection
          title={t('home.ranking_sections.trending_expeditions.title')}
          description={t('home.ranking_sections.trending_expeditions.description')}
          websites={mostPopularWebsites}
          icon={TrendingUp}
          viewAllLink="/rankings/popular"
        />
      </div>

      <RankingSection
        title={t('home.ranking_sections.free_territory.title')}
        description={t('home.ranking_sections.free_territory.description')}
        websites={topFreeWebsites}
        icon={CheckCircle}
        viewAllLink="/rankings/free"
      />

      <div className="bg-muted/30">
        <RankingSection
          title={t('home.ranking_sections.new_horizons.title')}
          description={t('home.ranking_sections.new_horizons.description')}
          websites={recentWebsites}
          icon={Clock}
          viewAllLink="/rankings/recent"
        />
      </div>

      {/* Value Proposition Section - Atlassian风格 */}
      <section className="py-16 px-4 bg-primary/5"> {/* 减少垂直间距，使用更简洁的背景 */}
        <div className="container mx-auto">
          <div className="text-center mb-12"> {/* 减少底部间距 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3,
                ease: [0.15, 1, 0.3, 1] // Atlassian entrance缓动
              }}
            >
              <h2 className="text-atlassian-h2 font-medium mb-4"> {/* 使用Atlassian字体层级 */}
                {t('home.value_props.title')}
              </h2>
              <p className="text-atlassian-body-large text-muted-foreground max-w-3xl mx-auto">
                {t('home.value_props.description')}
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> {/* 减少间距 */}
            {valueProps.map((prop, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05, // 减少延迟间隔
                  ease: [0.25, 0.1, 0.25, 1] // Atlassian standard缓动
                }}
              >
                <Card className={cn(
                  "h-full text-center",
                  "card-atlassian", // 使用Atlassian卡片样式
                  "border-border/60 hover:border-primary/30",
                  "transition-atlassian-standard"
                )}>
                  <CardContent className="p-6"> {/* 减少内边距 */}
                    <div className="mb-4 flex justify-center"> {/* 减少底部间距 */}
                      <div className={cn(
                        "p-3 rounded-lg", // 使用8px圆角
                        "bg-primary/10 border border-primary/20"
                      )}>
                        <prop.icon className="h-6 w-6 text-primary" /> {/* 稍微减小图标 */}
                      </div>
                    </div>
                    <h3 className="text-atlassian-h5 font-medium mb-3">{prop.title}</h3> {/* 使用Atlassian字体 */}
                    <p className="text-atlassian-body text-muted-foreground leading-relaxed">
                      {prop.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Atlassian风格 */}
      <section className="py-16 px-4"> {/* 减少垂直间距 */}
        <div className="container mx-auto">
          <div className="text-center mb-12"> {/* 减少底部间距 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3,
                ease: [0.15, 1, 0.3, 1] // Atlassian entrance缓动
              }}
            >
              <h2 className="text-atlassian-h2 font-medium mb-4"> {/* 使用Atlassian字体层级 */}
                {t('home.faq.title')}
              </h2>
              <p className="text-atlassian-body-large text-muted-foreground">
                {t('home.faq.description')}
              </p>
            </motion.div>
          </div>

          <div className="space-y-3"> {/* 减少间距 */}
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05, // 减少延迟间隔
                  ease: [0.25, 0.1, 0.25, 1] // Atlassian standard缓动
                }}
              >
                <Card className={cn(
                  "overflow-hidden",
                  "card-atlassian", // 使用Atlassian卡片样式
                  "border-border/60"
                )}>
                  <CardContent className="p-0">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className={cn(
                        "w-full text-left p-5 transition-atlassian-standard", // 减少内边距，使用Atlassian缓动
                        "hover:bg-muted/30 flex items-center justify-between"
                      )}
                    >
                      <h3 className="text-atlassian-h6 font-medium pr-4">{faq.question}</h3>
                      <div className="flex-shrink-0">
                        {openFaqIndex === index ? (
                          <Minus className="h-4 w-4 text-primary" />
                        ) : (
                          <Plus className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </button>
                    <AnimatePresence>
                      {openFaqIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ 
                            duration: 0.2, // 缩短动画时间
                            ease: [0.25, 0.1, 0.25, 1] // Atlassian缓动
                          }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 text-atlassian-body text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA - Atlassian风格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.4,
              ease: [0.25, 0.1, 0.25, 1] // Atlassian standard缓动
            }}
            className="mt-10 text-center" // 减少上边距
          >
            <Card className={cn(
              "bg-primary/5 border-primary/20",
              "card-atlassian"
            )}>
              <CardContent className="p-6"> {/* 减少内边距 */}
                <div className="space-y-3"> {/* 减少间距 */}
                  <Lightbulb className="h-10 w-10 text-primary mx-auto" /> {/* 稍微减小图标 */}
                  <h3 className="text-atlassian-h5 font-medium">{t('home.faq.contact_cta.title')}</h3>
                  <p className="text-atlassian-body text-muted-foreground">
                    {t('home.faq.contact_cta.description')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center"> {/* 减少间距 */}
                    <Button 
                      variant="outline"
                      className={cn(
                        "btn-atlassian-secondary",
                        "rounded-md px-4 py-2",
                        "text-atlassian-body"
                      )}
                    >
                      {t('home.faq.contact_cta.contact_navigator')}
                    </Button>
                    <Button 
                      className={cn(
                        "btn-atlassian-primary",
                        "rounded-md px-4 py-2",
                        "text-atlassian-body"
                      )}
                    >
                      {t('home.faq.contact_cta.join_expedition')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Atlassian风格 */}
      <section className="py-16 px-4"> {/* 减少垂直间距 */}
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3,
              ease: [0.15, 1, 0.3, 1] // Atlassian entrance缓动
            }}
            className="space-y-4" // 减少间距
          >
            <h2 className="text-atlassian-h2 font-medium"> {/* 使用Atlassian字体层级 */}
              {t('home.final_cta.title')}
            </h2>
            <p className="text-atlassian-body-large text-muted-foreground">
              {t('home.final_cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center"> {/* 减少间距 */}
              <Link href="/submit">
                <Button 
                  size="lg" 
                  className={cn(
                    "w-full sm:w-auto",
                    "btn-atlassian-primary",
                    "rounded-md px-6 py-3",
                    "text-atlassian-body font-medium"
                  )}
                >
                  {t('home.final_cta.chart_discovery')}
                </Button>
              </Link>
              <Link href="/categories">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className={cn(
                    "w-full sm:w-auto",
                    "btn-atlassian-secondary",
                    "rounded-md px-6 py-3",
                    "text-atlassian-body font-medium"
                  )}
                >
                  {t('home.final_cta.explore_territories')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Results */}
      {searchQuery && (
        <section className="py-8 px-4 border-t">
          <div className="container mx-auto">
            <SearchManager
              websites={websites}
              categories={categories}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              onSearchChange={setSearchQuery}
              onResultsChange={setFilteredWebsites}
            />
          </div>
        </section>
      )}
    </div>
  );
}