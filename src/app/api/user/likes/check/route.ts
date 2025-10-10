import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/user/likes/check
// 检查用户是否已点赞某个工具
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ isLiked: false })
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json({ error: 'websiteId is required' }, { status: 400 })
    }

    const like = await prisma.websiteLike.findUnique({
      where: {
        userId_websiteId: {
          userId,
          websiteId: parseInt(websiteId)
        }
      }
    })

    return NextResponse.json({ isLiked: !!like })
  } catch (error) {
    console.error('Error checking like status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}