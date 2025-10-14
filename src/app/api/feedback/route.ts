import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/db";
import { AjaxResponse } from "@/lib/utils";

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

    const created = await prisma.feedback.create({
      data: {
        name: name?.trim() || null,
        content: feedback.trim(),
        source: source?.trim() || null,
      },
    });

    return NextResponse.json(AjaxResponse.ok(created));
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return NextResponse.json(AjaxResponse.fail("Failed to submit feedback"), {
      status: 500,
    });
  }
}

// GET /api/feedback - list feedback (optional public listing)
export async function GET() {
  try {
    const items = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(AjaxResponse.ok(items));
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return NextResponse.json(AjaxResponse.fail("Failed to fetch feedback"), {
      status: 500,
    });
  }
}

