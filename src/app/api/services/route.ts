import { NextResponse } from "next/server";
import { db } from "@/db";
import { services, auditLogs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(services).orderBy(desc(services.createdAt));
    return NextResponse.json({ services: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, category = "Haircut", price, durationMin = 30, status = "active" } = await req.json();

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }

    const [newService] = await db
      .insert(services)
      .values({
        name,
        category,
        price: priceNum.toFixed(2),
        durationMin: parseInt(durationMin) || 30,
        status,
      })
      .returning();

    await db.insert(auditLogs).values({
      userId: null,
      userName: "Admin",
      action: "Created Service",
      details: `Created new service: ${name} (GH₵ ${priceNum.toFixed(2)}), category: ${category}`,
    });

    return NextResponse.json({ success: true, service: newService });
  } catch (error) {
    console.error("Create service error:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
