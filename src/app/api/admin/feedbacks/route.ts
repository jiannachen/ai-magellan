import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { getDB } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AjaxResponse } from "@/lib/utils";

// GET /api/admin/feedbacks - Get all feedbacks
export async function GET() {
  try {
    const db = getDB();

    // Only use auth() - avoid expensive currentUser() call
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        AjaxResponse.fail("Unauthorized"),
        { status: 401 }
      );
    }

    // Get current user from database to check admin role
    // The users.id is the Clerk userId
    const currentDbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { role: true },
    });

    if (!currentDbUser || currentDbUser.role !== 'admin') {
      return NextResponse.json(
        AjaxResponse.fail("Access denied"),
        { status: 403 }
      );
    }

    // Get feedbacks list with pagination
    const feedbacksList = await db.query.feedbacks.findMany({
      orderBy: (feedbacks, { desc }) => [desc(feedbacks.createdAt)],
      limit: 100, // Limit to reduce data transfer
    });

    return NextResponse.json(AjaxResponse.ok(feedbacksList));
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json(
      AjaxResponse.fail("Failed to fetch feedbacks"),
      { status: 500 }
    );
  }
}
