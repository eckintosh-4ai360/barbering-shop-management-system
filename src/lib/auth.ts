import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "receptionist";
  avatarInitials: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("barber_user_session");
    if (!sessionCookie?.value) return null;
    return JSON.parse(sessionCookie.value) as SessionUser;
  } catch {
    return null;
  }
}

// Call at the top of any mutating route that manages public storefront content.
// Returns the session user on success, or a NextResponse to return immediately on failure:
//   const auth = await requireAdmin();
//   if (auth instanceof NextResponse) return auth;
export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return user;
}
