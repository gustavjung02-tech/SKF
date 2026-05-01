import { readFile } from "node:fs/promises";
import path from "node:path";
import { findInternalPriceByNormalizedCode } from "@/lib/admin/price-master";

type CodeIndexRow = {
  code?: string;
  normalizedCode?: string;
  name?: string;
  productGroup?: string;
  productGroupLabel?: string;
};

export type AdminCatalogSearchResult = {
  code: string;
  normalizedCode: string;
  name: string;
  productGroup: string;
  productGroupLabel: string;
  internalPrice: number | null;
};

let codeIndexPromise: Promise<CodeIndexRow[]> | null = null;

async function loadCodeIndex() {
  const filePath = path.join(process.cwd(), "public", "data", "skf-code-index.json");
  const raw = await readFile(filePath, "utf-8");
  const parsed = JSON.parse(raw) as CodeIndexRow[];
  return Array.isArray(parsed) ? parsed : [];
}

async function getCodeIndex() {
  if (!codeIndexPromise) {
    codeIndexPromise = loadCodeIndex().catch((error) => {
      codeIndexPromise = null;
      throw error;
    });
  }

  return codeIndexPromise;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function normalizeCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function searchAdminCatalog(query: string, limit = 20) {
  const normalizedQueryText = normalizeText(query);
  const normalizedQueryCode = normalizeCode(query);
  if (!normalizedQueryText) {
    return [] satisfies AdminCatalogSearchResult[];
  }

  const rows = await getCodeIndex();
  const scoredRows = rows
    .map((row) => {
      const code = `${row.code ?? ""}`.trim();
      const normalizedCode = normalizeCode(`${row.normalizedCode ?? row.code ?? ""}`);
      const name = `${row.name ?? code}`.trim();
      const productGroup = `${row.productGroup ?? ""}`.trim();
      const productGroupLabel = `${row.productGroupLabel ?? productGroup}`.trim();

      if (!code || !normalizedCode) {
        return null;
      }

      let score = 0;
      if (normalizedCode === normalizedQueryCode) score += 100;
      if (normalizedCode.startsWith(normalizedQueryCode)) score += 80;
      if (code.toLowerCase().startsWith(normalizedQueryText)) score += 70;
      if (normalizedCode.includes(normalizedQueryCode)) score += 60;
      if (name.toLowerCase().includes(normalizedQueryText)) score += 30;

      if (score <= 0) {
        return null;
      }

      const item: AdminCatalogSearchResult = {
        code,
        normalizedCode,
        name,
        productGroup,
        productGroupLabel,
        internalPrice: null,
      };

      return {
        score,
        item,
      };
    })
    .filter((row): row is { score: number; item: AdminCatalogSearchResult } => row !== null)
    .sort((first, second) => second.score - first.score || first.item.normalizedCode.localeCompare(second.item.normalizedCode))
    .slice(0, limit);

  return Promise.all(
    scoredRows.map(async ({ item }) => ({
      ...item,
      internalPrice: await findInternalPriceByNormalizedCode(item.normalizedCode),
    })),
  );
}
