import { NextRequest, NextResponse } from 'next/server';
import { runHealthCheckProcess } from '@/lib/services/health-check';

// 只允许管理员或定时任务调用
export async function POST(request: NextRequest) {
  try {
    // 验证请求来源（可以使用API密钥或其他验证方式）
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.HEALTH_CHECK_TOKEN;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { limit } = await request.json().catch(() => ({ limit: 50 }));
    
    // 执行健康检查
    await runHealthCheckProcess(limit);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Health check completed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Health check API error:', error);
    return NextResponse.json(
      { error: 'Health check failed' }, 
      { status: 500 }
    );
  }
}

// 获取健康检查统计信息
export async function GET(_request: NextRequest) {
  try {
    const { db } = await import('@/lib/db/db');
    const { websites } = await import('@/lib/db/schema');
    const { eq, isNull, sql, desc } = await import('drizzle-orm');

    // 获取网站状态统计
    const stats = await db
      .select({
        active: websites.active,
        count: sql<number>`count(*)`,
      })
      .from(websites)
      .where(eq(websites.status, 'approved'))
      .groupBy(websites.active);

    // 获取最近检查的网站
    const recentChecks = await db
      .select({
        url: websites.url,
        active: websites.active,
        responseTime: websites.responseTime,
        lastChecked: websites.lastChecked,
        sslEnabled: websites.sslEnabled,
      })
      .from(websites)
      .where(eq(websites.status, 'approved'))
      .orderBy(desc(websites.lastChecked))
      .limit(10);

    // 计算平均响应时间
    const [avgResult] = await db
      .select({
        avg: sql<number>`avg(${websites.responseTime})`,
      })
      .from(websites)
      .where(eq(websites.status, 'approved'));

    return NextResponse.json({
      stats: {
        online: stats.find(s => s.active === 1)?.count || 0,
        offline: stats.find(s => s.active === 0)?.count || 0,
        averageResponseTime: avgResult?.avg || 0,
      },
      recentChecks,
      lastUpdate: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Health check stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get health check stats' }, 
      { status: 500 }
    );
  }
}