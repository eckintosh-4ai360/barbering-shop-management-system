import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        avatarInitials: users.avatarInitials,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return NextResponse.json({ users: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role = "receptionist", phone = "", avatarInitials = "AM" } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const initials = avatarInitials || name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase().trim(),
        password,
        role,
        phone,
        avatarInitials: initials,
        isActive: true,
      })
      .returning();

    await db.insert(auditLogs).values({
      userId: null,
      userName: "Admin",
      action: "Created User Account",
      details: `Created new staff account: ${name} (${email}) as ${role}`,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatarInitials: newUser.avatarInitials,
        isActive: newUser.isActive,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
