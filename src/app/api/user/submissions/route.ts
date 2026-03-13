import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AjaxResponse } from '@/lib/utils'
import { db } from '@/lib/db/db'
import { websites, websiteLikes, websiteFavorites } from '@/lib/db/schema'
import { eq, desc, sql, inArray } from 'drizzle-orm'

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

    // 批量查询所有相关网站的 likes 和 favorites 计数，消除 N+1
    const websiteIds = websitesList.map(w => w.id)

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

    const websitesWithCounts = websitesList.map(website => {
      const primaryCat = website.websiteCategories.find(wc => wc.isPrimary) || website.websiteCategories[0]
      return {
        ...website,
        category: primaryCat?.category || null,
        _count: {
          websiteLikes: likesMap.get(website.id) || 0,
          websiteFavorites: favsMap.get(website.id) || 0,
        }
      }
    })

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
    console.error('Error fetching user submissions:', error)
    return NextResponse.json(AjaxResponse.fail('Internal server error'), { status: 500 })
  }
}
