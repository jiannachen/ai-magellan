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

    // 获取用户提交的网站
    const websites = await prisma.website.findMany({
      where: {
        submittedBy: userId
      },
      include: {
        category: true,
        _count: {
          select: {
            websiteLikes: true,
            websiteFavorites: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: offset,
      take: limit
    })

    // 获取总数
    const total = await prisma.website.count({
      where: {
        submittedBy: userId
      }
    })

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
    console.error('Error fetching user submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}