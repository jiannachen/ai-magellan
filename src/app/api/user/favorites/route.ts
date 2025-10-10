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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // 获取用户收藏的网站
    const favorites = await prisma.websiteFavorite.findMany({
      where: {
        userId: userId
      },
      include: {
        website: {
          include: {
            category: true,
            _count: {
              select: {
                websiteLikes: true,
                websiteFavorites: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    })

    // 获取总数
    const total = await prisma.websiteFavorite.count({
      where: {
        userId: userId
      }
    })

    // 提取网站数据
    const websites = favorites.map(fav => fav.website)

    return NextResponse.json({
      websites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching user favorites:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { websiteId } = await request.json()

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' }, 
        { status: 400 }
      )
    }

    // 检查网站是否存在
    const website = await prisma.website.findUnique({
      where: { id: parseInt(websiteId) }
    })

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found' }, 
        { status: 404 }
      )
    }

    // 检查是否已经收藏
    const existingFavorite = await prisma.websiteFavorite.findUnique({
      where: {
        userId_websiteId: {
          userId,
          websiteId: parseInt(websiteId)
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Already favorited' }, 
        { status: 400 }
      )
    }

    // 添加收藏
    const favorite = await prisma.websiteFavorite.create({
      data: {
        userId,
        websiteId: parseInt(websiteId)
      }
    })

    return NextResponse.json({ success: true, favorite })

  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// 移除收藏
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' }, 
        { status: 400 }
      )
    }

    // 删除收藏
    await prisma.websiteFavorite.deleteMany({
      where: {
        userId,
        websiteId: parseInt(websiteId)
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}