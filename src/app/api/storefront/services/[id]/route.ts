import { NextResponse } from "next/server";
import { db } from "@/db";
import { storefrontServices, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const serviceId = parseInt(id);
    const body = await req.json();

    const { name, description, price, durationMinutes, category, imageUrl, isActive } = body;

    const existing = await db.select().from(storefrontServices).where(eq(storefrontServices.id, serviceId));
    if (existing.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Math.round(Number(price) * 100);
    if (durationMinutes !== undefined) updateData.durationMinutes = parseInt(durationMinutes);
    if (category !== undefined) updateData.category = category;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const [updated] = await db
      .update(storefrontServices)
      .set(updateData)
      .where(eq(storefrontServices.id, serviceId))
      .returning();

    await db.insert(auditLogs).values({
      userId: auth.id,
      userName: auth.name,
      action: "Updated Website Service",
      details: `Updated website service: ${existing[0].name}`,
    });

    return NextResponse.json({ success: true, service: updated });
  } catch (error) {
    console.error("Update storefront service error:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const serviceId = parseInt(id);

    const existing = await db.select().from(storefrontServices).where(eq(storefrontServices.id, serviceId));
    if (existing.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await db.delete(storefrontServices).where(eq(storefrontServices.id, serviceId));

    await db.insert(auditLogs).values({
      userId: auth.id,
      userName: auth.name,
      action: "Deleted Website Service",
      details: `Removed "${existing[0].name}" from the public services menu`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete storefront service error:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
