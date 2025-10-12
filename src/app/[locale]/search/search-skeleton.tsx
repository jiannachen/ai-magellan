import { Skeleton } from '@/ui/common/skeleton';
import { Button } from '@/ui/common/button';
import { ArrowLeft, Compass, Search, SlidersHorizontal, Filter } from 'lucide-react';
import Link from 'next/link';

export default function SearchSkeleton() {
  return (
    <>
      {/* 搜索头部 */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-background border-b sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回首页
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Compass className="h-4 w-4" />
              <span className="text-sm">AI工具搜索</span>
            </div>
          </div>

          {/* 搜索栏骨架 */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* 过滤器切换骨架 */}
          <div className="flex justify-center mt-4">
            <Button variant="outline" size="sm" disabled className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              高级筛选
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* 搜索结果骨架 */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            {/* 搜索结果统计骨架 */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* 搜索结果网格骨架 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="bg-card rounded-lg border p-4 space-y-3">
                  <Skeleton className="h-32 w-full rounded" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* 分页骨架 */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <Skeleton className="h-8 w-20" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-8 w-8" />
                ))}
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}