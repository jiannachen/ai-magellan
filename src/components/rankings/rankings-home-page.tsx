"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card';
import { Badge } from '@/ui/common/badge';
import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils/utils';
import {
  TrendingUp,
  Star,
  Crown,
  CheckCircle,
  Clock,
  Award,
  Users,
  ArrowRight,
  BarChart3,
  Zap,
  Rocket,
  Target,
  Eye,
  Heart,
  ExternalLink,
  Trophy,
  Flame,
  Compass,
  Map,
  Route,
  Anchor,
  Telescope,
  Ship,
  Navigation
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { CompactCard } from '@/components/website/compact-card';

interface RankingsHomePageProps {
  rankings: {
    popular: any[];
    topRated: any[];
    trending: any[];
    free: any[];
    newest: any[];
  };
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    toolCount: number;
  }>;
  totalTools: number;
}

// 探险排行榜类型 - 航海主题图标
const rankingTypes = [
  {
    key: 'popular',
    icon: Ship, // 热门航线
    href: '/rankings/popular',
    color: 'magellan-teal'
  },
  {
    key: 'top-rated',
    icon: Crown, // 传奇宝藏
    href: '/rankings/top-rated',
    color: 'magellan-gold'
  },
  {
    key: 'trending',
    icon: Flame, // 新兴信标 
    href: '/rankings/trending',
    color: 'magellan-coral'
  },
  {
    key: 'free',
    icon: Anchor, // 免费港湾
    href: '/rankings/free',
    color: 'magellan-mint'
  },
  {
    key: 'new',
    icon: Telescope, // 新发现
    href: '/rankings/new',
    color: 'primary'
  },
  {
    key: 'monthly-hot',
    icon: Flame, // 月度热潮
    href: '/rankings/monthly-hot',
    color: 'magellan-coral'
  }
];

export default function RankingsHomePage({ rankings, categories, totalTools }: RankingsHomePageProps) {
  const { user } = useUser();
  const tRank = useTranslations('pages.rankings');
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());

  const handleVisit = async (website: any) => {
    try {
      await fetch(`/api/websites/${website.id}/visit`, { method: "POST" });
    } catch (error) {
      console.error('Failed to track visit:', error);
    }
    window.open(website.url, "_blank");
  };

  const WebsiteCard = ({ website, rank }: { website: any; rank: number }) => (
    <div className="relative group">
      {/* 排名徽章 - Atlassian Design System Compliant */}
      <div 
        className={cn(
          "absolute z-10 flex items-center justify-center",
          "w-6 h-6 text-xs font-medium transition-all",
          // Atlassian 设计规范：使用语义化颜色和正确的 tokens
          rank === 1 ? [
            // 第一名：品牌主色
            "bg-[#0052CC] text-white border-[#0747A6]",
            "shadow-[0px_1px_1px_rgba(9,30,66,0.25),0px_0px_1px_rgba(9,30,66,0.31)]",
            "hover:shadow-[0px_4px_8px_rgba(9,30,66,0.25),0px_0px_1px_rgba(9,30,66,0.31)]",
            "hover:bg-[#0747A6]"
          ] :
          rank === 2 ? [
            // 第二名：成功色
            "bg-[#22A06B] text-white border-[#1F845A]", 
            "shadow-[0px_1px_1px_rgba(9,30,66,0.25),0px_0px_1px_rgba(9,30,66,0.31)]",
            "hover:shadow-[0px_4px_8px_rgba(9,30,66,0.25),0px_0px_1px_rgba(9,30,66,0.31)]",
            "hover:bg-[#1F845A]"
          ] :
          rank === 3 ? [
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
        {rank <= 3 ? (
          rank === 1 ? <Crown className="w-3 h-3" /> :
          rank === 2 ? <Trophy className="w-3 h-3" /> :
          <Star className="w-3 h-3 fill-current" />
        ) : (
          <span className="font-semibold text-xs">{rank}</span>
        )}
      </div>
      
      {/* 发现标记 - 宝藏效果 */}
      {rank <= 3 && (
        <div className={cn(
          "absolute -top-1 -right-1 z-10 w-4 h-4 rounded-full",
          "bg-gradient-to-br from-magellan-gold to-magellan-coral",
          "animate-pulse shadow-lg",
          rank === 1 ? 'professional-glow' : ''
        )}>
          <Star className="h-2 w-2 text-white m-1" />
        </div>
      )}
      
      <CompactCard website={website} onVisit={handleVisit} />
    </div>
  );

  const RankingSection = ({ type, title, description, icon: Icon, data, color = 'primary' }: any) => (
    <section className="py-16 px-4 relative">
      {/* 海域背景装饰 */}
      <div className="absolute inset-0 opacity-6 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/3 to-transparent rounded-full blur-3xl professional-float"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-magellan-teal/3 to-transparent rounded-full blur-2xl professional-decoration" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* 探险图标 - 罗盘风格 */}
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center relative group",
              `bg-gradient-to-br from-${color}/15 to-${color}/5`,
              `border border-${color}/20 shadow-lg`,
              "subtle-scale"
            )}>
              <Icon className={cn(
                "h-7 w-7 transition-colors duration-300",
                `text-${color} group-hover:text-${color}`
              )} />
              {/* 发光环效果 */}
              <div className={cn(
                "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                `bg-gradient-to-br from-${color}/20 to-transparent`
              )}></div>
            </div>
            <div className="space-y-1">
              <h2 className={cn(
                "text-atlassian-h3 font-semibold text-foreground",
                "flex items-center gap-2"
              )}>
                🏆 {title}
              </h2>
              <p className="text-atlassian-body text-muted-foreground flex items-center gap-2">
                <Compass className="h-4 w-4 text-magellan-teal professional-compass" />
                {description}
              </p>
            </div>
          </div>
          
          {/* 探索更多按钮 - 航海风格 */}
          <Link href={`/rankings/${type}`}>
            <Button 
              variant="outline" 
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
              <Route className="h-4 w-4 subtle-rotate" />
              {tRank('view_all')}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>

        {/* 宝藏发现网格 - 海洋主题 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {data.slice(0, 12).map((website: any, index: number) => (
            <motion.div
              key={website.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.08,
                ease: [0.15, 1, 0.3, 1] // 海洋波浪效果
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
          <Link href={`/rankings/${type}`}>
            <Button 
              size="lg"
              className={cn(
                "w-full max-w-sm",
                `bg-gradient-to-r from-${color} to-${color}/80`,
                `hover:from-${color}/90 hover:to-${color}/70`,
                "text-white rounded-xl px-6 py-4",
                "shadow-lg hover:shadow-xl",
                "subtle-hover",
                "border border-primary/20"
              )}
            >
              <Ship className="h-5 w-5 mr-2 professional-float" />
              ⚓ {tRank('view_all_with_title', { title })}
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - AI Magellan 探险排行榜 */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-primary/5 via-background to-magellan-coral/3 overflow-hidden">
        {/* 海洋装饰背景元素 */}
        <div className="absolute inset-0 opacity-8 pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-primary/4 to-transparent rounded-full blur-3xl professional-float"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-magellan-gold/3 to-transparent rounded-full blur-3xl professional-decoration" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-magellan-coral/2 to-magellan-teal/2 rounded-full blur-2xl professional-decoration active" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6,
              ease: [0.15, 1, 0.3, 1]
            }}
            className="space-y-8"
          >
            {/* 探险徽章 */}
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-magellan-gold/10 border border-primary/20 shadow-lg">
              <Trophy className="h-5 w-5 text-primary professional-glow" />
              <span className="text-sm font-semibold text-primary">🏆 {tRank('hero.badge')}</span>
              <div className="w-2 h-2 rounded-full bg-magellan-coral professional-glow"></div>
            </div>
            
            <h1 className={cn(
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight",
              "bg-gradient-to-r from-primary via-magellan-gold to-magellan-coral bg-clip-text text-transparent"
            )}>
              🗺️ {tRank('home_header_title')}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              ⚓ {tRank('home_header_subtitle')}
            </p>
          </motion.div>

          {/* 探险统计 - 航海数据 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.3
            }}
            className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Compass className="h-4 w-4 text-primary professional-compass" />
              </div>
              <span className="font-medium">{totalTools}+ {tRank('stats.tools_charted')}</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-full bg-magellan-teal/10 group-hover:bg-magellan-teal/20 transition-colors">
                <Map className="h-4 w-4 text-magellan-teal professional-float" />
              </div>
              <span className="font-medium">{categories.length} {tRank('stats.territories')}</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-full bg-magellan-gold/10 group-hover:bg-magellan-gold/20 transition-colors">
                <Trophy className="h-4 w-4 text-magellan-gold professional-glow" />
              </div>
              <span className="font-medium">{rankingTypes.length} {tRank('stats.expedition_types')}</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-full bg-magellan-mint/10 group-hover:bg-magellan-mint/20 transition-colors">
                <Navigation className="h-4 w-4 text-magellan-mint professional-compass" />
              </div>
              <span className="font-medium">24/7 {tRank('stats.navigation')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 探险类型概览 - 航海地图 */}
      <section className="py-20 px-4 relative">
        {/* 海域背景装饰 */}
        <div className="absolute inset-0 opacity-6 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-magellan-teal/4 to-transparent rounded-full blur-3xl professional-decoration"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-primary/3 to-transparent rounded-full blur-2xl professional-decoration active"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              🗺️ {tRank('overview_title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {tRank('overview_subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {rankingTypes.map((type, index) => (
              <motion.div
                key={type.key}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: [0.15, 1, 0.3, 1]
                }}
              >
                <Link href={type.href}>
                  <Card className={cn(
                    "group h-full relative overflow-hidden cursor-pointer",
                    "bg-card/95 backdrop-blur-sm border border-primary/10",
                    "rounded-2xl shadow-lg hover:shadow-2xl",
                    "transition-all duration-500 ease-out",
                    "subtle-hover",
                    "hover:border-primary/30"
                  )}>
                    {/* 背景效果 */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500",
                      `bg-gradient-to-br from-${type.color}/3 via-transparent to-${type.color}/5`
                    )}></div>
                    
                    <CardContent className="p-8 relative z-10 text-center">
                      {/* 探险图标 */}
                      <div className="mb-6 flex justify-center">
                        <div className={cn(
                          "relative p-4 rounded-2xl",
                          `bg-${type.color}/15 border border-${type.color}/20`,
                          "subtle-scale",
                          "transition-all duration-500"
                        )}>
                          <type.icon className={cn(
                            "h-8 w-8 transition-colors duration-300",
                            `text-${type.color} group-hover:text-${type.color}`
                          )} />
                          {/* 发光环效果 */}
                          <div className={cn(
                            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                            `bg-gradient-to-br from-${type.color}/20 to-transparent`
                          )}></div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                        {tRank(`types.${type.key}.title`)}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {tRank(`types.${type.key}.description`)}
                      </p>
                      <div className={cn(
                        "text-sm font-medium flex items-center justify-center gap-2",
                        `text-${type.color} group-hover:underline transition-colors duration-300`
                      )}>
                        <Compass className="h-4 w-4" />
                        {tRank('actions.view_expedition')}
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </CardContent>
                    
                    {/* 底部装饰线 */}
                    <div className={cn(
                      "absolute bottom-0 left-0 right-0 h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-500",
                      `bg-gradient-to-r from-transparent via-${type.color}/60 to-transparent`
                    )}></div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 顶级探险预览 */}
      <div className="bg-muted/30">
        <RankingSection
          type="top-rated"
          title={tRank('types.top-rated.title')}
          description={tRank('types.top-rated.description')}
          icon={Crown}
          data={rankings.topRated}
          color="magellan-gold"
        />
      </div>

      <RankingSection
        type="popular"
        title={tRank('types.popular.title')}
        description={tRank('types.popular.description')}
        icon={Ship}
        data={rankings.popular}
        color="magellan-teal"
      />

      <div className="bg-muted/30">
        <RankingSection
          type="trending"
          title={tRank('types.trending.title')}
          description={tRank('types.trending.description')}
          icon={Flame}
          data={rankings.trending}
          color="magellan-coral"
        />
      </div>

      {/* 最终CTA Section - 启程探险 */}
      <section className="py-20 px-4 relative bg-gradient-to-br from-primary/5 via-background to-magellan-coral/3">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-primary/3 to-transparent"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6,
              ease: [0.15, 1, 0.3, 1]
            }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold flex items-center justify-center gap-3">
              ⚓ {tRank('cta_title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              🌊 {tRank('cta_subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center sm:items-stretch">
              <Link href="/categories">
                <Button 
                  size="lg" 
                  className={cn(
                    "group relative overflow-hidden",
                    "bg-gradient-to-r from-primary to-magellan-teal",
                    "hover:from-primary/90 hover:to-magellan-teal/90",
                    "text-white rounded-xl px-8 py-4 text-lg font-semibold",
                    "shadow-lg hover:shadow-xl",
                    "subtle-hover"
                  )}
                >
                  <div className="relative flex items-center gap-3">
                    <Map className="h-5 w-5 subtle-rotate" />
                    🗺️ {tRank('cta_navigate_by_territory')}
                  </div>
                </Button>
              </Link>
              
              <Link href="/submit">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className={cn(
                    "group",
                    "border-2 border-primary/30 hover:border-primary/60",
                    "bg-background/80 hover:bg-primary/5 backdrop-blur-sm",
                    "rounded-xl px-8 py-4 text-lg font-semibold",
                    "shadow-lg hover:shadow-xl",
                    "subtle-hover"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Anchor className="h-5 w-5 text-primary subtle-rotate" />
                    ⚓ {tRank('cta_chart_discovery')}
                  </div>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
