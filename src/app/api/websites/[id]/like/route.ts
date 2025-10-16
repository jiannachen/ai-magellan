import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { AjaxResponse, ensureUserExists } from "@/lib/utils";
import { prisma } from "@/lib/db/db";

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
    const existingLike = await prisma.websiteLike.findUnique({
      where: {
        userId_websiteId: {
          userId,
          websiteId
        }
      }
    });

    if (existingLike) {
      return NextResponse.json(AjaxResponse.fail("Already liked"), {
        status: 400,
      });
    }

    // 添加点赞记录和更新计数
    await prisma.$transaction([
      prisma.websiteLike.create({
        data: {
          userId,
          websiteId
        }
      }),
      prisma.website.update({
        where: { id: websiteId },
        data: { likes: { increment: 1 } }
      })
    ]);

    const updatedWebsite = await prisma.website.findUnique({
      where: { id: websiteId },
      select: { likes: true }
    });

    return NextResponse.json(AjaxResponse.ok({ likes: updatedWebsite?.likes || 0 }));
  } catch (error) {
    return NextResponse.json(AjaxResponse.fail("Failed to like website"), {
      status: 500,
    });
  }
}
