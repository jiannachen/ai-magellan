import { db } from "@/lib/db/db";
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
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (existingUser) {
      return true;
    }

    // Create new user
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
    // Handle email uniqueness conflict
    if (error.code === 'P2002' || error.message?.includes('unique constraint') || error.message?.includes('UNIQUE constraint')) {
      try {
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
