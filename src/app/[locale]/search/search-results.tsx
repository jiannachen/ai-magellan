'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CompactCard } from '@/components/website/compact-card';
import { AdvancedSearch, SearchFilters } from '@/components/search/advanced-search';
import { Button } from '@/ui/common/button';
import { Input } from '@/ui/common/input';
import { Badge } from '@/ui/common/badge';
import { cn } from '@/lib/utils/utils';
import { 
  Search, 
  ArrowLeft, 
  Filter,
  SlidersHorizontal,
  Compass,
  Map,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import type { Website } from '@/lib/types';
import type { SearchResult } from '@/lib/search/search-service';
import Link from 'next/link';

interface SearchResultsProps {
  initialData: SearchResult | null;
  initialSearchParams: any;
}

export default function SearchResults({ initialData, initialSearchParams }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<SearchResult | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchParams.q || '');
  
  // 翻译hooks
  const t = useTranslations('search');
  const tCommon = useTranslations('common');

  // 搜索函数
  const performSearch = async (params: URLSearchParams) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        console.error('Search failed:', result.error);
        setData(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // 处理筛选器变化
  const handleFiltersChange = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    
    // 设置查询参数
    if (filters.query) {
      params.set('q', filters.query);
    }
    
    // 设置筛选参数
    if (filters.category) params.set('category', filters.category);
    if (filters.pricingModel?.length) {
      filters.pricingModel.forEach(model => params.append('pricingModel', model));
    }
    if (filters.minQualityScore) params.set('minQualityScore', filters.minQualityScore.toString());
    if (filters.isTrusted) params.set('isTrusted', 'true');
    if (filters.isFeatured) params.set('isFeatured', 'true');
    if (filters.hasFreePlan) params.set('hasFreePlan', 'true');
    if (filters.sortBy && filters.sortBy !== 'relevance') params.set('sortBy', filters.sortBy === 'relevance' ? 'quality_score' : filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    
    // 重置到第一页
    params.set('page', '1');
    
    router.push(`/search?${params.toString()}`);
  };

  // 处理分页
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/search?${params.toString()}`);
  };

  // 监听URL变化并更新搜索
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(searchParams);
    } else {
      // 清空搜索结果如果没有查询参数
      setData(null);
      setSearchQuery('');
    }
  }, [searchParams]);

  // 处理工具访问
  const handleVisit = async (website: Website) => {
    try {
      await fetch(`/api/websites/${website.id}/visit`, { method: "POST" });
      // 更新本地数据中的访问次数
      if (data) {
        const updatedWebsites = data.websites.map(w => 
          w.id === website.id ? { ...w, visits: w.visits + 1 } : w
        );
        setData({ ...data, websites: updatedWebsites });
      }
    } catch (error) {
      console.error('Failed to track visit:', error);
    }
    window.open(website.url, "_blank");
  };

  const currentQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  return (
    <>
      {/* 搜索头部 */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-background border-b sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('back_to_home')}
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Compass className="h-4 w-4" />
              <span className="text-sm">{t('page_header')}</span>
            </div>
          </div>

          {/* 高级搜索组件 */}
          <AdvancedSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onFiltersChange={handleFiltersChange}
          />
        </div>
      </section>

      {/* 搜索结果 */}
      <section className="py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="space-y-6">
            {/* 搜索结果统计 */}
            {currentQuery && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-primary" />
                  <h1 className="text-xl font-semibold">
                    {t('results_title', { query: currentQuery })}
                  </h1>
                  {data && (
                    <Badge variant="secondary">
                      {t('results_count', { count: data.pagination.total })}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* 加载状态 */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">{t('searching')}</p>
                </div>
              </div>
            )}

            {/* 搜索结果网格 */}
            {!loading && currentQuery ? (
              data && data.websites.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {data.websites.map((website, index) => (
                      <motion.div
                        key={website.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.05,
                          ease: [0.15, 1, 0.3, 1]
                        }}
                      >
                        <CompactCard website={website} onVisit={handleVisit} />
                      </motion.div>
                    ))}
                  </div>

                  {/* 分页 */}
                  {data.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!data.pagination.hasPrevPage || loading}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t('pagination.previous')}
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                          const pageNum = currentPage - 2 + i;
                          if (pageNum < 1 || pageNum > data.pagination.totalPages) return null;
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              disabled={loading}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!data.pagination.hasNextPage || loading}
                      >
                        {t('pagination.next')}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">{t('no_results_title')}</h3>
                    <p className="text-muted-foreground">
                      {t('no_results_desc')}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        router.push('/search');
                      }}
                      className="mt-4"
                    >
                      {t('clear_search')}
                    </Button>
                  </div>
                </div>
              )
            ) : (
              !loading && (
                <div className="text-center py-16">
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Compass className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">{t('start_exploring_title')}</h3>
                    <p className="text-muted-foreground">
                      {t('start_exploring_desc')}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </>
  );
}