import { currentUser } from '@clerk/nextjs/server';
import { prisma } from "@/lib/db/db";

/**
 * 确保用户在数据库中存在
 * 如果不存在就创建，存在就跳过
 *
 * @param userId - Clerk 用户 ID
 * @returns true 成功，false 失败
 */
export async function ensureUserExists(userId: string): Promise<boolean> {
  try {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
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

    await prisma.user.create({
      data: {
        id: userId,
        email: userEmail || `${userId}@clerk.local`,
        name: userName,
        image: user.imageUrl,
      }
    });

    return true;
  } catch (error: any) {
    // 处理 email 唯一性冲突
    if (error.code === 'P2002') {
      // email 冲突，使用 userId 作为唯一 email
      try {
        const user = await currentUser();
        await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@clerk.duplicate`,
            name: user?.fullName || user?.firstName || 'User',
            image: user?.imageUrl,
          }
        });
        return true;
      } catch (retryError) {
        console.error('Failed to create user after retry:', retryError);
        return false;
      }
    }

    console.error('Error in ensureUserExists:', error);
    return false;
  }
}
