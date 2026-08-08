import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const foundUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));

    if (foundUsers.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = foundUsers[0];

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is inactive. Please contact Admin." }, { status: 403 });
    }

    // In production, use bcrypt/argon2. Here we compare plaintext passwords
    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarInitials: user.avatarInitials,
    };

    const response = NextResponse.json({ success: true, user: userSession });
    
    // Set HTTP-only cookie
    response.cookies.set("barber_user_session", JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
