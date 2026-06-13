import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername, verifyPin, createToken, ensureAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, pin } = await req.json();

    if (!username || !pin) {
      return NextResponse.json({ error: "Username and PIN required" }, { status: 400 });
    }

    try {
      await ensureAdmin();
    } catch (e) {
      console.error("ensureAdmin failed:", e);
      // Don't block login if ensureAdmin fails
    }

    const user = await getUserByUsername(username.trim().toLowerCase());
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPin(pin, user.pinHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.approved && !user.isAdmin) {
      return NextResponse.json({ error: "Account pending approval" }, { status: 403 });
    }

    const token = await createToken({
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    });

    const res = NextResponse.json({ success: true, isAdmin: user.isAdmin, nickname: user.nickname });
    res.cookies.set("wc_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
