import { NextResponse } from "next/server";
import { db } from "@/db";
import { services, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const serviceId = parseInt(id);
    const body = await req.json();

    const { name, category, price, durationMin, status } = body;

    const existing = await db.select().from(services).where(eq(services.id, serviceId));
    if (existing.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price).toFixed(2);
    if (durationMin !== undefined) updateData.durationMin = parseInt(durationMin);
    if (status !== undefined) updateData.status = status;

    const [updatedService] = await db
      .update(services)
      .set(updateData)
      .where(eq(services.id, serviceId))
      .returning();

    await db.insert(auditLogs).values({
      userId: null,
      userName: "Admin",
      action: "Updated Service",
      details: `Updated service ${existing[0].name}: ${JSON.stringify(updateData)}`,
    });

    return NextResponse.json({ success: true, service: updatedService });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const serviceId = parseInt(id);

    const existing = await db.select().from(services).where(eq(services.id, serviceId));
    if (existing.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(services)
      .set({ status: "inactive" })
      .where(eq(services.id, serviceId))
      .returning();

    await db.insert(auditLogs).values({
      userId: null,
      userName: "Admin",
      action: "Deactivated Service",
      details: `Deactivated service ${existing[0].name}`,
    });

    return NextResponse.json({ success: true, service: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to deactivate service" }, { status: 500 });
  }
}
