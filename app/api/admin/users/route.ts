import { NextRequest, NextResponse } from "next/server";
import { getSession, getAllUsers, getUser, saveUser } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await getAllUsers();
  return NextResponse.json({ users: users.filter(u => !u.isAdmin) });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, approved } = await req.json();
  const user = await getUser(userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  user.approved = approved;
  await saveUser(user);
  return NextResponse.json({ success: true });
}
