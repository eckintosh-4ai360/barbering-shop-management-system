import { NextResponse } from "next/server";
import { db } from "@/db";
import { expenses, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const expenseId = parseInt(id);

    const existing = await db.select().from(expenses).where(eq(expenses.id, expenseId));
    if (existing.length === 0) {
      return NextResponse.json({ error: "Expense record not found" }, { status: 404 });
    }

    const exp = existing[0];

    await db.delete(expenses).where(eq(expenses.id, expenseId));

    await db.insert(auditLogs).values({
      userId: null,
      userName: "Admin",
      action: "Deleted Expense",
      details: `Deleted expense [${exp.category}]: ${exp.description} (GH₵ ${exp.amount})`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
