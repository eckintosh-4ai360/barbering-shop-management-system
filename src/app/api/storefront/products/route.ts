import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// Prices are entered on the admin side as decimal GH₵ (e.g. "24.00") and stored
// as integer cents (2400), matching the client app's cart/checkout math.
export async function GET() {
  try {
    const list = await db.select().from(products).orderBy(desc(products.createdAt));
    return NextResponse.json({ products: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { name, description, price, stock, category, imageUrl, isActive } = await req.json();

    if (!name || price === undefined || price === null || !category) {
      return NextResponse.json({ error: "Name, category, and price are required" }, { status: 400 });
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        description,
        price: Math.round(priceNum * 100),
        stock: parseInt(stock) || 0,
        category,
        imageUrl: imageUrl || "",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      })
      .returning();

    await db.insert(auditLogs).values({
      userId: auth.id,
      userName: auth.name,
      action: "Created Website Product",
      details: `Added "${name}" (GH₵ ${priceNum.toFixed(2)}) to the shop`,
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
