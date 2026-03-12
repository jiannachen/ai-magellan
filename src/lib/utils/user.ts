import { getDB } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

interface UserInfo {
  email?: string;
  name?: string;
  imageUrl?: string;
}

/**
 * Ensure user exists in database.
 * If not found, create a new entry.
 *
 * @param userId - User ID from auth session
 * @param userInfo - Optional user info to avoid extra lookups
 * @returns true on success, false on failure
 */
export async function ensureUserExists(userId: string, userInfo?: UserInfo): Promise<boolean> {
  try {
    const db = getDB();
    // 检查用户是否已存在
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // 已存在，直接返回
    if (existingUser) {
      return true;
    }

    // 不存在，创建用户
    const userEmail = userInfo?.email || `${userId}@auth.local`;
    const userName = userInfo?.name || 'User';

    await db.insert(users).values({
      id: userId,
      email: userEmail,
      name: userName,
      image: userInfo?.imageUrl || null,
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    });

    return true;
  } catch (error: any) {
    // 处理 email 唯一性冲突
    if (error.code === 'P2002' || error.message?.includes('unique constraint') || error.message?.includes('UNIQUE constraint')) {
      // email 冲突，使用 userId 作为唯一 email
      try {
        const db = getDB();
        await db.insert(users).values({
          id: userId,
          email: `${userId}@auth.duplicate`,
          name: userInfo?.name || 'User',
          image: userInfo?.imageUrl || null,
          createdAt: sql`CURRENT_TIMESTAMP`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        });
        return true;
      } catch (retryError) {
        console.error('Failed to create user with duplicate email:', retryError);
        return false;
      }
    }

    console.error('Failed to ensure user exists:', error);
    return false;
  }
}
