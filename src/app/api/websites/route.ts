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
    const categoryIds: number[] = Array.isArray(validatedData.categoryId)
      ? validatedData.categoryId.map(Number)
      : [Number(validatedData.categoryId)];

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
        logoUrl: validatedData.logoUrl?.trim() || null,
        thumbnail: validatedData.thumbnail?.trim() || null,

        // 标签和描述
        tags: validatedData.tags,
        tagline: validatedData.tagline?.trim() || null,
        description: validatedData.description?.trim() || "",

        // 功能特性
        features: validatedData.features || [],

        // 使用场景和目标受众
        useCases: validatedData.useCases || [],
        targetAudience: validatedData.targetAudience || [],

        // 常见问题
        faq: validatedData.faq || [],

        // 定价信息
        pricingModel: validatedData.pricingModel || "free",
        hasFreeVersion: validatedData.hasFreeVersion || false,
        apiAvailable: validatedData.apiAvailable || false,
        pricingPlans: validatedData.pricingPlans || [],

        // 社交媒体链接
        twitterUrl: validatedData.twitterUrl?.trim() || null,
        linkedinUrl: validatedData.linkedinUrl?.trim() || null,
        facebookUrl: validatedData.facebookUrl?.trim() || null,
        instagramUrl: validatedData.instagramUrl?.trim() || null,
        youtubeUrl: validatedData.youtubeUrl?.trim() || null,
        discordUrl: validatedData.discordUrl?.trim() || null,

        // 集成
        integrations: validatedData.integrations || [],

        // 平台支持
        iosAppUrl: validatedData.iosAppUrl?.trim() || null,
        androidAppUrl: validatedData.androidAppUrl?.trim() || null,
        webAppUrl: validatedData.webAppUrl?.trim() || null,
        desktopPlatforms: validatedData.desktopPlatforms || [],
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
