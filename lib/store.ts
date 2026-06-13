// Dual-mode store: Vercel KV in production, file-based JSON in local dev

const isVercel = !!process.env.KV_REST_API_URL;

// ---------- Vercel KV (production) ----------
async function kvGet<T>(key: string): Promise<T | null> {
  const { kv } = await import("@vercel/kv");
  return kv.get<T>(key);
}
async function kvSet(key: string, value: unknown): Promise<void> {
  const { kv } = await import("@vercel/kv");
  await kv.set(key, value);
}
async function kvGetAll<T>(prefix: string): Promise<Record<string, T>> {
  const { kv } = await import("@vercel/kv");
  const keys = await kv.keys(`${prefix}*`);
  const result: Record<string, T> = {};
  await Promise.all(keys.map(async k => {
    const val = await kv.get<T>(k);
    if (val !== null) result[k] = val;
  }));
  return result;
}

// ---------- File-based JSON (local dev) ----------
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
function ensureDir() { if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true }); }
function fp(key: string) { return path.join(DATA_DIR, `${key.replace(/[:/]/g, "_")}.json`); }

async function fileGet<T>(key: string): Promise<T | null> {
  ensureDir();
  const f = fp(key);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, "utf-8")) as T; } catch { return null; }
}
async function fileSet(key: string, value: unknown): Promise<void> {
  ensureDir();
  writeFileSync(fp(key), JSON.stringify(value, null, 2), "utf-8");
}
async function fileGetAll<T>(prefix: string): Promise<Record<string, T>> {
  ensureDir();
  const { readdirSync } = await import("fs");
  const safePrefix = prefix.replace(/[:/]/g, "_");
  const files = readdirSync(DATA_DIR).filter(f => f.startsWith(safePrefix) && f.endsWith(".json"));
  const result: Record<string, T> = {};
  for (const file of files) {
    try {
      const raw = readFileSync(path.join(DATA_DIR, file), "utf-8");
      result[file.replace(".json", "")] = JSON.parse(raw) as T;
    } catch { /* skip */ }
  }
  return result;
}

export async function kget<T>(key: string): Promise<T | null> {
  return isVercel ? kvGet<T>(key) : fileGet<T>(key);
}
export async function kset(key: string, value: unknown): Promise<void> {
  return isVercel ? kvSet(key, value) : fileSet(key, value);
}
export async function kgetall<T>(prefix: string): Promise<Record<string, T>> {
  return isVercel ? kvGetAll<T>(prefix) : fileGetAll<T>(prefix);
}
export async function kdel(key: string): Promise<void> {
  if (isVercel) {
    const { kv } = await import("@vercel/kv");
    await kv.del(key);
  } else {
    const f = fp(key);
    if (existsSync(f)) { const { unlinkSync } = await import("fs"); unlinkSync(f); }
  }
}
