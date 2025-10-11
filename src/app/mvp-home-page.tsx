"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import { websitesAtom, categoriesAtom, searchQueryAtom, selectedCategoryAtom } from "@/lib/atoms";
import { SearchManager } from "@/components/search/search-manager";
import { Button } from "@/ui/common/button";
import { Card, CardContent } from "@/ui/common/card";
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
  ArrowRight
} from "lucide-react";
import type { Website, Category } from "@/lib/types";
import { useTranslations } from 'next-intl';
import Link from "next/link";

interface MVPHomePageProps {
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

export default function MVPHomePage({
  initialWebsites,
  initialCategories,
}: MVPHomePageProps) {
  const t = useTranslations();
  const [websites, setWebsites] = useAtom(websitesAtom);
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [selectedCategory] = useAtom(selectedCategoryAtom);
  const [filteredWebsites, setFilteredWebsites] = useState<Website[]>([]);
  const [featuredWebsites, setFeaturedWebsites] = useState<Website[]>([]);

  // Initialize data
  useEffect(() => {
    setWebsites(initialWebsites);
    setCategories(initialCategories);
  }, [initialWebsites, initialCategories, setWebsites, setCategories]);

  // Get featured websites (top rated or featured)
  useEffect(() => {
    const featured = websites
      .filter(w => w.is_featured || (w.quality_score ?? 50) > 80)
      .slice(0, 8);
    setFeaturedWebsites(featured);
  }, [websites]);

  const handleVisit = (website: Website) => {
    fetch(`/api/websites/${website.id}/visit`, { method: "POST" });
    window.open(website.url, "_blank");
  };

  const handleLike = async (websiteId: number) => {
    try {
      await fetch(`/api/websites/${websiteId}/like`, { method: "POST" });
      // Update local state
      setWebsites(prev => prev.map(w => 
        w.id === websiteId ? { ...w, likes: w.likes + 1 } : w
      ));
    } catch (error) {
      console.error('Failed to like website:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Headline */}
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
              Find, compare, and use the most powerful AI tools to boost your productivity and creativity.
            </p>
          </motion.div>

          {/* Quick Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for AI tools... (e.g., ChatGPT, Midjourney)"
                className="pl-12 h-14 text-lg rounded-full border-2 border-primary/20 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>{websites.length}+ AI Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{categories.length} Categories</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Updated Daily</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
            <p className="text-muted-foreground">Explore AI tools organized by their primary use cases</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group">
                      <CardContent className="p-6 text-center">
                        <div className="mb-4 flex justify-center">
                          <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
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
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Featured AI Tools</h2>
              <p className="text-muted-foreground">Hand-picked tools that are making waves in the AI community</p>
            </div>
            <Link href="/featured">
              <Button variant="outline" className="hidden md:flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredWebsites.map((website, index) => (
              <motion.div
                key={website.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {website.thumbnail ? (
                          <img 
                            src={website.thumbnail} 
                            alt={website.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Brain className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{website.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {categories.find(c => c.id === website.category_id)?.name}
                          </p>
                        </div>
                      </div>
                      {website.is_featured && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {website.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {website.visits}
                        </span>
                        <button 
                          onClick={() => handleLike(website.id)}
                          className="flex items-center gap-1 hover:text-red-500 transition-colors"
                        >
                          <Star className="h-3 w-3" />
                          {website.likes}
                        </button>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleVisit(website)}
                        className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Mobile View All Button */}
          <div className="mt-8 text-center md:hidden">
            <Link href="/featured">
              <Button className="w-full">
                View All Featured Tools
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
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
              Ready to boost your productivity?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of users discovering and using the best AI tools every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/submit">
                <Button size="lg" variant="default">
                  Submit Your Tool
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

      {/* Advanced Search Results */}
      {searchQuery && (
        <section className="py-8 px-4">
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