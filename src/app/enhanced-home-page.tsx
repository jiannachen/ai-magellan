"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import { websitesAtom, categoriesAtom, searchQueryAtom, selectedCategoryAtom } from "@/lib/atoms";
import { SearchManager } from "@/components/search/search-manager";
import { Button } from "@/ui/common/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/common/card";
import { Badge } from "@/ui/common/badge";
import { Input } from "@/ui/common/input";
import { Separator } from "@/ui/common/separator";
import { 
  Search, 
  TrendingUp, 
  Sparkles, 
  Brain, 
  Code, 
  Image, 
  PenTool, 
  MessageSquare,
  Star,
  Users,
  ExternalLink,
  ArrowRight,
  Calendar,
  Clock,
  ThumbsUp,
  Filter,
  Zap,
  Target,
  Award,
  BookOpen,
  Play,
  ChevronRight,
  Flame,
  Crown,
  Bookmark
} from "lucide-react";
import type { Website, Category } from "@/lib/types";
import { useTranslations } from 'next-intl';
import Link from "next/link";

interface EnhancedHomePageProps {
  initialWebsites: Website[];
  initialCategories: Category[];
}

// Category icons mapping
const categoryIcons = {
  'ai-chat': MessageSquare,
  'ai-art': Image,
  'ai-writing': PenTool,
  'ai-coding': Code,
  'ai-tools': Brain,
  'llm': Sparkles,
};

// Mock data for enhanced features
const trendingSearches = [
  "ChatGPT alternatives", "AI image generators", "Writing assistants", 
  "Code completion", "AI video tools", "Voice synthesis"
];

const recentNews = [
  {
    title: "GPT-4o Vision Now Available for All Users",
    date: "2024-10-10",
    category: "AI Updates"
  },
  {
    title: "Top 10 AI Tools for Content Creators in 2024",
    date: "2024-10-09", 
    category: "Guides"
  },
  {
    title: "Claude 3.5 Sonnet Beats GPT-4 in Coding Tasks",
    date: "2024-10-08",
    category: "Reviews"
  }
];

const userTestimonials = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    comment: "Found amazing AI tools that boosted my productivity by 300%!",
    avatar: "SC"
  },
  {
    name: "Mike Rodriguez", 
    role: "Developer",
    comment: "The best curated collection of AI development tools.",
    avatar: "MR"
  },
  {
    name: "Emily Johnson",
    role: "Marketing Manager", 
    comment: "Discovered tools I never knew existed. Game changer!",
    avatar: "EJ"
  }
];

export default function EnhancedHomePage({
  initialWebsites,
  initialCategories,
}: EnhancedHomePageProps) {
  const t = useTranslations();
  const [websites, setWebsites] = useAtom(websitesAtom);
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [selectedCategory] = useAtom(selectedCategoryAtom);
  const [filteredWebsites, setFilteredWebsites] = useState<Website[]>([]);
  const [featuredWebsites, setFeaturedWebsites] = useState<Website[]>([]);
  const [trendingWebsites, setTrendingWebsites] = useState<Website[]>([]);
  const [dailyPicks, setDailyPicks] = useState<Website[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Initialize data
  useEffect(() => {
    setWebsites(initialWebsites);
    setCategories(initialCategories);
  }, [initialWebsites, initialCategories, setWebsites, setCategories]);

  // Process websites for different sections
  useEffect(() => {
    // Featured websites (marked as featured or high quality)
    const featured = websites
      .filter(w => w.is_featured || (w.quality_score ?? 50) > 85)
      .slice(0, 6);
    setFeaturedWebsites(featured);

    // Trending websites (high recent visits)
    const trending = websites
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 8);
    setTrendingWebsites(trending);

    // Daily picks (trusted + high quality)
    const picks = websites
      .filter(w => w.is_trusted && (w.quality_score ?? 50) > 80)
      .slice(0, 4);
    setDailyPicks(picks);
  }, [websites]);

  const handleVisit = (website: Website) => {
    fetch(`/api/websites/${website.id}/visit`, { method: "POST" });
    window.open(website.url, "_blank");
  };

  const handleLike = async (websiteId: number) => {
    try {
      await fetch(`/api/websites/${websiteId}/like`, { method: "POST" });
      setWebsites(prev => prev.map(w => 
        w.id === websiteId ? { ...w, likes: w.likes + 1 } : w
      ));
    } catch (error) {
      console.error('Failed to like website:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Enhanced Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <motion.div
          className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Announcement Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>10,000+ AI Tools Curated</span>
              <Badge variant="secondary" className="text-xs">Updated Daily</Badge>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Discover{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Tools
              </span>
              <br />
              That Actually Work
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              From content creation to code generation, find the perfect AI tool for every task. 
              Curated by experts, tested by professionals, trusted by millions.
            </p>
          </motion.div>

          {/* Enhanced Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <Input
                  placeholder="Try: &quot;AI video generator&quot; or &quot;write code faster&quot;"
                  className="pl-16 pr-20 h-16 text-lg rounded-2xl border-2 border-primary/20 focus:border-primary shadow-xl bg-background/80 backdrop-blur"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  variant="ghost" 
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
              
              {/* Search Suggestions */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="text-sm text-muted-foreground">Trending:</span>
                {trendingSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(search)}
                    className="text-sm bg-muted hover:bg-muted/80 px-3 py-1 rounded-full transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
          >
            {[
              { icon: Brain, label: "AI Tools", value: `${websites.length}+` },
              { icon: Users, label: "Categories", value: categories.length },
              { icon: Star, label: "Reviews", value: "50K+" },
              { icon: TrendingUp, label: "Daily Users", value: "100K+" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-3 rounded-full bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Daily Editor's Picks */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Today's Editor's Picks</h2>
                <p className="text-muted-foreground">Hand-selected tools that are making waves</p>
              </div>
            </div>
            <Badge variant="outline" className="hidden md:flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Oct 10, 2024
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dailyPicks.map((website, index) => (
              <motion.div
                key={website.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group border-2 border-primary/10 hover:border-primary/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {website.thumbnail ? (
                          <img 
                            src={website.thumbnail} 
                            alt={website.title}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                            <Brain className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate">{website.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {categories.find(c => c.id === website.category_id)?.name}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800">
                        <Flame className="h-3 w-3 mr-1" />
                        Pick
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {website.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {website.visits}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {website.likes}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleVisit(website)}
                        className="group-hover:bg-primary group-hover:text-primary-foreground"
                      >
                        Try Now
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Categories Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Explore by Category</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover AI tools organized by their specific use cases and applications
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => {
              const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Brain;
              const toolCount = websites.filter(w => w.category_id === category.id).length;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/?category=${category.id}`}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group border-2 border-transparent hover:border-primary/20">
                      <CardContent className="p-8 text-center">
                        <div className="mb-6 flex justify-center">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 group-hover:from-primary/20 group-hover:to-purple-500/20 transition-all duration-300">
                            <IconComponent className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{toolCount} tools</p>
                        <div className="text-xs text-primary flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Explore
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending Tools */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Trending This Week</h2>
                <p className="text-muted-foreground">The most popular tools right now</p>
              </div>
            </div>
            <Link href="/trending">
              <Button variant="outline" className="hidden md:flex items-center gap-2">
                View All Trending
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingWebsites.slice(0, 8).map((website, index) => (
              <motion.div
                key={website.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200 group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      {website.thumbnail ? (
                        <img 
                          src={website.thumbnail} 
                          alt={website.title}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{website.title}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {website.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {website.visits}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleVisit(website)}
                        className="text-xs h-6 px-2"
                      >
                        Visit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI News & Resources */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Latest News */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Latest AI News</h2>
                  <p className="text-muted-foreground">Stay updated with the AI world</p>
                </div>
              </div>

              <div className="space-y-4">
                {recentNews.map((news, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">{news.category}</Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {news.date}
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {news.title}
                            </h3>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* User Testimonials */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">What Users Say</h2>
                  <p className="text-muted-foreground">Real feedback from our community</p>
                </div>
              </div>

              <div className="space-y-4">
                {userTestimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.2 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-sm mb-4 italic">"{testimonial.comment}"</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                            {testimonial.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{testimonial.name}</div>
                            <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to 10x Your Productivity?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join over 100,000 professionals who use our platform to discover and integrate AI tools into their workflow.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/submit">
                <Button size="lg" variant="default">
                  <Zap className="h-5 w-5 mr-2" />
                  Submit Your Tool
                </Button>
              </Link>
              <Link href="/tools">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg">
                  <Target className="h-5 w-5 mr-2" />
                  Explore All Tools
                </Button>
              </Link>
            </div>

            <div className="pt-8 flex justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Trusted by 100K+ users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>4.9/5 user rating</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Results */}
      {searchQuery && (
        <section className="py-8 px-4 border-t">
          <div className="max-w-7xl mx-auto">
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