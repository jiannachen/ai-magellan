import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 获取收藏数量
    const totalFavorites = await prisma.websiteFavorite.count({
      where: {
        userId: userId
      }
    })

    // 获取提交数量
    const totalSubmissions = await prisma.website.count({
      where: {
        submittedBy: userId
      }
    })

    // 获取点赞数量
    const totalLikes = await prisma.websiteLike.count({
      where: {
        userId: userId
      }
    })

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
