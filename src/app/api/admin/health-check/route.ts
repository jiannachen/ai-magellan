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
    const { prisma } = await import('@/lib/db/db');
    
    // 获取网站状态统计
    const stats = await prisma.website.groupBy({
      by: ['active'],
      where: { status: 'approved' },
      _count: true,
    });
    
    // 获取最近检查的网站
    const recentChecks = await prisma.website.findMany({
      where: { 
        status: 'approved',
        last_checked: { not: null }
      },
      select: {
        url: true,
        active: true,
        response_time: true,
        last_checked: true,
        ssl_enabled: true,
      },
      orderBy: { last_checked: 'desc' },
      take: 10,
    });
    
    // 计算平均响应时间
    const avgResponseTime = await prisma.website.aggregate({
      where: { 
        status: 'approved',
        response_time: { not: null }
      },
      _avg: { response_time: true },
    });
    
    return NextResponse.json({
      stats: {
        online: stats.find(s => s.active === 1)?._count || 0,
        offline: stats.find(s => s.active === 0)?._count || 0,
        averageResponseTime: avgResponseTime._avg.response_time || 0,
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