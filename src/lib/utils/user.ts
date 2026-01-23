import { getDB } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

interface UserInfo {
  email?: string;
  name?: string;
  imageUrl?: string;
}

/**
 * 确保用户在数据库中存在
 * 如果不存在就创建，存在就跳过
 *
 * @param userId - Clerk 用户 ID
 * @param userInfo - 可选的用户信息，避免额外调用 Clerk API
 * @returns true 成功，false 失败
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
    const userEmail = userInfo?.email || `${userId}@clerk.local`;
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
          email: `${userId}@clerk.duplicate`,
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
