import { NextResponse } from "next/server";
import { updateWebsiteThumbnails } from "@/lib/utils/update-thumbnails";
import { requireAdmin } from "@/lib/utils/admin";
import { AjaxResponse } from "@/lib/utils";

export async function POST() {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.success) {
      return NextResponse.json(
        AjaxResponse.fail(adminCheck.message),
        { status: adminCheck.status }
      );
    }

    console.log("手动触发缩略图更新任务");
    await updateWebsiteThumbnails();
    return NextResponse.json(AjaxResponse.ok("缩略图更新完成"));
  } catch (error) {
    console.error("手动更新缩略图失败:", error);
    return NextResponse.json(AjaxResponse.fail("更新失败，请查看服务器日志"), {
      status: 500,
    });
  }
}
