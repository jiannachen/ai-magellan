import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AjaxResponse } from '@/lib/utils'
import { db } from '@/lib/db/db'
import { websiteLikes } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET /api/user/likes/check
export async function GET(request: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(AjaxResponse.ok({ isLiked: false }))
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json(AjaxResponse.fail('websiteId is required'), { status: 400 })
    }

    const like = await db.query.websiteLikes.findFirst({
      where: and(
        eq(websiteLikes.userId, userId),
        eq(websiteLikes.websiteId, parseInt(websiteId))
      )
    })

    return NextResponse.json(AjaxResponse.ok({ isLiked: !!like }))
  } catch (error) {
    console.error('Error checking like status:', error)
    return NextResponse.json(AjaxResponse.fail('Internal server error'), { status: 500 })
  }
}
