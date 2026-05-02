#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const PRICE_MASTER_HEADERS = [
  "code",
  "normalizedCode",
  "name",
  "productGroup",
  "productGroupSlug",
  "priceVnd",
  "priceStatus",
  "stockStatus",
  "sourceSite",
  "sourceUrl",
  "imageUrl",
  "suffixes",
  "lastUpdated",
  "note",
  "duplicateRawCount",
];

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function normalizeText(value) {
  return `${value ?? ""}`.trim();
}

function normalizeCode(input) {
  const raw = normalizeText(input).toUpperCase();
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

function parseDate(input) {
  const raw = normalizeText(input);
  if (!raw) {
    return new Date().toISOString().slice(0, 10);
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function csvEscape(value) {
  const text = `${value ?? ""}`;
  if (text.includes(",") || text.includes("\n") || text.includes("\"")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(records) {
  const lines = [PRICE_MASTER_HEADERS.join(",")];
  for (const record of records) {
    lines.push(
      PRICE_MASTER_HEADERS.map((header) => csvEscape(record[header] ?? "")).join(","),
    );
  }
  return lines.join("\n");
}

function collectSourceFiles(sourceDir) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
    .map((entry) => path.join(sourceDir, entry.name));
}

function loadSourceRows({ sourceFile, sourceDir }) {
  if (sourceFile) {
    return [{ filePath: path.resolve(sourceFile), rows: loadJson(sourceFile) }];
  }

  if (!sourceDir) {
    throw new Error("Missing input. Use --sourceFile or --sourceDir.");
  }

  return collectSourceFiles(sourceDir).map((filePath) => ({ filePath, rows: loadJson(filePath) }));
}

function buildCatalogIndex(catalogRows) {
  const map = new Map();
  for (const row of catalogRows) {
    const normalizedCode = normalizeCode(row.normalizedCode ?? row.code);
    if (!normalizedCode) continue;
    if (!map.has(normalizedCode)) {
      map.set(normalizedCode, {
        code: normalizeText(row.code),
        name: normalizeText(row.name),
        productGroupLabel: normalizeText(row.productGroupLabel ?? row.productGroup),
        productGroupSlug: normalizeText(row.productGroup),
      });
    }
  }
  return map;
}

function buildSourceMap(sourceBatches) {
  const sourceMap = new Map();
  const stats = {
    totalRows: 0,
    mappedRows: 0,
    validPriceRows: 0,
    skippedNoCode: 0,
    skippedNoPrice: 0,
    duplicateReplaced: 0,
  };

  for (const batch of sourceBatches) {
    const rows = Array.isArray(batch.rows) ? batch.rows : [];
    for (const row of rows) {
      stats.totalRows += 1;
      const normalizedCode = normalizeCode(row.normalizedCode ?? row.code ?? row.sku);
      if (!normalizedCode) {
        stats.skippedNoCode += 1;
        continue;
      }
      stats.mappedRows += 1;

      const priceVnd = parsePrice(row.price ?? row.priceVnd);
      if (priceVnd == null) {
        stats.skippedNoPrice += 1;
        continue;
      }
      stats.validPriceRows += 1;

      if (sourceMap.has(normalizedCode)) {
        stats.duplicateReplaced += 1;
      }

      const sourceUrl = normalizeText(row.url ?? row.sourceUrl);
      const sourceSite = (() => {
        if (!sourceUrl) return "";
        try {
          return new URL(sourceUrl).hostname;
        } catch {
          return "";
        }
      })();

      sourceMap.set(normalizedCode, {
        normalizedCode,
        code: normalizeText(row.code ?? row.sku),
        name: normalizeText(row.name),
        priceVnd,
        stockStatus: normalizeText(row.stockStatus) || "unknown",
        sourceSite,
        sourceUrl,
        imageUrl: normalizeText(row.image),
        lastUpdated: parseDate(row.crawledAt),
        note: `Gia bo sung tu ${sourceSite || "external source"}`,
        sourceFile: batch.filePath,
      });
    }
  }

  return { sourceMap, stats };
}

function buildPriceMasterIndex(records) {
  const map = new Map();
  for (const record of records) {
    const normalizedCode = normalizeCode(record.normalizedCode ?? record.code);
    if (!normalizedCode) continue;
    if (!map.has(normalizedCode)) {
      map.set(normalizedCode, record);
    }
  }
  return map;
}

function hasValidPrice(record) {
  return parsePrice(record?.priceVnd) != null;
}

function timestampToken() {
  const now = new Date();
  const yyyy = `${now.getFullYear()}`;
  const mm = `${now.getMonth() + 1}`.padStart(2, "0");
  const dd = `${now.getDate()}`.padStart(2, "0");
  const hh = `${now.getHours()}`.padStart(2, "0");
  const mi = `${now.getMinutes()}`.padStart(2, "0");
  const ss = `${now.getSeconds()}`.padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

function cloneRecord(record) {
  return { ...record };
}

function percentage(part, total) {
  if (!total) return 0;
  return (part / total) * 100;
}

function buildMarkdownReport(report) {
  const lines = [
    "# Price Master Merge Report",
    "",
    `- Generated at: ${report.generatedAt}`,
    `- Source files: ${report.input.sourceFilesCount}`,
    `- Backup JSON: ${report.output.backupJsonPath}`,
    `- Backup CSV: ${report.output.backupCsvPath}`,
    `- Merged JSON: ${report.output.priceJsonPath}`,
    `- Merged CSV: ${report.output.priceCsvPath}`,
    "",
    "## Summary",
    `- source total rows: ${report.sourceStats.totalRows}`,
    `- source mapped rows: ${report.sourceStats.mappedRows}`,
    `- source valid price rows: ${report.sourceStats.validPriceRows}`,
    `- baseline total records: ${report.summary.baselineRecordCount}`,
    `- merged total records: ${report.summary.mergedRecordCount}`,
    `- inserted new records: ${report.summary.insertedCount}`,
    `- filled existing records: ${report.summary.filledExistingCount}`,
    `- skipped existing priced records: ${report.summary.skippedExistingPricedCount}`,
    `- skipped outside catalog: ${report.summary.skippedOutsideCatalogCount}`,
    `- baseline priced coverage: ${report.summary.baselineCoverage.toFixed(2)}%`,
    `- merged priced coverage: ${report.summary.mergedCoverage.toFixed(2)}%`,
    `- coverage gain: +${report.summary.coverageGain.toFixed(2)} point`,
    "",
    "## Sample Changes",
  ];

  if (report.sampleChanges.length === 0) {
    lines.push("- (none)");
  } else {
    for (const row of report.sampleChanges) {
      lines.push(`- ${row.normalizedCode}: ${row.catalogCode} | ${row.action} | ${row.priceVnd}`);
    }
  }

  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv);
  const workspaceRoot = process.cwd();
  const pricingDir = path.join(workspaceRoot, "data_SP", "pricing");
  const reportsDir = path.join(workspaceRoot, "data_SP", "reports");
  const backupsDir = path.join(pricingDir, "backups");
  const catalogPath = path.join(workspaceRoot, "public", "data", "skf-code-index.json");
  const priceJsonPath = path.join(pricingDir, "skf-price-master-bacdanskf.json");
  const priceCsvPath = path.join(pricingDir, "skf-price-master-bacdanskf.csv");

  const sourceBatches = loadSourceRows({ sourceFile: args.sourceFile, sourceDir: args.sourceDir });
  const catalogRows = loadJson(catalogPath);
  const priceRows = loadJson(priceJsonPath);

  const catalogIndex = buildCatalogIndex(catalogRows);
  const baselineRecords = Array.isArray(priceRows) ? priceRows.map(cloneRecord) : [];
  const priceIndex = buildPriceMasterIndex(baselineRecords);
  const { sourceMap, stats: sourceStats } = buildSourceMap(sourceBatches);

  const mergedRecords = baselineRecords.map(cloneRecord);
  const mergedIndex = buildPriceMasterIndex(mergedRecords);

  let insertedCount = 0;
  let filledExistingCount = 0;
  let skippedExistingPricedCount = 0;
  let skippedOutsideCatalogCount = 0;
  const changeRows = [];

  for (const [normalizedCode, source] of sourceMap.entries()) {
    const catalog = catalogIndex.get(normalizedCode);
    if (!catalog) {
      skippedOutsideCatalogCount += 1;
      continue;
    }

    const existing = mergedIndex.get(normalizedCode);
    if (existing) {
      if (hasValidPrice(existing) && !args.allowOverwrite) {
        skippedExistingPricedCount += 1;
        continue;
      }

      const action = hasValidPrice(existing) ? "overwritten" : "filled";
      existing.code = normalizeText(existing.code) || catalog.code || source.code;
      existing.normalizedCode = normalizedCode;
      existing.name = normalizeText(existing.name) || catalog.name || source.name || existing.code;
      existing.productGroup = normalizeText(existing.productGroup) || catalog.productGroupLabel;
      existing.productGroupSlug = normalizeText(existing.productGroupSlug) || catalog.productGroupSlug;
      existing.priceVnd = source.priceVnd;
      existing.priceStatus = "listed";
      existing.stockStatus = source.stockStatus || normalizeText(existing.stockStatus) || "unknown";
      existing.sourceSite = source.sourceSite || normalizeText(existing.sourceSite);
      existing.sourceUrl = source.sourceUrl || normalizeText(existing.sourceUrl);
      existing.imageUrl = source.imageUrl || normalizeText(existing.imageUrl);
      existing.suffixes = normalizeText(existing.suffixes);
      existing.lastUpdated = source.lastUpdated;
      existing.note = source.note;
      existing.duplicateRawCount = Number.isFinite(Number(existing.duplicateRawCount)) ? Number(existing.duplicateRawCount) : 1;

      if (action === "filled") {
        filledExistingCount += 1;
      }

      changeRows.push({
        action,
        normalizedCode,
        catalogCode: catalog.code,
        catalogName: catalog.name,
        priceVnd: source.priceVnd,
        sourceFile: source.sourceFile,
      });
      continue;
    }

    const nextRecord = {
      code: catalog.code || source.code,
      normalizedCode,
      name: catalog.name || source.name || catalog.code || source.code,
      productGroup: catalog.productGroupLabel,
      productGroupSlug: catalog.productGroupSlug,
      priceVnd: source.priceVnd,
      priceStatus: "listed",
      stockStatus: source.stockStatus || "unknown",
      sourceSite: source.sourceSite,
      sourceUrl: source.sourceUrl,
      imageUrl: source.imageUrl,
      suffixes: "",
      lastUpdated: source.lastUpdated,
      note: source.note,
      duplicateRawCount: 1,
    };

    mergedRecords.push(nextRecord);
    mergedIndex.set(normalizedCode, nextRecord);
    insertedCount += 1;
    changeRows.push({
      action: "inserted",
      normalizedCode,
      catalogCode: catalog.code,
      catalogName: catalog.name,
      priceVnd: source.priceVnd,
      sourceFile: source.sourceFile,
    });
  }

  mergedRecords.sort((first, second) => normalizeCode(first.normalizedCode ?? first.code).localeCompare(normalizeCode(second.normalizedCode ?? second.code)));

  const catalogTotal = catalogIndex.size;
  const baselineCovered = new Set([...priceIndex.entries()].filter(([, record]) => hasValidPrice(record) && catalogIndex.has(normalizeCode(record.normalizedCode ?? record.code))).map(([code]) => code));
  const mergedCovered = new Set([...mergedIndex.entries()].filter(([, record]) => hasValidPrice(record) && catalogIndex.has(normalizeCode(record.normalizedCode ?? record.code))).map(([code]) => code));

  const baselineCoverage = percentage(baselineCovered.size, catalogTotal);
  const mergedCoverage = percentage(mergedCovered.size, catalogTotal);
  const coverageGain = mergedCoverage - baselineCoverage;

  const token = timestampToken();
  ensureDir(backupsDir);
  ensureDir(reportsDir);

  const backupJsonPath = path.join(backupsDir, `skf-price-master-bacdanskf.${token}.backup.json`);
  const backupCsvPath = path.join(backupsDir, `skf-price-master-bacdanskf.${token}.backup.csv`);
  fs.copyFileSync(priceJsonPath, backupJsonPath);
  if (fs.existsSync(priceCsvPath)) {
    fs.copyFileSync(priceCsvPath, backupCsvPath);
  }

  writeJson(priceJsonPath, mergedRecords);
  fs.writeFileSync(priceCsvPath, toCsv(mergedRecords), "utf-8");

  const report = {
    generatedAt: new Date().toISOString(),
    input: {
      sourceFile: args.sourceFile ?? null,
      sourceDir: args.sourceDir ?? null,
      sourceFilesCount: sourceBatches.length,
      catalogPath,
      priceJsonPath,
      priceCsvPath,
      allowOverwrite: Boolean(args.allowOverwrite),
    },
    output: {
      backupJsonPath,
      backupCsvPath: fs.existsSync(backupCsvPath) ? backupCsvPath : null,
      priceJsonPath,
      priceCsvPath,
      reportJsonPath: path.join(reportsDir, "price-merge-report.json"),
      reportMdPath: path.join(reportsDir, "price-merge-report.md"),
    },
    sourceStats,
    summary: {
      baselineRecordCount: baselineRecords.length,
      mergedRecordCount: mergedRecords.length,
      insertedCount,
      filledExistingCount,
      skippedExistingPricedCount,
      skippedOutsideCatalogCount,
      baselineCoverage,
      mergedCoverage,
      coverageGain,
    },
    sampleChanges: changeRows.slice(0, 50),
  };

  writeJson(report.output.reportJsonPath, report);
  fs.writeFileSync(report.output.reportMdPath, buildMarkdownReport(report), "utf-8");

  console.log(JSON.stringify({ ok: true, report }, null, 2));
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[merge-price-master-from-source] ${message}`);
  process.exitCode = 1;
}
