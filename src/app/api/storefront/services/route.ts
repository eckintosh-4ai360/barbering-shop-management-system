import { NextResponse } from "next/server";
import { db } from "@/db";
import { storefrontServices, auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// Prices are entered on the admin side as decimal GH₵ (e.g. "45.00") and stored
// in the storefront_services table as integer cents (4500), matching how the
// client app renders and totals prices throughout its cart/checkout flow.
export async function GET() {
  try {
    const list = await db.select().from(storefrontServices).orderBy(desc(storefrontServices.createdAt));
    return NextResponse.json({ services: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch storefront services" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { name, description, price, durationMinutes, category, imageUrl, isActive } = await req.json();

    if (!name || price === undefined || price === null || !category) {
      return NextResponse.json({ error: "Name, category, and price are required" }, { status: 400 });
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }

    const [newService] = await db
      .insert(storefrontServices)
      .values({
        name,
        description,
        price: Math.round(priceNum * 100),
        durationMinutes: parseInt(durationMinutes) || 30,
        category,
        imageUrl: imageUrl || "",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      })
      .returning();

    await db.insert(auditLogs).values({
      userId: auth.id,
      userName: auth.name,
      action: "Created Website Service",
      details: `Added "${name}" (GH₵ ${priceNum.toFixed(2)}) to the public services menu`,
    });

    return NextResponse.json({ success: true, service: newService });
  } catch (error) {
    console.error("Create storefront service error:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
