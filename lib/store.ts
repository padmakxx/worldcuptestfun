// Dual-mode store: Vercel Blob in production, file-based JSON in local dev
// Production detects BLOB_READ_WRITE_TOKEN (auto-injected when you create a Blob store in Vercel dashboard)

const isVercel = !!process.env.BLOB_READ_WRITE_TOKEN;

const BLOB_PREFIX = "wc2026/";

// ---------- Vercel Blob (production) ----------
async function blobGet<T>(key: string): Promise<T | null> {
  const { list, head } = await import("@vercel/blob");
  try {
    const pathname = BLOB_PREFIX + key.replace(/[:/]/g, "_") + ".json";
    const { blobs } = await list({ prefix: pathname });
    if (blobs.length === 0) return null;
    // Use head to confirm it exists, then fetch content
    const blob = blobs.find(b => b.pathname === pathname);
    if (!blob) return null;
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

async function blobSet(key: string, value: unknown): Promise<void> {
  const { put } = await import("@vercel/blob");
  const pathname = BLOB_PREFIX + key.replace(/[:/]/g, "_") + ".json";
  await put(pathname, JSON.stringify(value), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });
}

async function blobGetAll<T>(prefix: string): Promise<Record<string, T>> {
  const { list } = await import("@vercel/blob");
  const safePrefix = BLOB_PREFIX + prefix.replace(/[:/]/g, "_");
  const { blobs } = await list({ prefix: safePrefix });
  const result: Record<string, T> = {};
  await Promise.all(blobs.map(async blob => {
    try {
      const res = await fetch(blob.url, { cache: "no-store" });
      if (!res.ok) return;
      const val = await res.json() as T;
      // Restore original key format from pathname
      const rawKey = blob.pathname
        .slice(BLOB_PREFIX.length)
        .replace(/\.json$/, "");
      result[rawKey] = val;
    } catch { /* skip */ }
  }));
  return result;
}

async function blobDel(key: string): Promise<void> {
  const { list, del } = await import("@vercel/blob");
  const pathname = BLOB_PREFIX + key.replace(/[:/]/g, "_") + ".json";
  const { blobs } = await list({ prefix: pathname });
  if (blobs.length > 0) {
    await del(blobs.map(b => b.url));
  }
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
  return isVercel ? blobGet<T>(key) : fileGet<T>(key);
}
export async function kset(key: string, value: unknown): Promise<void> {
  return isVercel ? blobSet(key, value) : fileSet(key, value);
}
export async function kgetall<T>(prefix: string): Promise<Record<string, T>> {
  return isVercel ? blobGetAll<T>(prefix) : fileGetAll<T>(prefix);
}
export async function kdel(key: string): Promise<void> {
  return isVercel ? blobDel(key) : (async () => {
    const f = fp(key);
    if (existsSync(f)) { const { unlinkSync } = await import("fs"); unlinkSync(f); }
  })();
}
