import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { AjaxResponse, generateSlug } from "@/lib/utils";
import { prisma } from "@/lib/db/db";
import { validateWebsiteEdit } from "@/lib/validations/website";

// GET /api/websites/[id]
// 获取单个网站详细信息 - 支持通过ID或slug查询
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 尝试解析为数字，如果失败则认为是slug
    const isNumericId = !isNaN(Number(id));

    const website = await prisma.website.findUnique({
      where: isNumericId ? { id: parseInt(id) } : { slug: id },
      include: {
        category: {
          include: {
            parent: true
          }
        },
        websiteCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                name_en: true,
                name_zh: true,
                parent_id: true,
                parent: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          },
          orderBy: {
            isPrimary: 'desc' // 主分类排在前面
          }
        },
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

    const category = await prisma.category.findUnique({
      where: { id: Number(validatedData.category_id) },
    });

    if (!category) {
      return NextResponse.json(AjaxResponse.fail("Category does not exist"), {
        status: 400,
      });
    }

    // 检查URL是否已存在（排除当前网站）
    const urlExists = await prisma.website.findFirst({
      where: { 
        url: validatedData.url,
        id: { not: websiteId }
      }
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
      while (await prisma.website.findFirst({
        where: {
          slug,
          id: { not: websiteId }
        }
      })) {
        slug = `${generateSlug(validatedData.title)}-${slugCounter}`;
        slugCounter++;
      }
    }

    const website = await prisma.website.update({
      where: { id: websiteId },
      data: {
        // 基本信息
        title: validatedData.title.trim(),
        slug: slug,
        url: validatedData.url.trim(),
        email: validatedData.email?.trim() || null,
        description: validatedData.description?.trim() || "",
        category_id: Number(validatedData.category_id),

        // 图片资源
        logo_url: validatedData.logo_url?.trim() || null,
        thumbnail: validatedData.thumbnail?.trim() || null,

        // 标签和描述
        tagline: validatedData.tagline?.trim() || null,
        tags: validatedData.tags,

        // 功能特性
        features: validatedData.features || [],

        // 使用场景和目标受众
        use_cases: validatedData.use_cases || [],
        target_audience: validatedData.target_audience || [],

        // 常见问题
        faq: validatedData.faq || [],

        // 定价信息
        pricing_model: validatedData.pricing_model || 'free',
        has_free_version: Boolean(validatedData.has_free_version),
        api_available: Boolean(validatedData.api_available),
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
