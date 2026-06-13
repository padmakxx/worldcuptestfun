import { NextResponse } from "next/server";
import { getSession, getUser } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });
  const user = await getUser(session.userId);
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: user.id, username: user.username, nickname: user.nickname, isAdmin: user.isAdmin, approved: user.approved } });
}
