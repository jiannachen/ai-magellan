"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { websitesAtom, categoriesAtom } from "@/lib/atoms";
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
import { ValuePropCard } from "@/components/ui/value-prop-card";
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
  const tLanding = useTranslations('landing');
  const router = useRouter();
  const { user } = useUser();
  const [websites, setWebsites] = useAtom(websitesAtom);
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [searchQuery, setSearchQuery] = useState('');
  const [topRatedWebsites, setTopRatedWebsites] = useState<Website[]>([]);
  const [mostPopularWebsites, setMostPopularWebsites] = useState<Website[]>([]);
  const [recentWebsites, setRecentWebsites] = useState<Website[]>([]);
  const [topFreeWebsites, setTopFreeWebsites] = useState<Website[]>([]);
  const [topPaidWebsites, setTopPaidWebsites] = useState<Website[]>([]);
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
  const [userFavorites, setUserFavorites] = useState<Set<number>>(new Set());
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
              <WebsiteCard website={website} rank={index + 1} />
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
    <div className="min-h-screen bg-background">
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
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <Compass className="h-5 w-5 text-primary professional-compass" />
                </div>
                <Input
                  placeholder={tLanding('hero.search_placeholder')}
                  className={cn(
                    "pl-14 pr-6 h-14 text-lg",
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
            
            <div className="text-sm text-muted-foreground mt-3 flex items-center justify-center gap-2">
              <span>💡 {tLanding('hero.popular_searches')}:</span>
              {['ChatGPT', 'Midjourney', tLanding('hero.search_tags.coding_assistant'), tLanding('hero.search_tags.ai_writing')].map((tag) => (
                <Badge 
                  key={tag}
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => handleSearch(tag)}
                >
                  {tag}
                </Badge>
              ))}
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

      {/* Value Proposition Section - 探索价值主张 */}
      <section className="py-20 px-4 relative bg-gradient-to-br from-primary/3 via-background to-magellan-teal/2">
        {/* 海域背景效果 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-magellan-coral/4 to-transparent rounded-full blur-3xl ocean-float"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-tl from-magellan-mint/4 to-transparent rounded-full blur-2xl" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          {/* 章节标题 - 航海日志风格 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6,
              ease: [0.15, 1, 0.3, 1]
            }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-magellan-teal/10 border border-primary/20">
              <Map className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">{tLanding('sections.value_props.badge')}</span>
              <div className="w-2 h-2 rounded-full bg-magellan-coral animate-pulse"></div>
            </div>
            <h2 className="text-atlassian-h2 font-semibold mb-4 flex items-center justify-center gap-3">
              ⚓ {tLanding('sections.value_props.title')}
            </h2>
            <p className="text-atlassian-body-large text-muted-foreground max-w-4xl mx-auto">
              🌊 {tLanding('sections.value_props.description')}
            </p>
          </motion.div>

          {/* 价值主张网格 - 探索能力 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {valueProps.map((prop, index) => (
              <ValuePropCard
                key={index}
                icon={prop.icon}
                title={prop.title}
                description={prop.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - 航海指南 */}
      <section className="py-20 px-4 relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-br from-magellan-teal/5 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          {/* 标题区域 - 导航员指南 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6,
              ease: [0.15, 1, 0.3, 1]
            }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-magellan-gold/10 to-magellan-coral/10 border border-magellan-gold/20">
              <Compass className="h-5 w-5 text-magellan-gold professional-compass" />
              <span className="text-sm font-medium text-magellan-gold">{tLanding('sections.faq.badge')}</span>
              <div className="w-2 h-2 rounded-full bg-magellan-mint professional-glow"></div>
            </div>
            <h2 className="text-atlassian-h2 font-semibold mb-4 flex items-center justify-center gap-3">
              🧭 {tLanding('sections.faq.title')}
            </h2>
            <p className="text-atlassian-body-large text-muted-foreground max-w-3xl mx-auto">
              {tLanding('sections.faq.description')}
            </p>
          </motion.div>

          {/* FAQ列表 - 航海问答 */}
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1,
                  ease: [0.15, 1, 0.3, 1]
                }}
              >
                <Card className={cn(
                  "group overflow-hidden relative",
                  "bg-card/95 backdrop-blur-sm border border-primary/10",
                  "rounded-2xl shadow-lg hover:shadow-xl",
                  "transition-all duration-300",
                  "hover:border-primary/30"
                )}>
                  {/* 背景波纹效果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-magellan-teal/2 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  <CardContent className="p-0 relative z-10">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className={cn(
                        "w-full text-left p-6 transition-all duration-300",
                        "hover:bg-primary/5 flex items-center justify-between group/btn"
                      )}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={cn(
                          "p-2 rounded-xl transition-all duration-300",
                          "bg-gradient-to-br from-primary/15 to-magellan-teal/10",
                          "border border-primary/20",
                          "group-hover/btn:scale-105 group-hover/btn:rotate-3 professional-scale"
                        )}>
                          <Map className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-atlassian-h6 font-semibold text-foreground group-hover/btn:text-primary transition-colors duration-300">
                          {faq.question}
                        </h3>
                      </div>
                      <div className={cn(
                        "flex-shrink-0 p-2 rounded-lg transition-all duration-300",
                        "bg-primary/10 group-hover/btn:bg-primary/20",
                        openFaqIndex === index ? "rotate-180" : "rotate-0"
                      )}>
                        <ChevronDown className="h-4 w-4 text-primary" />
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
                            ease: [0.25, 0.1, 0.25, 1]
                          }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6">
                            <div className="pl-12">
                              <div className="border-l-2 border-primary/20 pl-4">
                                <p className="text-atlassian-body text-muted-foreground leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - 启程远航 */}
      <section className="py-24 px-4 relative bg-gradient-to-br from-primary/5 via-background to-magellan-coral/3">
        {/* 最终航海背景 */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-primary/3 to-transparent"></div>
          <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-bl from-magellan-teal/5 to-transparent rounded-full blur-3xl ocean-float"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-magellan-coral/5 to-transparent rounded-full blur-2xl" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              ease: [0.15, 1, 0.3, 1]
            }}
            className="space-y-8"
          >
            {/* 最终徽章 */}
            <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-gradient-to-r from-primary/15 to-magellan-coral/10 border border-primary/30 shadow-lg">
              <Rocket className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">{tLanding('sections.final_cta.badge')}</span>
              <div className="w-2 h-2 rounded-full bg-magellan-mint animate-pulse"></div>
            </div>
            
            {/* 启程标题 */}
            <div className="space-y-6">
              <h2 className="text-atlassian-h1 font-bold leading-tight flex items-center justify-center gap-4 flex-wrap">
                <span>⚓</span>
                {tLanding('sections.final_cta.title')}
                <span>🗺️</span>
              </h2>
              <p className="text-atlassian-body-large text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                🌊 {tLanding('sections.final_cta.description')}
              </p>
            </div>
            
            {/* 航海统计 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center gap-12 text-sm text-muted-foreground flex-wrap my-8"
            >
              <div className="flex items-center gap-2 group">
                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{tLanding('sections.final_cta.stats.active_explorers')}</span>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="p-2 rounded-full bg-magellan-teal/10 group-hover:bg-magellan-teal/20 transition-colors">
                  <Star className="h-4 w-4 text-magellan-teal" />
                </div>
                <span className="font-medium">{tLanding('sections.final_cta.stats.discoveries_made')}</span>
              </div>
              <div className="flex items-center gap-2 group">
                <div className="p-2 rounded-full bg-magellan-gold/10 group-hover:bg-magellan-gold/20 transition-colors">
                  <Crown className="h-4 w-4 text-magellan-gold" />
                </div>
                <span className="font-medium">{tLanding('sections.final_cta.stats.verified_treasures')}</span>
              </div>
            </motion.div>
            
            {/* 行动按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.4,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link href="/submit">
                <Button 
                  size="lg" 
                  className={cn(
                    "group relative overflow-hidden",
                    "bg-gradient-to-r from-primary via-magellan-teal to-primary",
                    "hover:from-primary/90 hover:via-magellan-teal/90 hover:to-primary/90",
                    "text-white rounded-2xl px-8 py-4 text-lg font-semibold",
                    "shadow-2xl hover:shadow-3xl",
                    "transition-all duration-500 professional-scale",
                    "border border-primary/20"
                  )}
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'gradient-shift 3s ease infinite'
                  }}
                >
                  {/* 按钮背景效果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-magellan-coral/20 via-transparent to-magellan-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative flex items-center gap-3">
                    <Map className="h-6 w-6 group-hover:rotate-6 transition-transform duration-300 professional-rotate" />
                    ⚓ {tLanding('sections.final_cta.chart_discovery')}
                    <ExternalLink className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
                </Button>
              </Link>
              
              <Link href="/categories">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className={cn(
                    "group",
                    "border-2 border-primary/30 hover:border-primary/60",
                    "bg-background/80 hover:bg-primary/5 backdrop-blur-sm",
                    "rounded-2xl px-8 py-4 text-lg font-semibold",
                    "shadow-lg hover:shadow-xl",
                    "subtle-hover"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Compass className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-500 professional-rotate" />
                    🗺️ {tLanding('sections.final_cta.explore_territories')}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}