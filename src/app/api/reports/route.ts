import { NextResponse } from "next/server";
import { db } from "@/db";
import { visits, expenses, barbers, services } from "@/db/schema";
import { gte, lte, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "month"; // 'today' | 'week' | 'month' | 'year' | 'all'

    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (range === "today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (range === "week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else if (range === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (range === "year") {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else {
      start = new Date(2020, 0, 1);
      end = new Date(2030, 11, 31);
    }

    const allVisits = await db
      .select()
      .from(visits)
      .where(and(gte(visits.createdAt, start), lte(visits.createdAt, end)));

    const startIso = start.toISOString().split("T")[0];
    const endIso = end.toISOString().split("T")[0];

    const allExpenses = await db
      .select()
      .from(expenses)
      .where(and(gte(expenses.expenseDate, startIso), lte(expenses.expenseDate, endIso)));

    const validVisits = allVisits.filter((v) => v.visitStatus !== "cancelled");

    // 1. Service Popularity Report
    const serviceMap: Record<string, { serviceName: string; count: number; revenue: number }> = {};
    validVisits.forEach((v) => {
      const sName = v.serviceName || "Other";
      if (!serviceMap[sName]) {
        serviceMap[sName] = { serviceName: sName, count: 0, revenue: 0 };
      }
      serviceMap[sName].count += 1;
      serviceMap[sName].revenue += parseFloat(v.amount || "0");
    });
    const servicesReport = Object.values(serviceMap).sort((a, b) => b.revenue - a.revenue);

    // 2. Barber Report
    const barberMap: Record<string, { barberName: string; count: number; revenue: number; commission: number }> = {};
    validVisits.forEach((v) => {
      const bName = v.barberName || "Unassigned";
      if (!barberMap[bName]) {
        barberMap[bName] = { barberName: bName, count: 0, revenue: 0, commission: 0 };
      }
      barberMap[bName].count += 1;
      barberMap[bName].revenue += parseFloat(v.amount || "0");
      barberMap[bName].commission += parseFloat(v.barberCommissionAmount || "0");
    });
    const barbersReport = Object.values(barberMap).sort((a, b) => b.revenue - a.revenue);

    // 3. Payment Methods Breakdown
    const paymentMap: Record<string, number> = { Cash: 0, "Mobile Money": 0, Card: 0, Other: 0 };
    validVisits.forEach((v) => {
      const method = v.paymentMethod || "Cash";
      paymentMap[method] = (paymentMap[method] || 0) + parseFloat(v.amount || "0");
    });

    // 4. Expenses Category Breakdown
    const expenseCategoryMap: Record<string, number> = {};
    allExpenses.forEach((e) => {
      const cat = e.category || "Other";
      expenseCategoryMap[cat] = (expenseCategoryMap[cat] || 0) + parseFloat(e.amount || "0");
    });

    const totalRevenue = validVisits.reduce((sum, v) => sum + parseFloat(v.amount || "0"), 0);
    const totalExpenses = allExpenses.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);
    const totalCommissions = validVisits.reduce((sum, v) => sum + parseFloat(v.barberCommissionAmount || "0"), 0);
    const shopNetProfit = totalRevenue - totalExpenses - totalCommissions;

    return NextResponse.json({
      financials: {
        totalRevenue,
        totalExpenses,
        totalCommissions,
        netProfit: totalRevenue - totalExpenses,
        shopNetProfit,
        totalVisitsCount: validVisits.length,
      },
      servicesReport,
      barbersReport,
      paymentBreakdown: Object.entries(paymentMap).map(([method, amount]) => ({ method, amount })),
      expensesByCategory: Object.entries(expenseCategoryMap).map(([category, amount]) => ({ category, amount })),
    });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
