import { NextResponse } from "next/server";
import { db } from "@/db";
import { visits, barbers, services, customers, auditLogs } from "@/db/schema";
import { desc, eq, and, gte, lte, like, or, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // 'today' or 'YYYY-MM-DD' or 'all'
    const status = searchParams.get("status");
    const barberId = searchParams.get("barberId");
    const search = searchParams.get("search");

    let conditions = [];

    if (date === "today" || !date) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      conditions.push(gte(visits.createdAt, startOfDay));
      conditions.push(lte(visits.createdAt, endOfDay));
    } else if (date !== "all") {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
        conditions.push(gte(visits.createdAt, startOfDay));
        conditions.push(lte(visits.createdAt, endOfDay));
      }
    }

    if (status && status !== "all") {
      conditions.push(eq(visits.visitStatus, status));
    }

    if (barberId && barberId !== "all") {
      conditions.push(eq(visits.barberId, parseInt(barberId)));
    }

    if (search) {
      conditions.push(
        or(
          like(visits.customerName, `%${search}%`),
          like(visits.customerPhone, `%${search}%`),
          like(visits.visitNumber, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const list = await db
      .select()
      .from(visits)
      .where(whereClause)
      .orderBy(desc(visits.createdAt));

    return NextResponse.json({ visits: list });
  } catch (error) {
    console.error("Fetch visits error:", error);
    return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      serviceId,
      barberId,
      customPrice,
      paymentMethod = "Cash",
      visitStatus = "waiting",
      receptionistName = "Receptionist",
      receptionistId = null,
      notes = "",
    } = body;

    if (!customerName || !serviceId || !barberId) {
      return NextResponse.json({ error: "Customer name, service, and barber are required." }, { status: 400 });
    }

    // Get Service
    const foundService = await db.select().from(services).where(eq(services.id, parseInt(serviceId)));
    if (foundService.length === 0) {
      return NextResponse.json({ error: "Selected service not found" }, { status: 404 });
    }
    const service = foundService[0];

    // Get Barber
    const foundBarber = await db.select().from(barbers).where(eq(barbers.id, parseInt(barberId)));
    if (foundBarber.length === 0) {
      return NextResponse.json({ error: "Selected barber not found" }, { status: 404 });
    }
    const barber = foundBarber[0];

    // Determine price & barber commission
    const priceAmount = customPrice !== undefined && customPrice !== null && customPrice !== "" 
      ? parseFloat(customPrice) 
      : parseFloat(service.price);

    const commissionPct = parseFloat(barber.commissionRate || "40.00") / 100;
    const barberCommissionAmount = (priceAmount * commissionPct).toFixed(2);

    // Generate Visit Number
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(visits);
    const visitNum = `VIS-${1000 + (Number(countResult[0]?.count || 0) + 1)}`;

    // Find or create customer
    let custId: number | null = null;
    if (customerPhone) {
      const existingCust = await db.select().from(customers).where(eq(customers.phone, customerPhone));
      if (existingCust.length > 0) {
        custId = existingCust[0].id;
        await db.update(customers)
          .set({ totalVisits: (existingCust[0].totalVisits || 0) + 1 })
          .where(eq(customers.id, custId));
      } else {
        const [newCust] = await db.insert(customers).values({
          name: customerName,
          phone: customerPhone,
          totalVisits: 1,
        }).returning();
        custId = newCust.id;
      }
    } else {
      const [newCust] = await db.insert(customers).values({
        name: customerName,
        phone: customerPhone || "",
        totalVisits: 1,
      }).returning();
      custId = newCust.id;
    }

    const completedAt = visitStatus === "completed" ? new Date() : null;

    const [newVisit] = await db.insert(visits).values({
      visitNumber: visitNum,
      customerId: custId,
      customerName,
      customerPhone: customerPhone || "",
      serviceId: service.id,
      serviceName: service.name,
      barberId: barber.id,
      barberName: barber.name,
      amount: priceAmount.toFixed(2),
      paymentMethod,
      paymentStatus: "paid",
      visitStatus,
      receptionistId,
      receptionistName,
      barberCommissionAmount,
      notes,
      completedAt,
    }).returning();

    // Log action in audit logs
    await db.insert(auditLogs).values({
      userId: receptionistId,
      userName: receptionistName,
      action: "Registered Walk-in Customer",
      details: `Registered ${customerName} for ${service.name} (GH₵ ${priceAmount.toFixed(2)}) assigned to ${barber.name}. Payment: ${paymentMethod}.`,
    });

    return NextResponse.json({ success: true, visit: newVisit });
  } catch (error) {
    console.error("Create visit error:", error);
    return NextResponse.json({ error: "Failed to create visit transaction" }, { status: 500 });
  }
}
