import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDB } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ isAdmin: false })
    }

    // Check admin role from database
    const db = getDB()
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true },
    })

    const isAdmin = user?.role === 'admin'

    return NextResponse.json({ isAdmin })

  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json({ isAdmin: false })
  }
}
