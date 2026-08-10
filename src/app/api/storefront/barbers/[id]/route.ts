import { NextResponse } from "next/server";
import { db } from "@/db";
import { storefrontBarbers, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const barberId = parseInt(id);
    const body = await req.json();

    const { name, title, bio, avatarUrl, rating, yearsExperience, specialties, phone, isAvailable } = body;

    const existing = await db.select().from(storefrontBarbers).where(eq(storefrontBarbers.id, barberId));
    if (existing.length === 0) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (title !== undefined) updateData.title = title;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (rating !== undefined) updateData.rating = String(rating);
    if (yearsExperience !== undefined) updateData.yearsExperience = parseInt(yearsExperience) || 0;
    if (specialties !== undefined) updateData.specialties = specialties;
    if (phone !== undefined) updateData.phone = phone;
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);

    const [updated] = await db
      .update(storefrontBarbers)
      .set(updateData)
      .where(eq(storefrontBarbers.id, barberId))
      .returning();

    await db.insert(auditLogs).values({
      userId: auth.id,
      userName: auth.name,
      action: "Updated Website Barber",
      details: `Updated website barber profile: ${existing[0].name}`,
    });

    return NextResponse.json({ success: true, barber: updated });
  } catch (error) {
    console.error("Update storefront barber error:", error);
    return NextResponse.json({ error: "Failed to update barber" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const barberId = parseInt(id);

    const existing = await db.select().from(storefrontBarbers).where(eq(storefrontBarbers.id, barberId));
    if (existing.length === 0) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    await db.delete(storefrontBarbers).where(eq(storefrontBarbers.id, barberId));

    await db.insert(auditLogs).values({
      userId: auth.id,
      userName: auth.name,
      action: "Deleted Website Barber",
      details: `Removed "${existing[0].name}" from the public website's barber team`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete storefront barber error:", error);
    return NextResponse.json({ error: "Failed to delete barber" }, { status: 500 });
  }
}
