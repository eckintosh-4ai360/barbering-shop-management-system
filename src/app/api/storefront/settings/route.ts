import { NextResponse } from "next/server";
import { db } from "@/db";
import { storefrontSettings, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

const EDITABLE_FIELDS = [
  "shopName",
  "tagline",
  "announcementText",
  "heroBadgeText",
  "heroHeading",
  "heroHeadingAccent",
  "heroSubtext",
  "heroImageUrl",
  "statValue1",
  "statLabel1",
  "statValue2",
  "statLabel2",
  "statValue3",
  "statLabel3",
  "whyTitle1",
  "whyText1",
  "whyTitle2",
  "whyText2",
  "whyTitle3",
  "whyText3",
  "footerDescription",
  "footerBadgeText",
  "hoursWeekday",
  "hoursSaturday",
  "hoursSunday",
  "contactAddress",
  "contactPhone",
  "contactEmail",
  "seoTitle",
  "seoDescription",
] as const;

async function getOrCreateSettingsRow() {
  const rows = await db.select().from(storefrontSettings).limit(1);
  if (rows.length > 0) return rows[0];
  const [created] = await db.insert(storefrontSettings).values({}).returning();
  return created;
}

export async function GET() {
  try {
    const row = await getOrCreateSettingsRow();
    return NextResponse.json({ settings: row });
  } catch (error) {
    console.error("Fetch website settings error:", error);
    return NextResponse.json({ error: "Failed to fetch website settings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const current = await getOrCreateSettingsRow();

    const updateData: Record<string, any> = { updatedAt: new Date() };
    for (const field of EDITABLE_FIELDS) {
      if (body[field] !== undefined) updateData[field] = String(body[field]);
    }

    const [updated] = await db
      .update(storefrontSettings)
      .set(updateData)
      .where(eq(storefrontSettings.id, current.id))
      .returning();

    await db.insert(auditLogs).values({
      userId: auth.id,
      userName: auth.name,
      action: "Updated Website Content",
      details: "Updated public website branding/content settings",
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Update website settings error:", error);
    return NextResponse.json({ error: "Failed to update website settings" }, { status: 500 });
  }
}
