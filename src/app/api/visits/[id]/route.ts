import { NextResponse } from "next/server";
import { db } from "@/db";
import { visits, auditLogs, barbers, services } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const visitId = parseInt(id);

    const result = await db.select().from(visits).where(eq(visits.id, visitId));
    if (result.length === 0) {
      return NextResponse.json({ error: "Visit record not found" }, { status: 404 });
    }

    return NextResponse.json({ visit: result[0] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch visit" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const visitId = parseInt(id);
    const body = await req.json();

    const {
      visitStatus,
      paymentMethod,
      amount,
      barberId,
      serviceId,
      notes,
      updatedByName = "Staff",
      userId = null,
    } = body;

    const existingVisits = await db.select().from(visits).where(eq(visits.id, visitId));
    if (existingVisits.length === 0) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }

    const current = existingVisits[0];
    const updateData: Record<string, any> = {};

    if (visitStatus !== undefined) {
      updateData.visitStatus = visitStatus;
      if (visitStatus === "completed" && !current.completedAt) {
        updateData.completedAt = new Date();
      }
    }

    if (paymentMethod !== undefined) {
      updateData.paymentMethod = paymentMethod;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (amount !== undefined) {
      const newAmt = parseFloat(amount);
      updateData.amount = newAmt.toFixed(2);

      // Recalculate barber commission if amount changed
      if (current.barberId) {
        const barberResult = await db.select().from(barbers).where(eq(barbers.id, current.barberId));
        if (barberResult.length > 0) {
          const commPct = parseFloat(barberResult[0].commissionRate || "40.00") / 100;
          updateData.barberCommissionAmount = (newAmt * commPct).toFixed(2);
        }
      }
    }

    if (barberId !== undefined && barberId !== current.barberId) {
      const barberResult = await db.select().from(barbers).where(eq(barbers.id, parseInt(barberId)));
      if (barberResult.length > 0) {
        updateData.barberId = barberResult[0].id;
        updateData.barberName = barberResult[0].name;

        // Recalculate commission for new barber
        const amt = amount !== undefined ? parseFloat(amount) : parseFloat(current.amount);
        const commPct = parseFloat(barberResult[0].commissionRate || "40.00") / 100;
        updateData.barberCommissionAmount = (amt * commPct).toFixed(2);
      }
    }

    if (serviceId !== undefined && serviceId !== current.serviceId) {
      const serviceResult = await db.select().from(services).where(eq(services.id, parseInt(serviceId)));
      if (serviceResult.length > 0) {
        updateData.serviceId = serviceResult[0].id;
        updateData.serviceName = serviceResult[0].name;
      }
    }

    const [updatedVisit] = await db
      .update(visits)
      .set(updateData)
      .where(eq(visits.id, visitId))
      .returning();

    // Log in audit trail
    await db.insert(auditLogs).values({
      userId,
      userName: updatedByName,
      action: "Updated Transaction",
      details: `Updated visit ${current.visitNumber} (${current.customerName}): ${JSON.stringify(updateData)}`,
    });

    return NextResponse.json({ success: true, visit: updatedVisit });
  } catch (error) {
    console.error("Update visit error:", error);
    return NextResponse.json({ error: "Failed to update visit" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const visitId = parseInt(id);

    const existingVisits = await db.select().from(visits).where(eq(visits.id, visitId));
    if (existingVisits.length === 0) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    }

    const current = existingVisits[0];

    // Set visitStatus to 'cancelled' instead of hard delete for audit tracking
    const [cancelledVisit] = await db
      .update(visits)
      .set({ visitStatus: "cancelled" })
      .where(eq(visits.id, visitId))
      .returning();

    await db.insert(auditLogs).values({
      userId: null,
      userName: "Staff",
      action: "Cancelled Visit",
      details: `Cancelled visit ${current.visitNumber} for customer ${current.customerName} (GH₵ ${current.amount})`,
    });

    return NextResponse.json({ success: true, visit: cancelledVisit });
  } catch (error) {
    console.error("Cancel visit error:", error);
    return NextResponse.json({ error: "Failed to cancel visit" }, { status: 500 });
  }
}
