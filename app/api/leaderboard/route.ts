import { NextResponse } from "next/server";
import { getSession, getAllUsers } from "@/lib/auth";
import { computeLeaderboard } from "@/lib/scoring";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await getAllUsers();
  const eligible = users.filter(u => u.approved);
  const board = await computeLeaderboard(eligible.map(u => ({ id: u.id, username: u.username, nickname: u.nickname })));
  return NextResponse.json({ leaderboard: board });
}
