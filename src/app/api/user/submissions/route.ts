import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db/db'
import { websites, websiteLikes, websiteFavorites } from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'

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

    // Add counts for each website
    const websitesWithCounts = await Promise.all(
      websitesList.map(async (website) => {
        const [likesCount] = await db.select({ count: sql<number>`count(*)` })
          .from(websiteLikes)
          .where(eq(websiteLikes.websiteId, website.id))

        const [favoritesCount] = await db.select({ count: sql<number>`count(*)` })
          .from(websiteFavorites)
          .where(eq(websiteFavorites.websiteId, website.id))

        return {
          ...website,
          _count: {
            websiteLikes: likesCount.count,
            websiteFavorites: favoritesCount.count
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
    console.error('Error fetching user submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
