import { pgTable, serial, text, numeric, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("receptionist"), // 'admin' | 'receptionist'
  phone: text("phone"),
  avatarInitials: text("avatar_initials").notNull().default("EO"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const barbers = pgTable("barbers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  status: text("status").notNull().default("active"), // 'active' | 'inactive'
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull().default("40.00"), // % share for barber
  specialties: text("specialties"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("Haircut"), // 'Haircut' | 'Beard' | 'Combos' | 'Washing & Treatments' | 'Kids' | 'Other'
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  durationMin: integer("duration_min").notNull().default(30),
  status: text("status").notNull().default("active"), // 'active' | 'inactive'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  totalVisits: integer("total_visits").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  visitNumber: text("visit_number").notNull(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  serviceId: integer("service_id").references(() => services.id, { onDelete: "set null" }),
  serviceName: text("service_name").notNull(),
  barberId: integer("barber_id").references(() => barbers.id, { onDelete: "set null" }),
  barberName: text("barber_name").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull().default("Cash"), // 'Cash' | 'Mobile Money' | 'Card' | 'Other'
  paymentStatus: text("payment_status").notNull().default("paid"), // 'paid' | 'unpaid' | 'refunded'
  visitStatus: text("visit_status").notNull().default("waiting"), // 'waiting' | 'in_progress' | 'completed' | 'cancelled'
  receptionistId: integer("receptionist_id").references(() => users.id, { onDelete: "set null" }),
  receptionistName: text("receptionist_name").notNull().default("Receptionist"),
  barberCommissionAmount: numeric("barber_commission_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // 'Electricity' | 'Water' | 'Rent' | 'Cleaning supplies' | 'Hair products' | 'Equipment' | 'Maintenance' | 'Staff expenses' | 'Other'
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  expenseDate: text("expense_date").notNull(), // 'YYYY-MM-DD'
  recordedById: integer("recorded_by_id").references(() => users.id, { onDelete: "set null" }),
  recordedByName: text("recorded_by_name").notNull().default("Admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyClosings = pgTable("daily_closings", {
  id: serial("id").primaryKey(),
  closingDate: text("closing_date").notNull().unique(), // YYYY-MM-DD
  closedById: integer("closed_by_id").references(() => users.id, { onDelete: "set null" }),
  closedByName: text("closed_by_name").notNull().default("Admin"),
  totalCustomers: integer("total_customers").notNull().default(0),
  cashSales: numeric("cash_sales", { precision: 10, scale: 2 }).notNull().default("0.00"),
  momoSales: numeric("momo_sales", { precision: 10, scale: 2 }).notNull().default("0.00"),
  cardSales: numeric("card_sales", { precision: 10, scale: 2 }).notNull().default("0.00"),
  otherSales: numeric("other_sales", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalSales: numeric("total_sales", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalExpenses: numeric("total_expenses", { precision: 10, scale: 2 }).notNull().default("0.00"),
  expectedBalance: numeric("expected_balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  actualCashCounted: numeric("actual_cash_counted", { precision: 10, scale: 2 }).notNull().default("0.00"),
  discrepancy: numeric("discrepancy", { precision: 10, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  status: text("status").notNull().default("closed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  userName: text("user_name").notNull().default("System"),
  action: text("action").notNull(),
  details: text("details").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  shopName: text("shop_name").notNull().default("Executive Barber Lounge"),
  currencySymbol: text("currency_symbol").notNull().default("GH₵"),
  phone: text("phone").notNull().default("+233 24 123 4567"),
  address: text("address").notNull().default("Airport Residential Area, Accra, Ghana"),
  momoNumber: text("momo_number").notNull().default("024 123 4567 (MTN MoMo)"),
  receiptFooter: text("receipt_footer").notNull().default("Thank you for grooming with us! Please visit us again."),
  defaultCommissionRate: numeric("default_commission_rate", { precision: 5, scale: 2 }).notNull().default("40.00"),
});
