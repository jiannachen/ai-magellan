import { NextResponse } from "next/server";
import { AjaxResponse } from "@/lib/utils";
import { db } from "@/lib/db/db";
import { websites } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// POST /api/websites/[id]/visit
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const websiteId = parseInt(params.id);

    if (isNaN(websiteId)) {
      return NextResponse.json(AjaxResponse.fail("Invalid website ID"), {
        status: 400,
      });
    }

    const [updatedWebsite] = await db.update(websites)
      .set({ visits: sql`${websites.visits} + 1` })
      .where(eq(websites.id, websiteId))
      .returning();

    return NextResponse.json(
      AjaxResponse.ok({ visits: updatedWebsite.visits })
    );
  } catch (error) {
    console.error("Failed to increment visits:", error);
    return NextResponse.json(AjaxResponse.fail("Failed to increment visits"), {
      status: 500,
    });
  }
}
