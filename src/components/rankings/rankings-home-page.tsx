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
  Route
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

const rankingTypes = [
  {
    key: 'popular',
    icon: TrendingUp,
    href: '/rankings/popular'
  },
  {
    key: 'top-rated',
    icon: Crown,
    href: '/rankings/top-rated'
  },
  {
    key: 'trending',
    icon: Zap,
    href: '/rankings/trending'
  },
  {
    key: 'free',
    icon: CheckCircle,
    href: '/rankings/free'
  },
  {
    key: 'new',
    icon: Clock,
    href: '/rankings/new'
  }
  ,
  {
    key: 'monthly-hot',
    icon: TrendingUp,
    href: '/rankings/monthly-hot'
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
    <div className="relative">
      {/* 排名标识 - Atlassian风格 */}
      <div className={cn(
        "absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center",
        "text-atlassian-caption font-medium",
        rank === 1 ? 'bg-primary text-primary-foreground' :
        rank === 2 ? 'bg-muted-foreground text-background' :
        rank === 3 ? 'bg-orange-500 text-white' :
        'bg-muted text-muted-foreground'
      )}>
        {rank}
      </div>
      <CompactCard website={website} onVisit={handleVisit} />
    </div>
  );

  const RankingSection = ({ type, title, description, icon: Icon, data }: any) => (
    <section className="py-10 px-4"> {/* 减少垂直间距 */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6"> {/* 减少底部间距 */}
          <div className="flex items-center gap-3"> {/* 减少gap */}
            <div className={cn(
              "p-2.5 rounded-lg", // 使用8px圆角，减少padding
              "bg-primary/10 border border-primary/20"
            )}>
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-atlassian-h3 font-medium">{title}</h2> {/* 使用Atlassian字体层级 */}
              <p className="text-atlassian-body text-muted-foreground">{description}</p>
            </div>
          </div>
          <Link href={`/rankings/${type}`}>
            <Button 
              variant="outline" 
              className={cn(
                "hidden md:flex items-center gap-2",
                "btn-atlassian-secondary",
                "rounded-md px-4 py-2",
                "text-atlassian-body"
              )}
            >
              {tRank('view_all')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.slice(0, 8).map((website: any, index: number) => (
            <motion.div
              key={website.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05, // 减少延迟间隔
                ease: [0.25, 0.1, 0.25, 1] // Atlassian standard缓动
              }}
            >
              <WebsiteCard website={website} rank={index + 1} />
            </motion.div>
          ))}
        </div>

        {/* Mobile View All Button - Atlassian风格 */}
        <div className="mt-5 text-center md:hidden"> {/* 减少上边距 */}
          <Link href={`/rankings/${type}`}>
            <Button className={cn(
              "w-full",
              "btn-atlassian-primary",
              "rounded-md",
              "text-atlassian-body"
            )}>
              {tRank('view_all_with_title', { title })}
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
      <section className="py-12 px-4 bg-primary/5"> {/* 减少垂直间距，使用简洁背景 */}
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3,
              ease: [0.15, 1, 0.3, 1] // Atlassian entrance缓动
            }}
            className="space-y-4" // 减少间距
          >
            <div className="flex items-center justify-center gap-3 mb-4"> {/* 减少底部间距 */}
              <Compass className="h-10 w-10 text-primary" /> {/* 稍微减小图标 */}
              <h1 className={cn(
                "text-atlassian-display md:text-atlassian-display", // 使用Atlassian字体层级
                "font-medium tracking-tight"
              )}>
                {tRank('home_header_title')}
              </h1>
            </div>
            <p className="text-atlassian-body-large text-muted-foreground max-w-3xl mx-auto">
              {tRank('home_header_subtitle')}
            </p>
          </motion.div>

          {/* Quick Stats - Atlassian风格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.1,
              ease: [0.25, 0.1, 0.25, 1] // Atlassian standard缓动
            }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto" // 减少间距
          >
            <div className="text-center">
              <div className="text-atlassian-h4 font-medium text-primary">{totalTools}+</div> {/* 使用Atlassian字体 */}
              <div className="text-atlassian-caption text-muted-foreground">{tRank('stats.tools_charted')}</div>
            </div>
            <div className="text-center">
              <div className="text-atlassian-h4 font-medium text-primary">{categories.length}</div>
              <div className="text-atlassian-caption text-muted-foreground">{tRank('stats.territories')}</div>
            </div>
            <div className="text-center">
              <div className="text-atlassian-h4 font-medium text-primary">{rankingTypes.length}</div>
              <div className="text-atlassian-caption text-muted-foreground">{tRank('stats.expedition_types')}</div>
            </div>
            <div className="text-center">
              <div className="text-atlassian-h4 font-medium text-primary">24/7</div>
              <div className="text-atlassian-caption text-muted-foreground">{tRank('stats.navigation')}</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ranking Types Overview - Atlassian风格 */}
      <section className="py-12 px-4"> {/* 减少垂直间距 */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10"> {/* 减少底部间距 */}
            <h2 className="text-atlassian-h2 font-medium mb-3">{tRank('overview_title')}</h2> {/* 使用Atlassian字体层级 */}
            <p className="text-atlassian-body-large text-muted-foreground">
              {tRank('overview_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"> {/* 减少间距 */}
            {rankingTypes.map((type, index) => (
              <motion.div
                key={type.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05, // 减少延迟间隔
                  ease: [0.25, 0.1, 0.25, 1] // Atlassian standard缓动
                }}
              >
                <Link href={type.href}>
                  <Card className={cn(
                    "h-full group cursor-pointer",
                    "card-atlassian", // 使用Atlassian卡片样式
                    "border-border/60 hover:border-primary/30",
                    "transition-atlassian-standard"
                  )}>
                    <CardContent className="p-5 text-center"> {/* 减少内边距 */}
                      <div className={cn(
                        "mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-4", // 使用8px圆角，减小尺寸
                        "bg-primary/10 border border-primary/20",
                        "group-hover:bg-primary/15 transition-atlassian-standard"
                      )}>
                        <type.icon className="h-6 w-6 text-primary" /> {/* 稍微减小图标 */}
                      </div>
                      <h3 className="text-atlassian-h5 font-medium mb-2">{tRank(`types.${type.key}.title`)}</h3> {/* 使用Atlassian字体 */}
                      <p className="text-atlassian-body text-muted-foreground mb-3">{tRank(`types.${type.key}.description`)}</p>
                      <div className="text-atlassian-body text-primary font-medium group-hover:underline">
                        {tRank('actions.view_expedition')} →
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rankings Preview */}
      <div className="bg-muted/20"> {/* 减少背景透明度 */}
        <RankingSection
          type="top-rated"
          title={tRank('types.top-rated.title')}
          description={tRank('types.top-rated.description')}
          icon={Crown}
          data={rankings.topRated}
        />
      </div>

      <RankingSection
        type="popular"
        title={tRank('types.popular.title')}
        description={tRank('types.popular.description')}
        icon={TrendingUp}
        data={rankings.popular}
      />

      <div className="bg-muted/20"> {/* 减少背景透明度 */}
        <RankingSection
          type="trending"
          title={tRank('types.trending.title')}
          description={tRank('types.trending.description')}
          icon={Flame}
          data={rankings.trending}
        />
      </div>

      {/* CTA Section - Atlassian风格 */}
      <section className="py-16 px-4 bg-primary/5"> {/* 减少垂直间距，使用简洁背景 */}
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
              {tRank('cta_title')}
            </h2>
            <p className="text-atlassian-body-large text-muted-foreground">
              {tRank('cta_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center"> {/* 减少间距 */}
              <Link href="/categories">
                <Button 
                  size="lg" 
                  className={cn(
                    "w-full sm:w-auto",
                    "btn-atlassian-primary",
                    "rounded-md px-6 py-3",
                    "text-atlassian-body font-medium"
                  )}
                >
                  {tRank('cta_navigate_by_territory')}
                </Button>
              </Link>
              <Link href="/submit">
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
                  {tRank('cta_chart_discovery')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
