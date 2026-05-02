#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function normalizeCode(input) {
  const raw = `${input ?? ""}`.trim().toUpperCase();
  if (!raw) return "";
  const compact = raw.replace(/[^A-Z0-9]/g, "");
  if (!compact) return "";
  return compact.endsWith("SKF") ? compact.slice(0, -3) : compact;
}

function parsePrice(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 0 ? Math.round(value) : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed.replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(numeric) && numeric > 0) {
      return Math.round(numeric);
    }
  }

  return null;
}

function collectSourceFiles(sourceDir) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
    .map((entry) => path.join(sourceDir, entry.name));
}

function loadSourceRows({ sourceFile, sourceDir }) {
  if (sourceFile) {
    return [{ filePath: sourceFile, rows: loadJson(sourceFile) }];
  }

  if (!sourceDir) {
    throw new Error("Missing input. Use --sourceFile or --sourceDir.");
  }

  const files = collectSourceFiles(sourceDir);
  return files.map((filePath) => ({ filePath, rows: loadJson(filePath) }));
}

function buildCatalogIndex(catalogRows) {
  const byNormalized = new Map();
  for (const row of catalogRows) {
    const normalizedCode = normalizeCode(row.normalizedCode ?? row.code);
    if (!normalizedCode) continue;
    if (!byNormalized.has(normalizedCode)) {
      byNormalized.set(normalizedCode, {
        code: `${row.code ?? ""}`.trim(),
        name: `${row.name ?? ""}`.trim(),
        productGroup: `${row.productGroupLabel ?? row.productGroup ?? ""}`.trim(),
      });
    }
  }
  return byNormalized;
}

function buildBaselinePriceSet(priceRows) {
  const set = new Set();
  for (const row of priceRows) {
    const normalizedCode = normalizeCode(row.normalizedCode ?? row.code);
    const price = parsePrice(row.priceVnd);
    if (!normalizedCode || price == null) continue;
    set.add(normalizedCode);
  }
  return set;
}

function buildSourcePriceMap(sourceBatches) {
  const sourceMap = new Map();

  for (const batch of sourceBatches) {
    const rows = Array.isArray(batch.rows) ? batch.rows : [];
    for (const row of rows) {
      const normalizedCode = normalizeCode(row.normalizedCode ?? row.code ?? row.sku);
      if (!normalizedCode) continue;

      const price = parsePrice(row.price ?? row.priceVnd);
      if (price == null) continue;

      sourceMap.set(normalizedCode, {
        price,
        sourceCode: `${row.code ?? row.sku ?? ""}`.trim(),
        sourceName: `${row.name ?? ""}`.trim(),
        sourceFile: batch.filePath,
      });
    }
  }

  return sourceMap;
}

function csvEscape(value) {
  const text = `${value ?? ""}`;
  if (text.includes(",") || text.includes("\n") || text.includes("\"")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows) {
  const headers = [
    "normalizedCode",
    "catalogCode",
    "catalogName",
    "productGroup",
    "priceVnd",
    "sourceCode",
    "sourceName",
    "sourceFile",
  ];

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.normalizedCode,
        row.catalogCode,
        row.catalogName,
        row.productGroup,
        row.priceVnd,
        row.sourceCode,
        row.sourceName,
        row.sourceFile,
      ]
        .map(csvEscape)
        .join(","),
    );
  }

  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv);
  const workspaceRoot = process.cwd();

  const catalogPath = path.join(workspaceRoot, "public", "data", "skf-code-index.json");
  const baselinePricePath = path.join(workspaceRoot, "data_SP", "pricing", "skf-price-master-bacdanskf.json");
  const defaultOutJson = path.join(workspaceRoot, "data_SP", "reports", "price-diff-dry-run.json");
  const defaultOutCsv = path.join(workspaceRoot, "data_SP", "reports", "price-diff-dry-run.csv");

  const outJsonPath = args.outJson ? path.resolve(args.outJson) : defaultOutJson;
  const outCsvPath = args.outCsv ? path.resolve(args.outCsv) : defaultOutCsv;

  const sourceBatches = loadSourceRows({ sourceFile: args.sourceFile, sourceDir: args.sourceDir });
  const catalogRows = loadJson(catalogPath);
  const baselineRows = loadJson(baselinePricePath);

  const catalogIndex = buildCatalogIndex(catalogRows);
  const baselineSet = buildBaselinePriceSet(baselineRows);
  const sourceMap = buildSourcePriceMap(sourceBatches);

  const diffRows = [];
  for (const [normalizedCode, source] of sourceMap.entries()) {
    const catalog = catalogIndex.get(normalizedCode);
    if (!catalog) continue;
    if (baselineSet.has(normalizedCode)) continue;

    diffRows.push({
      normalizedCode,
      catalogCode: catalog.code,
      catalogName: catalog.name,
      productGroup: catalog.productGroup,
      priceVnd: source.price,
      sourceCode: source.sourceCode,
      sourceName: source.sourceName,
      sourceFile: source.sourceFile,
    });
  }

  diffRows.sort((a, b) => a.normalizedCode.localeCompare(b.normalizedCode));

  const report = {
    generatedAt: new Date().toISOString(),
    input: {
      sourceFile: args.sourceFile ?? null,
      sourceDir: args.sourceDir ?? null,
      sourceFilesCount: sourceBatches.length,
      catalogPath,
      baselinePricePath,
    },
    summary: {
      catalogTotalCodes: catalogIndex.size,
      baselinePricedCodes: baselineSet.size,
      sourceUniquePricedCodes: sourceMap.size,
      newPricedCodesInCatalog: diffRows.length,
    },
    rows: diffRows,
  };

  ensureDir(path.dirname(outJsonPath));
  ensureDir(path.dirname(outCsvPath));

  fs.writeFileSync(outJsonPath, JSON.stringify(report, null, 2), "utf-8");
  fs.writeFileSync(outCsvPath, toCsv(diffRows), "utf-8");

  console.log(
    JSON.stringify(
      {
        ok: true,
        outJson: outJsonPath,
        outCsv: outCsvPath,
        summary: report.summary,
      },
      null,
      2,
    ),
  );
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[export-price-diff-dry-run] ${message}`);
  process.exitCode = 1;
}
