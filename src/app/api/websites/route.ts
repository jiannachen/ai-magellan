import { NextResponse } from "next/server";
import { auth, currentUser } from '@clerk/nextjs/server';
import type { Website } from "@/lib/types";
import { AjaxResponse } from "@/lib/utils";
import { prisma } from "@/lib/db/db";
import { validateWebsiteSubmit } from "@/lib/validations/website";

// GET /api/websites
// 获取所有指定分类的网站
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const websites = await prisma.website.findMany({
    where: statusParam && statusParam !== "all" ? { status: statusParam as any } : {},
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

    // 统一表单验证
    const validationResult = validateWebsiteSubmit(data);
    
    if (!validationResult.success) {
      // 收集所有验证错误
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      
      return NextResponse.json(
        AjaxResponse.fail("Form validation failed", { errors }),
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: Number(validatedData.category_id) },
    });

    if (!category) {
      return NextResponse.json(AjaxResponse.fail("Category does not exist"), {
        status: 400,
      });
    }

    // Check if URL already exists
    const existingWebsite = await prisma.website.findFirst({
      where: { url: validatedData.url },
    });

    if (existingWebsite) {
      return NextResponse.json(AjaxResponse.fail("URL already exists"), {
        status: 400,
      });
    }

    const website = await prisma.website.create({
      data: {
        // 基本信息
        title: validatedData.title.trim(),
        url: validatedData.url.trim(),
        email: validatedData.email?.trim() || null,
        category_id: Number(validatedData.category_id),
        status: "pending", // 默认为待审核状态
        submittedBy: userId,
        
        // 标签和描述
        tags: validatedData.tags?.trim() || null,
        tagline: validatedData.tagline?.trim() || null,
        description: validatedData.description?.trim() || "",
        
        // 功能特性
        features: validatedData.features || [],
        
        // 使用场景和目标受众
        use_cases: validatedData.use_cases || [],
        target_audience: validatedData.target_audience || [],
        
        // 常见问题
        faq: validatedData.faq || [],
        
        // 定价信息
        pricing_model: validatedData.pricing_model || "free",
        has_free_version: validatedData.has_free_version || false,
        api_available: validatedData.api_available || false,
        pricing_plans: validatedData.pricing_plans || [],
        
        // 社交媒体链接
        twitter_url: validatedData.twitter_url?.trim() || null,
        linkedin_url: validatedData.linkedin_url?.trim() || null,
        facebook_url: validatedData.facebook_url?.trim() || null,
        instagram_url: validatedData.instagram_url?.trim() || null,
        youtube_url: validatedData.youtube_url?.trim() || null,
        discord_url: validatedData.discord_url?.trim() || null,
        
        // 集成
        integrations: validatedData.integrations || [],
        
        // 平台支持
        ios_app_url: validatedData.ios_app_url?.trim() || null,
        android_app_url: validatedData.android_app_url?.trim() || null,
        web_app_url: validatedData.web_app_url?.trim() || null,
        desktop_platforms: validatedData.desktop_platforms || [],
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
