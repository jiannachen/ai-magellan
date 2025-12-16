import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db/db'
import { websiteReviews } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { ensureUserExists } from '@/lib/utils'

// GET /api/websites/[id]/reviews
// 获取工具的评论列表
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
      limit: 10 // 限制返回数量
    })

    // 计算平均评分
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0

    return NextResponse.json({
      reviews,
      stats: {
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/websites/[id]/reviews
// 添加或更新评论
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }

    // 确保用户在数据库中存在（兜底机制）
    const userExists = await ensureUserExists(userId)
    if (!userExists) {
      return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 401 })
    }

    const websiteId = parseInt((await params).id)
    const body = await request.json()
    const { rating, comment } = body

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // 检查是否已经评论过
    const existingReview = await db.query.websiteReviews.findFirst({
      where: and(
        eq(websiteReviews.userId, userId),
        eq(websiteReviews.websiteId, websiteId)
      )
    })

    let review
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

      review = await db.query.websiteReviews.findFirst({
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
    } else {
      // 创建新评论
      const now = new Date()
      await db.insert(websiteReviews).values({
        id: `${userId}_${websiteId}`,
        userId: userId,
        websiteId: websiteId,
        rating: rating,
        comment: comment?.trim() || null,
        createdAt: now,
        updatedAt: now,
      })

      review = await db.query.websiteReviews.findFirst({
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
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error creating/updating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/websites/[id]/reviews
// 删除评论
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }

    // 确保用户在数据库中存在（兜底机制）
    const userExists = await ensureUserExists(userId)
    if (!userExists) {
      return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 401 })
    }

    const websiteId = parseInt((await params).id)

    await db.delete(websiteReviews).where(and(
      eq(websiteReviews.userId, userId),
      eq(websiteReviews.websiteId, websiteId)
    ))

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Error deleting review:', error)
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
