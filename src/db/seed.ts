import { db } from "./index";
import { users, barbers, services, customers, visits, expenses, auditLogs, dailyClosings, settings } from "./schema";

export async function clearDatabase() {
  try {
    // Delete all rows from tables in dependent order
    await db.delete(visits);
    await db.delete(expenses);
    await db.delete(dailyClosings);
    await db.delete(auditLogs);
    await db.delete(customers);
    await db.delete(services);
    await db.delete(barbers);
    await db.delete(settings);
    await db.delete(users);

    // Re-insert 1 default shop settings
    await db.insert(settings).values({
      shopName: "Executive Barber Lounge",
      currencySymbol: "GH₵",
      phone: "+233 24 123 4567",
      address: "Airport Residential Area, Accra, Ghana",
      momoNumber: "024 123 4567 (MTN MoMo)",
      receiptFooter: "Thank you for grooming with us!",
      defaultCommissionRate: "40.00",
    });

    // Re-insert essential authentication user accounts (Admin & Receptionist)
    await db.insert(users).values([
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
      },
    ]);

    return { message: "Database cleared successfully. All mock data removed." };
  } catch (error) {
    console.error("Error clearing database:", error);
    return { error: String(error) };
  }
}

// Keep seedDatabase alias pointing to clearDatabase for route compatibility
export const seedDatabase = clearDatabase;
