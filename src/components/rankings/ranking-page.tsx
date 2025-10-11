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
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Heart,
  Eye,
  ExternalLink,
  Award,
  Bookmark,
  ArrowLeft,
  Trophy,
  TrendingUp,
  Crown,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

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
  popular: TrendingUp,
  'top-rated': Crown,
  trending: Zap,
  free: CheckCircle,
  new: Clock
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
      {/* Header */}
      <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <Link href="/rankings" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Rankings
            </Link>
          </div>

          {/* Title */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-purple-500">
                <IconComponent className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {rankingType.title}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {rankingType.description}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Filters and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-background/80 backdrop-blur rounded-xl border p-6"
          >
            <div className="flex flex-col gap-6">
              {/* Search and Basic Filters */}
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tools..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Basic Filters */}
                <div className="flex items-center gap-4">
                  <Select value={priceFilter} onValueChange={(value: FilterOption) => setPriceFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pricing</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="freemium">Freemium</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="border-t pt-4">
                <RankingFilters
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                  categoryFilter={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  categories={categories}
                  currentType={type}
                />
              </div>

              {/* Results count and loading */}
              <div className="text-center">
                {loading ? (
                  <p className="text-muted-foreground">Loading rankings...</p>
                ) : (
                  <p className="text-muted-foreground">
                    Showing {filteredWebsites.length} of {websites.length} tools
                    {timeRange !== 'all' && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {timeRange}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredWebsites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWebsites.map((website, index) => (
              <CompactCard key={website.id} website={website} onVisit={handleVisit} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tools found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to find more tools.
              </p>
              <Button 
                variant="default"
                onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setPriceFilter('all');
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}