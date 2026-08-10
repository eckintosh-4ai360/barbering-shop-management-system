import { NextResponse } from "next/server";
import { db } from "@/db";
import { notificationSettings, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(notificationSettings);
    if (list.length === 0) {
      const [inserted] = await db
        .insert(notificationSettings)
        .values({
          smsEnabled: false,
          mnotifyApiKey: "",
          smsSenderId: "BARBERSHOP",
          emailEnabled: false,
          gmailUser: "",
          gmailAppPassword: "",
          emailFromName: "Eckintosh Barbers",
        })
        .returning();
      return NextResponse.json({ settings: inserted });
    }
    return NextResponse.json({ settings: list[0] });
  } catch (error) {
    console.error("Fetch notification settings error:", error);
    return NextResponse.json({ error: "Failed to fetch notification settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const list = await db.select().from(notificationSettings);
    if (list.length === 0) {
      const [inserted] = await db.insert(notificationSettings).values(body).returning();
      return NextResponse.json({ settings: inserted });
    }

    const currentId = list[0].id;
    const [updated] = await db
      .update(notificationSettings)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(notificationSettings.id, currentId))
      .returning();

    await db.insert(auditLogs).values({
      userId: null,
      userName: "Admin",
      action: "Updated Notification Settings",
      details: "Updated SMS (mNotify) and Email (Gmail) templates and credentials",
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Update notification settings error:", error);
    return NextResponse.json({ error: "Failed to update notification settings" }, { status: 500 });
  }
}
