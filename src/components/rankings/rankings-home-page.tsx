"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card';
import { Badge } from '@/ui/common/badge';
import { Button } from '@/ui/common/button';
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
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

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
    color: 'from-blue-500 to-cyan-500',
    href: '/rankings/popular'
  },
  {
    key: 'topRated',
    title: 'Top Rated',
    description: 'Highest quality tools based on our review system',
    icon: Crown,
    color: 'from-yellow-500 to-orange-500',
    href: '/rankings/top-rated'
  },
  {
    key: 'trending',
    title: 'Trending',
    description: 'AI tools gaining momentum recently',
    icon: Zap,
    color: 'from-red-500 to-pink-500',
    href: '/rankings/trending'
  },
  {
    key: 'free',
    title: 'Best Free',
    description: 'Top-quality free AI tools',
    icon: CheckCircle,
    color: 'from-green-500 to-emerald-500',
    href: '/rankings/free'
  },
  {
    key: 'newest',
    title: 'Recently Added',
    description: 'Latest AI tools in our directory',
    icon: Clock,
    color: 'from-purple-500 to-indigo-500',
    href: '/rankings/new'
  },
  {
    key: 'monthlyHot',
    title: 'Monthly Hot',
    description: 'Trending tools this month',
    icon: BarChart3,
    color: 'from-orange-500 to-red-500',
    href: '/rankings/monthly-hot'
  },
  {
    key: 'categoryLeaders',
    title: 'Category Leaders',
    description: 'Top performers in each category',
    icon: Target,
    color: 'from-indigo-500 to-purple-500',
    href: '/rankings/category-leaders'
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

  const WebsiteCard = ({ website, rank }: { website: any; rank: number }) => {
    const isLiked = userLikes.has(website.id);

    return (
      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Rank */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0
                ${rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                  rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white' :
                  rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                  'bg-muted text-muted-foreground'}`}
              >
                {rank}
              </div>

              {/* Thumbnail */}
              {website.thumbnail ? (
                <img 
                  src={website.thumbnail} 
                  alt={website.title}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Award className="h-5 w-5 text-primary" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{website.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{website.category?.name}</span>
                  {website.quality_score > 80 && (
                    <Badge variant="outline" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      {website.quality_score}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {website.visits}
              </span>
              <Button 
                size="sm" 
                onClick={() => handleVisit(website)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const RankingSection = ({ type, title, description, icon: Icon, color, data }: any) => (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>
          <Link href={`/rankings/${type}`}>
            <Button variant="outline" className="hidden md:flex items-center gap-2">
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
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <WebsiteCard website={website} rank={index + 1} />
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link href={`/rankings/${type}`}>
            <Button className="w-full">
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
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Trophy className="h-12 w-12 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                AI Tools{" "}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Rankings
                </span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive rankings of AI tools by popularity, quality, and user engagement. Find the best tools across all categories.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">{totalTools}+</div>
              <div className="text-sm text-muted-foreground">Tools Ranked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">7</div>
              <div className="text-sm text-muted-foreground">Ranking Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Updated</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ranking Types Overview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore Rankings</h2>
            <p className="text-muted-foreground text-lg">
              Discover AI tools through different ranking perspectives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rankingTypes.map((type, index) => (
              <motion.div
                key={type.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={type.href}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-r ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <type.icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{type.description}</p>
                      <div className="text-primary font-semibold group-hover:underline">
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
      <div className="bg-muted/30">
        <RankingSection
          type="top-rated"
          title="Top Rated Tools"
          description="Highest quality AI tools based on our comprehensive review system"
          icon={Crown}
          color="from-yellow-500 to-orange-500"
          data={rankings.topRated}
        />
      </div>

      <RankingSection
        type="popular"
        title="Most Popular Tools"
        description="AI tools with the highest user engagement and visits"
        icon={TrendingUp}
        color="from-blue-500 to-cyan-500"
        data={rankings.popular}
      />

      <div className="bg-muted/30">
        <RankingSection
          type="trending"
          title="Trending Tools"
          description="AI tools gaining momentum and popularity recently"
          icon={Fire}
          color="from-red-500 to-pink-500"
          data={rankings.trending}
        />
      </div>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Find Your Perfect AI Tool
            </h2>
            <p className="text-xl text-muted-foreground">
              Browse through our comprehensive rankings or explore by category
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/categories">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse by Category
                </Button>
              </Link>
              <Link href="/submit">
                <Button size="lg" className="w-full sm:w-auto">
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