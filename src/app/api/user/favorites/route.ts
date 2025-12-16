import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db/db'
import { websiteFavorites, websites, websiteLikes } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { ensureUserExists } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
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

    // 提取网站数据并添加计数
    const websitesWithCounts = await Promise.all(
      favorites.map(async (fav) => {
        const [likesCount] = await db.select({ count: sql<number>`count(*)` })
          .from(websiteLikes)
          .where(eq(websiteLikes.websiteId, fav.website.id))

        const [favoritesCount] = await db.select({ count: sql<number>`count(*)` })
          .from(websiteFavorites)
          .where(eq(websiteFavorites.websiteId, fav.website.id))

        return {
          ...fav.website,
          _count: {
            websiteLikes: Number(likesCount.count),
            websiteFavorites: Number(favoritesCount.count)
          }
        }
      })
    )

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

    const { websiteId } = await request.json()

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      )
    }

    // 检查网站是否存在
    const website = await db.query.websites.findFirst({
      where: eq(websites.id, parseInt(websiteId))
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
        eq(websiteFavorites.websiteId, parseInt(websiteId))
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
      websiteId: parseInt(websiteId)
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
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      )
    }

    // 删除收藏
    await db.delete(websiteFavorites).where(
      and(
        eq(websiteFavorites.userId, userId),
        eq(websiteFavorites.websiteId, parseInt(websiteId))
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
