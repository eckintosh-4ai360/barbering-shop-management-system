import { NextResponse } from "next/server";
import { db } from "@/db";
import { barbers, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const barberId = parseInt(id);
    const body = await req.json();

    const { name, phone, commissionRate, specialties, status, photoUrl } = body;

    const existing = await db.select().from(barbers).where(eq(barbers.id, barberId));
    if (existing.length === 0) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (commissionRate !== undefined) updateData.commissionRate = String(commissionRate);
    if (specialties !== undefined) updateData.specialties = specialties;
    if (status !== undefined) updateData.status = status;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl || null;

    const [updatedBarber] = await db
      .update(barbers)
      .set(updateData)
      .where(eq(barbers.id, barberId))
      .returning();

    await db.insert(auditLogs).values({
      userId: null,
      userName: "Admin",
      action: "Updated Barber",
      details: `Updated barber profile for ${existing[0].name}: ${JSON.stringify(updateData)}`,
    });

    return NextResponse.json({ success: true, barber: updatedBarber });
  } catch (error) {
    console.error("Update barber error:", error);
    return NextResponse.json({ error: "Failed to update barber" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const barberId = parseInt(id);

    const existing = await db.select().from(barbers).where(eq(barbers.id, barberId));
    if (existing.length === 0) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 });
    }

    // Toggle to inactive instead of hard deleting to preserve historical visit relationship
    const [updated] = await db
      .update(barbers)
      .set({ status: "inactive" })
      .where(eq(barbers.id, barberId))
      .returning();

    await db.insert(auditLogs).values({
      userId: null,
      userName: "Admin",
      action: "Deactivated Barber",
      details: `Deactivated barber ${existing[0].name}`,
    });

    return NextResponse.json({ success: true, barber: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to deactivate barber" }, { status: 500 });
  }
}
