import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { feedbacks } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AjaxResponse } from "@/lib/utils";
import { requireAdmin } from "@/lib/utils/admin";

// POST /api/feedback - submit feedback
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(AjaxResponse.fail("Request body is required"), {
        status: 400,
      });
    }

    const { name, feedback, source } = body as {
      name?: string;
      feedback?: string;
      source?: string;
    };

    if (!feedback || !feedback.trim()) {
      return NextResponse.json(AjaxResponse.fail("Feedback content is required"), {
        status: 400,
      });
    }

    const [created] = await db.insert(feedbacks).values({
      id: `feedback_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: name?.trim() || null,
      content: feedback.trim(),
      source: source?.trim() || null,
    }).returning();

    return NextResponse.json(AjaxResponse.ok(created));
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return NextResponse.json(AjaxResponse.fail("Failed to submit feedback"), {
      status: 500,
    });
  }
}

// GET /api/feedback - list feedback (admin only)
export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.success) {
      return NextResponse.json(
        AjaxResponse.fail(adminCheck.message),
        { status: adminCheck.status }
      );
    }

    const items = await db.query.feedbacks.findMany({
      orderBy: desc(feedbacks.createdAt),
      limit: 100,
    });
    return NextResponse.json(AjaxResponse.ok(items));
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return NextResponse.json(AjaxResponse.fail("Failed to fetch feedback"), {
      status: 500,
    });
  }
}
