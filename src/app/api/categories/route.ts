import { NextResponse } from "next/server";
import { AjaxResponse } from "@/lib/utils";
import { db } from "@/lib/db/db";
import { categories, websiteCategories, websites } from "@/lib/db/schema";
import { eq, isNull, sql, and, asc } from "drizzle-orm";

// GET: 查询所有分类（支持多分类统计）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeSubcategories = searchParams.get('includeSubcategories') === 'true';
    const parentId = searchParams.get('parentId');

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

      // Get counts for each category
      const categoriesWithCounts = await Promise.all(
        parentCategories.map(async (category) => {
          const count = await db
            .select({ count: sql<number>`count(*)` })
            .from(websiteCategories)
            .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
            .where(
              and(
                eq(websiteCategories.categoryId, category.id),
                eq(websites.status, 'approved')
              )
            );

          const childrenWithCounts = await Promise.all(
            (category.children || []).map(async (child) => {
              const childCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(websiteCategories)
                .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
                .where(
                  and(
                    eq(websiteCategories.categoryId, child.id),
                    eq(websites.status, 'approved')
                  )
                );
              return {
                ...child,
                _count: { websiteCategories: Number(childCount[0]?.count || 0) },
              };
            })
          );

          return {
            ...category,
            children: childrenWithCounts,
            _count: { websiteCategories: Number(count[0]?.count || 0) },
          };
        })
      );

      return NextResponse.json(AjaxResponse.ok(categoriesWithCounts));
    } else {
      // 返回扁平的分类列表
      const allCategories = await db.query.categories.findMany({
        orderBy: asc(categories.sortOrder),
      });

      // Get counts for all categories
      const categoriesWithCounts = await Promise.all(
        allCategories.map(async (category) => {
          const count = await db
            .select({ count: sql<number>`count(*)` })
            .from(websiteCategories)
            .innerJoin(websites, eq(websiteCategories.websiteId, websites.id))
            .where(
              and(
                eq(websiteCategories.categoryId, category.id),
                eq(websites.status, 'approved')
              )
            );
          return {
            ...category,
            _count: { websiteCategories: Number(count[0]?.count || 0) },
          };
        })
      );

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
    const { name, slug, parent_id, sort_order = 0 } = await request.json();
    const now = new Date().toISOString();
    const newCategory = await db.insert(categories).values({
      name,
      slug,
      parentId: parent_id ? parseInt(parent_id) : null,
      sortOrder: sort_order,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return NextResponse.json(AjaxResponse.ok(newCategory[0]));
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(AjaxResponse.fail("创建分类失败"), {
      status: 500,
    });
  }
}
