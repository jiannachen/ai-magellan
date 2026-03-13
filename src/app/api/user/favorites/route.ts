import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AjaxResponse } from '@/lib/utils'
import { db } from '@/lib/db/db'
import { websiteFavorites, websites, websiteLikes } from '@/lib/db/schema'
import { eq, and, desc, sql, inArray } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(AjaxResponse.fail('Unauthorized'), { status: 401 })
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

    // 批量查询所有相关网站的 likes 和 favorites 计数，消除 N+1
    const websiteIds = favorites.map(fav => fav.website.id)

    let likesMap = new Map<number, number>()
    let favsMap = new Map<number, number>()

    if (websiteIds.length > 0) {
      const [likesCounts, favsCounts] = await Promise.all([
        db.select({ websiteId: websiteLikes.websiteId, count: sql<number>`count(*)` })
          .from(websiteLikes)
          .where(inArray(websiteLikes.websiteId, websiteIds))
          .groupBy(websiteLikes.websiteId),
        db.select({ websiteId: websiteFavorites.websiteId, count: sql<number>`count(*)` })
          .from(websiteFavorites)
          .where(inArray(websiteFavorites.websiteId, websiteIds))
          .groupBy(websiteFavorites.websiteId),
      ])

      likesMap = new Map(likesCounts.map(r => [r.websiteId, Number(r.count)]))
      favsMap = new Map(favsCounts.map(r => [r.websiteId, Number(r.count)]))
    }

    const websitesWithCounts = favorites.map(fav => ({
      ...fav.website,
      _count: {
        websiteLikes: likesMap.get(fav.website.id) || 0,
        websiteFavorites: favsMap.get(fav.website.id) || 0,
      }
    }))

    return NextResponse.json(AjaxResponse.ok({
      websites: websitesWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }))

  } catch (error) {
    return NextResponse.json(
      AjaxResponse.fail('Internal server error'),
      { status: 500 }
    )
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(AjaxResponse.fail('Unauthorized'), { status: 401 })
    }

    const { websiteId } = await request.json()

    if (!websiteId) {
      return NextResponse.json(AjaxResponse.fail('Website ID is required'), { status: 400 })
    }

    // 检查网站是否存在
    const website = await db.query.websites.findFirst({
      where: eq(websites.id, parseInt(websiteId))
    })

    if (!website) {
      return NextResponse.json(AjaxResponse.fail('Website not found'), { status: 404 })
    }

    // 检查是否已经收藏
    const existingFavorite = await db.query.websiteFavorites.findFirst({
      where: and(
        eq(websiteFavorites.userId, userId),
        eq(websiteFavorites.websiteId, parseInt(websiteId))
      )
    })

    if (existingFavorite) {
      return NextResponse.json(AjaxResponse.fail('Already favorited'), { status: 400 })
    }

    // 添加收藏
    const [favorite] = await db.insert(websiteFavorites).values({
      id: `${userId}_${websiteId}`,
      userId,
      websiteId: parseInt(websiteId)
    }).returning()

    return NextResponse.json(AjaxResponse.ok(favorite))

  } catch (error) {
    return NextResponse.json(AjaxResponse.fail('Internal server error'), { status: 500 })
  }
}

// 移除收藏
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(AjaxResponse.fail('Unauthorized'), { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json(AjaxResponse.fail('Website ID is required'), { status: 400 })
    }

    // 删除收藏
    await db.delete(websiteFavorites).where(
      and(
        eq(websiteFavorites.userId, userId),
        eq(websiteFavorites.websiteId, parseInt(websiteId))
      )
    )

    return NextResponse.json(AjaxResponse.ok(null))

  } catch (error) {
    return NextResponse.json(AjaxResponse.fail('Internal server error'), { status: 500 })
  }
}
