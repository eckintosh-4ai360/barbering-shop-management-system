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
  photoUrl: text("photo_url"), // base64 or URL of barber profile photo
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

// ---------------------------------------------------------------------------
// Tables below are owned by the barber-client-app (the customer-facing online
// booking/shop app), which shares this same database. They're mirrored here,
// column-for-column, so the admin dashboard can read and manage online orders.
// If you change these, make the identical change in barber-client-app/src/db/schema.ts.
// ---------------------------------------------------------------------------

export const storefrontBarbers = pgTable("storefront_barbers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("4.90"),
  yearsExperience: integer("years_experience").notNull().default(5),
  specialties: text("specialties").notNull(),
  phone: text("phone").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storefrontServices = pgTable("storefront_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  durationMinutes: integer("duration_minutes").notNull().default(30),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  stock: integer("stock").notNull().default(50),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderCode: text("order_code").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  barberId: integer("barber_id").references(() => storefrontBarbers.id, { onDelete: "set null" }),
  appointmentDate: text("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  totalAmount: integer("total_amount").notNull(), // in cents
  tipAmount: integer("tip_amount").notNull().default(0), // in cents
  status: text("status").notNull().default("pending"), // pending, confirmed, in_progress, completed, cancelled
  paymentStatus: text("payment_status").notNull().default("paid_at_shop"), // paid_at_shop, paid_online
  beveragePreference: text("beverage_preference"),
  specialNotes: text("special_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  itemType: text("item_type").notNull(), // "service" or "product"
  serviceId: integer("service_id").references(() => storefrontServices.id, { onDelete: "set null" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  itemName: text("item_name").notNull(),
  price: integer("price").notNull(), // in cents
  quantity: integer("quantity").notNull().default(1),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "set null" }),
  barberId: integer("barber_id").references(() => storefrontBarbers.id, { onDelete: "cascade" }),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// storefrontSettings holds every piece of editable marketing copy/branding shown on
// the public client app (brand name, hero section, footer, hours, SEO, etc.) so the
// shop owner can restyle their site's wording/contact info without touching code.
// Single-row table, same pattern as `settings` above. Mirrored in barber-client-app.
export const storefrontSettings = pgTable("storefront_settings", {
  id: serial("id").primaryKey(),

  // Brand
  shopName: text("shop_name").notNull().default("O2 Trims"),
  tagline: text("tagline").notNull().default("Grooming & Barber Co."),
  announcementText: text("announcement_text").notNull().default("Walk-ins Welcome • Online Booking Guarantees Zero Wait Time"),

  // Hero section
  heroBadgeText: text("hero_badge_text").notNull().default("Premier Gentlemen's Barbering Co."),
  heroHeading: text("hero_heading").notNull().default("Master Craftsmanship."),
  heroHeadingAccent: text("hero_heading_accent").notNull().default("Flawless Barbering."),
  heroSubtext: text("hero_subtext").notNull().default("Experience bespoke haircutting, hot steam straight-razor shaves, precision skin fades, and beard sculpting. Relax with complimentary craft beverages in a refined atmosphere."),
  heroImageUrl: text("hero_image_url").notNull().default("https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80"),

  // Stat highlights (3 fixed slots shown under the hero)
  statValue1: text("stat_value_1").notNull().default("14,000+"),
  statLabel1: text("stat_label_1").notNull().default("Haircuts Delivered"),
  statValue2: text("stat_value_2").notNull().default("4.96"),
  statLabel2: text("stat_label_2").notNull().default("Customer Rating"),
  statValue3: text("stat_value_3").notNull().default("100%"),
  statLabel3: text("stat_label_3").notNull().default("Precision Guaranteed"),

  // "Why choose us" cards (3 fixed slots)
  whyTitle1: text("why_title_1").notNull().default("Zero Waiting Time"),
  whyText1: text("why_text_1").notNull().default("Online bookings reserve your chair instantly. Arrive, grab a drink, and step straight into the barber chair."),
  whyTitle2: text("why_title_2").notNull().default("Craft Beverage Bar"),
  whyText2: text("why_text_2").notNull().default("Every service includes a complimentary beverage of your choice: freshly brewed espresso, cold craft beer, or aged bourbon."),
  whyTitle3: text("why_title_3").notNull().default("Barber Grade Grooming"),
  whyText3: text("why_text_3").notNull().default("We use and sell top-tier pomades, organic beard oils, and soothing eucalyptus aftershave formulations."),

  // Footer & contact
  footerDescription: text("footer_description").notNull().default("Premium barbering craftsmanship, precision haircuts, traditional hot towel shaves, and custom grooming products."),
  footerBadgeText: text("footer_badge_text").notNull().default("Voted Best Barbershop 2024 & 2025"),
  hoursWeekday: text("hours_weekday").notNull().default("8:00 AM - 8:00 PM"),
  hoursSaturday: text("hours_saturday").notNull().default("8:00 AM - 6:00 PM"),
  hoursSunday: text("hours_sunday").notNull().default("10:00 AM - 4:00 PM"),
  contactAddress: text("contact_address").notNull().default("482 Executive Parkway, Suite 100, Heritage Square"),
  contactPhone: text("contact_phone").notNull().default("(555) 234-8901"),
  contactEmail: text("contact_email").notNull().default("bookings@crownandbarber.com"),

  // SEO
  seoTitle: text("seo_title").notNull().default("O2 Trims | Gentlemen's Grooming & Barber Co."),
  seoDescription: text("seo_description").notNull().default("Bespoke barbering craftsmanship, skin fades, hot towel straight razor shaves, and premium grooming store."),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
