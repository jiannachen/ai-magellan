import { NextResponse } from "next/server";
import { auth } from '@/lib/auth';
import { AjaxResponse } from "@/lib/utils";
import { db } from "@/lib/db/db";
import { websites, websiteLikes } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { headers } from "next/headers";

// POST /api/websites/[id]/like - Add like (支持匿名点赞)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const websiteId = parseInt((await params).id);

    const session = await auth();
    const userId = session?.user?.id;

    // 确定用于去重的标识：已登录用户用 userId，匿名用户用 IP
    let likeIdentifier: string;
    if (userId) {
      likeIdentifier = userId;
    } else {
      const headersList = await headers();
      const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
        || headersList.get('x-real-ip')
        || 'anonymous';
      likeIdentifier = `anon_${ip}`;
    }

    // 检查是否已经点赞
    const existingLike = await db.query.websiteLikes.findFirst({
      where: and(
        eq(websiteLikes.userId, likeIdentifier),
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
        id: `${likeIdentifier}_${websiteId}`,
        userId: likeIdentifier,
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
    console.error("Error liking website:", error);
    return NextResponse.json(AjaxResponse.fail("Failed to like website"), {
      status: 500,
    });
  }
}
