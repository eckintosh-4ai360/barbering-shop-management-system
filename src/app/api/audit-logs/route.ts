import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { desc, like, or } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let whereClause = undefined;
    if (search) {
      whereClause = or(
        like(auditLogs.action, `%${search}%`),
        like(auditLogs.details, `%${search}%`),
        like(auditLogs.userName, `%${search}%`)
      );
    }

    const list = await db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);

    return NextResponse.json({ logs: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
