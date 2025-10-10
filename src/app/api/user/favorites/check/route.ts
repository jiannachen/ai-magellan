import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ isFavorited: false })
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' }, 
        { status: 400 }
      )
    }

    // 检查是否已收藏
    const favorite = await prisma.websiteFavorite.findUnique({
      where: {
        userId_websiteId: {
          userId,
          websiteId: parseInt(websiteId)
        }
      }
    })

    return NextResponse.json({ isFavorited: !!favorite })

  } catch (error) {
    console.error('Error checking favorite status:', error)
    return NextResponse.json({ isFavorited: false })
  }
}