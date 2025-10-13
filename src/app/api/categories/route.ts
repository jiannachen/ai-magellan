import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { AjaxResponse } from "@/lib/utils";

const prisma = new PrismaClient();

// GET: 查询所有分类
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeSubcategories = searchParams.get('includeSubcategories') === 'true';
    const parentId = searchParams.get('parentId');
    
    if (includeSubcategories) {
      // 返回分级结构的分类数据
      const categories = await prisma.category.findMany({
        where: {
          parent_id: parentId ? parseInt(parentId) : null
        },
        include: {
          children: {
            orderBy: { sort_order: 'asc' }
          },
          _count: {
            select: {
              websites: {
                where: { status: 'approved' }
              }
            }
          }
        },
        orderBy: { sort_order: 'asc' }
      });
      
      return NextResponse.json(AjaxResponse.ok(categories));
    } else {
      // 返回扁平的分类列表
      const categories = await prisma.category.findMany({
        orderBy: { sort_order: 'asc' }
      });
      return NextResponse.json(AjaxResponse.ok(categories));
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
    const newCategory = await prisma.category.create({
      data: { 
        name, 
        slug, 
        parent_id: parent_id ? parseInt(parent_id) : null,
        sort_order 
      },
    });
    return NextResponse.json(AjaxResponse.ok(newCategory));
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(AjaxResponse.fail("创建分类失败"), {
      status: 500,
    });
  }
}
