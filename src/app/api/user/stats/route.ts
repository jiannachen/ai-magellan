import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getDB } from '@/lib/db'
import { websiteFavorites, websites, websiteLikes } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'


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

    // 获取收藏数量
    const [{ count: totalFavorites }] = await db.select({ count: sql<number>`count(*)` })
      .from(websiteFavorites)
      .where(eq(websiteFavorites.userId, userId))

    // 获取提交数量
    const [{ count: totalSubmissions }] = await db.select({ count: sql<number>`count(*)` })
      .from(websites)
      .where(eq(websites.submittedBy, userId))

    // 获取点赞数量
    const [{ count: totalLikes }] = await db.select({ count: sql<number>`count(*)` })
      .from(websiteLikes)
      .where(eq(websiteLikes.userId, userId))

    return NextResponse.json({
      data: {
        totalFavorites,
        totalSubmissions,
        totalLikes
      }
    })

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
