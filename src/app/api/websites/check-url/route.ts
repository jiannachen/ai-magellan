import { NextResponse } from "next/server";
import { AjaxResponse } from "@/lib/utils";
import { prisma } from "@/lib/db/db";

/**
 * GET /api/websites/check-url?url=xxx&excludeId=xxx
 * 检查URL是否已存在
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const excludeId = searchParams.get("excludeId");

    if (!url) {
      return NextResponse.json(
        AjaxResponse.fail("URL parameter is required"),
        { status: 400 }
      );
    }

    // 查找是否有相同URL的网站
    const existingWebsite = await prisma.website.findFirst({
      where: {
        url: url.trim(),
        // 如果提供了excludeId,排除该ID(用于编辑时检查)
        ...(excludeId && { id: { not: parseInt(excludeId) } })
      },
      select: {
        id: true,
        title: true,
        status: true
      }
    });

    if (existingWebsite) {
      return NextResponse.json(
        AjaxResponse.fail("URL already exists", {
          exists: true,
          website: existingWebsite
        })
      );
    }

    return NextResponse.json(
      AjaxResponse.ok({ exists: false })
    );
  } catch (error) {
    console.error("Error checking URL:", error);
    return NextResponse.json(
      AjaxResponse.fail("Failed to check URL"),
      { status: 500 }
    );
  }
}
