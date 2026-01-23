import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDB } from '@/lib/db'
import { websites, websiteLikes, websiteFavorites } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'


export async function GET(request: NextRequest) {
  try {
    const db = getDB();
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // 获取用户提交的网站
    const websitesList = await db.query.websites.findMany({
      where: eq(websites.submittedBy, userId),
      with: {
        websiteCategories: {
          with: {
            category: true
          }
        }
      },
      orderBy: desc(websites.createdAt),
      limit,
      offset
    })

    // 获取总数
    const [{ count: total }] = await db.select({ count: sql<number>`count(*)` })
      .from(websites)
      .where(eq(websites.submittedBy, userId))

    // 提取网站ID列表
    const websiteIds = websitesList.map(w => w.id)

    // 批量查询点赞数和收藏数（避免N+1查询）
    let likesCountMap: Record<number, number> = {}
    let favoritesCountMap: Record<number, number> = {}

    if (websiteIds.length > 0) {
      // 批量获取所有网站的点赞数
      const likesCountResult = await db
        .select({
          websiteId: websiteLikes.websiteId,
          count: sql<number>`count(*)`
        })
        .from(websiteLikes)
        .where(sql`${websiteLikes.websiteId} IN (${sql.join(websiteIds.map(id => sql`${id}`), sql`, `)})`)
        .groupBy(websiteLikes.websiteId)

      likesCountMap = Object.fromEntries(
        likesCountResult.map(r => [r.websiteId, Number(r.count)])
      )

      // 批量获取所有网站的收藏数
      const favoritesCountResult = await db
        .select({
          websiteId: websiteFavorites.websiteId,
          count: sql<number>`count(*)`
        })
        .from(websiteFavorites)
        .where(sql`${websiteFavorites.websiteId} IN (${sql.join(websiteIds.map(id => sql`${id}`), sql`, `)})`)
        .groupBy(websiteFavorites.websiteId)

      favoritesCountMap = Object.fromEntries(
        favoritesCountResult.map(r => [r.websiteId, Number(r.count)])
      )
    }

    // 组装结果（无需额外数据库查询）
    const websitesWithCounts = websitesList.map(website => ({
      ...website,
      _count: {
        websiteLikes: likesCountMap[website.id] || 0,
        websiteFavorites: favoritesCountMap[website.id] || 0
      }
    }))

    return NextResponse.json({
      websites: websitesWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching user submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
