import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { hydrateProactiveQuote, normalizeAdminQuoteSourceType, normalizeAdminQuoteStatus, type AdminProactiveQuoteRecord } from "@/lib/admin/proactive-quote";

// Primary store path (readable on all platforms; writable only on local dev).
const STORE_FILE_PATH = path.join(process.cwd(), "data_SP", "pricing", "admin-proactive-quotes.json");
// Fallback path writable on Vercel Lambda (/tmp) — ephemeral per warm instance.
const TMP_FILE_PATH = "/tmp/admin-proactive-quotes.json";

type ProactiveQuoteStoreData = {
  quotes: AdminProactiveQuoteRecord[];
};

// Module-level cache: survives across requests within the same process/Lambda instance.
let memCache: ProactiveQuoteStoreData | null = null;

async function readStoreFile(): Promise<ProactiveQuoteStoreData> {
  if (memCache !== null) {
    return { quotes: [...memCache.quotes] };
  }
  for (const filePath of [STORE_FILE_PATH, TMP_FILE_PATH]) {
    try {
      const raw = await readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw) as ProactiveQuoteStoreData;
      if (parsed && Array.isArray(parsed.quotes)) {
        const data = { quotes: parsed.quotes.map((quote) => hydrateProactiveQuote(quote)) };
        memCache = data;
        return { quotes: [...data.quotes] };
      }
    } catch {
      // Try next path.
    }
  }
  return { quotes: [] };
}

async function writeStoreFile(data: ProactiveQuoteStoreData) {
  // Always update in-memory cache first — works on every environment.
  memCache = { quotes: [...data.quotes] };

  // Try primary path (works on local dev).
  try {
    await mkdir(path.dirname(STORE_FILE_PATH), { recursive: true });
    await writeFile(STORE_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return;
  } catch {
    // Primary path is read-only (serverless). Fall through to /tmp.
  }

  // Fallback: /tmp is writable on Vercel Lambda.
  try {
    await writeFile(TMP_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // /tmp also unavailable (Cloudflare Workers). Data lives in memCache only.
  }
}

function buildQuoteId() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = createHash("sha1").update(randomUUID()).digest("hex").slice(0, 6).toUpperCase();
  return `Q${datePart}-${randomPart}`;
}

export async function listProactiveQuotes() {
  const store = await readStoreFile();
  return [...store.quotes].sort((first, second) => second.created_at.localeCompare(first.created_at));
}

export async function getProactiveQuoteById(quoteId: string) {
  const store = await readStoreFile();
  return store.quotes.find((quote) => quote.quote_id.toLowerCase() === quoteId.trim().toLowerCase()) ?? null;
}

export async function upsertProactiveQuote(inputQuote: unknown) {
  const now = new Date().toISOString();
  const normalized = hydrateProactiveQuote(inputQuote);
  const store = await readStoreFile();

  const quoteId = normalized.quote_id || buildQuoteId();
  const quoteToSave: AdminProactiveQuoteRecord = {
    ...normalized,
    quote_id: quoteId,
    source_type: normalizeAdminQuoteSourceType(normalized.source_type),
    status: normalizeAdminQuoteStatus(normalized.status),
    created_at: normalized.created_at || now,
    updated_at: now,
  };

  const index = store.quotes.findIndex((quote) => quote.quote_id.toLowerCase() === quoteId.toLowerCase());
  if (index >= 0) {
    const createdAt = store.quotes[index].created_at || quoteToSave.created_at;
    store.quotes[index] = {
      ...quoteToSave,
      created_at: createdAt,
    };
  } else {
    store.quotes.push({
      ...quoteToSave,
      created_at: now,
    });
  }

  await writeStoreFile(store);
  return quoteToSave;
}
