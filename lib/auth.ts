import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { kget, kset, kgetall } from "./store";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "wc2026-secret-key-change-in-production"
);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";

export interface User {
  id: string;
  username: string;
  nickname: string;
  pinHash: string;
  approved: boolean;
  isAdmin: boolean;
  createdAt: string;
  avatar?: string;       // emoji e.g. "🦁"
  supportedTeam?: string; // team flag emoji e.g. "🇧🇷"
  avatarColor?: string;  // hex bg color e.g. "#7c3aed"
}

export interface Session {
  userId: string;
  username: string;
  isAdmin: boolean;
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function createToken(session: Session): Promise<string> {
  return new SignJWT(session as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("wc_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getUser(userId: string): Promise<User | null> {
  return kget<User>(`user:${userId}`);
}

export async function getAllUsers(): Promise<User[]> {
  const all = await kgetall<User>("user_");
  // Also check direct user: keys
  const all2 = await kgetall<User>("user:");
  const merged = { ...all, ...all2 };
  return Object.values(merged).filter(u => u && u.id);
}

export async function saveUser(user: User): Promise<void> {
  await kset(`user:${user.id}`, user);
  // Also store username -> id mapping
  await kset(`username:${user.username.toLowerCase()}`, user.id);
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const id = await kget<string>(`username:${username.toLowerCase()}`);
  if (!id) return null;
  return getUser(id);
}

export async function ensureAdmin(): Promise<void> {
  const existing = await getUserByUsername(ADMIN_USERNAME);
  if (!existing) {
    const admin: User = {
      id: "admin",
      username: ADMIN_USERNAME,
      nickname: "Admin",
      pinHash: await hashPin(process.env.ADMIN_PIN || "000000"),
      approved: true,
      isAdmin: true,
      createdAt: new Date().toISOString(),
    };
    await saveUser(admin);
  }
}
