import { NextResponse } from "next/server";
import { db } from "@/db";
import { dailyClosings, visits, expenses, auditLogs } from "@/db/schema";
import { eq, gte, lte, and, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

    // Check if closing record exists for date
    const existingClosing = await db
      .select()
      .from(dailyClosings)
      .where(eq(dailyClosings.closingDate, targetDate));

    // Calculate real-time numbers for targetDate
    const dateObj = new Date(targetDate);
    const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0);
    const endOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59);

    const dayVisits = await db
      .select()
      .from(visits)
      .where(and(gte(visits.createdAt, startOfDay), lte(visits.createdAt, endOfDay)));

    const dayExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.expenseDate, targetDate));

    let cashSales = 0;
    let momoSales = 0;
    let cardSales = 0;
    let otherSales = 0;

    dayVisits.forEach((v) => {
      if (v.visitStatus === "cancelled") return;
      const amt = parseFloat(v.amount || "0");
      if (v.paymentMethod === "Cash") cashSales += amt;
      else if (v.paymentMethod === "Mobile Money") momoSales += amt;
      else if (v.paymentMethod === "Card") cardSales += amt;
      else otherSales += amt;
    });

    const totalCustomers = dayVisits.filter((v) => v.visitStatus !== "cancelled").length;
    const totalSales = cashSales + momoSales + cardSales + otherSales;
    const totalExpenses = dayExpenses.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);
    const expectedBalance = totalSales - totalExpenses;

    const closingHistory = await db.select().from(dailyClosings).orderBy(desc(dailyClosings.createdAt)).limit(10);

    return NextResponse.json({
      closing: existingClosing.length > 0 ? existingClosing[0] : null,
      liveSummary: {
        date: targetDate,
        totalCustomers,
        cashSales,
        momoSales,
        cardSales,
        otherSales,
        totalSales,
        totalExpenses,
        expectedBalance,
      },
      history: closingHistory,
    });
  } catch (error) {
    console.error("Daily closing error:", error);
    return NextResponse.json({ error: "Failed to fetch daily closing data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      closingDate = new Date().toISOString().split("T")[0],
      actualCashCounted,
      notes = "",
      closedByName = "Staff",
      closedById = null,
    } = body;

    const dateObj = new Date(closingDate);
    const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 0, 0, 0);
    const endOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59);

    const dayVisits = await db
      .select()
      .from(visits)
      .where(and(gte(visits.createdAt, startOfDay), lte(visits.createdAt, endOfDay)));

    const dayExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.expenseDate, closingDate));

    let cashSales = 0;
    let momoSales = 0;
    let cardSales = 0;
    let otherSales = 0;

    dayVisits.forEach((v) => {
      if (v.visitStatus === "cancelled") return;
      const amt = parseFloat(v.amount || "0");
      if (v.paymentMethod === "Cash") cashSales += amt;
      else if (v.paymentMethod === "Mobile Money") momoSales += amt;
      else if (v.paymentMethod === "Card") cardSales += amt;
      else otherSales += amt;
    });

    const totalCustomers = dayVisits.filter((v) => v.visitStatus !== "cancelled").length;
    const totalSales = cashSales + momoSales + cardSales + otherSales;
    const totalExpenses = dayExpenses.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);
    const expectedBalance = totalSales - totalExpenses;

    const actualCash = parseFloat(actualCashCounted !== undefined ? actualCashCounted : expectedBalance);
    const discrepancy = actualCash - expectedBalance;

    // Insert or update daily closing
    const existing = await db.select().from(dailyClosings).where(eq(dailyClosings.closingDate, closingDate));

    let closingRecord;
    if (existing.length > 0) {
      const [updated] = await db
        .update(dailyClosings)
        .set({
          closedById,
          closedByName,
          totalCustomers,
          cashSales: cashSales.toFixed(2),
          momoSales: momoSales.toFixed(2),
          cardSales: cardSales.toFixed(2),
          otherSales: otherSales.toFixed(2),
          totalSales: totalSales.toFixed(2),
          totalExpenses: totalExpenses.toFixed(2),
          expectedBalance: expectedBalance.toFixed(2),
          actualCashCounted: actualCash.toFixed(2),
          discrepancy: discrepancy.toFixed(2),
          notes,
          status: "closed",
        })
        .where(eq(dailyClosings.closingDate, closingDate))
        .returning();
      closingRecord = updated;
    } else {
      const [inserted] = await db
        .insert(dailyClosings)
        .values({
          closingDate,
          closedById,
          closedByName,
          totalCustomers,
          cashSales: cashSales.toFixed(2),
          momoSales: momoSales.toFixed(2),
          cardSales: cardSales.toFixed(2),
          otherSales: otherSales.toFixed(2),
          totalSales: totalSales.toFixed(2),
          totalExpenses: totalExpenses.toFixed(2),
          expectedBalance: expectedBalance.toFixed(2),
          actualCashCounted: actualCash.toFixed(2),
          discrepancy: discrepancy.toFixed(2),
          notes,
          status: "closed",
        })
        .returning();
      closingRecord = inserted;
    }

    await db.insert(auditLogs).values({
      userId: closedById,
      userName: closedByName,
      action: "Executed Daily Closing",
      details: `Executed EOD closing for ${closingDate}. Total Sales: GH₵ ${totalSales.toFixed(2)}, Expenses: GH₵ ${totalExpenses.toFixed(2)}, Expected Balance: GH₵ ${expectedBalance.toFixed(2)}, Cash Counted: GH₵ ${actualCash.toFixed(2)}, Discrepancy: GH₵ ${discrepancy.toFixed(2)}`,
    });

    return NextResponse.json({ success: true, closing: closingRecord });
  } catch (error) {
    console.error("Execute daily closing error:", error);
    return NextResponse.json({ error: "Failed to perform daily closing" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { closingDate = new Date().toISOString().split("T")[0], action, userName = "Staff", userId = null } = body;

    if (action === "reopen") {
      const [updated] = await db
        .update(dailyClosings)
        .set({ status: "open" })
        .where(eq(dailyClosings.closingDate, closingDate))
        .returning();

      await db.insert(auditLogs).values({
        userId,
        userName,
        action: "Reopened Daily Register",
        details: `Reopened daily register for date ${closingDate} to allow new transactions.`,
      });

      return NextResponse.json({ success: true, closing: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Reopen daily closing error:", error);
    return NextResponse.json({ error: "Failed to reopen daily register" }, { status: 500 });
  }
}
