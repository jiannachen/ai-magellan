import { NextResponse } from "next/server";
import { AjaxResponse } from "@/lib/utils";
import { prisma } from "@/lib/db/db";

interface CheckUrlResponse {
  isAlive: boolean;
}

async function checkUrl(url: string): Promise<CheckUrlResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    clearTimeout(timeoutId);
    return {
      isAlive: response.ok,
    };
  } catch {
    return {
      isAlive: false,
    };
  }
}

export async function POST(request: Request) {
  try {
    const { url, id: websiteId } = await request.json();

    if (isNaN(websiteId)) {
      return NextResponse.json(AjaxResponse.fail("Invalid website ID"), {
        status: 400,
      });
    }

    if (!url) {
      return NextResponse.json(AjaxResponse.fail("url必须传递"));
    }

    const result = await checkUrl(url);

    const updatedWebsite = await prisma.website.update({
      where: { id: websiteId },
      data: { active: result.isAlive ? 1 : 0 },
    });
    return NextResponse.json(
      AjaxResponse.ok({ active: updatedWebsite.active })
    );
  } catch {
    return NextResponse.json(AjaxResponse.fail("校验页面链接失败"));
  }
}
