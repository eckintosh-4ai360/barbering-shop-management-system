import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, storefrontBarbers } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const rows = await db
      .select({
        order: orders,
        barberName: storefrontBarbers.name,
        barberTitle: storefrontBarbers.title,
      })
      .from(orders)
      .leftJoin(storefrontBarbers, eq(orders.barberId, storefrontBarbers.id))
      .orderBy(desc(orders.createdAt));

    let filtered = rows;
    if (status && status !== "all") {
      filtered = filtered.filter((r) => r.order.status === status);
    }
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.order.customerName.toLowerCase().includes(lower) ||
          r.order.orderCode.toLowerCase().includes(lower) ||
          r.order.customerPhone.toLowerCase().includes(lower)
      );
    }

    const ordersWithItems = await Promise.all(
      filtered.map(async (r) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, r.order.id));
        return {
          ...r.order,
          barber: r.barberName ? { name: r.barberName, title: r.barberTitle } : null,
          items,
        };
      })
    );

    return NextResponse.json({ orders: ordersWithItems });
  } catch (error) {
    console.error("Fetch online orders error:", error);
    return NextResponse.json({ error: "Failed to fetch online orders" }, { status: 500 });
  }
}
