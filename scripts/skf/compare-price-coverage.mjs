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
      });
    }
  }
  return byNormalized;
}

function buildBaselinePriceMap(priceRows) {
  const map = new Map();
  for (const row of priceRows) {
    const normalizedCode = normalizeCode(row.normalizedCode ?? row.code);
    const price = parsePrice(row.priceVnd);
    if (!normalizedCode || price == null) continue;
    map.set(normalizedCode, price);
  }
  return map;
}

function buildSourcePriceMap(sourceBatches) {
  const sourceMap = new Map();

  let totalRows = 0;
  let mappedRows = 0;
  let validPriceRows = 0;
  let skippedNoCode = 0;
  let skippedNoPrice = 0;
  let duplicateReplaced = 0;

  for (const batch of sourceBatches) {
    const rows = Array.isArray(batch.rows) ? batch.rows : [];
    for (const row of rows) {
      totalRows += 1;
      const normalizedCode = normalizeCode(row.normalizedCode ?? row.code ?? row.sku);
      if (!normalizedCode) {
        skippedNoCode += 1;
        continue;
      }

      mappedRows += 1;
      const price = parsePrice(row.price ?? row.priceVnd);
      if (price == null) {
        skippedNoPrice += 1;
        continue;
      }

      validPriceRows += 1;

      if (sourceMap.has(normalizedCode)) {
        duplicateReplaced += 1;
      }

      sourceMap.set(normalizedCode, {
        price,
        code: `${row.code ?? row.sku ?? ""}`.trim(),
        name: `${row.name ?? ""}`.trim(),
        sourceFile: batch.filePath,
      });
    }
  }

  return {
    sourceMap,
    stats: {
      totalRows,
      mappedRows,
      validPriceRows,
      skippedNoCode,
      skippedNoPrice,
      duplicateReplaced,
    },
  };
}

function percentage(part, total) {
  if (!total) return 0;
  return (part / total) * 100;
}

function classifyPassFail(metrics) {
  const checks = {
    mappingSuccessRate: metrics.mappingSuccessRate >= 85,
    validPriceRate: metrics.validPriceRate >= 70,
    sourceOutsideCatalogRate: metrics.sourceOutsideCatalogRate <= 45,
    newCoveragePointGain: metrics.newCoveragePointGain >= 2.0,
  };

  const passedCount = Object.values(checks).filter(Boolean).length;
  let status = "FAIL";
  if (passedCount === 4) {
    status = "PASS";
  } else if (passedCount >= 3) {
    status = "CONDITIONAL_PASS";
  }

  return { status, checks };
}

function main() {
  const args = parseArgs(process.argv);

  const workspaceRoot = process.cwd();
  const catalogPath = path.join(workspaceRoot, "public", "data", "skf-code-index.json");
  const baselinePricePath = path.join(workspaceRoot, "data_SP", "pricing", "skf-price-master-bacdanskf.json");

  const sourceBatches = loadSourceRows({ sourceFile: args.sourceFile, sourceDir: args.sourceDir });
  const catalogRows = loadJson(catalogPath);
  const baselineRows = loadJson(baselinePricePath);

  const catalogIndex = buildCatalogIndex(catalogRows);
  const catalogCodes = new Set(catalogIndex.keys());

  const baselineMap = buildBaselinePriceMap(baselineRows);
  const { sourceMap, stats } = buildSourcePriceMap(sourceBatches);

  const baselineCovered = new Set([...baselineMap.keys()].filter((code) => catalogCodes.has(code)));
  const sourceCovered = new Set([...sourceMap.keys()].filter((code) => catalogCodes.has(code)));

  const projectedCovered = new Set([...baselineCovered, ...sourceCovered]);

  const sourceOutsideCatalog = [...sourceMap.keys()].filter((code) => !catalogCodes.has(code));
  const newCoveredCodes = [...projectedCovered].filter((code) => !baselineCovered.has(code));

  const catalogTotal = catalogCodes.size;
  const baselineCoverage = percentage(baselineCovered.size, catalogTotal);
  const projectedCoverage = percentage(projectedCovered.size, catalogTotal);
  const newCoveragePointGain = projectedCoverage - baselineCoverage;
  const relativeGainOnBaseline = percentage(newCoveredCodes.length, baselineCovered.size || 1);

  const mappingSuccessRate = percentage(stats.mappedRows, stats.totalRows);
  const validPriceRate = percentage(stats.validPriceRows, stats.totalRows);
  const sourceOutsideCatalogRate = percentage(sourceOutsideCatalog.length, sourceMap.size || 1);

  const metrics = {
    catalogTotal,
    baselineCovered: baselineCovered.size,
    projectedCovered: projectedCovered.size,
    newCovered: newCoveredCodes.length,
    baselineCoverage,
    projectedCoverage,
    newCoveragePointGain,
    relativeGainOnBaseline,
    mappingSuccessRate,
    validPriceRate,
    sourceOutsideCatalogRate,
    sourceUniquePricedCodes: sourceMap.size,
    sourceCoveredCodes: sourceCovered.size,
    sourceOutsideCatalogCodes: sourceOutsideCatalog.length,
  };

  const passFail = classifyPassFail(metrics);

  const sampleNewCovered = newCoveredCodes
    .slice(0, 20)
    .map((code) => ({
      normalizedCode: code,
      code: catalogIndex.get(code)?.code ?? "",
      name: catalogIndex.get(code)?.name ?? "",
      priceVnd: sourceMap.get(code)?.price ?? null,
    }));

  const report = {
    generatedAt: new Date().toISOString(),
    input: {
      sourceFile: args.sourceFile ?? null,
      sourceDir: args.sourceDir ?? null,
      sourceFilesCount: sourceBatches.length,
      catalogPath,
      baselinePricePath,
    },
    mappingRule: {
      codeFieldPriority: ["normalizedCode", "code", "sku"],
      codeNormalization: "uppercase + remove non [A-Z0-9] + trim trailing SKF token",
      priceFieldPriority: ["price", "priceVnd"],
      priceNormalization: "parse numeric; keep only > 0",
    },
    sourceStats: stats,
    metrics,
    passFail,
    sampleNewCovered,
  };

  console.log(JSON.stringify(report, null, 2));
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[compare-price-coverage] ${message}`);
  process.exitCode = 1;
}
