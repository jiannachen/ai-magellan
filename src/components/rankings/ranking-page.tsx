"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/ui/common/card';
import { Button } from '@/ui/common/button';
import { Badge } from '@/ui/common/badge';
import { Input } from '@/ui/common/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/common/select';
import RankingFilters from './ranking-filters';
import { CompactCard } from '@/components/website/compact-card';
import {
  ArrowLeft,
  Trophy,
  Crown,
  Zap,
  Compass,
  Anchor,
  Ship,
  Telescope,
  Navigation
} from 'lucide-react';
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
        // Use initial data if no filters applied
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
    <div className="min-h-screen bg-background">
      {/* Header - 探险排行榜主页 */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-magellan-coral/3 border-b border-primary/20 overflow-hidden">
        {/* 海洋背景装饰 */}
        <div className="absolute inset-0 opacity-8 pointer-events-none">
          <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-primary/4 to-transparent rounded-full blur-3xl professional-float"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-magellan-teal/3 to-transparent rounded-full blur-2xl professional-decoration"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* 导航面包屑 - 航海路径 */}
          <div className="mb-8">
            <Link href="/rankings" className={cn(
              "inline-flex items-center gap-3 group",
              "text-muted-foreground hover:text-primary transition-all duration-300",
              "p-3 rounded-xl bg-background/80 backdrop-blur-sm border border-primary/10",
              "hover:border-primary/30 hover:bg-primary/5"
            )}>
              <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <Compass className="h-4 w-4 subtle-rotate" />
              🧭 Back to Expedition Hub
            </Link>
          </div>

          {/* 探险标题区域 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6,
              ease: [0.15, 1, 0.3, 1]
            }}
            className="mb-10"
          >
            <div className="flex items-center gap-6 mb-8">
              {/* 探险徽章 */}
              <div className={cn(
                "p-4 rounded-2xl relative group",
                "bg-gradient-to-br from-primary/15 to-magellan-teal/10",
                "border border-primary/20 shadow-xl",
                "subtle-scale"
              )}>
                <IconComponent className="h-10 w-10 text-primary group-hover:text-magellan-teal transition-colors duration-300" />
                {/* 发光环效果 */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              <div className="space-y-2">
                <h1 className={cn(
                  "text-4xl md:text-5xl lg:text-6xl font-bold leading-tight",
                  "bg-gradient-to-r from-primary via-magellan-teal to-magellan-coral bg-clip-text text-transparent"
                )}>
                  🏆 {rankingType.title}
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl">
                  ⚓ {rankingType.description}
                </p>
              </div>
            </div>
          </motion.div>

          {/* 探险控制台 - 航海仪表盘 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={cn(
              "bg-background/95 backdrop-blur-xl rounded-2xl border border-primary/20",
              "p-8 shadow-xl relative overflow-hidden"
            )}
          >
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-magellan-teal/2 pointer-events-none"></div>
            
            <div className="relative z-10 space-y-6">
              {/* 搜索和基础过滤器 */}
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                {/* 罗盘搜索框 */}
                <div className="relative flex-1 max-w-md group compass-search">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <Compass className="h-5 w-5 text-primary professional-compass" />
                  </div>
                  <Input
                    placeholder="🔍 Search expedition tools..."
                    className={cn(
                      "pl-12 h-12 text-base rounded-xl",
                      "border-2 border-primary/20 focus:border-primary",
                      "bg-background/80 backdrop-blur-sm",
                      "shadow-lg hover:shadow-xl transition-all duration-300"
                    )}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* 航海过滤器 */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Anchor className="h-4 w-4 text-magellan-coral professional-float" />
                    <Select value={priceFilter} onValueChange={(value: FilterOption) => setPriceFilter(value)}>
                      <SelectTrigger className={cn(
                        "w-40 h-12 rounded-xl border-primary/20",
                        "focus:border-primary bg-background/80"
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">🌊 All Pricing</SelectItem>
                        <SelectItem value="free">⚓ Free Harbor</SelectItem>
                        <SelectItem value="freemium">🏝️ Freemium Isle</SelectItem>
                        <SelectItem value="paid">💎 Premium Treasure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 高级探险过滤器 */}
              <div className="border-t border-primary/20 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Navigation className="h-5 w-5 text-magellan-teal professional-compass" />
                  <span className="text-sm font-semibold text-foreground">🗺️ Advanced Navigation Filters</span>
                </div>
                <RankingFilters
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                  categoryFilter={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  categories={categories}
                  currentType={type}
                />
              </div>

              {/* 发现统计和加载状态 */}
              <div className="text-center p-4 rounded-xl bg-gradient-to-r from-primary/5 to-magellan-teal/5 border border-primary/10">
                {loading ? (
                  <div className="flex items-center justify-center gap-3 text-muted-foreground">
                    <Compass className="h-4 w-4 professional-compass" />
                    <span>🧭 Charting expedition routes...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 text-muted-foreground">
                    <Trophy className="h-4 w-4 text-magellan-gold professional-glow" />
                    <span>
                      🏆 Discovered {filteredWebsites.length} of {websites.length} expedition tools
                      {timeRange !== 'all' && (
                        <span className="ml-2 text-xs bg-primary/15 text-primary px-3 py-1 rounded-full border border-primary/20">
                          ⏰ {timeRange}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 探险发现主内容区 */}
      <div className="max-w-7xl mx-auto px-4 py-12 relative">
        {/* 海域背景装饰 */}
        <div className="absolute inset-0 opacity-6 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-br from-primary/3 to-transparent rounded-full blur-2xl professional-decoration"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-magellan-coral/3 to-transparent rounded-full blur-3xl professional-decoration active"></div>
        </div>
        
        {filteredWebsites.length > 0 ? (
          <div className="relative z-10">
            {/* 发现网格 - 岛屿探险 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWebsites.map((website, index) => (
                <motion.div
                  key={website.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    ease: [0.15, 1, 0.3, 1]
                  }}
                  className="group"
                >
                  <div className="relative">
                    {/* 排名徽章 - Atlassian Design System Compliant */}
                    {index < 10 && (
                      <div 
                        className={cn(
                          "absolute z-10 flex items-center justify-center",
                          "w-6 h-6 text-xs font-medium transition-all",
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
                          // Atlassian 标准：4px 圆角，200ms 标准过渡，2px 边框
                          "rounded border-2",
                          "duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                          // 24px grid positioning (-12px = -3 * 4px)
                          "-top-3 -left-3"
                        )}
                        style={{
                          // 确保过渡使用 Atlassian 标准曲线
                          transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
                        }}
                      >
                        {index < 3 ? (
                          <Crown className="w-3 h-3" />
                        ) : (
                          <span className="font-semibold text-xs">{index + 1}</span>
                        )}
                      </div>
                    )}
                    
                    <CompactCard website={website} onVisit={handleVisit} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 relative z-10">
            <div className="max-w-md mx-auto">
              <div className="mb-8 flex justify-center">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-magellan-teal/5 border border-primary/20">
                  <Telescope className="h-16 w-16 text-muted-foreground" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                🔍 No treasures discovered
              </h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                🌊 Adjust your navigation compass or exploration filters to chart new territories and discover more AI treasures.
              </p>
              
              <Button 
                variant="default"
                className={cn(
                  "bg-gradient-to-r from-primary to-magellan-teal",
                  "hover:from-primary/90 hover:to-magellan-teal/90",
                  "text-white rounded-xl px-6 py-3",
                  "shadow-lg hover:shadow-xl",
                  "subtle-hover",
                  "professional-card"
                )}
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setPriceFilter('all');
                }}
              >
                <Compass className="h-4 w-4 mr-2 professional-compass" />
                ⚓ Reset Navigation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}