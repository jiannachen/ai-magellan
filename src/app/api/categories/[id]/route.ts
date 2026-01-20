import { NextResponse } from "next/server";
import { AjaxResponse } from "@/lib/utils";
import { getDB } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";


// PUT: 更新分类
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const db = getDB();
    const { name, slug } = await request.json() as { name: string; slug: string };
    const id = parseInt(params.id);

    if (!name || !slug) {
      return NextResponse.json(
        AjaxResponse.fail("Missing required fields: name or slug"),
        { status: 400 }
      );
    }

    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!existingCategory) {
      return NextResponse.json(AjaxResponse.fail("Category not found"), {
        status: 404,
      });
    }

    const [updatedCategory] = await db.update(categories)
      .set({ name, slug })
      .where(eq(categories.id, id))
      .returning();

    return NextResponse.json(AjaxResponse.ok(updatedCategory));
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

// DELETE: 删除分类
export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const db = getDB();
    const id = parseInt(params.id);

    await db.delete(categories).where(eq(categories.id, id));

    return NextResponse.json(AjaxResponse.ok(null));
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(AjaxResponse.fail("删除分类失败"), {
      status: 500,
    });
  }
}
