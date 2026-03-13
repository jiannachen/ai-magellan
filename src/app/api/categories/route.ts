import { NextResponse } from "next/server";
import { AjaxResponse } from "@/lib/utils";
import { requireAdmin } from "@/lib/utils/admin";
import { db } from "@/lib/db/db";
import { categories, websiteCategories, websites } from "@/lib/db/schema";
import { eq, isNull, sql, and, asc } from "drizzle-orm";

// GET: 查询所有分类（支持多分类统计）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeSubcategories = searchParams.get('includeSubcategories') === 'true';
    const parentId = searchParams.get('parentId');

    // 一次性批量查询所有分类的计数，消除 N+1
    const allCounts = await db
      .select({
        categoryId: websiteCategories.categoryId,
        count: sql<number>`count(*)`,
      })
      .from(websiteCategories)
      .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
      .where(eq(websites.status, 'approved'))
      .groupBy(websiteCategories.categoryId);

    const countMap = new Map(allCounts.map(c => [c.categoryId, Number(c.count)]));

    if (includeSubcategories) {
      const parentCategories = await db.query.categories.findMany({
        where: parentId
          ? eq(categories.parentId, parseInt(parentId))
          : isNull(categories.parentId),
        with: {
          children: {
            orderBy: asc(categories.sortOrder),
          },
        },
        orderBy: asc(categories.sortOrder),
      });

      const categoriesWithCounts = parentCategories.map((category) => ({
        ...category,
        children: (category.children || []).map((child) => ({
          ...child,
          _count: { websiteCategories: countMap.get(child.id) || 0 },
        })),
        _count: { websiteCategories: countMap.get(category.id) || 0 },
      }));

      return NextResponse.json(AjaxResponse.ok(categoriesWithCounts));
    } else {
      const allCategories = await db.query.categories.findMany({
        orderBy: asc(categories.sortOrder),
      });

      const categoriesWithCounts = allCategories.map((category) => ({
        ...category,
        _count: { websiteCategories: countMap.get(category.id) || 0 },
      }));

      return NextResponse.json(AjaxResponse.ok(categoriesWithCounts));
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(AjaxResponse.fail("获取分类数据失败"), {
      status: 500,
    });
  }
}

// POST: 创建新分类（需要管理员权限）
export async function POST(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.success) {
      return NextResponse.json(
        AjaxResponse.fail(adminCheck.message),
        { status: adminCheck.status }
      );
    }

    const { name, slug, parent_id, sort_order = 0 } = await request.json();
    const newCategory = await db.insert(categories).values({
      name: name,
      slug: slug,
      parentId: parent_id ? parseInt(parent_id) : null,
      sortOrder: sort_order,
    }).returning();

    return NextResponse.json(AjaxResponse.ok(newCategory[0]));
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(AjaxResponse.fail("创建分类失败"), {
      status: 500,
    });
  }
}
