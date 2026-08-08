import { NextResponse } from "next/server";
import { db } from "@/db";
import { expenses, auditLogs } from "@/db/schema";
import { desc, eq, and, gte, lte } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // 'today' | 'YYYY-MM-DD' | 'all'
    const category = searchParams.get("category");

    let conditions = [];

    if (date === "today") {
      const todayIso = new Date().toISOString().split("T")[0];
      conditions.push(eq(expenses.expenseDate, todayIso));
    } else if (date && date !== "all") {
      conditions.push(eq(expenses.expenseDate, date));
    }

    if (category && category !== "all") {
      conditions.push(eq(expenses.category, category));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const list = await db
      .select()
      .from(expenses)
      .where(whereClause)
      .orderBy(desc(expenses.createdAt));

    const totalAmount = list.reduce((sum, item) => sum + parseFloat(item.amount || "0"), 0);

    return NextResponse.json({ expenses: list, totalAmount });
  } catch (error) {
    console.error("Fetch expenses error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const {
      category,
      description,
      amount,
      expenseDate = new Date().toISOString().split("T")[0],
      recordedByName = "Admin",
      recordedById = null,
    } = await req.json();

    if (!category || !description || amount === undefined || amount === null) {
      return NextResponse.json({ error: "Category, description, and amount are required." }, { status: 400 });
    }

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      return NextResponse.json({ error: "Valid expense amount is required." }, { status: 400 });
    }

    const [newExpense] = await db
      .insert(expenses)
      .values({
        category,
        description,
        amount: amtNum.toFixed(2),
        expenseDate,
        recordedById,
        recordedByName,
      })
      .returning();

    await db.insert(auditLogs).values({
      userId: recordedById,
      userName: recordedByName,
      action: "Recorded Expense",
      details: `Added expense [${category}]: ${description} - GH₵ ${amtNum.toFixed(2)} on ${expenseDate}`,
    });

    return NextResponse.json({ success: true, expense: newExpense });
  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json({ error: "Failed to record expense" }, { status: 500 });
  }
}
