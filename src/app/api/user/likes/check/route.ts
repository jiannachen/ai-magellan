import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AjaxResponse } from '@/lib/utils'
import { db } from '@/lib/db/db'
import { websiteLikes } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'

// GET /api/user/likes/check
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json(AjaxResponse.fail('websiteId is required'), { status: 400 })
    }

    const session = await auth()
    const userId = session?.user?.id

    // 确定用于查询的标识
    let likeIdentifier: string;
    if (userId) {
      likeIdentifier = userId;
    } else {
      const headersList = await headers();
      const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
        || headersList.get('x-real-ip')
        || 'anonymous';
      likeIdentifier = `anon_${ip}`;
    }

    const like = await db.query.websiteLikes.findFirst({
      where: and(
        eq(websiteLikes.userId, likeIdentifier),
        eq(websiteLikes.websiteId, parseInt(websiteId))
      )
    })

    return NextResponse.json(AjaxResponse.ok({ isLiked: !!like }))
  } catch (error) {
    console.error('Error checking like status:', error)
    return NextResponse.json(AjaxResponse.fail('Internal server error'), { status: 500 })
  }
}
