import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

type AdminCheckResult =
  | { success: true; userId: string }
  | { success: false; status: 401 | 403; message: string }

export async function requireAdmin(): Promise<AdminCheckResult> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true, email: true },
  })

  if (!user) {
    return { success: false, status: 403, message: 'Access denied' }
  }

  if (user.role === 'admin') {
    return { success: true, userId }
  }

  // Fallback: auto-promote if email is in ADMIN_EMAILS
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  if (user.email && adminEmails.includes(user.email.toLowerCase())) {
    await db.update(users).set({ role: 'admin' }).where(eq(users.id, userId))
    return { success: true, userId }
  }

  return { success: false, status: 403, message: 'Access denied' }
}
