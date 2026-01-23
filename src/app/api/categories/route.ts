import { NextResponse } from "next/server";
import { AjaxResponse } from "@/lib/utils";
import { getDB } from "@/lib/db";
import { categories, websiteCategories, websites } from "@/lib/db/schema";
import { eq, isNull, sql, and, asc } from "drizzle-orm";


// GET: 查询所有分类（支持多分类统计）
// 优化：使用单次 GROUP BY 聚合查询替代 N+1 查询，避免 Cloudflare 10ms CPU 限制
export async function GET(request: Request) {
  try {
    const db = getDB();
    const { searchParams } = new URL(request.url);
    const includeSubcategories = searchParams.get('includeSubcategories') === 'true';
    const parentId = searchParams.get('parentId');

    // 单次查询获取所有分类的网站数量，避免 N+1 问题
    const websiteCounts = await db
      .select({
        categoryId: websiteCategories.categoryId,
        count: sql<number>`count(distinct ${websiteCategories.websiteId})`.as('count'),
      })
      .from(websiteCategories)
      .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
      .where(eq(websites.status, 'approved'))
      .groupBy(websiteCategories.categoryId);

    // 创建 Map 用于快速查找
    const countMap = new Map(
      websiteCounts.map(item => [item.categoryId, Number(item.count)])
    );

    if (includeSubcategories) {
      // 返回分级结构的分类数据
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

      // 使用 countMap 添加计数，无需额外查询
      const categoriesWithCounts = parentCategories.map(category => ({
        ...category,
        children: (category.children || []).map(child => ({
          ...child,
          _count: { websiteCategories: countMap.get(child.id) || 0 },
        })),
        _count: { websiteCategories: countMap.get(category.id) || 0 },
      }));

      return NextResponse.json(AjaxResponse.ok(categoriesWithCounts));
    } else {
      // 返回扁平的分类列表
      const allCategories = await db.query.categories.findMany({
        orderBy: asc(categories.sortOrder),
      });

      // 使用 countMap 添加计数，无需额外查询
      const categoriesWithCounts = allCategories.map(category => ({
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

// POST: 创建新分类
export async function POST(request: Request) {
  try {
    const db = getDB();
    const { name, slug, parent_id, sort_order = 0 } = await request.json() as { name: string; slug: string; parent_id?: string; sort_order?: number };
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
