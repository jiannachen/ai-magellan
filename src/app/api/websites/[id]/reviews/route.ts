import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/websites/[id]/reviews
// 获取工具的评论列表
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const websiteId = parseInt((await params).id)
    
    const reviews = await prisma.websiteReview.findMany({
      where: { websiteId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // 限制返回数量
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

    const websiteId = parseInt((await params).id)
    const body = await request.json()
    const { rating, comment } = body

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // 检查是否已经评论过
    const existingReview = await prisma.websiteReview.findUnique({
      where: {
        userId_websiteId: {
          userId,
          websiteId
        }
      }
    })

    let review
    if (existingReview) {
      // 更新现有评论
      review = await prisma.websiteReview.update({
        where: {
          userId_websiteId: {
            userId,
            websiteId
          }
        },
        data: {
          rating,
          comment: comment?.trim() || null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      })
    } else {
      // 创建新评论
      review = await prisma.websiteReview.create({
        data: {
          userId,
          websiteId,
          rating,
          comment: comment?.trim() || null
        },
        include: {
          user: {
            select: {
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

    const websiteId = parseInt((await params).id)

    const deletedReview = await prisma.websiteReview.delete({
      where: {
        userId_websiteId: {
          userId,
          websiteId
        }
      }
    })

    return NextResponse.json({ message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Error deleting review:', error)
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}