import { NextResponse } from "next/server";
import { auth, currentUser } from '@clerk/nextjs/server';
import type { Website } from "@/lib/types";
import { AjaxResponse } from "@/lib/utils";
import { prisma } from "@/lib/db/db";

// GET /api/websites
// 获取所有指定分类的网站
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status =
    (searchParams.get("status") as Website["status"]) || "approved";
  const websites = await prisma.website.findMany({
    where: { status: status === "all" ? undefined : status },
  });
  return NextResponse.json(AjaxResponse.ok(websites));
}

// POST /api/websites
// 创建网站
export async function POST(request: Request) {
  if (!request.body) {
    return NextResponse.json(AjaxResponse.fail("Request body is required"), {
      status: 400,
    });
  }

  try {
    // 获取当前用户信息
    const { userId } = await auth();
    const user = await currentUser();
    
    // 检查用户是否已登录
    if (!userId || !user) {
      return NextResponse.json(
        AjaxResponse.fail("Please login to submit a website"),
        { status: 401 }
      );
    }
    
    // 确保用户在数据库中存在
    const dbUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        name: user.fullName || user.firstName || 'User',
        email: user.emailAddresses[0]?.emailAddress || '',
        image: user.imageUrl,
      },
      create: {
        id: userId,
        name: user.fullName || user.firstName || 'User',
        email: user.emailAddresses[0]?.emailAddress || '',
        image: user.imageUrl,
      }
    });
    
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.url || !data.category_id) {
      return NextResponse.json(
        AjaxResponse.fail(
          "Missing required fields: title, url, or category_id"
        ),
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: Number(data.category_id) },
    });

    if (!category) {
      return NextResponse.json(AjaxResponse.fail("Category does not exist"), {
        status: 400,
      });
    }

    console.log(data);

    // Check if URL already exists
    const existingWebsite = await prisma.website.findFirst({
      where: { url: data.url },
    });

    if (existingWebsite) {
      return NextResponse.json(AjaxResponse.fail("URL already exists"), {
        status: 400,
      });
    }

    // Validate URL format
    try {
      new URL(data.url);
    } catch (error) {
      return NextResponse.json(AjaxResponse.fail("Invalid URL format"), {
        status: 400,
      });
    }

    const website = await prisma.website.create({
      data: {
        // 基本信息
        title: data.title.trim(),
        url: data.url.trim(),
        email: data.email?.trim() || null,
        category_id: Number(data.category_id),
        status: data.status || "pending",
        submittedBy: userId,
        
        // 标签和描述
        tags: data.tags?.trim() || null,
        tagline: data.tagline?.trim() || null,
        description: data.description?.trim() || "",
        
        // 功能特性
        features: data.features || [],
        
        // 使用场景和目标受众
        use_cases: data.use_cases || [],
        target_audience: data.target_audience || [],
        
        // 常见问题
        faq: data.faq || [],
        
        // 定价信息
        pricing_model: data.pricing_model || "free",
        has_free_version: data.has_free_version || false,
        api_available: data.api_available || false,
        pricing_plans: data.pricing_plans || [],
        
        // 社交媒体链接
        twitter_url: data.twitter_url?.trim() || null,
        linkedin_url: data.linkedin_url?.trim() || null,
        facebook_url: data.facebook_url?.trim() || null,
        instagram_url: data.instagram_url?.trim() || null,
        youtube_url: data.youtube_url?.trim() || null,
        discord_url: data.discord_url?.trim() || null,
        
        // 集成
        integrations: data.integrations || [],
        
        // 平台支持
        ios_app_url: data.ios_app_url?.trim() || null,
        android_app_url: data.android_app_url?.trim() || null,
        web_app_url: data.web_app_url?.trim() || null,
        desktop_platforms: data.desktop_platforms || [],
      },
    });

    return NextResponse.json(AjaxResponse.ok(website));
  } catch (error) {
    console.error("Failed to create website:", error);
    return NextResponse.json(AjaxResponse.fail("Failed to create website"), {
      status: 500,
    });
  }
}
