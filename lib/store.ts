// Store: Upstash Redis REST API in production, file-based JSON in local dev

function isProduction() {
  return !!process.env.UPSTASH_REDIS_REST_URL;
}

const getUpstashUrl = () => process.env.UPSTASH_REDIS_REST_URL!;
const getUpstashToken = () => process.env.UPSTASH_REDIS_REST_TOKEN!;

async function upstashCmd(command: unknown[]): Promise<unknown> {
  const res = await fetch(getUpstashUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getUpstashToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const data = await res.json() as { result: unknown };
  return data.result;
}

async function kvGet<T>(key: string): Promise<T | null> {
  const result = await upstashCmd(["GET", key]);
  if (!result) return null;
  try { return JSON.parse(result as string) as T; } catch { return result as T; }
}

async function kvSet(key: string, value: unknown): Promise<void> {
  await upstashCmd(["SET", key, JSON.stringify(value)]);
}

async function kvGetAll<T>(prefix: string): Promise<Record<string, T>> {
  const keys = await upstashCmd(["KEYS", `${prefix}*`]) as string[];
  if (!keys || keys.length === 0) return {};
  const result: Record<string, T> = {};
  await Promise.all(keys.map(async k => {
    const val = await kvGet<T>(k);
    if (val !== null) result[k] = val;
  }));
  return result;
}

async function kvDel(key: string): Promise<void> {
  await upstashCmd(["DEL", key]);
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
  return isProduction() ? kvGet<T>(key) : fileGet<T>(key);
}
export async function kset(key: string, value: unknown): Promise<void> {
  return isProduction() ? kvSet(key, value) : fileSet(key, value);
}
export async function kgetall<T>(prefix: string): Promise<Record<string, T>> {
  return isProduction() ? kvGetAll<T>(prefix) : fileGetAll<T>(prefix);
}
export async function kdel(key: string): Promise<void> {
  return isProduction() ? kvDel(key) : (async () => {
    const f = fp(key);
    if (existsSync(f)) { const { unlinkSync } = await import("fs"); unlinkSync(f); }
  })();
}
