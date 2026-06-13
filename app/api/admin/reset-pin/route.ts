import { NextRequest, NextResponse } from "next/server";
import { getSession, getUser, saveUser, hashPin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId, newPin } = await req.json();
  if (!userId || !newPin || !/^\d{6}$/.test(newPin)) {
    return NextResponse.json({ error: "Invalid user or PIN (must be 6 digits)" }, { status: 400 });
  }

  const user = await getUser(userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  user.pinHash = await hashPin(newPin);
  await saveUser(user);

  return NextResponse.json({ success: true });
}
