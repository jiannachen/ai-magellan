import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AjaxResponse } from '@/lib/utils'
import { db } from '@/lib/db/db'
import { websiteFavorites, websites, websiteLikes } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(AjaxResponse.fail('Unauthorized'), { status: 401 })
    }

    // 并行查询三项统计
    const [favResult, subResult, likeResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(websiteFavorites)
        .where(eq(websiteFavorites.userId, userId)),
      db.select({ count: sql<number>`count(*)` })
        .from(websites)
        .where(eq(websites.submittedBy, userId)),
      db.select({ count: sql<number>`count(*)` })
        .from(websiteLikes)
        .where(eq(websiteLikes.userId, userId)),
    ])

    return NextResponse.json(AjaxResponse.ok({
      totalFavorites: favResult[0].count,
      totalSubmissions: subResult[0].count,
      totalLikes: likeResult[0].count,
    }))

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(AjaxResponse.fail('Internal server error'), { status: 500 })
  }
}
