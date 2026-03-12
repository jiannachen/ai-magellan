import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { feedbacks } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { AjaxResponse } from "@/lib/utils";
import { requireAdmin } from "@/lib/utils/admin";

// GET /api/admin/feedbacks - 获取反馈列表（分页）
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.success) {
      return NextResponse.json(
        AjaxResponse.fail(adminCheck.message),
        { status: adminCheck.status }
      );
    }

    const db = getDB();
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')));
    const offset = (page - 1) * pageSize;

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(feedbacks);

    // Get paginated feedbacks
    const feedbacksList = await db.query.feedbacks.findMany({
      orderBy: (feedbacks, { desc }) => [desc(feedbacks.createdAt)],
      limit: pageSize,
      offset,
    });

    return NextResponse.json(AjaxResponse.ok({
      feedbacks: feedbacksList,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    }));
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json(
      AjaxResponse.fail("Failed to fetch feedbacks"),
      { status: 500 }
    );
  }
}
