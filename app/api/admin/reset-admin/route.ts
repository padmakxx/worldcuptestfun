import { NextRequest, NextResponse } from "next/server";
import { hashPin } from "@/lib/auth";
import { kset } from "@/lib/store";

// One-time endpoint to force-reset the admin user credentials from env vars
// Protected by CRON_SECRET so only you can call it
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-secret");
  if (secret !== (process.env.CRON_SECRET || "wc2026-cron")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
  const pin = process.env.ADMIN_PIN || "000000";

  const admin = {
    id: "admin",
    username,
    nickname: "Admin",
    pinHash: await hashPin(pin),
    approved: true,
    isAdmin: true,
    createdAt: new Date().toISOString(),
  };

  await kset(`user:admin`, admin);
  await kset(`username:${username}`, "admin");

  return NextResponse.json({ success: true, username });
}
