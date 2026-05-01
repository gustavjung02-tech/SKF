import { readFile } from "node:fs/promises";
import path from "node:path";

type PriceMasterRecord = {
  normalizedCode?: string;
  code?: string;
  priceVnd?: number | null;
};

let priceMapPromise: Promise<Map<string, number>> | null = null;

async function loadPriceMap() {
  const filePath = path.join(process.cwd(), "data_SP", "pricing", "skf-price-master-bacdanskf.json");
  const raw = await readFile(filePath, "utf-8");
  const records = JSON.parse(raw) as PriceMasterRecord[];
  const nextMap = new Map<string, number>();

  for (const record of records) {
    const normalizedCode = `${record.normalizedCode ?? record.code ?? ""}`.trim().toUpperCase();
    const priceVnd = typeof record.priceVnd === "number" && Number.isFinite(record.priceVnd) ? record.priceVnd : null;
    if (!normalizedCode || priceVnd == null) {
      continue;
    }

    nextMap.set(normalizedCode, priceVnd);
  }

  return nextMap;
}

async function getPriceMap() {
  if (!priceMapPromise) {
    priceMapPromise = loadPriceMap().catch((error) => {
      priceMapPromise = null;
      throw error;
    });
  }

  return priceMapPromise;
}

export async function findInternalPriceByNormalizedCode(normalizedCode: string) {
  const safeCode = normalizedCode.trim().toUpperCase();
  if (!safeCode) {
    return null;
  }

  try {
    const priceMap = await getPriceMap();
    return priceMap.get(safeCode) ?? null;
  } catch {
    return null;
  }
}