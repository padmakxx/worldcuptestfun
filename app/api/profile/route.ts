import { NextRequest, NextResponse } from "next/server";
import { getSession, getUser, saveUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { avatar, supportedTeam, avatarColor } = await req.json();
  const user = await getUser(session.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (avatar !== undefined) user.avatar = avatar;
  if (supportedTeam !== undefined) user.supportedTeam = supportedTeam;
  if (avatarColor !== undefined) user.avatarColor = avatarColor;

  await saveUser(user);
  return NextResponse.json({ success: true });
}
