import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDB } from '@/lib/db'
import { websiteFavorites, websites, websiteLikes } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { ensureUserExists } from '@/lib/utils'


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

    // 获取用户收藏的网站
    const favorites = await db.query.websiteFavorites.findMany({
      where: eq(websiteFavorites.userId, userId),
      with: {
        website: {
          with: {
            websiteCategories: {
              with: {
                category: true
              }
            }
          }
        }
      },
      orderBy: desc(websiteFavorites.createdAt),
      limit,
      offset
    })

    // 获取总数
    const [{ count: total }] = await db.select({ count: sql<number>`count(*)` })
      .from(websiteFavorites)
      .where(eq(websiteFavorites.userId, userId))

    // 提取网站ID列表
    const websiteIds = favorites.map(fav => fav.website.id)

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
    const websitesWithCounts = favorites.map(fav => ({
      ...fav.website,
      _count: {
        websiteLikes: likesCountMap[fav.website.id] || 0,
        websiteFavorites: favoritesCountMap[fav.website.id] || 0
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    const db = getDB();
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Ensure user exists in database
    const userExists = await ensureUserExists(userId)
    if (!userExists) {
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: 401 }
      )
    }

    const { websiteId } = await request.json() as { websiteId: number }

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      )
    }

    // 检查网站是否存在
    const website = await db.query.websites.findFirst({
      where: eq(websites.id, websiteId)
    })

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      )
    }

    // 检查是否已经收藏
    const existingFavorite = await db.query.websiteFavorites.findFirst({
      where: and(
        eq(websiteFavorites.userId, userId),
        eq(websiteFavorites.websiteId, websiteId)
      )
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Already favorited' },
        { status: 400 }
      )
    }

    // 添加收藏
    const [favorite] = await db.insert(websiteFavorites).values({
      id: `${userId}_${websiteId}`,
      userId,
      websiteId: websiteId
    }).returning()

    return NextResponse.json({ success: true, favorite })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 移除收藏
export async function DELETE(request: NextRequest) {
  try {
    const db = getDB();
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 确保用户在数据库中存在（兜底机制）
    const userExists = await ensureUserExists(userId)
    if (!userExists) {
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const websiteIdStr = searchParams.get('websiteId')

    if (!websiteIdStr) {
      return NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      )
    }

    const websiteId = parseInt(websiteIdStr)

    // 删除收藏
    await db.delete(websiteFavorites).where(
      and(
        eq(websiteFavorites.userId, userId),
        eq(websiteFavorites.websiteId, websiteId)
      )
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
