"use server";

import { unstable_cache } from 'next/cache';

// 缓存统计(仅用于开发调试)
const CACHE_STATS = {
  hits: 0,
  misses: 0,
  total: 0,
};

interface CacheOptions {
  ttl: number; // 缓存时间（秒）
  tags?: string[]; // 可选的缓存标签，用于按需失效
}

/**
 * 使用 Next.js 内置的 unstable_cache 进行数据缓存
 * 相比 Map 缓存，这个方法可以在 Serverless 环境中正常工作
 * 并且支持跨请求、跨实例的缓存共享
 */
export async function cachedPrismaQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  options: CacheOptions = { ttl: 3600 }
): Promise<T> {
  CACHE_STATS.total++;

  console.log("--------------------------------");
  console.log(`[Cache] 请求查询: ${queryName}`);
  console.log(
    `[Cache] 当前缓存统计 - 总请求数: ${CACHE_STATS.total}, 命中数: ${CACHE_STATS.hits}, 未命中数: ${CACHE_STATS.misses}`
  );
  console.log(`[Cache] TTL设置: ${options.ttl}秒`);

  // 使用 Next.js 的 unstable_cache 进行缓存
  // 这会在构建时和运行时都提供缓存能力
  const cachedFn = unstable_cache(
    queryFn,
    [queryName], // 缓存键
    {
      revalidate: options.ttl, // 重新验证时间（秒）
      tags: options.tags || [queryName], // 缓存标签，可用于按需失效
    }
  );

  try {
    const data = await cachedFn();
    CACHE_STATS.hits++;
    console.log(`[Cache] 数据获取成功 ✅`);
    return data;
  } catch (error) {
    CACHE_STATS.misses++;
    console.error(`[Cache] 查询失败 ❌`, error);
    throw error;
  }
}
