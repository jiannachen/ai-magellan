import { NextResponse } from "next/server";
import { auth, currentUser } from '@clerk/nextjs/server';
import { AjaxResponse, generateSlug, ensureUserExists } from "@/lib/utils";
import { db } from "@/lib/db/db";
import { websites, websiteCategories, categories } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { validateWebsiteSubmit } from "@/lib/validations/website";

// GET /api/websites
// 获取所有指定分类的网站（支持多分类）
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");

  const websitesList = await db.query.websites.findMany({
    where: (websites, { eq, and, exists }) => {
      const conditions = [];

      if (statusParam && statusParam !== "all") {
        conditions.push(eq(websites.status, statusParam));
      }

      if (categoryId) {
        conditions.push(
          exists(
            db.select()
              .from(websiteCategories)
              .where(
                and(
                  eq(websiteCategories.websiteId, websites.id),
                  eq(websiteCategories.categoryId, parseInt(categoryId))
                )
              )
          )
        );
      }

      return conditions.length > 0 ? and(...conditions) : undefined;
    },
    with: {
      websiteCategories: {
        with: {
          category: {
            columns: {
              id: true,
              name: true,
              slug: true,
              nameEn: true,
              nameZh: true
            }
          }
        },
        orderBy: (websiteCategories, { desc }) => [desc(websiteCategories.isPrimary)]
      }
    }
  });

  return NextResponse.json(AjaxResponse.ok(websitesList));
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
    const categoriesList = await db.query.categories.findMany({
      where: inArray(categories.id, categoryIds)
    });

    if (categoriesList.length !== categoryIds.length) {
      return NextResponse.json(AjaxResponse.fail("One or more categories do not exist"), {
        status: 400,
      });
    }

    // Check if URL already exists
    const existingWebsite = await db.query.websites.findFirst({
      where: eq(websites.url, validatedData.url),
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
    while (await db.query.websites.findFirst({ where: eq(websites.slug, slug) })) {
      slug = `${generateSlug(validatedData.title)}-${slugCounter}`;
      slugCounter++;
    }

    // Use transaction to create website and categories atomically
    const result = await db.transaction(async (tx) => {
      // Create website
      const [website] = await tx.insert(websites).values({
        // 基本信息
        title: validatedData.title.trim(),
        slug: slug,
        url: validatedData.url.trim(),
        email: validatedData.email?.trim() || null,
        categoryId: Number(categoryIds[0]), // 保留旧字段为主分类
        status: "pending", // 默认为待审核状态
        submittedBy: userId,

        // 图片资源
        logoUrl: validatedData.logo_url?.trim() || null,
        thumbnail: validatedData.thumbnail?.trim() || null,

        // 标签和描述
        tags: validatedData.tags,
        tagline: validatedData.tagline?.trim() || null,
        description: validatedData.description?.trim() || "",

        // 功能特性
        features: validatedData.features || [],

        // 使用场景和目标受众
        useCases: validatedData.use_cases || [],
        targetAudience: validatedData.target_audience || [],

        // 常见问题
        faq: validatedData.faq || [],

        // 定价信息
        pricingModel: validatedData.pricing_model || "free",
        hasFreeVersion: validatedData.has_free_version || false,
        apiAvailable: validatedData.api_available || false,
        pricingPlans: validatedData.pricing_plans || [],

        // 社交媒体链接
        twitterUrl: validatedData.twitter_url?.trim() || null,
        linkedinUrl: validatedData.linkedin_url?.trim() || null,
        facebookUrl: validatedData.facebook_url?.trim() || null,
        instagramUrl: validatedData.instagram_url?.trim() || null,
        youtubeUrl: validatedData.youtube_url?.trim() || null,
        discordUrl: validatedData.discord_url?.trim() || null,

        // 集成
        integrations: validatedData.integrations || [],

        // 平台支持
        iosAppUrl: validatedData.ios_app_url?.trim() || null,
        androidAppUrl: validatedData.android_app_url?.trim() || null,
        webAppUrl: validatedData.web_app_url?.trim() || null,
        desktopPlatforms: validatedData.desktop_platforms || [],
      }).returning();

      // Create website categories
      await tx.insert(websiteCategories).values(
        categoryIds.map((catId, index) => ({
          websiteId: website.id,
          categoryId: catId,
          isPrimary: index === 0 // 第一个为主分类
        }))
      );

      // Fetch the complete website with categories
      const websiteWithCategories = await tx.query.websites.findFirst({
        where: eq(websites.id, website.id),
        with: {
          websiteCategories: {
            with: {
              category: true
            }
          }
        }
      });

      return websiteWithCategories;
    });

    return NextResponse.json(AjaxResponse.ok(result));
  } catch (error) {
    console.error("Failed to create website:", error);
    return NextResponse.json(AjaxResponse.fail("Failed to create website"), {
      status: 500,
    });
  }
}
