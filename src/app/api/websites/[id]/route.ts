import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { AjaxResponse, generateSlug } from "@/lib/utils";
import { getDB } from "@/lib/db";
import { websites, categories, websiteLikes, websiteFavorites, websiteCategories } from "@/lib/db/schema";
import { eq, and, ne, sql, desc } from "drizzle-orm";
import { validateWebsiteEdit } from "@/lib/validations/website";


// GET /api/websites/[id]
// 获取单个网站详细信息 - 支持通过ID或slug查询
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDB();
    const { id } = await params;

    // 尝试解析为数字，如果失败则认为是slug
    const isNumericId = !isNaN(Number(id));

    const website = await db.query.websites.findFirst({
      where: isNumericId ? eq(websites.id, parseInt(id)) : eq(websites.slug, id),
      with: {
        websiteCategories: {
          with: {
            category: {
              columns: {
                id: true,
                name: true,
                slug: true,
                nameEn: true,
                nameZh: true,
                parentId: true,
              },
              with: {
                parent: {
                  columns: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          },
          orderBy: desc(websiteCategories.isPrimary)
        }
      },
    });

    if (!website) {
      return NextResponse.json(AjaxResponse.fail("Website not found"), {
        status: 404,
      });
    }

    // Get counts separately
    const [likesCount] = await db.select({ count: sql<number>`count(*)` })
      .from(websiteLikes)
      .where(eq(websiteLikes.websiteId, website.id));

    const [favoritesCount] = await db.select({ count: sql<number>`count(*)` })
      .from(websiteFavorites)
      .where(eq(websiteFavorites.websiteId, website.id));

    const websiteWithCounts = {
      ...website,
      _count: {
        websiteLikes: likesCount.count,
        websiteFavorites: favoritesCount.count
      }
    };

    return NextResponse.json(AjaxResponse.ok(websiteWithCounts));
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
    const db = getDB();
    const { id } = await params;
    if (!id) {
      return NextResponse.json(AjaxResponse.fail("Website ID is required"), {});
    }

    const websiteId = parseInt(id);

    // Check if website exists first
    const website = await db.query.websites.findFirst({
      where: eq(websites.id, websiteId),
    });

    if (!website) {
      return NextResponse.json(AjaxResponse.fail("Website not found"), {
        status: 404,
      });
    }

    // Delete the website
    await db.delete(websites).where(eq(websites.id, websiteId));

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
    const db = getDB();
    // 获取当前用户信息
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(AjaxResponse.fail("Unauthorized"), {
        status: 401,
      });
    }

    const data = await request.json() as Record<string, unknown>;
    const { id } = await params;
    const websiteId = parseInt(id);

    // 统一表单验证
    const validationResult = validateWebsiteEdit(data);
    
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

    const existingWebsite = await db.query.websites.findFirst({
      where: eq(websites.id, websiteId),
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

    const category = await db.query.categories.findFirst({
      where: eq(categories.id, Number(validatedData.categoryId)),
    });

    if (!category) {
      return NextResponse.json(AjaxResponse.fail("Category does not exist"), {
        status: 400,
      });
    }

    // 检查URL是否已存在（排除当前网站）
    const urlExists = await db.query.websites.findFirst({
      where: and(
        eq(websites.url, validatedData.url),
        ne(websites.id, websiteId)
      )
    });

    if (urlExists) {
      return NextResponse.json(AjaxResponse.fail("URL already exists"), {
        status: 400,
      });
    }

    // 如果标题改变，重新生成slug
    let slug = existingWebsite.slug;
    if (validatedData.title.trim() !== existingWebsite.title) {
      slug = generateSlug(validatedData.title);
      let slugCounter = 1;

      // 确保slug唯一（排除当前网站）
      while (await db.query.websites.findFirst({
        where: and(
          eq(websites.slug, slug),
          ne(websites.id, websiteId)
        )
      })) {
        slug = `${generateSlug(validatedData.title)}-${slugCounter}`;
        slugCounter++;
      }
    }

    const [website] = await db.update(websites)
      .set({
        // 基本信息
        title: validatedData.title.trim(),
        slug: slug,
        url: validatedData.url.trim(),
        email: validatedData.email?.trim() || null,
        description: validatedData.description?.trim() || "",
        categoryId: Number(validatedData.categoryId),

        // 图片资源
        logoUrl: validatedData.logoUrl?.trim() || null,
        thumbnail: validatedData.thumbnail?.trim() || null,

        // 标签和描述
        tagline: validatedData.tagline?.trim() || null,
        tags: validatedData.tags,

        // 功能特性
        features: validatedData.features || [],

        // 使用场景和目标受众
        useCases: validatedData.useCases || [],
        targetAudience: validatedData.targetAudience || [],

        // 常见问题
        faq: validatedData.faq || [],

        // 定价信息
        pricingModel: validatedData.pricingModel || 'free',
        hasFreeVersion: Boolean(validatedData.hasFreeVersion),
        apiAvailable: Boolean(validatedData.apiAvailable),
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

        // 保持原状态或根据需要重置为待审核
        status: existingWebsite.status,
      })
      .where(eq(websites.id, websiteId))
      .returning();

    const websiteWithCategory = await db.query.websites.findFirst({
      where: eq(websites.id, websiteId),
      with: {
        websiteCategories: {
          with: {
            category: true
          }
        }
      }
    });

    return NextResponse.json(AjaxResponse.ok(websiteWithCategory));
  } catch (error) {
    console.error("Failed to update website:", error);
    return NextResponse.json(AjaxResponse.fail("Failed to update website"), {
      status: 500,
    });
  }
}
