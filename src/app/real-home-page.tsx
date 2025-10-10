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
  ThumbsUp,
  Heart,
  Bookmark,
  Eye,
  Clock,
  Award,
  Filter,
  Grid3X3,
  ChevronRight,
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
  Lightbulb
} from "lucide-react";
import type { Website, Category } from "@/lib/types";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { useUser } from '@clerk/nextjs';

interface RealHomePageProps {
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

export default function RealHomePage({
  initialWebsites,
  initialCategories,
}: RealHomePageProps) {
  const t = useTranslations();
  const { user } = useUser();
  const [websites, setWebsites] = useAtom(websitesAtom);
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [selectedCategory] = useAtom(selectedCategoryAtom);
  const [filteredWebsites, setFilteredWebsites] = useState<Website[]>([]);
  const [featuredWebsites, setFeaturedWebsites] = useState<Website[]>([]);
  const [trendingWebsites, setTrendingWebsites] = useState<Website[]>([]);
  const [recentWebsites, setRecentWebsites] = useState<Website[]>([]);
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
  const [userFavorites, setUserFavorites] = useState<Set<number>>(new Set());
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // FAQ data
  const faqs = [
    {
      question: "What types of AI tools can I find here?",
      answer: "We curate AI tools across all major categories including chat assistants, image generators, writing tools, coding assistants, video editors, voice synthesizers, and business automation tools. All tools are tested and verified for quality."
    },
    {
      question: "Are these AI tools free to use?",
      answer: "We list both free and paid AI tools. Each tool shows its pricing model - free, freemium, subscription, or one-time purchase. Many tools offer free tiers or trial periods so you can test them before committing."
    },
    {
      question: "How do you ensure the quality of listed tools?",
      answer: "Every tool goes through our review process. We test functionality, check user reviews, verify company legitimacy, and assign quality scores. Featured tools meet our highest standards for reliability and user experience."
    },
    {
      question: "Can I submit my own AI tool?",
      answer: "Yes! We welcome submissions from tool creators and users. Simply use our submission form, provide detailed information about the tool, and our team will review it. Quality tools that pass our review will be added to the directory."
    },
    {
      question: "How often is the directory updated?",
      answer: "We update our directory daily with new tools, feature updates, and pricing changes. Our team continuously monitors the AI landscape to ensure you have access to the latest and most relevant tools."
    },
    {
      question: "Do I need to create an account?",
      answer: "No account is needed to browse and discover tools. However, creating a free account allows you to like tools, save favorites, leave reviews, and get personalized recommendations based on your interests."
    }
  ];

  // Value propositions
  const valueProps = [
    {
      icon: Shield,
      title: "Quality Verified",
      description: "Every tool is tested and reviewed by our expert team before listing"
    },
    {
      icon: Zap,
      title: "Save Time",
      description: "Skip the research. Find the perfect AI tool for your needs in minutes"
    },
    {
      icon: Target,
      title: "Perfect Match",
      description: "Advanced filtering and search to find exactly what you're looking for"
    },
    {
      icon: BarChart3,
      title: "Data-Driven",
      description: "Real user reviews, usage stats, and quality scores help you decide"
    },
    {
      icon: Rocket,
      title: "Stay Updated", 
      description: "Access the latest AI tools as soon as they're released and verified"
    },
    {
      icon: Globe,
      title: "Comprehensive",
      description: "From startups to enterprise - tools for every use case and budget"
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
      // Load user likes and favorites
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

  // Process websites for different sections
  useEffect(() => {
    // Featured websites (marked as featured)
    const featured = websites
      .filter(w => w.is_featured && w.status === 'approved')
      .slice(0, 6);
    setFeaturedWebsites(featured);

    // Trending websites (most visited recently)
    const trending = websites
      .filter(w => w.status === 'approved')
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 8);
    setTrendingWebsites(trending);

    // Recent websites (newly added)
    const recent = websites
      .filter(w => w.status === 'approved')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);
    setRecentWebsites(recent);
  }, [websites]);

  const handleVisit = async (website: Website) => {
    // Track visit
    try {
      await fetch(`/api/websites/${website.id}/visit`, { method: "POST" });
      // Update local state
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
        
        // Update website likes count
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

  const WebsiteCard = ({ website, showStats = true }: { website: Website; showStats?: boolean }) => {
    const category = categories.find(c => c.id === website.category_id);
    const isLiked = userLikes.has(website.id);
    const isFavorited = userFavorites.has(website.id);

    return (
      <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {website.thumbnail ? (
                <img 
                  src={website.thumbnail} 
                  alt={website.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{website.title}</h3>
                {website.tagline && (
                  <p className="text-sm text-muted-foreground truncate">{website.tagline}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {category?.name}
                  </Badge>
                  {website.pricing_model !== 'free' && (
                    <Badge variant="outline" className="text-xs">
                      {website.pricing_model}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            {user && (
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(website.id)}
                  className={`h-8 w-8 p-0 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFavorite(website.id)}
                  className={`h-8 w-8 p-0 ${isFavorited ? 'text-yellow-500' : 'text-muted-foreground'}`}
                >
                  <Bookmark className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {website.description}
          </p>

          {/* Features */}
          {website.features && Array.isArray(website.features) && website.features.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {(website.features as any[]).slice(0, 2).map((feature: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature.name || feature}
                  </Badge>
                ))}
                {(website.features as any[]).length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{(website.features as any[]).length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            {showStats && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {website.visits}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {website.likes}
                </span>
                {website.quality_score > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {website.quality_score}/100
                  </span>
                )}
              </div>
            )}
            <Button 
              size="sm" 
              onClick={() => handleVisit(website)}
              className="group-hover:bg-primary group-hover:text-primary-foreground"
            >
              Visit
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Discover the Best{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                AI Tools
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Curated collection of AI tools to boost your productivity. Find, compare, and use the tools that actually work.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search AI tools... (e.g., ChatGPT, coding assistant)"
                className="pl-12 h-14 text-lg rounded-xl border-2 border-primary/20 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>{websites.length} Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              <span>{categories.length} Categories</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Quality Curated</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
            <p className="text-muted-foreground">Find the perfect AI tool for your specific needs</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => {
              const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Brain;
              const toolCount = websites.filter(w => w.category_id === category.id && w.status === 'approved').length;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/?category=${category.id}`}>
                    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group">
                      <CardContent className="p-6 text-center">
                        <div className="mb-4 flex justify-center">
                          <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <h3 className="font-semibold mb-2">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{toolCount} tools</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      {featuredWebsites.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-3xl font-bold">Featured Tools</h2>
                  <p className="text-muted-foreground">Editor's choice and community favorites</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredWebsites.map((website, index) => (
                <motion.div
                  key={website.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <WebsiteCard website={website} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Tools */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">Trending Tools</h2>
                <p className="text-muted-foreground">Most popular tools this week</p>
              </div>
            </div>
            <Link href="/trending">
              <Button variant="outline" className="hidden md:flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingWebsites.slice(0, 8).map((website, index) => (
              <motion.div
                key={website.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <WebsiteCard website={website} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added */}
      {recentWebsites.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-3xl font-bold">Recently Added</h2>
                  <p className="text-muted-foreground">Latest tools added to our collection</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentWebsites.map((website, index) => (
                <motion.div
                  key={website.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <WebsiteCard website={website} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Value Proposition Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose Our AI Tools Directory?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We don't just list tools - we curate, test, and verify every AI tool to save you time and help you make informed decisions.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {valueProps.map((prop, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30">
                  <CardContent className="p-8">
                    <div className="mb-6 flex justify-center">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10">
                        <prop.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-4">{prop.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {prop.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 text-center"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="space-y-2">
                <div className="text-2xl md:text-3xl font-bold text-primary">{websites.length}+</div>
                <div className="text-sm text-muted-foreground">Curated Tools</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl md:text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Happy Users</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl md:text-3xl font-bold text-primary">99%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl md:text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Updated</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to know about our AI tools directory
              </p>
            </motion.div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className="w-full text-left p-6 hover:bg-muted/50 transition-colors flex items-center justify-between"
                    >
                      <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                      <div className="flex-shrink-0">
                        {openFaqIndex === index ? (
                          <Minus className="h-5 w-5 text-primary" />
                        ) : (
                          <Plus className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                    <AnimatePresence>
                      {openFaqIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
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

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 text-center"
          >
            <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <Lightbulb className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="text-xl font-bold">Still have questions?</h3>
                  <p className="text-muted-foreground">
                    Can't find the answer you're looking for? Our team is here to help.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline">
                      Contact Support
                    </Button>
                    <Button>
                      Join Community
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Can't find what you're looking for?
            </h2>
            <p className="text-xl text-muted-foreground">
              Submit your favorite AI tool and help others discover amazing tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/submit">
                <Button size="lg" className="w-full sm:w-auto">
                  Submit a Tool
                </Button>
              </Link>
              <Link href="/tools">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse All Tools
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Results */}
      {searchQuery && (
        <section className="py-8 px-4 border-t">
          <div className="max-w-6xl mx-auto">
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