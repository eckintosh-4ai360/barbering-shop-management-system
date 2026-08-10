import { NextResponse } from "next/server";
import { db } from "@/db";
import { barbers, visits, auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(barbers).orderBy(desc(barbers.createdAt));
    const allVisits = await db.select().from(visits);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    const barbersWithStats = list.map((barber) => {
      const barberVisits = allVisits.filter((v) => v.barberId === barber.id && v.visitStatus !== "cancelled");
      const todayVisits = barberVisits.filter((v) => new Date(v.createdAt) >= startOfToday);

      const totalCustomers = barberVisits.length;
      const todayCustomers = todayVisits.length;
      const totalRevenue = barberVisits.reduce((sum, v) => sum + parseFloat(v.amount || "0"), 0);
      const todayRevenue = todayVisits.reduce((sum, v) => sum + parseFloat(v.amount || "0"), 0);
      const totalCommission = barberVisits.reduce((sum, v) => sum + parseFloat(v.barberCommissionAmount || "0"), 0);
      const todayCommission = todayVisits.reduce((sum, v) => sum + parseFloat(v.barberCommissionAmount || "0"), 0);

      return {
        ...barber,
        totalCustomers,
        todayCustomers,
        totalRevenue,
        todayRevenue,
        totalCommission,
        todayCommission,
      };
    });

    return NextResponse.json({ barbers: barbersWithStats });
  } catch (error) {
    console.error("Fetch barbers error:", error);
    return NextResponse.json({ error: "Failed to fetch barbers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, phone, commissionRate = "40.00", specialties = "", status = "active", photoUrl } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const [newBarber] = await db
      .insert(barbers)
      .values({
        name,
        phone,
        commissionRate: String(commissionRate),
        specialties,
        status,
        photoUrl: photoUrl || null,
      })
      .returning();

    await db.insert(auditLogs).values({
      userId: null,
      userName: "Admin",
      action: "Created Barber",
      details: `Added new barber: ${name} (${phone}), commission rate: ${commissionRate}%`,
    });

    return NextResponse.json({ success: true, barber: newBarber });
  } catch (error) {
    console.error("Create barber error:", error);
    return NextResponse.json({ error: "Failed to create barber" }, { status: 500 });
  }
}
