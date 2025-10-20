import { NextResponse } from "next/server";
import { auth, currentUser } from '@clerk/nextjs/server';
import { AjaxResponse, generateSlug, ensureUserExists } from "@/lib/utils";
import { prisma } from "@/lib/db/db";
import { validateWebsiteSubmit } from "@/lib/validations/website";

// GET /api/websites
// 获取所有指定分类的网站（支持多分类）
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");

  const websites = await prisma.website.findMany({
    where: {
      ...(statusParam && statusParam !== "all" ? { status: statusParam as any } : {}),
      ...(categoryId ? {
        websiteCategories: {
          some: {
            categoryId: parseInt(categoryId)
          }
        }
      } : {})
    },
    include: {
      websiteCategories: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              name_en: true,
              name_zh: true
            }
          }
        },
        orderBy: {
          isPrimary: 'desc' // 主分类排在前面
        }
      }
    }
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

    // 确保用户在数据库中存在（用于外键关系）
    const userExists = await ensureUserExists(userId);
    if (!userExists) {
      return NextResponse.json(
        AjaxResponse.fail("Failed to authenticate user"),
        { status: 401 }
      );
    }

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

    // Check if at least one category is provided
    const categoryIds: number[] = Array.isArray(validatedData.category_id)
      ? validatedData.category_id.map(Number)
      : [Number(validatedData.category_id)];

    // 验证所有分类是否存在
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } }
    });

    if (categories.length !== categoryIds.length) {
      return NextResponse.json(AjaxResponse.fail("One or more categories do not exist"), {
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

    // 生成唯一的slug
    let slug = generateSlug(validatedData.title);
    let slugCounter = 1;

    // 确保slug唯一
    while (await prisma.website.findUnique({ where: { slug } })) {
      slug = `${generateSlug(validatedData.title)}-${slugCounter}`;
      slugCounter++;
    }

    const website = await prisma.website.create({
      data: {
        // 基本信息
        title: validatedData.title.trim(),
        slug: slug,
        url: validatedData.url.trim(),
        email: validatedData.email?.trim() || null,
        category_id: Number(categoryIds[0]), // 保留旧字段为主分类
        status: "pending", // 默认为待审核状态
        submittedBy: userId,

        // 图片资源
        logo_url: validatedData.logo_url?.trim() || null,
        thumbnail: validatedData.thumbnail?.trim() || null,

        // 标签和描述
        tags: validatedData.tags,
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

        // 创建多分类关联
        websiteCategories: {
          create: categoryIds.map((catId, index) => ({
            categoryId: catId,
            isPrimary: index === 0 // 第一个为主分类
          }))
        }
      },
      include: {
        websiteCategories: {
          include: {
            category: true
          }
        }
      }
    });

    return NextResponse.json(AjaxResponse.ok(website));
  } catch (error) {
    console.error("Failed to create website:", error);
    return NextResponse.json(AjaxResponse.fail("Failed to create website"), {
      status: 500,
    });
  }
}
