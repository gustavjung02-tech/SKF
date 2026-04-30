import * as fs from "node:fs";
import * as path from "node:path";

type AnyRecord = Record<string, any>;

const ROOT = path.resolve(__dirname, "../..");

const PATHS = {
  supplement: path.join(ROOT, "data_SP", "import", "skf-public-supplement-bacdanskf-2026-04-30.json"),
  priceJsonSrc: path.join(ROOT, "data_SP", "import", "skf-price-master-bacdanskf-2026-04-30.json"),
  priceCsvSrc: path.join(ROOT, "data_SP", "import", "skf-price-master-bacdanskf-2026-04-30.csv"),
  pricingDir: path.join(ROOT, "data_SP", "pricing"),
  priceJsonDst: path.join(ROOT, "data_SP", "pricing", "skf-price-master-bacdanskf.json"),
  priceCsvDst: path.join(ROOT, "data_SP", "pricing", "skf-price-master-bacdanskf.csv"),
  groupDir: path.join(ROOT, "public", "data", "skf"),
  codeIndex: path.join(ROOT, "public", "data", "skf-code-index.json"),
  codeIndexCompact: path.join(ROOT, "public", "data", "skf-code-index-compact.json"),
  searchIndex: path.join(ROOT, "public", "data", "skf-search-index.json"),
  searchIndexCompact: path.join(ROOT, "public", "data", "skf-search-index-compact.json"),
  filterOptions: path.join(ROOT, "public", "data", "skf-filter-options.json"),
  report: path.join(ROOT, "data_SP", "reports", "bacdanskf-merge-report.md"),
};

const GROUP_FILES: Record<string, string> = {
  "vong-bi-skf": "vong-bi-skf.json",
  "goi-do-skf": "goi-do-skf.json",
  "phot-skf": "phot-skf.json",
  "mo-boi-tron-skf": "mo-boi-tron-skf.json",
  "he-thong-boi-tron-skf": "he-thong-boi-tron-skf.json",
  "dung-cu-bao-tri-skf": "dung-cu-bao-tri-skf.json",
  "truyen-dong-skf": "truyen-dong-skf.json",
};

const FALLBACK_GROUP = "vong-bi-skf";

const FILL_ONLY_FIELDS = ["sourceUrl", "imageUrl", "suffixes", "sourceSite", "lastUpdated"];

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function normalizeText(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim();
}

function hasValue(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function splitApplications(value: unknown): string[] {
  const text = normalizeText(value);
  if (!text) return [];
  return text
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "vi"));
}

function compactCodeIndexItem(row: AnyRecord): AnyRecord {
  return {
    i: String(row.id ?? ""),
    c: row.code ?? "",
    n: row.normalizedCode ?? "",
    t: row.name ?? "",
    g: row.productGroup ?? "",
    gl: row.productGroupLabel ?? "",
    sc: row.subCategory ?? "",
    a: row.applicationText ?? "",
    img: row.image ?? "",
    u: row.sourceUrl ?? "",
    p: row.priority ?? "medium",
  };
}

function compactSearchIndexItem(row: AnyRecord): AnyRecord {
  return {
    i: String(row.id ?? ""),
    b: row.brand ?? "SKF",
    c: row.code ?? "",
    n: row.normalizedCode ?? "",
    t: row.name ?? "",
    g: row.productGroup ?? "",
    gl: row.productGroupLabel ?? "",
    sc: row.subCategory ?? "",
    a: Array.isArray(row.applications) ? row.applications.join(" | ") : "",
    ind: Array.isArray(row.industries) ? row.industries.join(" | ") : "",
    m: Array.isArray(row.machineGroups) ? row.machineGroups.join(" | ") : "",
    img: row.image ?? "",
    u: row.sourceUrl ?? "",
    p: row.priority ?? "medium",
  };
}

function main() {
  ensureDir(PATHS.pricingDir);
  fs.copyFileSync(PATHS.priceJsonSrc, PATHS.priceJsonDst);
  fs.copyFileSync(PATHS.priceCsvSrc, PATHS.priceCsvDst);

  const supplementInput = readJson<AnyRecord[]>(PATHS.supplement);
  const inputTotal = supplementInput.length;

  const withRequired = supplementInput.filter((row) => {
    const code = normalizeText(row.code);
    const normalizedCode = normalizeText(row.normalizedCode);
    const productGroupLabel = normalizeText(row.productGroupLabel);
    return Boolean(code && normalizedCode && normalizedCode.length >= 3 && productGroupLabel);
  });

  const dedupMap = new Map<string, AnyRecord>();
  for (const row of withRequired) {
    const key = normalizeText(row.normalizedCode);
    if (!dedupMap.has(key)) {
      dedupMap.set(key, row);
    }
  }

  const validUniqueRows = Array.from(dedupMap.values());
  const duplicateDropped = withRequired.length - validUniqueRows.length;

  const groupData = new Map<string, AnyRecord[]>();
  for (const fileName of Object.values(GROUP_FILES)) {
    const filePath = path.join(PATHS.groupDir, fileName);
    if (fs.existsSync(filePath)) {
      groupData.set(fileName, readJson<AnyRecord[]>(filePath));
    }
  }

  const existingByNormalized = new Map<string, { fileName: string; record: AnyRecord }>();
  let maxId = 0;

  groupData.forEach((rows, fileName) => {
    for (const row of rows) {
      const normalized = normalizeText(row.normalizedCode);
      if (normalized) {
        existingByNormalized.set(normalized, { fileName, record: row });
      }
      const idNum = Number(row.id);
      if (Number.isFinite(idNum) && idNum > maxId) {
        maxId = idNum;
      }
    }
  });

  let addedNew = 0;
  let updatedMissingRecords = 0;
  let updatedMissingFields = 0;

  for (const src of validUniqueRows) {
    const normalizedCode = normalizeText(src.normalizedCode);
    const existing = existingByNormalized.get(normalizedCode);

    if (existing) {
      let changed = false;
      for (const key of FILL_ONLY_FIELDS) {
        const oldVal = existing.record[key];
        const newVal = src[key];
        if (!hasValue(oldVal) && hasValue(newVal)) {
          existing.record[key] = newVal;
          changed = true;
          updatedMissingFields += 1;
        }
      }

      if (!hasValue(existing.record.image) && hasValue(existing.record.imageUrl)) {
        existing.record.image = existing.record.imageUrl;
        changed = true;
      }

      if (changed) {
        updatedMissingRecords += 1;
      }

      continue;
    }

    const srcGroup = normalizeText(src.productGroup);
    const targetFileName = GROUP_FILES[srcGroup] && groupData.has(GROUP_FILES[srcGroup])
      ? GROUP_FILES[srcGroup]
      : GROUP_FILES[FALLBACK_GROUP];

    const targetGroup = GROUP_FILES[srcGroup] && groupData.has(GROUP_FILES[srcGroup]) ? srcGroup : FALLBACK_GROUP;

    maxId += 1;
    const code = normalizeText(src.code);
    const name = normalizeText(src.name) || code;
    const imageUrl = normalizeText(src.imageUrl);

    const newRecord: AnyRecord = {
      id: String(maxId),
      brand: "SKF",
      code,
      normalizedCode,
      name,
      productGroup: targetGroup,
      productGroupLabel: normalizeText(src.productGroupLabel) || "Vong bi SKF",
      subCategory: normalizeText(src.subCategory),
      applicationText: normalizeText(src.applicationText),
      applications: splitApplications(src.applicationText),
      industries: [],
      machineGroups: [],
      specs: src.specs ?? null,
      image: imageUrl,
      sourceUrl: normalizeText(src.sourceUrl),
      imageUrl,
      suffixes: Array.isArray(src.suffixes) ? src.suffixes : [],
      sourceSite: normalizeText(src.sourceSite),
      lastUpdated: normalizeText(src.lastUpdated),
      priority: "medium",
    };

    const targetRows = groupData.get(targetFileName);
    if (!targetRows) {
      throw new Error(`Missing target group file: ${targetFileName}`);
    }
    targetRows.push(newRecord);
    existingByNormalized.set(normalizedCode, { fileName: targetFileName, record: newRecord });
    addedNew += 1;
  }

  groupData.forEach((rows, fileName) => {
    const filePath = path.join(PATHS.groupDir, fileName);
    writeJson(filePath, rows);
  });

  const mergedSearchIndex = Array.from(groupData.values()).flat();

  const mergedCodeIndex = mergedSearchIndex.map((row) => ({
    id: String(row.id ?? ""),
    code: row.code ?? "",
    normalizedCode: row.normalizedCode ?? "",
    name: row.name ?? "",
    productGroup: row.productGroup ?? "",
    productGroupLabel: row.productGroupLabel ?? "",
    subCategory: row.subCategory ?? "",
    applicationText: row.applicationText ?? (Array.isArray(row.applications) ? row.applications.join(" | ") : ""),
    image: row.image ?? row.imageUrl ?? "",
    sourceUrl: row.sourceUrl ?? "",
    priority: row.priority ?? "medium",
  }));

  writeJson(PATHS.codeIndex, mergedCodeIndex);

  if (fs.existsSync(PATHS.codeIndexCompact)) {
    writeJson(PATHS.codeIndexCompact, mergedCodeIndex.map(compactCodeIndexItem));
  }

  if (fs.existsSync(PATHS.searchIndex)) {
    writeJson(PATHS.searchIndex, mergedSearchIndex);
  }

  if (fs.existsSync(PATHS.searchIndexCompact)) {
    writeJson(PATHS.searchIndexCompact, mergedSearchIndex.map(compactSearchIndexItem));
  }

  if (fs.existsSync(PATHS.filterOptions)) {
    const productGroups = uniqueSorted(mergedSearchIndex.map((r) => normalizeText(r.productGroup)).filter(Boolean));
    const subCategories = uniqueSorted(mergedSearchIndex.map((r) => normalizeText(r.subCategory)).filter(Boolean));
    const applications = uniqueSorted(mergedSearchIndex.flatMap((r) => Array.isArray(r.applications) ? r.applications : []));
    const industries = uniqueSorted(mergedSearchIndex.flatMap((r) => Array.isArray(r.industries) ? r.industries : []));
    const machineGroups = uniqueSorted(mergedSearchIndex.flatMap((r) => Array.isArray(r.machineGroups) ? r.machineGroups : []));
    const priorities = uniqueSorted(mergedSearchIndex.map((r) => normalizeText(r.priority)).filter(Boolean));

    const existingFilter = readJson<AnyRecord>(PATHS.filterOptions);
    const nextFilter: AnyRecord = {
      ...existingFilter,
      productGroups,
      subCategories,
      applications,
      industries,
      machineGroups,
      priorities,
    };
    writeJson(PATHS.filterOptions, nextFilter);
  }

  const groupLabelCount = new Map<string, number>();
  for (const row of validUniqueRows) {
    const key = normalizeText(row.productGroupLabel) || "(empty)";
    groupLabelCount.set(key, (groupLabelCount.get(key) ?? 0) + 1);
  }

  const checkCodes = ["6205", "62052Z", "62052ZC3", "6206", "63072Z", "NU308", "NU308ECP", "LGHP2", "LGMT2"];
  const finalByCodeOrNormalized = new Set<string>();
  for (const row of mergedCodeIndex) {
    finalByCodeOrNormalized.add(normalizeText(row.code));
    finalByCodeOrNormalized.add(normalizeText(row.normalizedCode));
  }

  const checkResult = checkCodes.map((code) => ({
    code,
    exists: finalByCodeOrNormalized.has(code),
  }));

  const publicFilesToCheck = [
    ...Array.from(groupData.keys()).map((name) => path.join(PATHS.groupDir, name)),
    PATHS.codeIndex,
    PATHS.codeIndexCompact,
    PATHS.searchIndex,
    PATHS.searchIndexCompact,
  ].filter((p) => fs.existsSync(p));

  let hasPriceVndInPublic = false;
  for (const filePath of publicFilesToCheck) {
    const content = fs.readFileSync(filePath, "utf-8");
    if (content.includes("\"priceVnd\"") || content.includes("\"priceText\"") || content.includes("\"sellPrice\"") || content.includes("\"costPrice\"")) {
      hasPriceVndInPublic = true;
      break;
    }
  }

  ensureDir(path.dirname(PATHS.report));
  const labelLines = Array.from(groupLabelCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => `- ${label}: ${count}`)
    .join("\n");

  const checkLines = checkResult
    .map((row) => `- ${row.code}: ${row.exists ? "YES" : "NO"}`)
    .join("\n");

  const report = [
    "# BacdanSKF Public Supplement Merge Report",
    "",
    `- input total: ${inputTotal}`,
    `- valid records (required fields + normalizedCode >= 3): ${withRequired.length}`,
    `- duplicate records dropped by normalizedCode: ${duplicateDropped}`,
    `- new records added: ${addedNew}`,
    `- existing records updated (fill missing fields only): ${updatedMissingRecords}`,
    `- total missing fields filled: ${updatedMissingFields}`,
    "",
    "## Count by productGroupLabel",
    labelLines || "- (none)",
    "",
    "## Code checks",
    checkLines,
    "",
    `- public data has NO priceVnd/priceText/costPrice/sellPrice: ${hasPriceVndInPublic ? "NO" : "YES"}`,
  ].join("\n");

  fs.writeFileSync(PATHS.report, report, "utf-8");

  console.log("Done merge.");
  console.log(`Input: ${inputTotal}, valid: ${withRequired.length}, duplicates dropped: ${duplicateDropped}`);
  console.log(`Added: ${addedNew}, updated records: ${updatedMissingRecords}, filled fields: ${updatedMissingFields}`);
  console.log(`Report: ${PATHS.report}`);
}

main();