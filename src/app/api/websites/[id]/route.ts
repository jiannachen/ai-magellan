import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { AjaxResponse } from "@/lib/utils";
import { prisma } from "@/lib/db/db";

// GET /api/websites/[id]
// 获取单个网站详细信息
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const websiteId = parseInt(id);
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: { 
        category: true,
        _count: {
          select: {
            websiteLikes: true,
            websiteFavorites: true
          }
        }
      },
    });

    if (!website) {
      return NextResponse.json(AjaxResponse.fail("Website not found"), {
        status: 404,
      });
    }

    return NextResponse.json(AjaxResponse.ok(website));
  } catch (error) {
    console.error("Failed to fetch website:", error);
    return NextResponse.json(AjaxResponse.fail("Failed to fetch website"), {
      status: 500,
    });
  }
}

// DELETE /api/websites/[id]
// 删除网站
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(AjaxResponse.fail("Website ID is required"), {});
    }

    const websiteId = parseInt(id);

    // Check if website exists first
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!website) {
      return NextResponse.json(AjaxResponse.fail("Website not found"), {
        status: 404,
      });
    }

    // Delete the website
    await prisma.website.delete({
      where: { id: websiteId },
    });

    return NextResponse.json(AjaxResponse.ok("Website deleted successfully"));
  } catch (error) {
    console.error("Failed to delete website:", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json(AjaxResponse.fail("Website not found"), {
        status: 404,
      });
    }
    return NextResponse.json(AjaxResponse.fail("Failed to delete website"), {
      status: 500,
    });
  }
}

// PUT /api/websites/[id]
// 更新网站
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 获取当前用户信息
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(AjaxResponse.fail("Unauthorized"), {
        status: 401,
      });
    }

    const data = await request.json();
    const { id } = await params;
    const websiteId = parseInt(id);

    const existingWebsite = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!existingWebsite) {
      return NextResponse.json(AjaxResponse.fail("Website not found"), {
        status: 404,
      });
    }

    // 检查是否是当前用户提交的网站
    if (existingWebsite.submittedBy !== userId) {
      return NextResponse.json(AjaxResponse.fail("You can only edit your own submissions"), {
        status: 403,
      });
    }

    if (!data.title || !data.url || !data.category_id) {
      return NextResponse.json(
        AjaxResponse.fail(
          "Missing required fields: title, url, or category_id"
        ),
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: Number(data.category_id) },
    });

    if (!category) {
      return NextResponse.json(AjaxResponse.fail("Category does not exist"), {
        status: 400,
      });
    }

    // 检查URL是否已存在（排除当前网站）
    const urlExists = await prisma.website.findFirst({
      where: { 
        url: data.url,
        id: { not: websiteId }
      }
    });

    if (urlExists) {
      return NextResponse.json(AjaxResponse.fail("URL already exists"), {
        status: 400,
      });
    }

    const website = await prisma.website.update({
      where: { id: websiteId },
      data: {
        title: data.title.trim(),
        url: data.url.trim(),
        description: data.description?.trim() || "",
        category_id: Number(data.category_id),
        thumbnail: data.thumbnail?.trim() || null,
        tagline: data.tagline?.trim() || null,
        features: data.features || [],
        use_cases: data.use_cases || null,
        target_audience: data.target_audience || null,
        faq: data.faq || null,
        pricing_model: data.pricing_model || 'free',
        has_free_version: Boolean(data.has_free_version),
        api_available: Boolean(data.api_available),
        tags: data.tags?.trim() || null,
        twitter_url: data.twitter_url?.trim() || null,
        linkedin_url: data.linkedin_url?.trim() || null,
        facebook_url: data.facebook_url?.trim() || null,
        instagram_url: data.instagram_url?.trim() || null,
        youtube_url: data.youtube_url?.trim() || null,
        discord_url: data.discord_url?.trim() || null,
        integrations: data.integrations || null,
        ios_app_url: data.ios_app_url?.trim() || null,
        android_app_url: data.android_app_url?.trim() || null,
        web_app_url: data.web_app_url?.trim() || null,
        desktop_platforms: data.desktop_platforms || null,
        // 保持原状态或根据需要重置为待审核
        status: existingWebsite.status,
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(AjaxResponse.ok(website));
  } catch (error) {
    console.error("Failed to update website:", error);
    return NextResponse.json(AjaxResponse.fail("Failed to update website"), {
      status: 500,
    });
  }
}
