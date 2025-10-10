"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/ui/common/card';
import { Button } from '@/ui/common/button';
import { Badge } from '@/ui/common/badge';
import { Input } from '@/ui/common/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/common/select';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Heart,
  Eye,
  ExternalLink,
  TrendingUp,
  Clock,
  Award,
  CheckCircle,
  Bookmark,
  ArrowLeft,
  SlidersHorizontal,
  Brain,
  Code,
  Image,
  PenTool,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface CategoryPageProps {
  category: {
    id: number;
    name: string;
    slug: string;
  };
  websites: any[];
  allCategories: any[];
}

type SortOption = 'featured' | 'popular' | 'newest' | 'rating' | 'name';
type ViewMode = 'grid' | 'list';
type FilterOption = 'all' | 'free' | 'paid' | 'freemium';

// Category icons mapping
const categoryIcons = {
  'ai-chat': MessageSquare,
  'ai-art': Image,
  'ai-writing': PenTool,
  'ai-coding': Code,
  'ai-tools': Brain,
  'llm': Sparkles,
};

export default function CategoryPage({ category, websites: initialWebsites, allCategories }: CategoryPageProps) {
  const { user } = useUser();
  const [websites, setWebsites] = useState(initialWebsites);
  const [filteredWebsites, setFilteredWebsites] = useState(initialWebsites);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [priceFilter, setPriceFilter] = useState<FilterOption>('all');
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
  const [userFavorites, setUserFavorites] = useState<Set<number>>(new Set());

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

  // Filter and sort websites
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

    // Apply sorting
    switch (sortBy) {
      case 'featured':
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return b.quality_score - a.quality_score;
        });
        break;
      case 'popular':
        filtered.sort((a, b) => b.visits - a.visits);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => b.quality_score - a.quality_score);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredWebsites(filtered);
  }, [websites, searchQuery, sortBy, priceFilter]);

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

  const WebsiteCard = ({ website, index }: { website: any; index: number }) => {
    const isLiked = userLikes.has(website.id);
    const isFavorited = userFavorites.has(website.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      >
        <Card className={`h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group ${
          viewMode === 'list' ? 'flex' : ''
        }`}>
          <CardContent className={`p-6 ${viewMode === 'list' ? 'flex items-center w-full' : ''}`}>
            {/* Header */}
            <div className={`flex items-start justify-between ${
              viewMode === 'list' ? 'flex-1' : 'mb-4'
            }`}>
              <div className={`flex items-center gap-3 flex-1 min-w-0 ${
                viewMode === 'list' ? 'mr-6' : ''
              }`}>
                {website.thumbnail ? (
                  <img 
                    src={website.thumbnail} 
                    alt={website.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{website.title}</h3>
                  {website.tagline && (
                    <p className="text-sm text-muted-foreground truncate">{website.tagline}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {website.is_featured && (
                      <Badge variant="default" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {website.pricing_model !== 'free' && (
                      <Badge variant="outline" className="text-xs">
                        {website.pricing_model}
                      </Badge>
                    )}
                    {website.quality_score > 80 && (
                      <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                        {website.quality_score}/100
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className={`flex gap-2 ${viewMode === 'list' ? 'items-center' : 'flex-col'}`}>
                {user && (
                  <div className="flex gap-1">
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
                <Button 
                  size="sm" 
                  onClick={() => handleVisit(website)}
                  className="group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  Visit
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>

            {/* Description */}
            {viewMode === 'grid' && (
              <>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {website.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {website.visits}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {website.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {website.quality_score}
                  </span>
                </div>
              </>
            )}

            {/* List mode stats */}
            {viewMode === 'list' && (
              <div className="flex items-center gap-6 text-sm text-muted-foreground ml-6">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {website.visits}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {website.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {website.quality_score}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          {/* Title */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {category.name} AI Tools
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Discover the best {category.name} AI tools. Curated and ranked to help you find exactly what you need.
              </p>
            </motion.div>
          </div>

          {/* Filters and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-background/80 backdrop-blur rounded-xl border p-6"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${category.name} tools...`}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <Select value={priceFilter} onValueChange={(value: FilterOption) => setPriceFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tools</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-center">
              <p className="text-muted-foreground">
                Showing {filteredWebsites.length} of {websites.length} {category.name} tools
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Categories */}
          <aside className="w-64 flex-shrink-0 sticky top-4 h-fit">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 text-lg">Categories</h3>
                <div className="space-y-2">
                  {allCategories.map((cat) => {
                    const IconComponent = categoryIcons[cat.slug as keyof typeof categoryIcons] || Brain;
                    const isActive = cat.id === category.id;
                    
                    return (
                      <Link key={cat.id} href={`/categories/${cat.slug}`}>
                        <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-muted/50 ${
                          isActive ? 'bg-primary text-primary-foreground' : ''
                        }`}>
                          <IconComponent className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm truncate ${isActive ? 'text-primary-foreground' : ''}`}>
                              {cat.name}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                
                {/* Browse All Categories Link */}
                <div className="mt-6 pt-4 border-t">
                  <Link href="/categories">
                    <Button variant="outline" size="sm" className="w-full">
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      Browse All
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {filteredWebsites.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {filteredWebsites.map((website, index) => (
                  <WebsiteCard key={website.id} website={website} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No tools found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search or filters to find more {category.name} tools.
                  </p>
                  <Button onClick={() => {
                    setSearchQuery('');
                    setPriceFilter('all');
                    setSortBy('featured');
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}