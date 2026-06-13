import { NextRequest, NextResponse } from "next/server";
import { hashPin, saveUser, getUserByUsername, User } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const { username, pin, nickname } = await req.json();

  if (!username || !pin || !nickname) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }
  if (!/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "PIN must be 6 digits" }, { status: 400 });
  }
  if (username.length < 3 || username.length > 20) {
    return NextResponse.json({ error: "Username must be 3-20 characters" }, { status: 400 });
  }

  const existing = await getUserByUsername(username);
  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const user: User = {
    id: randomUUID(),
    username: username.trim().toLowerCase(),
    nickname: nickname.trim(),
    pinHash: await hashPin(pin),
    approved: false,
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };

  await saveUser(user);
  return NextResponse.json({ message: "Registered successfully. Waiting for admin approval." });
}
