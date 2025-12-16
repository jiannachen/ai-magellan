import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { footerLinks } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { AjaxResponse } from "@/lib/utils";

// 获取所有页脚链接
export async function GET() {
  try {
    const links = await db.query.footerLinks.findMany({
      columns: {
        title: true,
        url: true,
      },
      orderBy: asc(footerLinks.createdAt),
    });
    return NextResponse.json(AjaxResponse.ok(links));
  } catch (error) {
    return NextResponse.json(AjaxResponse.fail("获取页脚链接失败"));
  }
}

// 创建新的页脚链接
export async function POST(request: Request) {
  try {
    const { title, url } = await request.json();

    if (!title || !url) {
      return NextResponse.json(AjaxResponse.fail("标题和URL都是必需的"));
    }

    // 验证 URL 格式
    try {
      new URL(url);
    } catch (_e) {
      return NextResponse.json(AjaxResponse.fail("请输入有效的URL地址"));
    }

    const [link] = await db.insert(footerLinks).values({
      title: title,
      url: url,
    }).returning();

    return NextResponse.json(AjaxResponse.ok(link));
  } catch (error) {
    if ((error as any)?.code === "23505") { // Unique violation
      return NextResponse.json(AjaxResponse.fail("该URL已存在"));
    }
    return NextResponse.json(AjaxResponse.fail("创建页脚链接失败"));
  }
}

// 更新页脚链接
export async function PUT(request: Request) {
  try {
    const { id, title, url } = await request.json();

    if (!id || !title || !url) {
      return NextResponse.json(AjaxResponse.fail("ID、标题和URL都是必需的"));
    }

    const [link] = await db.update(footerLinks)
      .set({ title, url })
      .where(eq(footerLinks.id, id))
      .returning();

    if (!link) {
      return NextResponse.json(AjaxResponse.fail("链接不存在"));
    }

    return NextResponse.json(AjaxResponse.ok(link));
  } catch (error) {
    return NextResponse.json(AjaxResponse.fail("更新页脚链接失败"));
  }
}

// 删除页脚链接
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(AjaxResponse.fail("缺少ID参数"));
    }

    await db.delete(footerLinks).where(eq(footerLinks.id, parseInt(id)));

    return NextResponse.json(AjaxResponse.ok("success"));
  } catch (error) {
    return NextResponse.json(AjaxResponse.fail("删除页脚链接失败"));
  }
}
