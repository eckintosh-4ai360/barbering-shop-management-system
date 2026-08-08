import { NextResponse } from "next/server";
import { db } from "@/db";
import { visits, expenses, barbers, services, dailyClosings } from "@/db/schema";
import { gte, lte, and, eq, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "today"; // 'today' | 'week' | 'month' | 'last_month' | 'custom'
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let start = new Date();
    let end = new Date();

    const now = new Date();

    if (range === "today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (range === "week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else if (range === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (range === "last_month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (range === "custom" && startDateParam && endDateParam) {
      start = new Date(startDateParam);
      end = new Date(endDateParam);
      end.setHours(23, 59, 59, 999);
    }

    // Fetch visits in date range
    const rangeVisits = await db
      .select()
      .from(visits)
      .where(and(gte(visits.createdAt, start), lte(visits.createdAt, end)));

    // Fetch expenses in date range
    const startIso = start.toISOString().split("T")[0];
    const endIso = end.toISOString().split("T")[0];

    const rangeExpenses = await db
      .select()
      .from(expenses)
      .where(and(gte(expenses.expenseDate, startIso), lte(expenses.expenseDate, endIso)));

    // Calculations
    const totalCustomers = rangeVisits.length;
    const completedCount = rangeVisits.filter((v) => v.visitStatus === "completed").length;
    const waitingCount = rangeVisits.filter((v) => v.visitStatus === "waiting").length;
    const inProgressCount = rangeVisits.filter((v) => v.visitStatus === "in_progress").length;
    const cancelledCount = rangeVisits.filter((v) => v.visitStatus === "cancelled").length;

    const totalRevenue = rangeVisits
      .filter((v) => v.visitStatus !== "cancelled")
      .reduce((sum, v) => sum + parseFloat(v.amount || "0"), 0);

    const totalExpenses = rangeExpenses.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);

    const totalBarberCommissions = rangeVisits
      .filter((v) => v.visitStatus !== "cancelled")
      .reduce((sum, v) => sum + parseFloat(v.barberCommissionAmount || "0"), 0);

    const netProfit = totalRevenue - totalExpenses;
    const shopNetProfit = totalRevenue - totalExpenses - totalBarberCommissions;

    // Payment method breakdown
    let cashSales = 0;
    let momoSales = 0;
    let cardSales = 0;
    let otherSales = 0;

    rangeVisits.forEach((v) => {
      if (v.visitStatus === "cancelled") return;
      const amt = parseFloat(v.amount || "0");
      if (v.paymentMethod === "Cash") cashSales += amt;
      else if (v.paymentMethod === "Mobile Money") momoSales += amt;
      else if (v.paymentMethod === "Card") cardSales += amt;
      else otherSales += amt;
    });

    // Check today closing status
    const todayStr = new Date().toISOString().split("T")[0];
    const todayClosing = await db
      .select()
      .from(dailyClosings)
      .where(eq(dailyClosings.closingDate, todayStr));

    const isClosedToday = todayClosing.length > 0 && todayClosing[0].status === "closed";

    // Barber performance breakdown in range
    const allBarbers = await db.select().from(barbers);
    const barberPerformance = allBarbers.map((barber) => {
      const barberVisits = rangeVisits.filter((v) => v.barberId === barber.id && v.visitStatus !== "cancelled");
      const customersCount = barberVisits.length;
      const revenue = barberVisits.reduce((sum, v) => sum + parseFloat(v.amount || "0"), 0);
      const commission = barberVisits.reduce((sum, v) => sum + parseFloat(v.barberCommissionAmount || "0"), 0);

      return {
        id: barber.id,
        name: barber.name,
        phone: barber.phone,
        status: barber.status,
        commissionRate: barber.commissionRate,
        customersToday: customersCount,
        revenue,
        commission,
      };
    });

    // Chart Data (daily points for current selection)
    const chartData: Record<string, { date: string; label: string; revenue: number; expenses: number; profit: number }> = {};

    // Populate chart dates
    const current = new Date(start);
    while (current <= end) {
      const dKey = current.toISOString().split("T")[0];
      const dayLabel = current.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      chartData[dKey] = { date: dKey, label: dayLabel, revenue: 0, expenses: 0, profit: 0 };
      current.setDate(current.getDate() + 1);
    }

    rangeVisits.forEach((v) => {
      if (v.visitStatus === "cancelled") return;
      const dKey = new Date(v.createdAt).toISOString().split("T")[0];
      if (chartData[dKey]) {
        chartData[dKey].revenue += parseFloat(v.amount || "0");
      }
    });

    rangeExpenses.forEach((e) => {
      if (chartData[e.expenseDate]) {
        chartData[e.expenseDate].expenses += parseFloat(e.amount || "0");
      }
    });

    Object.keys(chartData).forEach((key) => {
      chartData[key].profit = chartData[key].revenue - chartData[key].expenses;
    });

    return NextResponse.json({
      summary: {
        totalCustomers,
        completedCount,
        waitingCount,
        inProgressCount,
        cancelledCount,
        totalRevenue,
        totalExpenses,
        netProfit,
        totalBarberCommissions,
        shopNetProfit,
        isClosedToday,
      },
      paymentBreakdown: {
        cash: cashSales,
        momo: momoSales,
        card: cardSales,
        other: otherSales,
        total: totalRevenue,
      },
      barberPerformance,
      chartData: Object.values(chartData),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
