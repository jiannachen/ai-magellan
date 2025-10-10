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
  Flame
} from 'lucide-react';
import Link from 'next/link';
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
    title: 'Most Popular',
    description: 'AI tools ranked by user visits and engagement',
    icon: TrendingUp,
    href: '/rankings/popular'
  },
  {
    key: 'topRated', 
    title: 'Top Rated',
    description: 'Highest quality tools based on our review system',
    icon: Crown,
    href: '/rankings/top-rated'
  },
  {
    key: 'trending',
    title: 'Trending',
    description: 'AI tools gaining momentum recently',
    icon: Zap,
    href: '/rankings/trending'
  },
  {
    key: 'free',
    title: 'Best Free',
    description: 'Top-quality free AI tools',
    icon: CheckCircle,
    href: '/rankings/free'
  },
  {
    key: 'newest',
    title: 'Recently Added',
    description: 'Latest AI tools in our directory',
    icon: Clock,
    href: '/rankings/new'
  }
];

export default function RankingsHomePage({ rankings, categories, totalTools }: RankingsHomePageProps) {
  const { user } = useUser();
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
              View All
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
              View All {title}
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
              <Trophy className="h-10 w-10 text-primary" /> {/* 稍微减小图标 */}
              <h1 className={cn(
                "text-atlassian-display md:text-atlassian-display", // 使用Atlassian字体层级
                "font-medium tracking-tight"
              )}>
                AI Tools{" "}
                <span className="text-primary"> {/* 简化为单一主色调 */}
                  Rankings
                </span>
              </h1>
            </div>
            <p className="text-atlassian-body-large text-muted-foreground max-w-3xl mx-auto">
              Comprehensive rankings of AI tools by popularity, quality, and user engagement. Find the best tools across all categories.
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
              <div className="text-atlassian-caption text-muted-foreground">Tools Ranked</div>
            </div>
            <div className="text-center">
              <div className="text-atlassian-h4 font-medium text-primary">{categories.length}</div>
              <div className="text-atlassian-caption text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-atlassian-h4 font-medium text-primary">5</div> {/* 调整数字 */}
              <div className="text-atlassian-caption text-muted-foreground">Ranking Types</div>
            </div>
            <div className="text-center">
              <div className="text-atlassian-h4 font-medium text-primary">24/7</div>
              <div className="text-atlassian-caption text-muted-foreground">Updated</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ranking Types Overview - Atlassian风格 */}
      <section className="py-12 px-4"> {/* 减少垂直间距 */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10"> {/* 减少底部间距 */}
            <h2 className="text-atlassian-h2 font-medium mb-3">Explore Rankings</h2> {/* 使用Atlassian字体层级 */}
            <p className="text-atlassian-body-large text-muted-foreground">
              Discover AI tools through different ranking perspectives
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
                      <h3 className="text-atlassian-h5 font-medium mb-2">{type.title}</h3> {/* 使用Atlassian字体 */}
                      <p className="text-atlassian-body text-muted-foreground mb-3">{type.description}</p>
                      <div className="text-atlassian-body text-primary font-medium group-hover:underline">
                        View Rankings →
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
          title="Top Rated Tools"
          description="Highest quality AI tools based on our comprehensive review system"
          icon={Crown}
          data={rankings.topRated}
        />
      </div>

      <RankingSection
        type="popular"
        title="Most Popular Tools"
        description="AI tools with the highest user engagement and visits"
        icon={TrendingUp}
        data={rankings.popular}
      />

      <div className="bg-muted/20"> {/* 减少背景透明度 */}
        <RankingSection
          type="trending"
          title="Trending Tools"
          description="AI tools gaining momentum and popularity recently"
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
              Find Your Perfect AI Tool
            </h2>
            <p className="text-atlassian-body-large text-muted-foreground">
              Use our comprehensive rankings to discover AI tools that match your specific needs and budget.
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
                  Browse by Category
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
                  Submit Your Tool
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}