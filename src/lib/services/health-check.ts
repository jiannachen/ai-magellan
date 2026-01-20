import { getDB } from '@/lib/db';
import { websites } from '@/lib/db/schema';
import { eq, sql, asc, desc } from 'drizzle-orm';

interface WebsiteHealthCheck {
  url: string;
  status: 'online' | 'offline' | 'slow' | 'error';
  responseTime: number;
  statusCode?: number;
  sslEnabled: boolean;
  error?: string;
}

/**
 * 检查单个网站的健康状态
 */
export async function checkWebsiteHealth(url: string): Promise<WebsiteHealthCheck> {
  const startTime = Date.now();

  try {
    // 使用 HEAD 请求检查网站状态，减少带宽消耗
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'AI-Navigation-Bot/1.0 (+https://yoursite.com/bot)',
        'Accept': '*/*',
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    const sslEnabled = url.startsWith('https://');

    if (response.ok) {
      return {
        url,
        status: responseTime > 5000 ? 'slow' : 'online',
        responseTime,
        statusCode: response.status,
        sslEnabled,
      };
    } else {
      return {
        url,
        status: 'offline',
        responseTime,
        statusCode: response.status,
        sslEnabled,
        error: `HTTP ${response.status} ${response.statusText}`,
      };
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      url,
      status: 'error',
      responseTime,
      sslEnabled: url.startsWith('https://'),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 批量检查网站健康状态
 */
export async function batchCheckWebsiteHealth(urls: string[], concurrency = 5): Promise<WebsiteHealthCheck[]> {
  const results: WebsiteHealthCheck[] = [];

  // 分批处理，避免同时发起太多请求
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchPromises = batch.map(url => checkWebsiteHealth(url));
    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          url: batch[index],
          status: 'error',
          responseTime: 0,
          sslEnabled: batch[index].startsWith('https://'),
          error: 'Health check failed',
        });
      }
    });

    // 批次间延迟，避免过于频繁的请求
    if (i + concurrency < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * 更新数据库中的网站状态
 */
export async function updateWebsiteStatus(healthChecks: WebsiteHealthCheck[]) {
  const db = getDB();
  const updatePromises = healthChecks.map(async (check) => {
    try {
      const isOnline = check.status === 'online' || check.status === 'slow';
      const qualityIncrement = check.status === 'online' ? 1 : check.status === 'slow' ? 0 : -2;

      await db
        .update(websites)
        .set({
          active: isOnline ? 1 : 0,
          responseTime: check.responseTime,
          sslEnabled: check.sslEnabled,
          lastChecked: new Date(),
          qualityScore: sql`${websites.qualityScore} + ${qualityIncrement}`,
        })
        .where(eq(websites.url, check.url));
    } catch (error) {
      console.error(`Failed to update website status for ${check.url}:`, error);
    }
  });

  await Promise.allSettled(updatePromises);
}

/**
 * 执行完整的健康检查流程
 */
export async function runHealthCheckProcess(limit = 50) {
  try {
    const db = getDB();
    console.log('开始执行网站健康检查...');

    // 获取需要检查的网站（优先检查很久没检查的）
    const websitesList = await db.query.websites.findMany({
      where: eq(websites.status, 'approved'),
      columns: { url: true },
      orderBy: (websites, { asc, desc }) => [asc(websites.lastChecked), desc(websites.updatedAt)],
      limit: limit,
    });

    if (websitesList.length === 0) {
      console.log('没有需要检查的网站');
      return;
    }

    console.log(`检查 ${websitesList.length} 个网站...`);

    const urls = websitesList.map(w => w.url);
    const healthChecks = await batchCheckWebsiteHealth(urls);

    // 统计结果
    const stats = healthChecks.reduce((acc, check) => {
      acc[check.status] = (acc[check.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('健康检查结果:', stats);

    // 更新数据库
    await updateWebsiteStatus(healthChecks);

    // 记录死链
    const deadLinks = healthChecks.filter(check =>
      check.status === 'offline' || check.status === 'error'
    );

    if (deadLinks.length > 0) {
      console.log(`发现 ${deadLinks.length} 个问题网站:`,
        deadLinks.map(link => `${link.url} (${link.error})`));
    }

    console.log('健康检查完成');

  } catch (error) {
    console.error('健康检查过程出错:', error);
  }
}
