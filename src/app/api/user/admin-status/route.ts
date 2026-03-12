import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/admin'

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    return NextResponse.json({ isAdmin: adminCheck.success })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json({ isAdmin: false })
  }
}
