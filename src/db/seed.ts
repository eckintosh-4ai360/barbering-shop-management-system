import { db } from "./index";
import { users, barbers, services, customers, visits, expenses, auditLogs, settings } from "./schema";
import { count } from "drizzle-orm";

export async function seedDatabase() {
  try {
    const userCountResult = await db.select({ count: count() }).from(users);
    if (userCountResult[0].count > 0) {
      return { message: "Database already seeded" };
    }

    // 1. Seed Settings
    await db.insert(settings).values({
      shopName: "Executive Barber Lounge",
      currencySymbol: "GH₵",
      phone: "+233 24 123 4567",
      address: "Airport Residential Area, Accra, Ghana",
      momoNumber: "024 123 4567 (MTN MoMo)",
      receiptFooter: "Thank you for grooming with us! Premium style guaranteed.",
      defaultCommissionRate: "40.00",
    });

    // 2. Seed Users
    const [adminUser] = await db.insert(users).values([
      {
        name: "E-Shop Owner",
        email: "admin@barber.com",
        password: "admin123",
        role: "admin",
        phone: "+233 20 111 2233",
        avatarInitials: "EO",
        isActive: true,
      },
      {
        name: "Abena Mansa",
        email: "receptionist@barber.com",
        password: "receptionist123",
        role: "receptionist",
        phone: "+233 24 999 8877",
        avatarInitials: "AM",
        isActive: true,
      }
    ]).returning();

    // 3. Seed Barbers
    const insertedBarbers = await db.insert(barbers).values([
      { name: "Michael Mensah", phone: "+233 24 555 0101", status: "active", commissionRate: "40.00", specialties: "Skin Fade, Haircuts, Beard Shaping" },
      { name: "Daniel Osei", phone: "+233 24 555 0102", status: "active", commissionRate: "40.00", specialties: "Executive Cut, Beard Trim, Hot Towel" },
      { name: "Samuel Addo", phone: "+233 24 555 0103", status: "active", commissionRate: "40.00", specialties: "Kids Cuts, Hair Wash, Scalp Treatment" },
      { name: "Emmanuel Boateng", phone: "+233 24 555 0104", status: "active", commissionRate: "40.00", specialties: "Dreadlocks, Hair Color, Lineup" },
    ]).returning();

    // 4. Seed Services
    const insertedServices = await db.insert(services).values([
      { name: "Haircut", category: "Haircut", price: "50.00", durationMin: 30, status: "active" },
      { name: "Haircut + Beard", category: "Combos", price: "80.00", durationMin: 45, status: "active" },
      { name: "Beard Trim", category: "Beard", price: "30.00", durationMin: 20, status: "active" },
      { name: "Kids Haircut", category: "Kids", price: "40.00", durationMin: 25, status: "active" },
      { name: "Hair Wash & Treatment", category: "Washing & Treatments", price: "25.00", durationMin: 20, status: "active" },
      { name: "Executive VIP Grooming", category: "Combos", price: "150.00", durationMin: 60, status: "active" },
      { name: "Hair Dye / Color", category: "Other", price: "70.00", durationMin: 40, status: "active" },
    ]).returning();

    // 5. Seed Customers
    const insertedCustomers = await db.insert(customers).values([
      { name: "John Mahama", phone: "+233 24 100 0001", totalVisits: 5 },
      { name: "David Kwarteng", phone: "+233 24 100 0002", totalVisits: 3 },
      { name: "Kwame Appiah", phone: "+233 24 100 0003", totalVisits: 8 },
      { name: "Yaw Frimpong", phone: "+233 24 100 0004", totalVisits: 2 },
      { name: "Kwadwo Asare", phone: "+233 24 100 0005", totalVisits: 4 },
      { name: "Prince Tagoe", phone: "+233 24 100 0006", totalVisits: 1 },
      { name: "Kojo Baah", phone: "+233 24 100 0007", totalVisits: 6 },
    ]).returning();

    // 6. Seed Today's & Past Visits
    const now = new Date();

    const sampleVisits = [
      {
        visitNumber: "VIS-1001",
        customerId: insertedCustomers[0].id,
        customerName: "John Mahama",
        customerPhone: "+233 24 100 0001",
        serviceId: insertedServices[0].id,
        serviceName: "Haircut",
        barberId: insertedBarbers[0].id,
        barberName: "Michael Mensah",
        amount: "50.00",
        paymentMethod: "Cash",
        paymentStatus: "paid",
        visitStatus: "completed",
        receptionistId: adminUser.id,
        receptionistName: adminUser.name,
        barberCommissionAmount: "20.00",
        notes: "Regular skin fade",
        createdAt: new Date(now.getTime() - 4 * 3600 * 1000),
        completedAt: new Date(now.getTime() - 3.5 * 3600 * 1000),
      },
      {
        visitNumber: "VIS-1002",
        customerId: insertedCustomers[1].id,
        customerName: "David Kwarteng",
        customerPhone: "+233 24 100 0002",
        serviceId: insertedServices[1].id,
        serviceName: "Haircut + Beard",
        barberId: insertedBarbers[1].id,
        barberName: "Daniel Osei",
        amount: "80.00",
        paymentMethod: "Mobile Money",
        paymentStatus: "paid",
        visitStatus: "completed",
        receptionistId: adminUser.id,
        receptionistName: adminUser.name,
        barberCommissionAmount: "32.00",
        notes: "Beard oil applied",
        createdAt: new Date(now.getTime() - 3 * 3600 * 1000),
        completedAt: new Date(now.getTime() - 2.2 * 3600 * 1000),
      },
      {
        visitNumber: "VIS-1003",
        customerId: insertedCustomers[2].id,
        customerName: "Kwame Appiah",
        customerPhone: "+233 24 100 0003",
        serviceId: insertedServices[0].id,
        serviceName: "Haircut",
        barberId: insertedBarbers[0].id,
        barberName: "Michael Mensah",
        amount: "50.00",
        paymentMethod: "Cash",
        paymentStatus: "paid",
        visitStatus: "waiting",
        receptionistId: adminUser.id,
        receptionistName: adminUser.name,
        barberCommissionAmount: "20.00",
        notes: "In waiting queue",
        createdAt: new Date(now.getTime() - 40 * 60 * 1000),
        completedAt: null,
      },
      {
        visitNumber: "VIS-1004",
        customerId: insertedCustomers[3].id,
        customerName: "Yaw Frimpong",
        customerPhone: "+233 24 100 0004",
        serviceId: insertedServices[5].id,
        serviceName: "Executive VIP Grooming",
        barberId: insertedBarbers[2].id,
        barberName: "Samuel Addo",
        amount: "150.00",
        paymentMethod: "Card",
        paymentStatus: "paid",
        visitStatus: "in_progress",
        receptionistId: adminUser.id,
        receptionistName: adminUser.name,
        barberCommissionAmount: "60.00",
        notes: "Full hot towel & facial massage",
        createdAt: new Date(now.getTime() - 20 * 60 * 1000),
        completedAt: null,
      },
      {
        visitNumber: "VIS-1005",
        customerId: insertedCustomers[4].id,
        customerName: "Kwadwo Asare",
        customerPhone: "+233 24 100 0005",
        serviceId: insertedServices[2].id,
        serviceName: "Beard Trim",
        barberId: insertedBarbers[1].id,
        barberName: "Daniel Osei",
        amount: "30.00",
        paymentMethod: "Mobile Money",
        paymentStatus: "paid",
        visitStatus: "completed",
        receptionistId: adminUser.id,
        receptionistName: adminUser.name,
        barberCommissionAmount: "12.00",
        notes: "",
        createdAt: new Date(now.getTime() - 1.5 * 3600 * 1000),
        completedAt: new Date(now.getTime() - 1.2 * 3600 * 1000),
      },
    ];

    await db.insert(visits).values(sampleVisits);

    // 7. Seed Expenses
    const todayStr = new Date().toISOString().split("T")[0];
    await db.insert(expenses).values([
      {
        category: "Electricity",
        description: "Monthly electricity bill",
        amount: "350.00",
        expenseDate: todayStr,
        recordedById: adminUser.id,
        recordedByName: adminUser.name,
      },
      {
        category: "Hair products",
        description: "Wave pomade & beard oil restock",
        amount: "150.00",
        expenseDate: todayStr,
        recordedById: adminUser.id,
        recordedByName: adminUser.name,
      },
      {
        category: "Cleaning supplies",
        description: "Disinfectant sprays and neck strips",
        amount: "80.00",
        expenseDate: todayStr,
        recordedById: adminUser.id,
        recordedByName: adminUser.name,
      },
    ]);

    // 8. Seed Audit Logs
    await db.insert(auditLogs).values([
      {
        userId: adminUser.id,
        userName: adminUser.name,
        action: "System Initialized",
        details: "Database populated with initial demo barbers, services, and transactions.",
      },
      {
        userId: adminUser.id,
        userName: adminUser.name,
        action: "Walk-in Registered",
        details: "Registered Kwame Appiah for Haircut (GH₵ 50.00) assigned to Michael Mensah.",
      },
      {
        userId: adminUser.id,
        userName: adminUser.name,
        action: "Expense Recorded",
        details: "Added Electricity expense of GH₵ 350.00",
      },
    ]);

    return { message: "Database successfully seeded" };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { error: String(error) };
  }
}
