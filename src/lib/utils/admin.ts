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
    columns: { role: true },
  })

  if (!user || user.role !== 'admin') {
    return { success: false, status: 403, message: 'Access denied' }
  }

  return { success: true, userId }
}
