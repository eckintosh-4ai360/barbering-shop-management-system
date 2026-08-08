import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(settings);
    if (list.length === 0) {
      const [inserted] = await db
        .insert(settings)
        .values({
          shopName: "Executive Barber Lounge",
          currencySymbol: "GH₵",
          phone: "+233 24 123 4567",
          address: "Airport Residential Area, Accra, Ghana",
          momoNumber: "024 123 4567 (MTN MoMo)",
          receiptFooter: "Thank you for grooming with us!",
          defaultCommissionRate: "40.00",
        })
        .returning();
      return NextResponse.json({ settings: inserted });
    }
    return NextResponse.json({ settings: list[0] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const list = await db.select().from(settings);
    if (list.length === 0) {
      const [inserted] = await db.insert(settings).values(body).returning();
      return NextResponse.json({ settings: inserted });
    }

    const currentId = list[0].id;
    const [updated] = await db
      .update(settings)
      .set(body)
      .where(eq(settings.id, currentId))
      .returning();

    await db.insert(auditLogs).values({
      userId: null,
      userName: "Admin",
      action: "Updated Shop Settings",
      details: `Updated shop configuration: ${JSON.stringify(body)}`,
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
