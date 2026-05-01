import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { hydrateProactiveQuote, normalizeAdminQuoteSourceType, normalizeAdminQuoteStatus, type AdminProactiveQuoteRecord } from "@/lib/admin/proactive-quote";

const STORE_FILE_PATH = path.join(process.cwd(), "data_SP", "pricing", "admin-proactive-quotes.json");

type ProactiveQuoteStoreData = {
  quotes: AdminProactiveQuoteRecord[];
};

async function ensureStoreDir() {
  await mkdir(path.dirname(STORE_FILE_PATH), { recursive: true });
}

async function readStoreFile() {
  try {
    const raw = await readFile(STORE_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as ProactiveQuoteStoreData;
    if (!parsed || !Array.isArray(parsed.quotes)) {
      return { quotes: [] } satisfies ProactiveQuoteStoreData;
    }

    return {
      quotes: parsed.quotes.map((quote) => hydrateProactiveQuote(quote)),
    } satisfies ProactiveQuoteStoreData;
  } catch {
    return { quotes: [] } satisfies ProactiveQuoteStoreData;
  }
}

async function writeStoreFile(data: ProactiveQuoteStoreData) {
  await ensureStoreDir();
  await writeFile(STORE_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
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
