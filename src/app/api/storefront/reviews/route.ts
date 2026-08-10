import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews, storefrontBarbers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({
        review: reviews,
        barberName: storefrontBarbers.name,
      })
      .from(reviews)
      .leftJoin(storefrontBarbers, eq(reviews.barberId, storefrontBarbers.id))
      .orderBy(desc(reviews.createdAt));

    const list = rows.map((r) => ({ ...r.review, barberName: r.barberName }));

    return NextResponse.json({ reviews: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
