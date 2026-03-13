import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AjaxResponse } from '@/lib/utils'
import { db } from '@/lib/db/db'
import { websiteReviews } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

// GET /api/websites/[id]/reviews
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const websiteId = parseInt((await params).id)

    const reviews = await db.query.websiteReviews.findMany({
      where: eq(websiteReviews.websiteId, websiteId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: desc(websiteReviews.createdAt),
      limit: 10
    })

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0

    return NextResponse.json(AjaxResponse.ok({
      reviews,
      stats: {
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length
      }
    }))
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(AjaxResponse.fail('Internal server error'), { status: 500 })
  }
}

// POST /api/websites/[id]/reviews
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(AjaxResponse.fail('Please login first'), { status: 401 })
    }

    const websiteId = parseInt((await params).id)
    const body = await request.json()
    const { rating, comment } = body

    if (rating < 1 || rating > 5) {
      return NextResponse.json(AjaxResponse.fail('Rating must be between 1 and 5'), { status: 400 })
    }

    // 检查是否已经评论过
    const existingReview = await db.query.websiteReviews.findFirst({
      where: and(
        eq(websiteReviews.userId, userId),
        eq(websiteReviews.websiteId, websiteId)
      )
    })

    if (existingReview) {
      // 更新现有评论
      await db.update(websiteReviews)
        .set({
          rating,
          comment: comment?.trim() || null,
          updatedAt: new Date()
        })
        .where(and(
          eq(websiteReviews.userId, userId),
          eq(websiteReviews.websiteId, websiteId)
        ))
    } else {
      // 创建新评论
      const now = new Date()
      await db.insert(websiteReviews).values({
        id: `${userId}_${websiteId}`,
        userId,
        websiteId,
        rating,
        comment: comment?.trim() || null,
        createdAt: now,
        updatedAt: now,
      })
    }

    // 统一查询返回结果
    const review = await db.query.websiteReviews.findFirst({
      where: and(
        eq(websiteReviews.userId, userId),
        eq(websiteReviews.websiteId, websiteId)
      ),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(AjaxResponse.ok(review))
  } catch (error) {
    console.error('Error creating/updating review:', error)
    return NextResponse.json(AjaxResponse.fail('Internal server error'), { status: 500 })
  }
}

// DELETE /api/websites/[id]/reviews
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(AjaxResponse.fail('Please login first'), { status: 401 })
    }

    const websiteId = parseInt((await params).id)

    await db.delete(websiteReviews).where(and(
      eq(websiteReviews.userId, userId),
      eq(websiteReviews.websiteId, websiteId)
    ))

    return NextResponse.json(AjaxResponse.ok(null))
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(AjaxResponse.fail('Internal server error'), { status: 500 })
  }
}
