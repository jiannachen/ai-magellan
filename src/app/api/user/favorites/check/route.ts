import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AjaxResponse } from '@/lib/utils'
import { db } from '@/lib/db/db'
import { websiteFavorites } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(AjaxResponse.ok({ isFavorited: false }))
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json(AjaxResponse.fail('Website ID is required'), { status: 400 })
    }

    const favorite = await db.query.websiteFavorites.findFirst({
      where: and(
        eq(websiteFavorites.userId, userId),
        eq(websiteFavorites.websiteId, parseInt(websiteId))
      )
    })

    return NextResponse.json(AjaxResponse.ok({ isFavorited: !!favorite }))

  } catch (error) {
    console.error('Error checking favorite status:', error)
    return NextResponse.json(AjaxResponse.ok({ isFavorited: false }))
  }
}
