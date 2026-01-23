import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

// 检查是否为管理员邮箱
function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []
  return adminEmails.includes(email)
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ isAdmin: false })
    }

    const user = await currentUser()
    const userEmail = user?.emailAddresses[0]?.emailAddress

    if (!userEmail) {
      return NextResponse.json({ isAdmin: false })
    }

    const isAdmin = isAdminEmail(userEmail)

    return NextResponse.json({ isAdmin })

  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json({ isAdmin: false })
  }
}
