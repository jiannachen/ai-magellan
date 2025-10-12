import { Suspense } from 'react';
import SearchResults from './search-results';
import SearchSkeleton from './search-skeleton';
import { searchWebsites } from '@/lib/search/search-service';

interface SearchPageProps {
  searchParams: Promise<{ 
    q?: string;
    category?: string; 
    pricingModel?: string | string[];
    minQualityScore?: string;
    isTrusted?: string;
    isFeatured?: string;
    hasFreePlan?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  }>;
}

// Server Component - 处理SEO和初始数据
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  
  let initialData = null;

  // 仅在有搜索查询时才获取初始数据
  if (query) {
    try {
      // 构建搜索参数
      const searchOptions = {
        q: query,
        category: params.category,
        pricingModel: params.pricingModel 
          ? (Array.isArray(params.pricingModel) ? params.pricingModel : [params.pricingModel])
          : undefined,
        minQualityScore: params.minQualityScore ? parseInt(params.minQualityScore) : undefined,
        isTrusted: params.isTrusted === 'true',
        isFeatured: params.isFeatured === 'true',
        hasFreePlan: params.hasFreePlan === 'true',
        sortBy: params.sortBy || 'quality_score',
        sortOrder: (params.sortOrder as 'asc' | 'desc') || 'desc',
        page: parseInt(params.page || '1'),
        limit: 20
      };

      // 直接调用搜索服务，不通过API
      const result = await searchWebsites(searchOptions);
      
      if (result.success) {
        initialData = result.data;
      }
    } catch (error) {
      console.error('Failed to fetch initial search data:', error);
      // 不要阻止页面渲染，让客户端组件处理错误
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults 
          initialData={initialData} 
          initialSearchParams={params}
        />
      </Suspense>
    </div>
  );
}

// 生成页面元数据（SEO优化）
export async function generateMetadata({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  
  if (!query) {
    return {
      title: 'AI工具搜索 - AI Magellan',
      description: '搜索和发现最优质的AI工具，找到最适合您需求的人工智能解决方案。',
    };
  }

  return {
    title: `"${query}" 的搜索结果 - AI Magellan`,
    description: `搜索 "${query}" 相关的AI工具，发现最适合您的人工智能解决方案。`,
    openGraph: {
      title: `"${query}" 的搜索结果 - AI Magellan`,
      description: `搜索 "${query}" 相关的AI工具，发现最适合您的人工智能解决方案。`,
    },
  };
}