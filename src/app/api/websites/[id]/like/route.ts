import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { AjaxResponse, ensureUserExists } from "@/lib/utils";
import { db } from "@/lib/db/db";
import { websites, websiteLikes } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// POST /api/websites/[id]/like - Add like (点赞只能增加，不能取消)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(AjaxResponse.fail("Please login first"), {
        status: 401,
      });
    }

    // Ensure user exists in database
    const userExists = await ensureUserExists(userId);
    if (!userExists) {
      return NextResponse.json(AjaxResponse.fail("Failed to authenticate user"), {
        status: 401,
      });
    }

    const websiteId = parseInt((await params).id);

    // 检查是否已经点赞
    const existingLike = await db.query.websiteLikes.findFirst({
      where: and(
        eq(websiteLikes.userId, userId),
        eq(websiteLikes.websiteId, websiteId)
      )
    });

    if (existingLike) {
      return NextResponse.json(AjaxResponse.fail("Already liked"), {
        status: 400,
      });
    }

    // 添加点赞记录和更新计数
    await db.transaction(async (tx) => {
      await tx.insert(websiteLikes).values({
        id: `${userId}_${websiteId}`,
        userId,
        websiteId
      });

      await tx.update(websites)
        .set({ likes: sql`${websites.likes} + 1` })
        .where(eq(websites.id, websiteId));
    });

    const updatedWebsite = await db.query.websites.findFirst({
      where: eq(websites.id, websiteId),
      columns: { likes: true }
    });

    return NextResponse.json(AjaxResponse.ok({ likes: updatedWebsite?.likes || 0 }));
  } catch (error) {
    return NextResponse.json(AjaxResponse.fail("Failed to like website"), {
      status: 500,
    });
  }
}
