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
  Grid3X3
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
    const approvedWebsites = websites.filter(w => w.status === 'approved');

    // Top rated by quality score
    const topRated = [...approvedWebsites]
      .sort((a, b) => b.quality_score - a.quality_score)
      .slice(0, 12);
    setTopRatedWebsites(topRated);

    // Most popular by visits
    const mostPopular = [...approvedWebsites]
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 12);
    setMostPopularWebsites(mostPopular);

    // Recent websites
    const recent = [...approvedWebsites]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 12);
    setRecentWebsites(recent);

    // Top free tools
    const topFree = approvedWebsites
      .filter(w => w.pricing_model === 'free' || w.has_free_version)
      .sort((a, b) => b.quality_score - a.quality_score)
      .slice(0, 12);
    setTopFreeWebsites(topFree);

    // Top paid tools
    const topPaid = approvedWebsites
      .filter(w => w.pricing_model !== 'free' && !w.has_free_version)
      .sort((a, b) => b.quality_score - a.quality_score)
      .slice(0, 12);
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
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-title1 font-semibold text-label-primary">{title}</h2>
              <p className="text-subhead text-label-secondary">{description}</p>
            </div>
          </div>
          <Link href={viewAllLink}>
            <Button variant="ghost" className="hidden md:flex items-center gap-2 text-primary">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {websites.slice(0, 12).map((website, index) => (
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

        {/* Mobile View All Button */}
        <div className="mt-6 text-center md:hidden">
          <Link href={viewAllLink}>
            <Button variant="secondary" className="w-full">
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
      <section className="relative py-24 px-4 bg-background">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fill-quaternary text-label-primary text-subhead font-medium"
            >
              <Rocket className="h-4 w-4" />
              <span>Discover Quality AI Tools</span>
            </motion.div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-largeTitle md:text-[48px] font-semibold tracking-tight leading-tight max-w-4xl mx-auto">
                Find the Best{" "}
                <span className="text-primary">
                  AI Tools
                </span>
                <br />
                <span className="text-title1 text-label-secondary font-normal">
                  That Actually Work
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-title3 text-label-secondary max-w-2xl mx-auto leading-relaxed font-normal">
                Curated collection of AI tools to boost your productivity.
                <br className="hidden md:block" />
                Find, compare, and use the tools trusted by professionals.
              </p>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 max-w-xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-label-tertiary" />
              <Input
                placeholder="Search AI tools..."
                className="pl-12 pr-4 h-14 text-body rounded-2xl border-2 border-fill-tertiary focus-visible:border-primary bg-background shadow-apple-1 focus-visible:shadow-apple-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <p className="text-footnote text-label-tertiary mt-3">
              Try: "image generator", "code assistant", "writing tool"
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-title2 font-semibold text-primary mb-1">{websites.length}+</div>
              <div className="text-caption1 text-label-secondary font-medium">AI Tools</div>
            </div>
            <div className="text-center">
              <div className="text-title2 font-semibold text-primary mb-1">50K+</div>
              <div className="text-caption1 text-label-secondary font-medium">Users</div>
            </div>
            <div className="text-center">
              <div className="text-title2 font-semibold text-primary mb-1">Daily</div>
              <div className="text-caption1 text-label-secondary font-medium">Updated</div>
            </div>
            <div className="text-center">
              <div className="text-title2 font-semibold text-primary mb-1">Quality</div>
              <div className="text-caption1 text-label-secondary font-medium">Curated</div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/categories">
              <Button size="lg" className="w-full sm:w-auto">
                <Grid3X3 className="h-5 w-5 mr-2" />
                Browse Categories
              </Button>
            </Link>
            <Link href="/submit">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                <Plus className="h-5 w-5 mr-2" />
                Submit Tool
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Rankings Sections */}
      <RankingSection
        title="Top Rated AI Tools"
        description="Highest quality tools based on our comprehensive review system"
        websites={topRatedWebsites}
        icon={Crown}
        viewAllLink="/rankings/top-rated"
      />

      <div className="bg-muted/30">
        <RankingSection
          title="Most Popular Tools"
          description="AI tools with the highest user engagement and visits"
          websites={mostPopularWebsites}
          icon={TrendingUp}
          viewAllLink="/rankings/popular"
        />
      </div>

      <RankingSection
        title="Best Free AI Tools"
        description="Top-quality AI tools that are completely free to use"
        websites={topFreeWebsites}
        icon={CheckCircle}
        viewAllLink="/rankings/free"
      />

      <div className="bg-muted/30">
        <RankingSection
          title="Recently Added"
          description="Latest AI tools added to our curated collection"
          websites={recentWebsites}
          icon={Clock}
          viewAllLink="/rankings/recent"
        />
      </div>

      {/* Value Proposition Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <div className="container mx-auto">
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
                We don't just list tools - we curate, test, and rank every AI tool to save you time and help you make informed decisions.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
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
              Ready to discover your next AI tool?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of professionals who use our rankings to find the best AI tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/submit">
                <Button size="lg" className="w-full sm:w-auto">
                  Submit Your Tool
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse Categories
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