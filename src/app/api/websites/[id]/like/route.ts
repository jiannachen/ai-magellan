import { NextResponse } from "next/server";
import { auth, currentUser } from '@clerk/nextjs/server';
import { AjaxResponse } from "@/lib/utils";
import { prisma } from "@/lib/db/db";

// Helper function to ensure user exists in database
async function ensureUserExists(userId: string) {
  const user = await currentUser();
  if (!user) return false;

  // Check if user exists in database
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existingUser) {
    // Create user if doesn't exist
    await prisma.user.create({
      data: {
        id: userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        name: user.firstName || user.username || 'User',
        image: user.imageUrl,
      }
    });
  }
  
  return true;
}

// POST /api/websites/[id]/like - Add like
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

// DELETE /api/websites/[id]/like - Remove like
export async function DELETE(
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

    if (!existingLike) {
      return NextResponse.json(AjaxResponse.fail("Not liked yet"), {
        status: 400,
      });
    }

    // 删除点赞记录和更新计数
    await prisma.$transaction([
      prisma.websiteLike.delete({
        where: {
          userId_websiteId: {
            userId,
            websiteId
          }
        }
      }),
      prisma.website.update({
        where: { id: websiteId },
        data: { likes: { decrement: 1 } }
      })
    ]);

    const updatedWebsite = await prisma.website.findUnique({
      where: { id: websiteId },
      select: { likes: true }
    });

    return NextResponse.json(AjaxResponse.ok({ likes: updatedWebsite?.likes || 0 }));
  } catch (error) {
    return NextResponse.json(AjaxResponse.fail("Failed to unlike website"), {
      status: 500,
    });
  }
}
