import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    const body = await req.json();
    const { status, updatedByName = "Staff", userId = null } = body;

    const existing = await db.select().from(orders).where(eq(orders.id, orderId));
    if (existing.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const current = existing[0];

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (status !== undefined) updateData.status = status;

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();

    await db.insert(auditLogs).values({
      userId,
      userName: updatedByName,
      action: "Updated Online Order",
      details: `Updated order ${current.orderCode} (${current.customerName}) status to "${status}"`,
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Update online order error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
