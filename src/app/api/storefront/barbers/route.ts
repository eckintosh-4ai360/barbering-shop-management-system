import { NextResponse } from "next/server";
import { db } from "@/db";
import { storefrontBarbers, auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const list = await db.select().from(storefrontBarbers).orderBy(desc(storefrontBarbers.createdAt));
    return NextResponse.json({ barbers: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch storefront barbers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { name, title, bio, avatarUrl, rating, yearsExperience, specialties, phone, isAvailable } = await req.json();

    if (!name || !title) {
      return NextResponse.json({ error: "Name and title are required" }, { status: 400 });
    }

    const [newBarber] = await db
      .insert(storefrontBarbers)
      .values({
        name,
        title,
        bio,
        avatarUrl: avatarUrl || "",
        rating: rating !== undefined && rating !== "" ? String(rating) : "5.00",
        yearsExperience: parseInt(yearsExperience) || 5,
        specialties: specialties || "",
        phone: phone || "",
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      })
      .returning();

    await db.insert(auditLogs).values({
      userId: auth.id,
      userName: auth.name,
      action: "Created Website Barber",
      details: `Added "${name}" to the public website's barber team`,
    });

    return NextResponse.json({ success: true, barber: newBarber });
  } catch (error) {
    console.error("Create storefront barber error:", error);
    return NextResponse.json({ error: "Failed to create barber" }, { status: 500 });
  }
}
