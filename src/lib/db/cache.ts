"use server";

import { unstable_cache } from 'next/cache';

interface CacheOptions {
  ttl: number;
  tags?: string[];
}

/**
 * 使用 Next.js 内置的 unstable_cache 进行数据缓存
 * 支持跨请求、跨实例的缓存共享（Serverless 友好）
 */
export async function cachedQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  options: CacheOptions = { ttl: 3600 }
): Promise<T> {
  const cachedFn = unstable_cache(
    queryFn,
    [queryName],
    {
      revalidate: options.ttl,
      tags: options.tags || [queryName],
    }
  );

  return cachedFn();
}
