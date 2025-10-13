"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/ui/common/card';
import { Button } from '@/ui/common/button';
import { Badge } from '@/ui/common/badge';
import { Input } from '@/ui/common/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/common/select';
import { CompactCard } from '@/components/website/compact-card';
import { WebsiteThumbnail } from '@/components/website/website-thumbnail';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Trophy,
  Crown,
  Zap,
  Compass,
  Anchor,
  Ship,
  Telescope,
  Navigation,
  Star,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { cn } from '@/lib/utils/utils';

interface RankingPageProps {
  type: string;
  rankingType: {
    title: string;
    description: string;
  };
  websites: any[];
  categories: any[];
  selectedCategory?: string;
}

type FilterOption = 'all' | 'free' | 'paid' | 'freemium';

const rankingIcons = {
  popular: Ship,
  'top-rated': Crown,
  trending: Zap,
  free: Anchor,
  new: Telescope
};

export default function RankingPage({ type, rankingType, websites: initialWebsites, categories, selectedCategory }: RankingPageProps) {
  const { user } = useUser();
  const router = useRouter();
  const tRanking = useTranslations('pages.rankings');
  const tCommon = useTranslations('common');
  const [websites, setWebsites] = useState(initialWebsites);
  const [filteredWebsites, setFilteredWebsites] = useState(initialWebsites);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<FilterOption>('all');
  const [categoryFilter, setCategoryFilter] = useState(selectedCategory || 'all');
  const [timeRange, setTimeRange] = useState('all');
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
  const [userFavorites, setUserFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const IconComponent = rankingIcons[type as keyof typeof rankingIcons] || Trophy;

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

  // Fetch data when filters change
  useEffect(() => {
    const fetchRankingData = async () => {
      if (timeRange === 'all' && categoryFilter === (selectedCategory || 'all')) {
        setWebsites(initialWebsites);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          type,
          timeRange,
          ...(categoryFilter !== 'all' && { category: categoryFilter }),
          limit: '100'
        });

        const response = await fetch(`/api/rankings?${params}`);
        if (response.ok) {
          const data = await response.json();
          setWebsites(data.data.websites);
        }
      } catch (error) {
        console.error('Failed to fetch ranking data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, [timeRange, categoryFilter, type, initialWebsites, selectedCategory]);

  // Filter and search websites
  useEffect(() => {
    let filtered = [...websites];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(website =>
        website.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        website.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (website.tagline && website.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      const categoryId = categories.find(c => c.slug === categoryFilter)?.id;
      if (categoryId) {
        filtered = filtered.filter(website => website.category_id === categoryId);
      }
    }

    // Apply price filter
    if (priceFilter !== 'all') {
      if (priceFilter === 'free') {
        filtered = filtered.filter(website => 
          website.pricing_model === 'free' || website.has_free_version
        );
      } else if (priceFilter === 'paid') {
        filtered = filtered.filter(website => 
          website.pricing_model !== 'free' && !website.has_free_version
        );
      } else if (priceFilter === 'freemium') {
        filtered = filtered.filter(website => 
          website.pricing_model === 'freemium'
        );
      }
    }

    setFilteredWebsites(filtered);
  }, [websites, searchQuery, categoryFilter, priceFilter]);

  const handleVisit = async (website: any) => {
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

  return (
    <div className="min-h-screen bg-magellan-depth-50">
      {/* Professional Maritime Ranking Header */}
      <section className="relative py-12 px-4 bg-gradient-to-br from-magellan-primary/8 via-magellan-depth-50 to-magellan-coral/3 border-b border-magellan-primary/20 overflow-hidden">
        {/* Professional background decoration */}
        <div className="absolute inset-0 professional-decoration opacity-6">
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-magellan-coral/15 to-transparent rounded-full blur-3xl professional-decoration active"></div>
          <div className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-gradient-to-br from-magellan-gold/10 to-transparent rounded-full blur-2xl professional-decoration active"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Navigation */}
          <div className="mb-6">
            <Link href="/rankings" className={cn(
              "inline-flex items-center gap-2 group",
              "text-magellan-depth-600 hover:text-magellan-primary transition-all duration-300",
              "p-2 rounded-lg hover:bg-magellan-primary/5"
            )}>
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              {tRanking('navigation.back_to_rankings')}
            </Link>
          </div>

          {/* Professional Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-center gap-4"
          >
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-br from-magellan-primary/15 to-magellan-teal/10",
              "border border-magellan-primary/20 professional-float"
            )}>
              <IconComponent className="h-8 w-8 text-magellan-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-magellan-depth-900 mb-2">
                {rankingType.title}
              </h1>
              <p className="text-base sm:text-lg text-magellan-depth-600">{rankingType.description}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Layout - 响应式布局 */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Left Maritime Navigation Sidebar - 桌面端显示，移动端隐藏 */}
          <aside className="hidden lg:flex w-80 bg-white/90 backdrop-blur-sm border-r border-magellan-primary/20 sticky top-4 self-start h-[calc(100vh-2rem)] flex-col shadow-lg">
          {/* Fixed Navigation Header */}
          <div className="p-6 pb-4 border-b border-magellan-primary/10">
            <h3 className="text-lg font-semibold text-magellan-depth-900 mb-4 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-magellan-primary professional-compass" />
              {tRanking('sidebar.navigation_title')}
            </h3>
            
            {/* Professional Compass Search */}
            <div className="relative">
              <Compass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-magellan-depth-600 professional-compass" />
              <Input
                placeholder={tRanking('search_placeholder')}
                className="pl-10 border-magellan-primary/20 focus:border-magellan-primary bg-white/80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Scrollable categories */}
          <div className="flex-1 overflow-y-auto p-6 pt-4">
            <div className="space-y-6">
              <div className="space-y-2">
                {/* All categories option */}
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all duration-300 group",
                    "border border-magellan-primary/10 hover:border-magellan-primary/30",
                    categoryFilter === 'all' 
                      ? "bg-gradient-to-r from-magellan-primary/10 to-magellan-teal/5 border-magellan-primary/30 shadow-sm"
                      : "hover:bg-magellan-primary/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-colors duration-300",
                      categoryFilter === 'all' ? "bg-magellan-primary" : "bg-magellan-depth-300 group-hover:bg-magellan-primary/50"
                    )} />
                    <span className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      categoryFilter === 'all' ? "text-magellan-primary" : "text-magellan-depth-700 group-hover:text-magellan-primary"
                    )}>
                      {tRanking('filters.category_all')}
                    </span>
                  </div>
                </button>

                {/* Individual categories */}
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setCategoryFilter(category.slug)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all duration-300 group",
                      "border border-magellan-primary/10 hover:border-magellan-primary/30",
                      categoryFilter === category.slug
                        ? "bg-gradient-to-r from-magellan-primary/10 to-magellan-teal/5 border-magellan-primary/30 shadow-sm"
                        : "hover:bg-magellan-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full transition-colors duration-300",
                        categoryFilter === category.slug ? "bg-magellan-primary" : "bg-magellan-depth-300 group-hover:bg-magellan-primary/50"
                      )} />
                      <span className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        categoryFilter === category.slug ? "text-magellan-primary" : "text-magellan-depth-700 group-hover:text-magellan-primary"
                      )}>
                        {category.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* 移动端筛选区域 - 只在移动端显示 */}
        <div className="lg:hidden p-4 bg-white border-b border-magellan-primary/20">
          <div className="space-y-4">
            <div className="relative">
              <Compass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-magellan-depth-600" />
              <Input
                placeholder={tRanking('search_placeholder')}
                className="pl-10 border-magellan-primary/20 focus:border-magellan-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  categoryFilter === 'all' 
                    ? "bg-magellan-primary text-white"
                    : "bg-magellan-primary/10 text-magellan-primary hover:bg-magellan-primary/20"
                )}
              >
                {tRanking('filters.category_all')}
              </button>
              {categories.slice(0, 3).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setCategoryFilter(category.slug)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    categoryFilter === category.slug
                      ? "bg-magellan-primary text-white"
                      : "bg-magellan-primary/10 text-magellan-primary hover:bg-magellan-primary/20"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-magellan-depth-600">
                <Compass className="h-5 w-5 professional-compass" />
                <span>{tRanking('loading')}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Professional Filter Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="bg-white/90 backdrop-blur-sm border border-magellan-primary/20 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xl font-bold text-magellan-depth-900 flex items-center gap-3">
                    <Ship className="h-6 w-6 text-magellan-teal" />
                    {tRanking('main.treasure_list_title')}
                  </h2>
                  <div className="bg-magellan-primary/5 px-4 py-2 rounded-lg border border-magellan-primary/10">
                    <span className="text-sm font-medium text-magellan-depth-700">
                      {tRanking('main.showing_count', { 
                        current: Math.min(filteredWebsites.length, 100), 
                        total: filteredWebsites.length 
                      })}
                    </span>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-6">
                  {/* Time Range Filter */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Anchor className="h-4 w-4 text-magellan-gold" />
                      <span className="text-sm font-medium text-magellan-depth-800">{tRanking('filters.time_range')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[
                        { value: 'all', short: tRanking('filters.time_ranges.all_time') },
                        { value: 'today', short: tRanking('filters.time_ranges.today') },
                        { value: 'week', short: tRanking('filters.time_ranges.week') },
                        { value: 'month', short: tRanking('filters.time_ranges.month') },
                      ].map((timeOption) => (
                        <button
                          key={timeOption.value}
                          onClick={() => setTimeRange(timeOption.value)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                            timeRange === timeOption.value
                              ? "bg-magellan-primary text-white shadow-sm"
                              : "bg-magellan-depth-50 text-magellan-depth-700 hover:bg-magellan-primary/10 hover:text-magellan-primary border border-magellan-primary/20"
                          )}
                        >
                          {timeOption.short}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-6 w-px bg-magellan-primary/20"></div>

                  {/* Price Filter */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-magellan-teal" />
                      <span className="text-sm font-medium text-magellan-depth-800">{tRanking('filters.pricing')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[
                        { value: 'all', short: tRanking('filters.pricing_all') },
                        { value: 'free', short: tRanking('filters.pricing_free') },
                        { value: 'freemium', short: tRanking('filters.pricing_freemium') },
                        { value: 'paid', short: tRanking('filters.pricing_paid') },
                      ].map((priceOption) => (
                        <button
                          key={priceOption.value}
                          onClick={() => setPriceFilter(priceOption.value as FilterOption)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                            priceFilter === priceOption.value
                              ? "bg-magellan-teal text-white shadow-sm"
                              : "bg-magellan-depth-50 text-magellan-depth-700 hover:bg-magellan-teal/10 hover:text-magellan-teal border border-magellan-teal/20"
                          )}
                        >
                          {priceOption.short}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Ranking List */}
              {filteredWebsites.length > 0 ? (
                <div className="space-y-2">
                  {filteredWebsites.slice(0, 100).map((website, index) => (
                    <motion.div
                      key={website.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      className="group"
                    >
                      <div 
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl bg-white border border-magellan-primary/10",
                          "hover:border-magellan-primary/20 hover:bg-magellan-primary/2",
                          "transition-all duration-300 cursor-pointer"
                        )}
                        onClick={() => {
                          // 跳转到工具详情页
                          router.push(`/tools/${website.id}`);
                        }}
                      >
                        {/* Premium Ranking Badge - Atlassian Design System Compliant */}
                        <div className="relative">
                          <div className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-xl font-bold text-sm",
                            "border-2 transition-all duration-300"
                          )}>
                            {/* 背景渐变徽章 */}
                            <div 
                              className={cn(
                                "absolute inset-0 rounded-xl flex items-center justify-center",
                                "text-xs font-medium transition-all",
                                // Atlassian 设计规范：使用语义化颜色和正确的 tokens
                                index === 0 ? [
                                  // 第一名：品牌主色
                                  "bg-[#0052CC] text-white border-[#0747A6]",
                                  "shadow-[0px_1px_1px_rgba(9,30,66,0.25),0px_0px_1px_rgba(9,30,66,0.31)]",
                                  "hover:shadow-[0px_4px_8px_rgba(9,30,66,0.25),0px_0px_1px_rgba(9,30,66,0.31)]",
                                  "hover:bg-[#0747A6]"
                                ] :
                                index === 1 ? [
                                  // 第二名：成功色
                                  "bg-[#22A06B] text-white border-[#1F845A]", 
                                  "shadow-[0px_1px_1px_rgba(9,30,66,0.25),0px_0px_1px_rgba(9,30,66,0.31)]",
                                  "hover:shadow-[0px_4px_8px_rgba(9,30,66,0.25),0px_0px_1px_rgba(9,30,66,0.31)]",
                                  "hover:bg-[#1F845A]"
                                ] :
                                index === 2 ? [
                                  // 第三名：警告色
                                  "bg-[#E56910] text-white border-[#974F0C]",
                                  "shadow-[0px_1px_1px_rgba(9,30,66,0.25),0px_0px_1px_rgba(9,30,66,0.31)]", 
                                  "hover:shadow-[0px_4px_8px_rgba(9,30,66,0.25),0px_0px_1px_rgba(9,30,66,0.31)]",
                                  "hover:bg-[#974F0C]"
                                ] :
                                [
                                  // 其他排名：中性色
                                  "bg-[#F7F8F9] text-[#172B4D] border-[#DCDFE4]",
                                  "shadow-[0px_1px_1px_rgba(9,30,66,0.25),0px_0px_1px_rgba(9,30,66,0.31)]",
                                  "hover:shadow-[0px_4px_8px_rgba(9,30,66,0.25),0px_0px_1px_rgba(9,30,66,0.31)]",
                                  "hover:bg-[#F1F2F4]"
                                ],
                                // Atlassian 标准：圆角，200ms 标准过渡，2px 边框
                                "rounded-xl border-2",
                                "duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                              )}
                              style={{
                                // 确保过渡使用 Atlassian 标准曲线
                                transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
                              }}
                            >
                              {index <= 2 ? (
                                index === 0 ? <Crown className="w-5 h-5" /> :
                                index === 1 ? <Trophy className="w-5 h-5" /> :
                                <Star className="w-5 h-5 fill-current" />
                              ) : (
                                <span className="font-semibold">#{index + 1}</span>
                              )}
                            </div>
                          </div>
                          
                          {/* 发现标记 - 宝藏效果 */}
                          {index <= 2 && (
                            <div className={cn(
                              "absolute -top-1 -right-1 z-10 w-4 h-4 rounded-full",
                              "bg-gradient-to-br from-magellan-gold to-magellan-coral",
                              "animate-pulse shadow-lg",
                              index === 0 ? 'professional-glow' : ''
                            )}>
                              <Star className="h-2 w-2 text-white m-1" />
                            </div>
                          )}
                        </div>

                        {/* Tool Thumbnail */}
                        <div className="relative">
                          <WebsiteThumbnail
                            url={website.url}
                            thumbnail={website.thumbnail}
                            title={website.title}
                            className="w-16 h-16 rounded-lg border border-magellan-primary/10"
                          />
                        </div>

                        {/* Tool Information */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-magellan-depth-900 group-hover:text-magellan-primary transition-colors line-clamp-1">
                                {website.title || 'Unnamed Island'}
                              </h3>
                              <p className="text-sm text-magellan-depth-600 line-clamp-2 mt-1">
                                {website.description || 'A mysterious treasure awaiting discovery...'}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {website.pricing_model === 'free' && (
                                  <Badge className="text-xs bg-magellan-mint/10 text-magellan-mint border-magellan-mint/30">
                                    {tRanking('filters.pricing_free')}
                                  </Badge>
                                )}
                                {website.pricing_model && website.pricing_model !== 'free' && (
                                  <Badge variant="outline" className="text-xs bg-magellan-primary/5 text-magellan-primary border-magellan-primary/30">
                                    {website.pricing_model}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVisit(website);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-magellan-primary/10 hover:text-magellan-primary"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="mb-6 flex justify-center">
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-magellan-primary/10 to-magellan-teal/5 border border-magellan-primary/20">
                        <Telescope className="h-16 w-16 text-magellan-depth-600" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 text-magellan-depth-900">
                      {tRanking('empty_state.title')}
                    </h3>
                    <p className="text-magellan-depth-600 mb-6">
                      {tRanking('empty_state.description')}
                    </p>
                    
                    <Button 
                      variant="default"
                      className="bg-gradient-to-r from-magellan-primary to-magellan-teal hover:from-magellan-primary/90 hover:to-magellan-teal/90 text-white"
                      onClick={() => {
                        setSearchQuery('');
                        setCategoryFilter('all');
                        setPriceFilter('all');
                        setTimeRange('all');
                      }}
                    >
                      <Compass className="h-4 w-4 mr-2" />
                      {tRanking('main.reset_filters')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
        </div>
      </div>
    </div>
  );
}