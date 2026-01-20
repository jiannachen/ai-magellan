import { currentUser } from '@clerk/nextjs/server';
import { getDB } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * 确保用户在数据库中存在
 * 如果不存在就创建，存在就跳过
 *
 * @param userId - Clerk 用户 ID
 * @returns true 成功，false 失败
 */
export async function ensureUserExists(userId: string): Promise<boolean> {
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

    // 不存在，获取 Clerk 用户信息并创建
    const user = await currentUser();
    if (!user) return false;

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const userName = user.fullName || user.firstName || user.username || 'User';

    await db.insert(users).values({
      id: userId,
      email: userEmail || `${userId}@clerk.local`,
      name: userName,
      image: user.imageUrl,
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    });

    return true;
  } catch (error: any) {
    // 处理 email 唯一性冲突
    if (error.code === 'P2002') {
      // email 冲突，使用 userId 作为唯一 email
      try {
        const db = getDB();
        const user = await currentUser();
        await db.insert(users).values({
          id: userId,
          email: `${userId}@clerk.duplicate`,
          name: user?.fullName || user?.firstName || 'User',
          image: user?.imageUrl,
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
