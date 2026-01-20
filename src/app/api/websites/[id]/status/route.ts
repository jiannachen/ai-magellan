import { NextResponse } from "next/server";
import { AjaxResponse } from "@/lib/utils";
import { getDB } from "@/lib/db";
import { websites } from "@/lib/db/schema";
import { eq } from "drizzle-orm";


export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const db = getDB();
    const { status } = await request.json() as { status: string };
    const websiteId = parseInt(params.id);

    if (isNaN(websiteId)) {
      return NextResponse.json(AjaxResponse.fail("Invalid website ID"), {
        status: 400,
      });
    }

    const website = await db.query.websites.findFirst({
      where: eq(websites.id, websiteId),
    });

    if (!website) {
      return NextResponse.json(AjaxResponse.fail("Website not found"), {
        status: 404,
      });
    }

    await db.update(websites)
      .set({ status })
      .where(eq(websites.id, websiteId));

    return NextResponse.json(AjaxResponse.ok("Status updated"));
  } catch (error) {
    console.error("Failed to update website status:", error);
    return NextResponse.json(AjaxResponse.fail("Failed to update status"), {
      status: 500,
    });
  }
}
