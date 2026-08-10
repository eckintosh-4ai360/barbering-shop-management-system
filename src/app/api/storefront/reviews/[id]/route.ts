import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const reviewId = parseInt(id);

    const existing = await db.select().from(reviews).where(eq(reviews.id, reviewId));
    if (existing.length === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await db.delete(reviews).where(eq(reviews.id, reviewId));

    await db.insert(auditLogs).values({
      userId: auth.id,
      userName: auth.name,
      action: "Deleted Website Review",
      details: `Removed review by "${existing[0].customerName}" (${existing[0].rating}★) from the public site`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
