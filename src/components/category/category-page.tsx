"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/ui/common/button';
import { CompactCard } from '@/components/website/compact-card';
import { AdvancedSearch, SearchFilters } from '@/components/search/advanced-search';
import { useTranslations } from 'next-intl';
import {
  Compass,
  ArrowLeft,
  Brain,
  Code,
  Image,
  PenTool,
  MessageSquare,
  Sparkles,
  Telescope
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface CategoryPageProps {
  category: {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
  };
  websites: any[];
  allCategories: any[];
  parentCategory?: {
    id: number;
    name: string;
    slug: string;
    children: Array<{
      id: number;
      name: string;
      slug: string;
      _count: {
        websites: number;
      };
    }>;
  } | null;
}


// 专业级动画变量
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Maritime-themed category icons mapping - 海域探索图标
const categoryIcons: Record<string, any> = {
  'ai-chat': MessageSquare,
  'ai-art': Image,
  'ai-writing': PenTool,
  'ai-coding': Code,
  'ai-tools': Brain,
  'llm': Sparkles,
  'machine-learning': Brain,
  'data-science': Brain,
  'automation': Sparkles,
  'productivity': Compass,
  'design': Image,
  'marketing': Sparkles,
  'education': Brain,
  'business': Sparkles,
  'research': Telescope,
  'entertainment': Sparkles,
  'finance': Sparkles,
  'healthcare': Compass,
  'development': Code,
  'analytics': Sparkles,
  'default': Brain
};

export default function CategoryPage({ category, websites: initialWebsites }: CategoryPageProps) {
  const { user } = useUser();
  const tCategory = useTranslations('pages.categories');
  const tCommon = useTranslations('common');
  const [websites, setWebsites] = useState(initialWebsites);
  const [filteredWebsites, setFilteredWebsites] = useState(initialWebsites);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    pricingModel: [],
    minQualityScore: 0,
    tags: [],
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  // Load user interactions if logged in
  useEffect(() => {
    if (user) {
      // Future implementation for user interactions
    }
  }, [user]);

  // Filter and sort websites using the advanced search logic
  useEffect(() => {
    let filtered = [...websites];

    // Apply search filter
    if (searchFilters.query) {
      filtered = filtered.filter(website =>
        website.title.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        website.description.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        (website.tagline && website.tagline.toLowerCase().includes(searchFilters.query.toLowerCase()))
      );
    }

    // Apply pricing model filter
    if (searchFilters.pricingModel && searchFilters.pricingModel.length > 0) {
      filtered = filtered.filter(website => {
        if (searchFilters.pricingModel?.includes('free')) {
          if (website.pricingModel === 'free' || website.hasFreeVersion) return true;
        }
        if (searchFilters.pricingModel?.includes('freemium')) {
          if (website.pricingModel === 'freemium') return true;
        }
        if (searchFilters.pricingModel?.includes('paid')) {
          if (website.pricingModel !== 'free' && !website.hasFreeVersion && website.pricingModel !== 'freemium') return true;
        }
        return false;
      });
    }

    // Apply quality score filter
    if (searchFilters.minQualityScore && searchFilters.minQualityScore > 0) {
      filtered = filtered.filter(website => website.qualityScore >= (searchFilters.minQualityScore || 0));
    }

    // Apply feature filters
    if (searchFilters.isTrusted) {
      filtered = filtered.filter(website => website.isTrusted);
    }
    if (searchFilters.isFeatured) {
      filtered = filtered.filter(website => website.isFeatured);
    }
    if (searchFilters.hasFreePlan) {
      filtered = filtered.filter(website => website.hasFreeVersion);
    }
    if (searchFilters.sslEnabled) {
      filtered = filtered.filter(website => website.sslEnabled);
    }

    // Apply sorting
    const sortBy = searchFilters.sortBy || 'relevance';
    const sortOrder = searchFilters.sortOrder || 'desc';

    switch (sortBy) {
      case 'relevance':
      default:
        filtered.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.qualityScore - a.qualityScore;
        });
        break;
      case 'visits':
        filtered.sort((a, b) => sortOrder === 'desc' ? b.visits - a.visits : a.visits - b.visits);
        break;
      case 'createdAt':
        filtered.sort((a, b) => {
          const aDate = new Date(a.createdAt).getTime();
          const bDate = new Date(b.createdAt).getTime();
          return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
        });
        break;
      case 'qualityScore':
        filtered.sort((a, b) => sortOrder === 'desc' ? b.qualityScore - a.qualityScore : a.qualityScore - b.qualityScore);
        break;
      case 'likes':
        filtered.sort((a, b) => sortOrder === 'desc' ? (b.likes || 0) - (a.likes || 0) : (a.likes || 0) - (b.likes || 0));
        break;
      case 'title':
        filtered.sort((a, b) => {
          return sortOrder === 'desc' ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title);
        });
        break;
    }

    setFilteredWebsites(filtered);
  }, [websites, searchFilters]);

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
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-background"
    >
      {/* 简洁的头部 */}
      <section className="relative py-8 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border">
        {/* 专业级背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl professional-decoration opacity-6"></div>
          <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-accent/5 rounded-full blur-2xl professional-decoration opacity-6"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* 面包屑导航 */}
          <motion.div 
            variants={itemVariants}
            className="mb-6"
          >
            <Link 
              href="/categories" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4" />
              {tCategory('navigation.back_to_home')}
            </Link>
          </motion.div>

          {/* 分类标题区域 */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 mb-6"
          >
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 professional-float">
              {(() => {
                const IconComponent = categoryIcons[category.slug] || categoryIcons.default;
                return <IconComponent className="h-8 w-8 text-primary" />;
              })()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                {tCategory('title', { category: category.name })}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                {tCategory('description', { category: category.name })}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 高级搜索和筛选控制栏 */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <AdvancedSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onFiltersChange={setSearchFilters}
            className="max-w-full"
          />
          
          {/* 结果统计 */}
          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Telescope className="h-4 w-4 text-primary" />
              <span>
                {tCategory('results_count', { 
                  found: filteredWebsites.length, 
                  total: websites.length, 
                  category: category.name 
                })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 工具展示区域 */}
        {filteredWebsites.length > 0 ? (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredWebsites.map((website) => (
              <motion.div
                key={website.id}
                variants={itemVariants}
                className="professional-glow"
              >
                <CompactCard website={website} onVisit={handleVisit} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            variants={itemVariants}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="mb-8 flex justify-center">
                <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                  <Telescope className="h-16 w-16 text-muted-foreground mx-auto" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">{tCategory('empty_state.title')}</h3>
              <p className="text-muted-foreground mb-6">
                {tCategory('empty_state.description', { category: category.name })}
              </p>
              <Button 
                variant="default"
                onClick={() => {
                  setSearchQuery('');
                  setSearchFilters({
                    query: '',
                    pricingModel: [],
                    minQualityScore: 0,
                    tags: [],
                    sortBy: 'relevance',
                    sortOrder: 'desc'
                  });
                }}
              >
                <Compass className="h-4 w-4 mr-2" />
                {tCommon('reset_filters')}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}