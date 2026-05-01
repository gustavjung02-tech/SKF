"use client";

import Image from "next/image";
import { type FormEvent, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Search, SlidersHorizontal, Loader2, RotateCcw, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";
import { LeadForm } from "@/components/forms/lead-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  buildEmailQuoteMessage,
  buildQuoteRequest,
  buildZaloQuoteMessage,
  exportQuoteRequestJson,
  saveQuoteRequestDraft,
  type QuoteRequest,
  type QuoteRequestCustomerForm,
} from "@/lib/quote-request";

type FilterOption = {
  value: string;
  label: string;
  count?: number;
};

type FilterOptions = {
  productGroups: FilterOption[];
  subCategories: FilterOption[];
  applications: FilterOption[];
  industries: FilterOption[];
  machineGroups: FilterOption[];
  priorities: FilterOption[];
  suggestedQueries: string[];
};

type RawFilterOption = string | { value?: unknown; label?: unknown; count?: unknown };

type RawFilterOptions = {
  productGroups?: RawFilterOption[];
  subCategories?: RawFilterOption[];
  applications?: RawFilterOption[];
  industries?: RawFilterOption[];
  machineGroups?: RawFilterOption[];
  priorities?: RawFilterOption[];
  suggestedQueries?: unknown[];
};

type ProductSpecs = {
  boreMm?: number | string;
  innerDiameterMm?: number | string;
  dMm?: number | string;
  d_mm?: number | string;
  d1_mm?: number | string;
  outerDiameterMm?: number | string;
  outsideDiameterMm?: number | string;
  DMm?: number | string;
  D_mm?: number | string;
  widthMm?: number | string;
  thicknessMm?: number | string;
  bMm?: number | string;
  B_T_mm?: number | string;
};

type CodeIndexRecord = {
  id: string;
  code: string;
  normalizedCode?: string;
  name?: string;
  productGroup?: string;
  productGroupSlug?: string;
  productGroupLabel?: string;
  subCategory?: string;
  applicationText?: string;
  priority?: string;
  specs?: ProductSpecs;
  boreMm?: number | string;
  outerDiameterMm?: number | string;
  widthMm?: number | string;
  d_mm?: number | string;
  d1_mm?: number | string;
  D_mm?: number | string;
  B_T_mm?: number | string;
};

type GroupRecord = CodeIndexRecord & {
  brand?: string;
  applications?: string[];
  industries?: string[];
  machineGroups?: string[];
};

type SearchRecord = GroupRecord & {
  applicationTextResolved: string;
  industriesText: string;
  machineGroupsText: string;
};

type QueryMatch = {
  matches: boolean;
  score: number;
};

type DimensionValues = {
  inner: number | null;
  outer: number | null;
  width: number | null;
};

type SelectedQuoteItem = {
  code: string;
  normalizedCode: string;
  name: string;
  productGroup: string;
  productGroupLabel?: string;
};

const FILTER_OPTIONS_URL = "/data/skf-filter-options.json";
const CODE_INDEX_URL = "/data/skf-code-index.json";
const TECHNICAL_CODE_PREFIXES = ["TMFT", "TKSA", "NUP", "UCP", "TIH", "NU", "NJ", "UC", "IR", "LG"];
const DIMENSION_TOLERANCE_MM = 0.5;
const QUICK_SUGGESTION_GROUPS = [
  { label: "Vòng bi", codes: ["6205", "6308", "22212", "NU308"] },
  { label: "Gối đỡ", codes: ["UCP208", "UCF207"] },
  { label: "Phớt", codes: ["60X90X10", "90X100X26"] },
  { label: "Bôi trơn", codes: ["LGHP 2", "LGMT 3"] },
] as const;
const BEARING_FOCUSED_SUGGESTIONS = ["6205", "6206", "6218", "6308", "22212", "NU308"];
const STANDARD_BEARING_SERIES = ["60", "62", "63", "68", "69"] as const;
const COMMON_BEARING_BORE_CODES = [
  "00", "01", "02", "03", "04", "05", "06", "07", "08", "09",
  "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "20", "22", "24", "26", "28", "30", "32", "34", "36",
] as const;
const KNOWN_BEARING_DIMENSIONS: Record<string, DimensionValues> = {
  "6005": { inner: 25, outer: 47, width: 12 },
  "6205": { inner: 25, outer: 52, width: 15 },
  "6305": { inner: 25, outer: 62, width: 17 },
  "6805": { inner: 25, outer: 37, width: 7 },
  "6905": { inner: 25, outer: 42, width: 9 },
  "6006": { inner: 30, outer: 55, width: 13 },
  "6206": { inner: 30, outer: 62, width: 16 },
  "6306": { inner: 30, outer: 72, width: 19 },
  "6208": { inner: 40, outer: 80, width: 18 },
  "6308": { inner: 40, outer: 90, width: 23 },
  "6018": { inner: 90, outer: 140, width: 24 },
  "6218": { inner: 90, outer: 160, width: 30 },
  "6318": { inner: 90, outer: 190, width: 43 },
  "6818": { inner: 90, outer: 115, width: 13 },
  "6918": { inner: 90, outer: 125, width: 18 },
  "NU308": { inner: 40, outer: 90, width: 23 },
  "NJ308": { inner: 40, outer: 90, width: 23 },
  "NUP308": { inner: 40, outer: 90, width: 23 },
};
const RESULT_CARD_IMAGES = {
  bearings: "/images/cards/product-vong-bi.webp",
  housings: "/images/cards/product-goi-do.webp",
  seals: "/images/card-kien-thuc-sai-phot-chan-dau.png",
  lubrication: "/images/tra-ma/hero-tra-ma-skf.png",
  maintenance: "/images/heroes/home/hero-home-skf-main.png",
  transmission: "/images/industry/hero-ung-dung-nganh-skf.png",
  fallback: "/images/brands/hero-san-pham-skf.png",
};
const CODE_VARIANT_PATTERN = /^(Z|ZZ|2Z|RS|RS1|2RS|2RS1|RSH|2RSH|C3|C4|TN9|E|N|NR)$/;
const SKF_VARIANT_SUFFIXES = ["2RS1", "2RSH", "2RS", "RS1", "RSH", "ECP", "TN9", "W33", "ZZ", "2Z", "RS", "C4", "C3", "P6", "P5", "MA", "CC", "CA", "K", "Z", "E", "N"] as const;
const PRODUCT_GROUP_LABELS: Record<string, string> = {
  "dung-cu-bao-tri-skf": "Dụng cụ bảo trì SKF",
  "goi-do-skf": "Gối đỡ SKF",
  "he-thong-boi-tron-skf": "Hệ thống bôi trơn SKF",
  "mo-boi-tron-skf": "Mỡ bôi trơn SKF",
  "phot-skf": "Phớt SKF",
  "truyen-dong-skf": "Truyền động SKF",
  "vong-bi-skf": "Vòng bi SKF",
};

type VariantCodeInfo = {
  baseCode: string;
  variantSuffixes: string[];
  variantLabel: string;
  variantGroupKey: string;
  isVariantFamily: boolean;
};

type SearchResultGroup = {
  key: string;
  primary: SearchRecord;
  variants: SearchRecord[];
  variantInfo: VariantCodeInfo;
};

type QuoteItemDraft = {
  quantity: string;
  customerNote: string;
};

const EMPTY_CUSTOMER_FORM: QuoteRequestCustomerForm = {
  name: "",
  email: "",
  phone: "",
  zalo: "",
  company: "",
  province: "",
  note: "",
};

function normalizeCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normalizeText(value: string | undefined) {
  return (value ?? "").toLowerCase();
}

function normalizeLookupText(value: string | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
}

function parseDimension(value: string): number | null {
  const normalizedValue = value.trim().replace(",", ".");
  if (!normalizedValue) {
    return null;
  }

  const parsed = Number(normalizedValue);
  return Number.isFinite(parsed) ? parsed : null;
}

function toFiniteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    return parseDimension(value);
  }

  return null;
}

function getNumericField(record: GroupRecord, keys: Array<keyof ProductSpecs | keyof CodeIndexRecord>) {
  for (const key of keys) {
    const directValue = record[key as keyof CodeIndexRecord];
    const directNumber = toFiniteNumber(directValue);
    if (directNumber !== null) {
      return directNumber;
    }

    const specValue = record.specs?.[key as keyof ProductSpecs];
    const specNumber = toFiniteNumber(specValue);
    if (specNumber !== null) {
      return specNumber;
    }
  }

  return null;
}

function getApplicationText(record: GroupRecord) {
  if (record.applicationText) {
    return record.applicationText;
  }

  if (Array.isArray(record.applications) && record.applications.length > 0) {
    return record.applications.join(" | ");
  }

  return "";
}

function getIndustriesText(record: GroupRecord) {
  return Array.isArray(record.industries) ? record.industries.join(" | ") : "";
}

function getMachineGroupsText(record: GroupRecord) {
  return Array.isArray(record.machineGroups) ? record.machineGroups.join(" | ") : "";
}

function splitOptionText(value: string | undefined) {
  return (value ?? "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getApplicationValues(record: GroupRecord) {
  if (Array.isArray(record.applications) && record.applications.length > 0) {
    return record.applications;
  }

  return splitOptionText(record.applicationText);
}

function buildFilterOptionsFromRecords(
  records: GroupRecord[],
  getValues: (record: GroupRecord) => string[],
  fallbackOptions: FilterOption[] = [],
) {
  const fallbackLabels = new Map(fallbackOptions.map((option) => [normalizeText(option.value).trim(), option.label]));
  const optionsByValue = new Map<string, FilterOption>();

  for (const record of records) {
    for (const rawValue of getValues(record)) {
      const value = rawValue.trim();
      if (!value) {
        continue;
      }

      const key = normalizeText(value).trim();
      const current = optionsByValue.get(key);
      optionsByValue.set(key, {
        value,
        label: fallbackLabels.get(key) ?? current?.label ?? value,
        count: (current?.count ?? 0) + 1,
      });
    }
  }

  return Array.from(optionsByValue.values()).sort((a, b) => {
    const countDiff = (b.count ?? 0) - (a.count ?? 0);
    if (countDiff !== 0) {
      return countDiff;
    }

    return a.label.localeCompare(b.label, "vi");
  });
}

function hasFilterOption(options: FilterOption[], value: string) {
  const normalizedValue = normalizeText(value).trim();
  return options.some((option) => normalizeText(option.value).trim() === normalizedValue);
}

function getRecordNormalizedCode(record: GroupRecord) {
  return normalizeCode(record.normalizedCode || record.code);
}

function toReadableLabel(value: string) {
  const normalizedValue = normalizeGroupKey(value);
  if (PRODUCT_GROUP_LABELS[normalizedValue]) {
    return PRODUCT_GROUP_LABELS[normalizedValue];
  }

  return value
    .replace(/[-_]+/g, " ")
    .replace(/\bskf\b/gi, "SKF")
    .replace(/\s+/g, " ")
    .trim();
}

function toFilterOption(
  rawOption: RawFilterOption,
  resolveLabel: (value: string, label?: string) => string = (value, label) => label ?? value,
): FilterOption | null {
  if (typeof rawOption === "string") {
    const value = rawOption.trim();
    if (!value) {
      return null;
    }

    return {
      value,
      label: resolveLabel(value),
    };
  }

  if (!rawOption || typeof rawOption !== "object") {
    return null;
  }

  const value = typeof rawOption.value === "string" ? rawOption.value.trim() : "";
  if (!value) {
    return null;
  }

  const label = typeof rawOption.label === "string" ? rawOption.label.trim() : "";
  const count = typeof rawOption.count === "number" && Number.isFinite(rawOption.count)
    ? rawOption.count
    : undefined;

  return {
    value,
    label: resolveLabel(value, label || undefined),
    count,
  };
}

function normalizeFilterOptionList(
  rawOptions: RawFilterOption[] | undefined,
  resolveLabel?: (value: string, label?: string) => string,
) {
  const optionsByValue = new Map<string, FilterOption>();

  for (const rawOption of rawOptions ?? []) {
    const option = toFilterOption(rawOption, resolveLabel);
    if (!option) {
      continue;
    }

    const key = normalizeText(option.value).trim();
    if (!key) {
      continue;
    }

    optionsByValue.set(key, option);
  }

  return Array.from(optionsByValue.values()).sort((a, b) => a.label.localeCompare(b.label, "vi"));
}

function normalizeSuggestedQueries(rawQueries: unknown[] | undefined) {
  const uniqueQueries = new Set<string>();
  for (const rawQuery of rawQueries ?? []) {
    if (typeof rawQuery !== "string") {
      continue;
    }

    const value = rawQuery.trim();
    if (!value) {
      continue;
    }

    uniqueQueries.add(value);
  }

  return Array.from(uniqueQueries);
}

function normalizeFilterOptions(rawData: RawFilterOptions): FilterOptions {
  return {
    productGroups: normalizeFilterOptionList(rawData.productGroups, (value, label) => label ?? toReadableLabel(value)),
    subCategories: normalizeFilterOptionList(rawData.subCategories),
    applications: normalizeFilterOptionList(rawData.applications),
    industries: normalizeFilterOptionList(rawData.industries),
    machineGroups: normalizeFilterOptionList(rawData.machineGroups),
    priorities: normalizeFilterOptionList(rawData.priorities),
    suggestedQueries: normalizeSuggestedQueries(rawData.suggestedQueries),
  };
}

function normalizeGroupKey(value: string | undefined) {
  return normalizeLookupText(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function doesRecordMatchGroup(record: GroupRecord, selectedGroup: string) {
  if (!selectedGroup) {
    return true;
  }

  const selectedGroupKey = normalizeGroupKey(selectedGroup);
  const candidateGroups = [
    record.productGroup,
    record.productGroupSlug,
    record.productGroupLabel,
  ]
    .map((value) => normalizeGroupKey(value))
    .filter(Boolean);

  return candidateGroups.some((value) => value === selectedGroupKey);
}

function getTechnicalPrefix(normalizedQuery: string) {
  return TECHNICAL_CODE_PREFIXES.find((prefix) => normalizedQuery === prefix || normalizedQuery.startsWith(prefix)) ?? null;
}

function getNumericSeriesPrefix(normalizedQuery: string, normalizedCode: string) {
  if (!/^\d{4,}$/.test(normalizedQuery)) {
    return null;
  }

  const prefixes = [normalizedQuery.slice(0, 3), normalizedQuery.slice(0, 2)];
  return prefixes.find((prefix) => prefix.length >= 2 && normalizedCode.startsWith(prefix)) ?? null;
}

function scoreQueryMatch(record: GroupRecord, rawQuery: string, textParts: string[]): QueryMatch {
  const trimmedQuery = rawQuery.trim();

  if (!trimmedQuery) {
    return { matches: true, score: 0 };
  }

  const normalizedQuery = normalizeCode(trimmedQuery);
  const loweredQuery = normalizeText(trimmedQuery);
  const normalizedCode = getRecordNormalizedCode(record);
  const normalizedDisplayCode = normalizeCode(record.code);
  const displayCode = (record.code ?? "").toUpperCase().trim();
  const displayQuery = trimmedQuery.toUpperCase();
  const isShortNumericPrefixQuery = /^\d{1,3}$/.test(normalizedQuery);
  const technicalPrefix = getTechnicalPrefix(normalizedQuery);

  if (!normalizedQuery && loweredQuery.length < 4) {
    return { matches: false, score: 0 };
  }

  if (isShortNumericPrefixQuery) {
    return normalizedCode.startsWith(normalizedQuery)
      ? { matches: true, score: normalizedCode === normalizedQuery ? 10000 : 8200 }
      : { matches: false, score: 0 };
  }

  if (normalizedCode === normalizedQuery || normalizedDisplayCode === normalizedQuery) {
    return { matches: true, score: 10000 };
  }

  if (normalizedCode.startsWith(normalizedQuery)) {
    return { matches: true, score: 8600 };
  }

  if (normalizedDisplayCode.startsWith(normalizedQuery) || displayCode.startsWith(displayQuery)) {
    return { matches: true, score: 8200 };
  }

  const numericSeriesPrefix = getNumericSeriesPrefix(normalizedQuery, normalizedCode);
  if (numericSeriesPrefix) {
    return { matches: true, score: numericSeriesPrefix.length === 3 ? 3600 : 3200 };
  }

  if (technicalPrefix) {
    return { matches: false, score: 0 };
  }

  if (normalizedQuery.length >= 4 && (normalizedCode.includes(normalizedQuery) || normalizedDisplayCode.includes(normalizedQuery))) {
    return { matches: true, score: 2400 };
  }

  if (loweredQuery.length >= 4 && textParts.some((part) => normalizeText(part).includes(loweredQuery))) {
    return { matches: true, score: 700 };
  }

  return { matches: false, score: 0 };
}

function parseDimensionsFromCode(code: string | undefined): DimensionValues {
  const match = (code ?? "").match(/(?:^|[^0-9])(\d+(?:[,.]\d+)?)\s*[xX]\s*(\d+(?:[,.]\d+)?)\s*[xX]\s*(\d+(?:[,.]\d+)?)(?:[^0-9]|$)/);

  if (!match) {
    return { inner: null, outer: null, width: null };
  }

  return {
    inner: parseDimension(match[1]),
    outer: parseDimension(match[2]),
    width: parseDimension(match[3]),
  };
}

function boreCodeToInnerMm(boreCode: string) {
  if (boreCode === "00") return 10;
  if (boreCode === "01") return 12;
  if (boreCode === "02") return 15;
  if (boreCode === "03") return 17;

  const parsed = Number(boreCode);
  return Number.isFinite(parsed) ? parsed * 5 : null;
}

function innerMmToBearingBoreCode(innerMm: number | null) {
  if (innerMm === null) return null;

  const specialCodes = new Map([
    [10, "00"],
    [12, "01"],
    [15, "02"],
    [17, "03"],
  ]);
  const roundedInner = Math.round(innerMm);
  const specialCode = specialCodes.get(roundedInner);
  if (specialCode) return specialCode;

  if (Math.abs(innerMm % 5) > DIMENSION_TOLERANCE_MM) {
    return null;
  }

  const boreNumber = Math.round(innerMm / 5);
  return boreNumber >= 4 ? String(boreNumber).padStart(2, "0") : null;
}

function inferBearingDimensionsFromCode(code: string | undefined): DimensionValues | null {
  const normalizedCode = normalizeCode(code ?? "");
  const knownCode = Object.keys(KNOWN_BEARING_DIMENSIONS).find((candidate) => normalizedCode.startsWith(candidate));
  if (knownCode) {
    return KNOWN_BEARING_DIMENSIONS[knownCode];
  }

  const standardMatch = normalizedCode.match(/^(60|62|63|68|69)(\d{2})(?:[A-Z0-9]*)$/);
  if (standardMatch) {
    const inner = boreCodeToInnerMm(standardMatch[2]);
    return inner === null ? null : { inner, outer: null, width: null };
  }

  const cylindricalMatch = normalizedCode.match(/^(NU|NJ|NUP)(\d)(\d{2})(?:[A-Z0-9]*)$/);
  if (cylindricalMatch) {
    const inner = boreCodeToInnerMm(cylindricalMatch[3]);
    return inner === null ? null : { inner, outer: null, width: null };
  }

  return null;
}

function getRecordDimensions(record: GroupRecord): DimensionValues {
  const parsedCodeDimensions = parseDimensionsFromCode(record.code);
  const inferredBearingDimensions = inferBearingDimensionsFromCode(record.normalizedCode ?? record.code);
  const explicitInner = getNumericField(record, ["d1_mm", "dMm", "d_mm", "innerDiameterMm"]);

  return {
    inner: explicitInner ?? parsedCodeDimensions.inner ?? getNumericField(record, ["boreMm"]) ?? inferredBearingDimensions?.inner ?? null,
    outer: getNumericField(record, ["outerDiameterMm", "outsideDiameterMm", "DMm", "D_mm"]) ?? parsedCodeDimensions.outer ?? inferredBearingDimensions?.outer ?? null,
    width: getNumericField(record, ["widthMm", "thicknessMm", "bMm", "B_T_mm"]) ?? parsedCodeDimensions.width ?? inferredBearingDimensions?.width ?? null,
  };
}

function resolveResultCardImage(record: GroupRecord) {
  const lookup = normalizeLookupText([
    record.productGroupLabel ?? "",
    record.productGroup ?? "",
    record.subCategory ?? "",
    record.name ?? "",
    record.code ?? "",
  ].join(" "));

  if (
    lookup.includes("vong bi") ||
    lookup.includes("bearing") ||
    lookup.includes("bac dan")
  ) {
    return { src: RESULT_CARD_IMAGES.bearings, alt: "Vòng bi SKF" };
  }

  if (
    lookup.includes("goi do") ||
    lookup.includes("housing") ||
    lookup.includes("ucp") ||
    lookup.includes("ucf") ||
    lookup.includes("ucfl")
  ) {
    return { src: RESULT_CARD_IMAGES.housings, alt: "Gối đỡ SKF" };
  }

  if (
    lookup.includes("phot") ||
    lookup.includes("seal")
  ) {
    return { src: RESULT_CARD_IMAGES.seals, alt: "Phớt SKF" };
  }

  if (
    lookup.includes("boi tron") ||
    lookup.includes("mo ") ||
    lookup.includes("lubrication") ||
    lookup.includes("lincoln")
  ) {
    return { src: RESULT_CARD_IMAGES.lubrication, alt: "Bôi trơn SKF" };
  }

  if (
    lookup.includes("bao tri") ||
    lookup.includes("tool") ||
    lookup.includes("dung cu")
  ) {
    return { src: RESULT_CARD_IMAGES.maintenance, alt: "Dụng cụ bảo trì SKF" };
  }

  if (
    lookup.includes("truyen dong") ||
    lookup.includes("xich") ||
    lookup.includes("chain") ||
    lookup.includes("belt")
  ) {
    return { src: RESULT_CARD_IMAGES.transmission, alt: "Truyền động SKF" };
  }

  return { src: RESULT_CARD_IMAGES.fallback, alt: "Sản phẩm SKF" };
}

function buildSpecsSummary(record: GroupRecord) {
  const dimensions = getRecordDimensions(record);
  const parts: string[] = [];

  if (dimensions.inner !== null) {
    parts.push(`d ${dimensions.inner}mm`);
  }
  if (dimensions.outer !== null) {
    parts.push(`D ${dimensions.outer}mm`);
  }
  if (dimensions.width !== null) {
    parts.push(`B/T ${dimensions.width}mm`);
  }

  return parts.join(" | ");
}

function splitVariantSuffixes(rawSuffix: string) {
  const normalizedSuffix = normalizeCode(rawSuffix);
  if (!normalizedSuffix) {
    return [];
  }

  const tokens: string[] = [];
  let cursor = normalizedSuffix;
  const knownSuffixes = [...SKF_VARIANT_SUFFIXES].sort((first, second) => second.length - first.length);

  while (cursor.length > 0) {
    const matchedSuffix = knownSuffixes.find((suffix) => cursor.startsWith(suffix));
    if (!matchedSuffix) {
      return [];
    }

    tokens.push(matchedSuffix);
    cursor = cursor.slice(matchedSuffix.length);
  }

  return Array.from(new Set(tokens));
}

function getVariantCodeInfo(record: GroupRecord): VariantCodeInfo {
  const normalizedCode = getRecordNormalizedCode(record);
  const normalizedGroup = normalizeGroupKey(record.productGroupSlug ?? record.productGroup ?? record.productGroupLabel ?? "skf");

  const numericBearingMatch = normalizedCode.match(/^(60|62|63|64|68|69)(\d{2})(.*)$/);
  if (numericBearingMatch) {
    const baseCode = `${numericBearingMatch[1]}${numericBearingMatch[2]}`;
    const variantSuffixes = splitVariantSuffixes(numericBearingMatch[3]);
    return {
      baseCode,
      variantSuffixes,
      variantLabel: variantSuffixes.join(", "),
      variantGroupKey: `${normalizedGroup}:${baseCode}`,
      isVariantFamily: true,
    };
  }

  const cylindricalBearingMatch = normalizedCode.match(/^(NU|NJ|NUP)(\d{3,4})(.*)$/);
  if (cylindricalBearingMatch) {
    const baseCode = `${cylindricalBearingMatch[1]}${cylindricalBearingMatch[2]}`;
    const variantSuffixes = splitVariantSuffixes(cylindricalBearingMatch[3]);
    return {
      baseCode,
      variantSuffixes,
      variantLabel: variantSuffixes.join(", "),
      variantGroupKey: `${normalizedGroup}:${baseCode}`,
      isVariantFamily: true,
    };
  }

  return {
    baseCode: normalizedCode,
    variantSuffixes: [],
    variantLabel: "",
    variantGroupKey: `${normalizedGroup}:${normalizedCode}`,
    isVariantFamily: false,
  };
}

function formatVariantDisplayCode(record: GroupRecord, variantInfo: VariantCodeInfo) {
  if (!variantInfo.variantSuffixes.length) {
    return record.code;
  }

  return `${variantInfo.baseCode} ${variantInfo.variantSuffixes.join("/")}`;
}

function sortVariantRecords(first: SearchRecord, second: SearchRecord) {
  const firstInfo = getVariantCodeInfo(first);
  const secondInfo = getVariantCodeInfo(second);

  if (firstInfo.variantSuffixes.length === 0 && secondInfo.variantSuffixes.length > 0) {
    return -1;
  }

  if (secondInfo.variantSuffixes.length === 0 && firstInfo.variantSuffixes.length > 0) {
    return 1;
  }

  const suffixCountDiff = firstInfo.variantSuffixes.length - secondInfo.variantSuffixes.length;
  if (suffixCountDiff !== 0) {
    return suffixCountDiff;
  }

  const variantDiff = firstInfo.variantLabel.localeCompare(secondInfo.variantLabel, "vi");
  if (variantDiff !== 0) {
    return variantDiff;
  }

  return first.code.localeCompare(second.code, "vi");
}

function createVirtualBearingRecord(code: string): GroupRecord {
  return {
    id: `virtual-bearing-${normalizeCode(code)}`,
    brand: "SKF",
    code,
    normalizedCode: normalizeCode(code),
    name: code,
    productGroup: "vong-bi-skf",
    productGroupSlug: "vong-bi-skf",
    productGroupLabel: "Vòng bi SKF",
    subCategory: code.startsWith("NU") || code.startsWith("NJ") || code.startsWith("NUP") ? "Vòng bi đũa trụ" : "Vòng bi cầu 1 dãy",
    applications: ["Bảo trì thiết bị quay", "Thay thế vòng bi theo mã SKF"],
    industries: ["Nhà máy sản xuất"],
    machineGroups: ["Motor", "Bơm", "Quạt"],
    priority: "high",
  };
}

function buildVirtualBearingRecords(
  rawQuery: string,
  expectedDimensions: DimensionValues,
  selectedGroup: string,
  existingRecords: GroupRecord[],
) {
  if (selectedGroup && selectedGroup !== "vong-bi-skf") {
    return [];
  }

  const normalizedQuery = normalizeCode(rawQuery.trim());
  const hasExpectedDimension = expectedDimensions.inner !== null || expectedDimensions.outer !== null || expectedDimensions.width !== null;
  if (!normalizedQuery && !hasExpectedDimension) {
    return [];
  }

  const isNumericBearingQuery = /^\d{0,5}$/.test(normalizedQuery) && (normalizedQuery === "" || normalizedQuery.startsWith("6"));
  const isCylindricalQuery = /^(NU|NJ|NUP)/.test(normalizedQuery);

  if (!isNumericBearingQuery && !isCylindricalQuery) {
    return [];
  }

  const existingCodes = new Set(existingRecords.map((record) => getRecordNormalizedCode(record)));
  const candidateCodes = new Set<string>();
  const expectedBoreCode = innerMmToBearingBoreCode(expectedDimensions.inner);

  if (isNumericBearingQuery) {
    const boreCodes = expectedBoreCode ? [expectedBoreCode] : [...COMMON_BEARING_BORE_CODES];
    for (const series of STANDARD_BEARING_SERIES) {
      for (const boreCode of boreCodes) {
        const baseCode = `${series}${boreCode}`;
        if (!normalizedQuery || baseCode.startsWith(normalizedQuery) || normalizedQuery.startsWith(baseCode)) {
          candidateCodes.add(baseCode);
          if (normalizedQuery.length >= 4 && normalizedQuery.startsWith(baseCode)) {
            candidateCodes.add(`${baseCode}-2Z`);
            candidateCodes.add(`${baseCode}-2RS1`);
          }
        }
      }
    }
  }

  if (isCylindricalQuery) {
    const technicalPrefixes = ["NU", "NJ", "NUP"];
    const boreCodes = expectedBoreCode ? [expectedBoreCode] : ["08", "12", "18"];
    for (const prefix of technicalPrefixes) {
      for (const boreCode of boreCodes) {
        const baseCode = `${prefix}3${boreCode}`;
        const displayCode = `${prefix} 3${boreCode}`;
        if (normalizeCode(displayCode).startsWith(normalizedQuery) || normalizedQuery.startsWith(baseCode)) {
          candidateCodes.add(displayCode);
        }
      }
    }
  }

  return Array.from(candidateCodes)
    .filter((code) => !existingCodes.has(normalizeCode(code)))
    .map(createVirtualBearingRecord);
}

function scoreDimensionMatch(actual: DimensionValues, expected: DimensionValues): QueryMatch {
  const checks = [
    { actual: actual.inner, expected: expected.inner },
    { actual: actual.outer, expected: expected.outer },
    { actual: actual.width, expected: expected.width },
  ];

  let score = 0;

  for (const check of checks) {
    if (check.expected === null) {
      continue;
    }

    if (check.actual === null || Math.abs(check.actual - check.expected) > DIMENSION_TOLERANCE_MM) {
      return { matches: false, score: 0 };
    }

    score += 1200;
  }

  return { matches: true, score };
}

function resolveInitialGroup(param: string | null, filterOptions: FilterOptions | null) {
  if (!param || !filterOptions) {
    return "";
  }

  const normalizedParam = normalizeText(param).trim();
  const match = filterOptions.productGroups.find((item) => {
    return normalizeText(item.value) === normalizedParam || normalizeText(item.label) === normalizedParam;
  });

  return match?.value ?? "";
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu: ${url}`);
  }
  return response.json() as Promise<T>;
}

export function SkfSearchQuoteExperience() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const groupParam = searchParams.get("group") ?? searchParams.get("nhom") ?? "";
  const resultsRef = useRef<HTMLElement | null>(null);
  const quoteFlowRef = useRef<HTMLElement | null>(null);
  const leadFormRef = useRef<HTMLElement | null>(null);
  const rfqMessageTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query);

  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedApplication, setSelectedApplication] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedMachineGroup, setSelectedMachineGroup] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [innerDiameter, setInnerDiameter] = useState("");
  const [outerDiameter, setOuterDiameter] = useState("");
  const [width, setWidth] = useState("");

  const [codeIndex, setCodeIndex] = useState<GroupRecord[] | null>(null);
  const [groupDataBySlug, setGroupDataBySlug] = useState<Record<string, GroupRecord[]>>({});
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<SearchRecord[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [selectedQuoteItems, setSelectedQuoteItems] = useState<SelectedQuoteItem[]>([]);
  const [copyNotice, setCopyNotice] = useState("");
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteFormError, setQuoteFormError] = useState("");
  const [customerForm, setCustomerForm] = useState<QuoteRequestCustomerForm>(EMPTY_CUSTOMER_FORM);
  const [quoteItemDrafts, setQuoteItemDrafts] = useState<Record<string, QuoteItemDraft>>({});
  const [isQuoteResultModalOpen, setIsQuoteResultModalOpen] = useState(false);
  const [latestQuoteMessage, setLatestQuoteMessage] = useState("");
  const [latestQuoteJson, setLatestQuoteJson] = useState("");
  const [latestSubmitChannel, setLatestSubmitChannel] = useState<QuoteRequest["channel"]>("zalo");
  const [clipboardAvailable, setClipboardAvailable] = useState(true);
  const [isSubmittingQuoteRequest, setIsSubmittingQuoteRequest] = useState(false);
  const [expandedVariantGroups, setExpandedVariantGroups] = useState<Record<string, boolean>>({});
  const [isQuickSuggestionsExpanded, setIsQuickSuggestionsExpanded] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setQuoteItemDrafts((current) => {
      const next: Record<string, QuoteItemDraft> = {};
      for (const item of selectedQuoteItems) {
        next[item.code] = current[item.code] ?? { quantity: "1", customerNote: "" };
      }
      return next;
    });
  }, [selectedQuoteItems]);

  useEffect(() => {
    let cancelled = false;

    async function loadFilterOptions() {
      try {
        setLoadingOptions(true);
        const rawData = await fetchJson<RawFilterOptions>(FILTER_OPTIONS_URL);
        const data = normalizeFilterOptions(rawData);
        if (cancelled) {
          return;
        }

        setFilterOptions(data);
        const initialGroup = resolveInitialGroup(groupParam, data);
        if (initialGroup) {
          setSelectedGroup(initialGroup);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Không thể tải bộ lọc SKF.");
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    void loadFilterOptions();

    return () => {
      cancelled = true;
    };
  }, [groupParam]);

  const hasDimensionInput = Boolean(innerDiameter.trim() || outerDiameter.trim() || width.trim());

  const shouldLoadCodeIndex =
    !selectedGroup &&
    Boolean(
      deferredQuery.trim() ||
        selectedApplication ||
        selectedPriority ||
        hasDimensionInput,
    );

  useEffect(() => {
    let cancelled = false;

    async function loadCodeIndex() {
      if (!shouldLoadCodeIndex || codeIndex) {
        return;
      }

      try {
        setLoadingDataset(true);
        const data = await fetchJson<GroupRecord[]>(CODE_INDEX_URL);
        if (!cancelled) {
          setCodeIndex(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Không thể tải code index SKF.");
        }
      } finally {
        if (!cancelled) {
          setLoadingDataset(false);
        }
      }
    }

    void loadCodeIndex();

    return () => {
      cancelled = true;
    };
  }, [codeIndex, shouldLoadCodeIndex]);

  useEffect(() => {
    let cancelled = false;

    async function loadGroupDataset() {
      if (!selectedGroup || groupDataBySlug[selectedGroup]) {
        return;
      }

      try {
        setLoadingDataset(true);
        const data = await fetchJson<GroupRecord[]>(`/data/skf/${selectedGroup}.json`);
        if (!cancelled) {
          setGroupDataBySlug((current) => ({ ...current, [selectedGroup]: data }));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu nhóm SKF.");
        }
      } finally {
        if (!cancelled) {
          setLoadingDataset(false);
        }
      }
    }

    void loadGroupDataset();

    return () => {
      cancelled = true;
    };
  }, [groupDataBySlug, selectedGroup]);

  useEffect(() => {
    let cancelled = false;

    async function loadDimensionDatasets() {
      if (!hasDimensionInput || selectedGroup || !filterOptions?.productGroups?.length) {
        return;
      }

      const missingGroups = filterOptions.productGroups
        .map((option) => option.value)
        .filter((slug) => slug.trim().length > 0 && !groupDataBySlug[slug]);

      if (missingGroups.length === 0) {
        return;
      }

      try {
        setLoadingDataset(true);
        const loadedGroups = await Promise.all(
          missingGroups.map(async (slug) => ({
            slug,
            data: await fetchJson<GroupRecord[]>(`/data/skf/${slug}.json`),
          })),
        );

        if (!cancelled) {
          setGroupDataBySlug((current) => {
            const next = { ...current };
            for (const group of loadedGroups) {
              next[group.slug] = group.data;
            }
            return next;
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu kích thước SKF.");
        }
      } finally {
        if (!cancelled) {
          setLoadingDataset(false);
        }
      }
    }

    void loadDimensionDatasets();

    return () => {
      cancelled = true;
    };
  }, [filterOptions, groupDataBySlug, hasDimensionInput, selectedGroup]);

  const allGroupData = useMemo(() => Object.values(groupDataBySlug).flat(), [groupDataBySlug]);

  const selectedGroupLabel = useMemo(() => {
    if (!selectedGroup) {
      return "";
    }

    const option = filterOptions?.productGroups.find((group) => group.value === selectedGroup);
    return option?.label ?? "";
  }, [filterOptions, selectedGroup]);

  const availableApplicationOptions = useMemo(() => {
    if (!filterOptions) {
      return [];
    }

    if (selectedGroup) {
      return buildFilterOptionsFromRecords(
        groupDataBySlug[selectedGroup] ?? [],
        getApplicationValues,
        filterOptions.applications,
      );
    }

    const records = codeIndex ?? allGroupData;
    if (!records.length) {
      return filterOptions.applications;
    }

    return buildFilterOptionsFromRecords(records, getApplicationValues, filterOptions.applications);
  }, [allGroupData, codeIndex, filterOptions, groupDataBySlug, selectedGroup]);

  useEffect(() => {
    if (!selectedApplication || availableApplicationOptions.length === 0) {
      return;
    }

    if (!hasFilterOption(availableApplicationOptions, selectedApplication)) {
      setSelectedApplication("");
    }
  }, [availableApplicationOptions, selectedApplication]);

  const parsedInnerDiameter = parseDimension(innerDiameter);
  const parsedOuterDiameter = parseDimension(outerDiameter);
  const parsedWidth = parseDimension(width);
  const dimensionWarning =
    parsedInnerDiameter !== null && parsedOuterDiameter !== null && parsedOuterDiameter <= parsedInnerDiameter
      ? "Đường kính ngoài D phải lớn hơn trục trong d."
      : "";

  function doesRecordMatchSupplementaryFilters(record: GroupRecord) {
    const applicationTextResolved = getApplicationText(record);
    const industriesText = getIndustriesText(record);
    const machineGroupsText = getMachineGroupsText(record);

    const matchesGroup = !selectedGroup || doesRecordMatchGroup(record, selectedGroup);
    const matchesApplication = !selectedApplication || normalizeText(applicationTextResolved).includes(normalizeText(selectedApplication));
    const matchesIndustry = !selectedIndustry || normalizeText(industriesText).includes(normalizeText(selectedIndustry));
    const matchesMachineGroup = !selectedMachineGroup || normalizeText(machineGroupsText).includes(normalizeText(selectedMachineGroup));
    const matchesPriority = !selectedPriority || record.priority === selectedPriority;

    return matchesGroup && matchesApplication && matchesIndustry && matchesMachineGroup && matchesPriority;
  }

  useEffect(() => {
    const rawQuery = deferredQuery.trim();
    const expectedInner = parsedInnerDiameter;
    const expectedOuter = parsedOuterDiameter;
    const expectedWidth = parsedWidth;
    const hasParsedDimension = expectedInner !== null || expectedOuter !== null || expectedWidth !== null;
    const sourceData = selectedGroup
      ? groupDataBySlug[selectedGroup] ?? null
      : hasParsedDimension && allGroupData.length
        ? allGroupData
        : codeIndex;

    if (!sourceData) {
      setResults([]);
      setTotalMatches(0);
      return;
    }

    if (dimensionWarning) {
      setResults([]);
      setTotalMatches(0);
      return;
    }

    if (
      !selectedGroup &&
      !rawQuery &&
      !selectedApplication &&
      !selectedPriority &&
      expectedInner === null &&
      expectedOuter === null &&
      expectedWidth === null
    ) {
      setResults([]);
      setTotalMatches(0);
      return;
    }

    const expectedDimensions = {
      inner: expectedInner,
      outer: expectedOuter,
      width: expectedWidth,
    };
    const virtualBearingRecords = buildVirtualBearingRecords(rawQuery, expectedDimensions, selectedGroup, sourceData);
    const candidateData = [...sourceData, ...virtualBearingRecords];
    const matchedResults: Array<SearchRecord & { searchScore: number }> = [];

    for (const record of candidateData) {
      const applicationTextResolved = getApplicationText(record);
      const industriesText = getIndustriesText(record);
      const machineGroupsText = getMachineGroupsText(record);
      const queryMatch = scoreQueryMatch(record, rawQuery, [
        record.name ?? "",
        record.productGroupLabel ?? "",
        record.subCategory ?? "",
        applicationTextResolved,
        industriesText,
        machineGroupsText,
      ]);

      const actualDimensions = getRecordDimensions(record);
      const dimensionMatch = scoreDimensionMatch(actualDimensions, expectedDimensions);
      const matchesGroup = !selectedGroup || doesRecordMatchGroup(record, selectedGroup);
      const matchesApplication = !selectedApplication || normalizeText(applicationTextResolved).includes(normalizeText(selectedApplication));
      const matchesIndustry = !selectedIndustry || normalizeText(industriesText).includes(normalizeText(selectedIndustry));
      const matchesMachineGroup = !selectedMachineGroup || normalizeText(machineGroupsText).includes(normalizeText(selectedMachineGroup));
      const matchesPriority = !selectedPriority || record.priority === selectedPriority;

      if (!queryMatch.matches || !matchesGroup || !matchesApplication || !matchesIndustry || !matchesMachineGroup || !matchesPriority || !dimensionMatch.matches) {
        continue;
      }

      matchedResults.push({
        ...record,
        applicationTextResolved,
        industriesText,
        machineGroupsText,
        searchScore: queryMatch.score + dimensionMatch.score,
      });
    }

    const sortedMatches = matchedResults.sort((first, second) => {
      const scoreDiff = second.searchScore - first.searchScore;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return getRecordNormalizedCode(first).localeCompare(getRecordNormalizedCode(second));
    });

    const nextResultsMap = new Map<string, SearchRecord>();
    const variantGroupKeys = new Set<string>();

    for (const { searchScore, ...record } of sortedMatches.slice(0, 50)) {
      nextResultsMap.set(record.id, record);
      const variantInfo = getVariantCodeInfo(record);
      if (variantInfo.isVariantFamily) {
        variantGroupKeys.add(variantInfo.variantGroupKey);
      }
    }

    if (variantGroupKeys.size > 0) {
      const variantSiblingPool = new Map<string, GroupRecord>();
      for (const poolRecord of [...(codeIndex ?? []), ...allGroupData, ...candidateData]) {
        variantSiblingPool.set(poolRecord.id, poolRecord);
      }

      for (const sibling of Array.from(variantSiblingPool.values())) {
        if (!doesRecordMatchSupplementaryFilters(sibling)) {
          continue;
        }

        const siblingVariantInfo = getVariantCodeInfo(sibling);
        if (variantGroupKeys.has(siblingVariantInfo.variantGroupKey)) {
          nextResultsMap.set(sibling.id, {
            ...sibling,
            applicationTextResolved: getApplicationText(sibling),
            industriesText: getIndustriesText(sibling),
            machineGroupsText: getMachineGroupsText(sibling),
          });
        }
      }
    }

    const nextResults = Array.from(nextResultsMap.values()).sort((first, second) => {
      const firstInfo = getVariantCodeInfo(first);
      const secondInfo = getVariantCodeInfo(second);
      const groupDiff = firstInfo.variantGroupKey.localeCompare(secondInfo.variantGroupKey, "vi");
      if (groupDiff !== 0) {
        return groupDiff;
      }

      return sortVariantRecords(first, second);
    });

    setResults(nextResults);
    setTotalMatches(matchedResults.length);
  }, [
    allGroupData,
    codeIndex,
    deferredQuery,
    dimensionWarning,
    groupDataBySlug,
    selectedApplication,
    selectedGroup,
    selectedIndustry,
    selectedMachineGroup,
    selectedPriority,
    parsedInnerDiameter,
    parsedOuterDiameter,
    parsedWidth,
  ]);

  const groupedResults = useMemo<SearchResultGroup[]>(() => {
    const groups = new Map<string, SearchResultGroup>();

    for (const record of results) {
      const variantInfo = getVariantCodeInfo(record);
      const current = groups.get(variantInfo.variantGroupKey);

      if (!current) {
        groups.set(variantInfo.variantGroupKey, {
          key: variantInfo.variantGroupKey,
          primary: record,
          variants: [record],
          variantInfo,
        });
        continue;
      }

      current.variants.push(record);
      const currentPrimaryInfo = getVariantCodeInfo(current.primary);
      if (currentPrimaryInfo.variantSuffixes.length > 0 && variantInfo.variantSuffixes.length === 0) {
        current.primary = record;
        current.variantInfo = variantInfo;
      }
    }

    return Array.from(groups.values()).map((group) => ({
      ...group,
      variants: [...group.variants].sort(sortVariantRecords),
      primary: [...group.variants].sort(sortVariantRecords)[0],
      variantInfo: getVariantCodeInfo([...group.variants].sort(sortVariantRecords)[0]),
    }));
  }, [results]);

  function toggleVariantGroup(groupKey: string) {
    setExpandedVariantGroups((current) => ({
      ...current,
      [groupKey]: !current[groupKey],
    }));
  }

  const quickSuggestionGroups = useMemo(() => {
    if (selectedGroup === "vong-bi-skf") {
      return [{ label: "Vòng bi", codes: BEARING_FOCUSED_SUGGESTIONS }];
    }

    return QUICK_SUGGESTION_GROUPS;
  }, [selectedGroup]);

  const quickSuggestionItems = useMemo(
    () => quickSuggestionGroups.flatMap((group) => group.codes.map((code) => ({ key: `${group.label}-${code}`, label: group.label, code }))),
    [quickSuggestionGroups],
  );

  const hasMoreQuickSuggestions = quickSuggestionItems.length > 8;
  const visibleQuickSuggestionCount = isQuickSuggestionsExpanded ? quickSuggestionItems.length : 8;

  const hasActiveSearch =
    Boolean(query.trim()) ||
    Boolean(selectedGroup) ||
    Boolean(selectedApplication) ||
    Boolean(selectedIndustry) ||
    Boolean(selectedMachineGroup) ||
    Boolean(selectedPriority) ||
    Boolean(innerDiameter.trim()) ||
    Boolean(outerDiameter.trim()) ||
    Boolean(width.trim());

  function scrollToResults() {
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function scrollToQuoteFlow() {
    window.requestAnimationFrame(() => {
      quoteFlowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function scrollToLeadForm() {
    window.requestAnimationFrame(() => {
      leadFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasActiveSearch) {
      scrollToResults();
    }
  }

  function handleQuickSuggestion(suggestion: string) {
    setQuery(suggestion);
    scrollToResults();
  }

  function handleGroupChange(value: string | null) {
    setSelectedGroup(value ?? "");
    setSelectedApplication("");
  }

  function resetFilters() {
    setSelectedGroup("");
    setSelectedApplication("");
    setSelectedIndustry("");
    setSelectedMachineGroup("");
    setSelectedPriority("");
    setInnerDiameter("");
    setOuterDiameter("");
    setWidth("");
    setError("");
  }

  function toggleQuoteItem(item: Pick<GroupRecord, "code" | "normalizedCode" | "name" | "subCategory" | "productGroup" | "productGroupLabel">) {
    setSelectedQuoteItems((current) => {
      const exists = current.some((selectedItem) => selectedItem.code === item.code);

      if (exists) {
        return current.filter((selectedItem) => selectedItem.code !== item.code);
      }

      return [
        ...current,
        {
          code: item.code,
          normalizedCode: normalizeCode(item.normalizedCode || item.code),
          name: item.name ?? item.subCategory ?? item.productGroupLabel ?? item.code,
          productGroup: item.productGroup ?? "",
          productGroupLabel: item.productGroupLabel,
        },
      ];
    });
  }

  async function tryCopyQuoteMessage(message: string) {
    if (!navigator.clipboard?.writeText) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(message);
      return true;
    } catch {
      return false;
    }
  }

  async function submitQuoteRequest(rfqJson: string) {
    const response = await fetch("/api/quote-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: rfqJson,
    });

    const payload = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error ?? "Không gửi được phiếu yêu cầu báo giá lên hệ thống.");
    }
  }

  async function copyLatestQuoteMessageAgain() {
    if (!latestQuoteMessage) {
      return;
    }

    const copied = await tryCopyQuoteMessage(latestQuoteMessage);
    setClipboardAvailable(copied);
    if (!copied) {
      window.requestAnimationFrame(() => {
        rfqMessageTextareaRef.current?.focus();
        rfqMessageTextareaRef.current?.select();
      });
    }
  }

  function openZaloOnly() {
    window.open(siteConfig.zaloLink, "_blank", "noopener,noreferrer");
  }

  function openZaloWithMessage(message: string) {
    const shareUrl = `https://zalo.me/share?text=${encodeURIComponent(message)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  function updateCustomerForm<K extends keyof QuoteRequestCustomerForm>(key: K, value: QuoteRequestCustomerForm[K]) {
    setCustomerForm((current) => ({ ...current, [key]: value }));
  }

  function updateQuoteItemDraft(code: string, nextPatch: Partial<QuoteItemDraft>) {
    setQuoteItemDrafts((current) => ({
      ...current,
      [code]: {
        quantity: current[code]?.quantity ?? "1",
        customerNote: current[code]?.customerNote ?? "",
        ...nextPatch,
      },
    }));
  }

  function openQuoteModal() {
    if (selectedQuoteItems.length === 0) {
      setQuoteFormError("Vui lòng chọn ít nhất 1 mã trước khi gửi yêu cầu báo giá.");
      scrollToResults();
      return;
    }

    setQuoteFormError("");
    setIsQuoteResultModalOpen(false);
    setIsQuoteModalOpen(true);
  }

  async function handleCreateQuoteRequest(channel: QuoteRequest["channel"]) {
    if (selectedQuoteItems.length === 0) {
      setQuoteFormError("Vui lòng chọn ít nhất 1 mã trước khi gửi yêu cầu báo giá.");
      return;
    }

    const customerName = customerForm.name.trim() || (channel === "email" ? "Khach gui email" : "Khach gui Zalo");
    const customerPhone = customerForm.phone.trim();
    const customerEmail = customerForm.email.trim();
    const customerZalo = customerForm.zalo.trim() || customerPhone;

    if (channel === "zalo" && !customerZalo) {
      setQuoteFormError("Gửi Zalo cần có SĐT/Zalo để liên hệ.");
      return;
    }

    if (channel === "email" && !customerEmail) {
      setQuoteFormError("Gửi email chỉ cần nhập Email để nhận phản hồi tự động.");
      return;
    }

    const rfqItems = selectedQuoteItems.map((item) => {
      const draft = quoteItemDrafts[item.code] ?? { quantity: "1", customerNote: "" };
      const parsedQuantity = Number.parseInt(draft.quantity, 10);
      return {
        code: item.code,
        normalizedCode: item.normalizedCode,
        name: item.name,
        productGroup: item.productGroup,
        quantity: Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 0,
        unit: "cai",
        customerNote: draft.customerNote,
      };
    });

    if (rfqItems.some((item) => item.quantity <= 0)) {
      setQuoteFormError("Số lượng từng mã phải lớn hơn 0.");
      return;
    }

    const rfq = buildQuoteRequest(
      rfqItems,
      {
        ...customerForm,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        zalo: customerZalo,
      },
      channel,
    );

    const rfqJson = exportQuoteRequestJson(rfq);
    if (/"priceVnd"|"priceText"|"sellPrice"|"costPrice"/.test(rfqJson)) {
      setQuoteFormError("RFQ không hợp lệ vì có trường giá.");
      return;
    }

    const zaloMessage = buildZaloQuoteMessage(rfq);
    const emailMessage = buildEmailQuoteMessage(rfq);
    const messageForClipboard = channel === "email" ? `${emailMessage.subject}\n\n${emailMessage.body}` : zaloMessage;

    setIsSubmittingQuoteRequest(true);

    try {
      await submitQuoteRequest(rfqJson);
      const copied = await tryCopyQuoteMessage(messageForClipboard);

      if (channel === "zalo") {
        openZaloWithMessage(zaloMessage);
      }

      setCopyNotice(
        channel === "zalo"
          ? "Đã lưu admin và mở Zalo. Nếu máy không tự điền đủ nội dung, hãy bấm Copy lại rồi dán gửi."
          : "Đã lưu admin và đã gửi email cảm ơn tự động cho khách. Nhân viên sẽ xử lý báo giá trên admin.",
      );
      window.setTimeout(() => setCopyNotice(""), 6000);
      setLatestQuoteMessage(channel === "zalo" ? messageForClipboard : "");
      setLatestQuoteJson(rfqJson);
      setLatestSubmitChannel(channel);
      setClipboardAvailable(channel === "zalo" ? copied : true);
      setIsQuoteModalOpen(false);
      setIsQuoteResultModalOpen(true);
      setQuoteFormError("");
    } catch (error) {
      saveQuoteRequestDraft(rfq);
      const copied = await tryCopyQuoteMessage(messageForClipboard);

      setCopyNotice("Không gửi được lên hệ thống, đã lưu bản backup tạm trên máy và copy nội dung.");
      window.setTimeout(() => setCopyNotice(""), 6500);
      setLatestQuoteMessage(messageForClipboard);
      setLatestQuoteJson(rfqJson);
      setLatestSubmitChannel(channel);
      setClipboardAvailable(copied);
      setIsQuoteModalOpen(false);
      setIsQuoteResultModalOpen(true);
      setQuoteFormError(error instanceof Error ? error.message : "Không gửi được phiếu yêu cầu báo giá.");
    } finally {
      setIsSubmittingQuoteRequest(false);
    }
  }

  function closeQuoteModal() {
    setIsQuoteModalOpen(false);
    setQuoteFormError("");
  }

  useEffect(() => {
    if (!isQuoteResultModalOpen || clipboardAvailable) {
      return;
    }

    window.requestAnimationFrame(() => {
      rfqMessageTextareaRef.current?.focus();
      rfqMessageTextareaRef.current?.select();
    });
  }, [clipboardAvailable, isQuoteResultModalOpen]);

  const selectedQuoteCodes = selectedQuoteItems.map((item) => item.code);
  const selectedQuoteText = selectedQuoteCodes.join(", ");

  return (
    <div className="space-y-6 rounded-3xl bg-[radial-gradient(120%_100%_at_50%_0%,#13365A_0%,#0B2440_45%,#071A2E_100%)] p-3 text-[#EAF2FB] sm:p-4">
      <section id="tra-ma-skf" className="scroll-mt-20 space-y-4">
        <div className="rounded-2xl border border-[#2D567F] bg-[#0D2744]/95 p-4 shadow-[0_20px_44px_-28px_rgba(4,12,25,0.8)] sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8EC6FF]">Nhập mã</p>
            <span className="rounded-full border border-[#4F7CA8] bg-[#163A5F] px-2.5 py-1 text-[11px] font-semibold text-[#D8EBFF]">Công cụ tra mã</span>
          </div>

          <form className="space-y-3" onSubmit={handleSearchSubmit}>
            <Label htmlFor="skf-code-search" className="text-sm font-semibold text-[#EAF2FB]">Mã sản phẩm SKF</Label>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8EC6FF]" />
                <Input
                  id="skf-code-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nhập mã SKF, ví dụ: 6205, 6205 2Z, NU308..."
                  className="h-12 rounded-xl border-[#3F6998] bg-[#0A223B] pl-11 font-semibold text-[#F4F9FF] placeholder:text-[#8BAECC] focus-visible:border-[#1FB6FF] focus-visible:bg-[#0A223B] focus-visible:ring-[#1FB6FF]/45"
                />
              </div>
              <Button type="submit" className="h-12 rounded-xl bg-[#1D72C9] px-5 text-white hover:bg-[#1159A6]">
                <Search className="mr-2 size-4" />
                Tra mã
              </Button>
            </div>

            <div className="rounded-xl border border-[#315B84] bg-[#0A223B] px-3 py-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#90B9DF]">Gợi ý nhanh</p>
                {hasMoreQuickSuggestions ? (
                  <button
                    type="button"
                    onClick={() => setIsQuickSuggestionsExpanded((current) => !current)}
                    className="text-[11px] font-semibold text-[#78C6FF] hover:text-[#A6DCFF]"
                  >
                    {isQuickSuggestionsExpanded ? "Thu gọn" : "Xem thêm"}
                  </button>
                ) : null}
              </div>
              <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1 sm:grid sm:grid-cols-4 sm:gap-2 sm:overflow-visible sm:whitespace-normal sm:pb-0">
                {quickSuggestionItems.slice(0, visibleQuickSuggestionCount).map((suggestion) => (
                  <button
                    key={suggestion.key}
                    type="button"
                    onClick={() => handleQuickSuggestion(suggestion.code)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#406C99] bg-[#123454] px-3 text-xs font-semibold text-[#DDEEFF] transition hover:border-[#6DBDFF] hover:bg-[#17466F] hover:text-white"
                  >
                    <span className="text-[#89B8E2]">{suggestion.label}:</span>
                    <span>{suggestion.code}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-[#2D567F] bg-[#0D2744]/95 p-4 shadow-[0_20px_44px_-28px_rgba(4,12,25,0.8)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#EAF2FB]">
              <SlidersHorizontal className="size-4 text-[#8EC6FF]" />
              Lọc theo nhóm và kích thước d/D/B-T
            </div>
            <Button type="button" variant="outline" size="sm" className="border-[#406C99] bg-[#123454] text-[#DDEEFF] hover:bg-[#17466F]" onClick={resetFilters}>
              <RotateCcw className="mr-1 size-3.5" />
              Reset
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-1.5 xl:col-span-2">
              <Label className="text-xs font-semibold text-[#B6D4F1]">Nhóm sản phẩm</Label>
              <Select value={selectedGroup} onValueChange={handleGroupChange}>
                <SelectTrigger className="h-11 w-full rounded-xl border-[#3F6998] bg-[#0A223B] text-[#EAF2FB] focus-visible:border-[#1FB6FF] focus-visible:bg-[#0A223B] focus-visible:ring-[#1FB6FF]/45">
                  <SelectValue placeholder="Chọn nhóm sản phẩm">{selectedGroupLabel || undefined}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(filterOptions?.productGroups ?? []).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 xl:col-span-1">
              <Label className="text-xs font-semibold text-[#B6D4F1]">Ứng dụng</Label>
              <Select value={selectedApplication} onValueChange={(value) => setSelectedApplication(value ?? "")}>
                <SelectTrigger className="h-11 w-full rounded-xl border-[#3F6998] bg-[#0A223B] text-[#EAF2FB] focus-visible:border-[#1FB6FF] focus-visible:bg-[#0A223B] focus-visible:ring-[#1FB6FF]/45">
                  <SelectValue placeholder="Chọn ứng dụng" />
                </SelectTrigger>
                <SelectContent>
                  {availableApplicationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="skf-inner-diameter" className="text-xs font-semibold text-[#B6D4F1]">d (trong)</Label>
              <Input
                id="skf-inner-diameter"
                inputMode="decimal"
                value={innerDiameter}
                onChange={(event) => setInnerDiameter(event.target.value)}
                placeholder="20"
                className="h-11 rounded-xl border-[#3F6998] bg-[#0A223B] font-semibold text-[#F4F9FF] placeholder:text-[#8BAECC] focus-visible:border-[#1FB6FF] focus-visible:bg-[#0A223B] focus-visible:ring-[#1FB6FF]/45"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="skf-outer-diameter" className="text-xs font-semibold text-[#B6D4F1]">D (ngoài)</Label>
              <Input
                id="skf-outer-diameter"
                inputMode="decimal"
                value={outerDiameter}
                onChange={(event) => setOuterDiameter(event.target.value)}
                placeholder="52"
                className="h-11 rounded-xl border-[#3F6998] bg-[#0A223B] font-semibold text-[#F4F9FF] placeholder:text-[#8BAECC] focus-visible:border-[#1FB6FF] focus-visible:bg-[#0A223B] focus-visible:ring-[#1FB6FF]/45"
              />
            </div>

            <div className="space-y-1.5 xl:col-span-1">
              <Label htmlFor="skf-width" className="text-xs font-semibold text-[#B6D4F1]">B/T (dày)</Label>
              <Input
                id="skf-width"
                inputMode="decimal"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
                placeholder="15"
                className="h-11 rounded-xl border-[#3F6998] bg-[#0A223B] font-semibold text-[#F4F9FF] placeholder:text-[#8BAECC] focus-visible:border-[#1FB6FF] focus-visible:bg-[#0A223B] focus-visible:ring-[#1FB6FF]/45"
              />
            </div>
          </div>

          {dimensionWarning ? <p className="mt-3 text-xs font-semibold text-[#FF8A90]">{dimensionWarning}</p> : null}
        </div>
      </section>

      <section id="ket-qua-tra-ma" ref={resultsRef} className="scroll-mt-24 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-xl font-bold text-[#F0F7FF]">Kết quả tra mã</h3>
            {hasActiveSearch ? null : <p className="text-sm text-[#9FBAD6]">Nhập mã hoặc chọn nhóm để bắt đầu.</p>}
          </div>

          {loadingOptions || loadingDataset ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#406C99] bg-[#113250] px-3 py-1.5 text-sm text-[#D6E9FD]">
              <Loader2 className="size-4 animate-spin" />
              {selectedGroup && loadingDataset ? "Đang tải dữ liệu nhóm sản phẩm..." : "Đang tải dữ liệu"}
            </div>
          ) : null}
        </div>

        {error ? <p className="rounded-2xl border border-[#7A2B36] bg-[#3E1A21] p-4 text-sm text-[#FFC4CC]">{error}</p> : null}

        <div className="grid gap-4">
          {groupedResults.map((group) => {
            const item = group.primary;
            const isSelected = selectedQuoteCodes.includes(item.code);
            const applicationSummary = item.applicationTextResolved.split("|")[0]?.trim() || "-";
            const displayName = (item.name || "").trim() || item.subCategory || applicationSummary;
            const specsSummary = buildSpecsSummary(item);
            const thumbnail = resolveResultCardImage(item);
            const groupVariants = group.variants
              .map((variant) => getVariantCodeInfo(variant).variantLabel)
              .filter(Boolean);
            const uniqueGroupVariants = Array.from(new Set(groupVariants));
            const isVariantExpanded = expandedVariantGroups[group.key] ?? false;

            return (
              <Card
                key={group.key}
                className={`border-[#2F567F] shadow-[0_16px_32px_-24px_rgba(4,12,25,0.9)] transition ${
                  isSelected ? "border-[#6CB8FF] bg-[#184267] ring-1 ring-[#59AFFF]/60" : "bg-[#0E2A49]"
                }`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex gap-3 sm:gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleQuoteItem(item)}
                      className="mt-1 size-4 rounded border-[#5584B5] bg-[#0A223B] text-[#2BAFFF]"
                      aria-label={`Chọn ${item.code} để báo giá`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#4777A6] bg-[#12395D] px-2.5 py-1 text-[11px] font-semibold text-[#D6E9FD]">
                          {item.productGroupLabel ?? item.productGroup}
                        </span>
                        {item.subCategory ? (
                          <span className="rounded-full border border-[#3B658F] bg-[#102F4D] px-2.5 py-1 text-[11px] font-semibold text-[#A8C7E6]">
                            {item.subCategory}
                          </span>
                        ) : null}
                        {uniqueGroupVariants.length > 0 ? (
                          <span className="rounded-full border border-[#8F4E59] bg-[#4C2330] px-2.5 py-1 text-[11px] font-semibold text-[#FFB9C2]">
                            Đuôi mã: {uniqueGroupVariants.join(", ")}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div className="min-w-0">
                          <p className="truncate text-lg font-bold text-[#F2F8FF]">{item.code}</p>
                          <p className="mt-0.5 truncate text-sm font-medium text-[#D2E7FC]">{displayName}</p>
                          {specsSummary ? <p className="mt-1 text-xs font-semibold text-[#95B7D8]">Thông số: {specsSummary}</p> : null}
                          {group.variants.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => toggleVariantGroup(group.key)}
                              className="mt-2 text-xs font-semibold text-[#82CCFF] hover:text-[#AEE0FF] hover:underline"
                            >
                              {isVariantExpanded ? "Ẩn mã cùng cỡ" : `Xem mã cùng cỡ (${group.variants.length})`}
                            </button>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="relative hidden size-14 shrink-0 overflow-hidden rounded-lg border border-[#3B658F] bg-[#102F4D] sm:block">
                            <Image
                              src={thumbnail.src}
                              alt={thumbnail.alt}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => toggleQuoteItem(item)}
                            className={
                              isSelected
                                ? "h-9 rounded-lg bg-[#0E5DAA] px-3 text-white hover:bg-[#0C4E8E]"
                                : "h-9 rounded-lg bg-[#1D72C9] px-3 text-white hover:bg-[#1159A6]"
                            }
                          >
                            {isSelected ? "Đã chọn" : "Chọn báo giá"}
                          </Button>
                        </div>
                      </div>

                      {isVariantExpanded ? (
                        <div className="mt-3 rounded-xl border border-[#3B658F] bg-[#102F4D] p-3">
                          <div className="space-y-2">
                            {group.variants.map((variant) => {
                              const variantSelected = selectedQuoteCodes.includes(variant.code);
                              const variantInfo = getVariantCodeInfo(variant);
                              const variantSpecsSummary = buildSpecsSummary(variant) || specsSummary;

                              return (
                                <div key={`${group.key}-${variant.id}`} className="flex flex-col gap-2 rounded-lg border border-[#3B658F] bg-[#0C2844] p-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[#F2F8FF]">{formatVariantDisplayCode(variant, variantInfo)}</p>
                                    {variantSpecsSummary ? (
                                      <p className="mt-0.5 text-xs font-medium text-[#95B7D8]">
                                        {buildSpecsSummary(variant) ? `Thông số: ${variantSpecsSummary}` : `Thông số theo mã nền: ${variantSpecsSummary}`}
                                      </p>
                                    ) : null}
                                  </div>

                                  <Button
                                    type="button"
                                    onClick={() => toggleQuoteItem(variant)}
                                    className={
                                      variantSelected
                                        ? "h-8 rounded-lg bg-[#0E5DAA] px-3 text-white hover:bg-[#0C4E8E]"
                                        : "h-8 rounded-lg bg-[#1D72C9] px-3 text-white hover:bg-[#1159A6]"
                                    }
                                  >
                                    {variantSelected ? "Đã chọn" : "Chọn mã này"}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {!loadingDataset && !error && groupedResults.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#3B658F] bg-[#0E2A49] p-5 text-sm text-[#B7D2EC]">
              Không có kết quả phù hợp.
            </div>
          ) : null}
        </div>
      </section>

      {selectedQuoteItems.length > 0 ? (
        <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 rounded-2xl border border-[#4878A8] bg-[#0C2B49]/95 p-3 shadow-[0_26px_52px_-30px_rgba(4,12,25,0.95)] backdrop-blur lg:bottom-5 lg:left-auto lg:right-5 lg:w-[520px]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#F0F7FF]">Đã chọn {selectedQuoteItems.length} sản phẩm</p>
              <p className="truncate text-xs text-[#B7D2EC]">{selectedQuoteText}</p>
              {copyNotice ? <p className="mt-1 text-xs font-medium text-emerald-700">{copyNotice}</p> : null}
            </div>
            <div className="grid gap-2 sm:flex">
              <Button type="button" className="bg-[#1D72C9] text-white hover:bg-[#1159A6]" onClick={openQuoteModal}>
                <MessageCircle className="mr-2 size-4" />
                Chọn cách gửi báo giá
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-[#406C99] text-[#D6E9FD] hover:bg-[#17466F]"
                onClick={() => {
                  setSelectedQuoteItems([]);
                  setCopyNotice("");
                }}
              >
                <X className="mr-2 size-4" />
                Xóa chọn
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <section id="gui-yeu-cau-zalo" ref={quoteFlowRef} className="scroll-mt-24 space-y-4">
        <div className="rounded-2xl border border-[#2D567F] bg-[#0D2744]/95 p-4 shadow-[0_20px_44px_-28px_rgba(4,12,25,0.8)] sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8EC6FF]">Bước gửi báo giá</p>
          <h3 className="mt-2 font-heading text-lg font-bold text-[#F0F7FF] sm:text-xl">Tra mã → Chọn mã → Gửi theo 2 cách riêng</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#4B79A8] bg-[#12395D] px-3 py-1 text-xs font-semibold text-[#DDEEFF]">1. Tra mã</span>
            <span className="rounded-full border border-[#4B79A8] bg-[#12395D] px-3 py-1 text-xs font-semibold text-[#DDEEFF]">2. Chọn mã</span>
            <span className="rounded-full border border-[#8F4E59] bg-[#4C2330] px-3 py-1 text-xs font-semibold text-[#FFB9C2]">3A. Gửi Zalo</span>
            <span className="rounded-full border border-[#4B79A8] bg-[#12395D] px-3 py-1 text-xs font-semibold text-[#DDEEFF]">3B. Gửi Email</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" className="bg-[#1D72C9] text-white hover:bg-[#1159A6]" onClick={openQuoteModal}>
              <MessageCircle className="mr-2 size-4" />
              {selectedQuoteItems.length > 0 ? "Chọn gửi Zalo / Email" : "Chọn mã trước khi mở phiếu"}
            </Button>
            <Button type="button" variant="outline" className="border-[#406C99] text-[#D6E9FD] hover:bg-[#17466F]" onClick={scrollToLeadForm}>
              Form phụ (tùy chọn)
            </Button>
          </div>

          {selectedQuoteItems.length > 0 ? (
            <p className="mt-3 text-sm text-[#C9DFF6]">Đang chọn {selectedQuoteItems.length} mã: {selectedQuoteText}</p>
          ) : (
            <p className="mt-3 text-sm text-[#FFD18B]">Chưa chọn mã nào. Hãy quay lên phần kết quả và tích ít nhất 1 mã trước khi mở bước gửi Zalo.</p>
          )}

          {quoteFormError && !isQuoteModalOpen ? <p className="mt-3 text-sm font-medium text-red-600">{quoteFormError}</p> : null}
        </div>
      </section>

      {isQuoteModalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-3">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-xl font-bold text-slate-950">Chọn cách gửi báo giá</h3>
                <p className="mt-1 text-sm text-slate-600">2 cách gửi là độc lập: Zalo dùng để chat nhanh, Email dùng để nhận phản hồi tự động cảm ơn.</p>
              </div>
              <Button type="button" variant="outline" className="border-slate-200 text-slate-600" onClick={closeQuoteModal}>
                <X className="mr-1 size-4" />
                Đóng
              </Button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreateQuoteRequest("email");
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="rfq-customer-name">Họ tên (tùy chọn cho Email)</Label>
                  <Input
                    id="rfq-customer-name"
                    value={customerForm.name}
                    onChange={(event) => updateCustomerForm("name", event.target.value)}
                    placeholder="Nguyen Van A"
                    className="bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rfq-customer-phone">SĐT/Zalo</Label>
                  <Input
                    id="rfq-customer-phone"
                    value={customerForm.phone}
                    onChange={(event) => {
                      const nextPhone = event.target.value;
                      updateCustomerForm("phone", nextPhone);
                      if (!customerForm.zalo.trim()) {
                        updateCustomerForm("zalo", nextPhone);
                      }
                    }}
                    placeholder="0969 155 751"
                    className="bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rfq-customer-email">Email (bắt buộc khi gửi Email)</Label>
                  <Input
                    id="rfq-customer-email"
                    value={customerForm.email}
                    onChange={(event) => updateCustomerForm("email", event.target.value)}
                    placeholder="ten@congty.com"
                    className="bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rfq-customer-company">Công ty/đơn vị</Label>
                  <Input
                    id="rfq-customer-company"
                    value={customerForm.company}
                    onChange={(event) => updateCustomerForm("company", event.target.value)}
                    placeholder="Ten nha may"
                    className="bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="rfq-customer-province">Tỉnh/thành</Label>
                  <Input
                    id="rfq-customer-province"
                    value={customerForm.province}
                    onChange={(event) => updateCustomerForm("province", event.target.value)}
                    placeholder="TP.HCM"
                    className="bg-white text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rfq-customer-note">Ghi chú chung</Label>
                <Textarea
                  id="rfq-customer-note"
                  rows={3}
                  value={customerForm.note}
                  onChange={(event) => updateCustomerForm("note", event.target.value)}
                  placeholder="Yeu cau giao nhanh, hoa don VAT..."
                  className="bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">Mã đã chọn ({selectedQuoteItems.length})</p>
                <div className="space-y-2">
                  {selectedQuoteItems.map((item) => {
                    const draft = quoteItemDrafts[item.code] ?? { quantity: "1", customerNote: "" };
                    return (
                      <div key={`rfq-item-${item.code}`} className="rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-sm font-semibold text-slate-900">{item.code}</p>
                        <p className="text-xs text-slate-500">{item.name}</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-[140px_1fr]">
                          <div className="space-y-1">
                            <Label htmlFor={`rfq-qty-${item.code}`}>Số lượng</Label>
                            <Input
                              id={`rfq-qty-${item.code}`}
                              inputMode="numeric"
                              value={draft.quantity}
                              onChange={(event) => updateQuoteItemDraft(item.code, { quantity: event.target.value.replace(/[^0-9]/g, "") })}
                              placeholder="1"
                              className="bg-white text-slate-900 placeholder:text-slate-400"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`rfq-note-${item.code}`}>Ghi chú riêng</Label>
                            <Input
                              id={`rfq-note-${item.code}`}
                              value={draft.customerNote}
                              onChange={(event) => updateQuoteItemDraft(item.code, { customerNote: event.target.value })}
                              placeholder="Vi du: can hang chinh hang, giao truoc thu 6"
                              className="bg-white text-slate-900 placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {quoteFormError ? <p className="text-sm font-medium text-red-600">{quoteFormError}</p> : null}

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  className="bg-[#1D72C9] text-white hover:bg-[#1159A6]"
                  disabled={isSubmittingQuoteRequest}
                  onClick={() => void handleCreateQuoteRequest("zalo")}
                >
                  <MessageCircle className="mr-2 size-4" />
                  {isSubmittingQuoteRequest ? "Đang gửi..." : "Gửi Zalo"}
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0E5DAA] text-white hover:bg-[#0C4E8E]"
                  disabled={isSubmittingQuoteRequest}
                >
                  {isSubmittingQuoteRequest ? "Đang gửi..." : "Gửi Email"}
                </Button>
                <Button type="button" variant="outline" className="border-slate-200 text-slate-600" onClick={closeQuoteModal}>
                  Hủy
                </Button>
              </div>
              <p className="text-xs text-slate-500">Gửi Zalo: cần SĐT/Zalo để mở chat và dán nội dung. Gửi Email: chỉ cần nhập Email, hệ thống tự gửi thư cảm ơn và chuyển phiếu vào admin.</p>
            </form>
          </div>
        </div>
      ) : null}

      {isQuoteResultModalOpen ? (
        <div className="fixed inset-0 z-[72] flex items-center justify-center bg-slate-950/55 p-3">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h3 className="font-heading text-xl font-bold text-slate-950">Đã tạo phiếu yêu cầu báo giá</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {latestSubmitChannel === "zalo"
                    ? "Phiếu đã lưu vào admin. Hệ thống đã mở kênh Zalo, nếu nội dung chưa tự điền thì bấm Copy lại rồi dán gửi."
                    : "Phiếu đã lưu vào admin. Hệ thống đã gửi email cảm ơn tự động tới khách và nhân viên sẽ xử lý báo giá."}
                </p>
              </div>
              <Button type="button" variant="outline" className="border-slate-200 text-slate-600" onClick={() => setIsQuoteResultModalOpen(false)}>
                <X className="mr-1 size-4" />
                Đóng
              </Button>
            </div>

            {!clipboardAvailable ? (
              <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="mb-2 text-sm font-medium text-amber-800">
                  {latestSubmitChannel === "zalo"
                    ? "Vui lòng copy nội dung bên dưới rồi dán vào Zalo."
                    : "Vui lòng copy nội dung bên dưới rồi dán vào email nếu cần."}
                </p>
                <Textarea
                  ref={rfqMessageTextareaRef}
                  rows={8}
                  value={latestQuoteMessage}
                  readOnly
                  className="bg-white"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {latestSubmitChannel === "zalo" ? (
                <Button type="button" className="bg-blue-800 text-white hover:bg-blue-900" onClick={openZaloOnly}>
                  <MessageCircle className="mr-2 size-4" />
                  Mở Zalo
                </Button>
              ) : null}
              <Button type="button" variant="outline" className="border-slate-200 text-slate-700" onClick={copyLatestQuoteMessageAgain}>
                Copy lại nội dung
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <section id="lead-form" ref={leadFormRef} className="scroll-mt-24 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-heading text-xl font-bold text-slate-950">Kênh phụ: form báo giá</h3>
          <p className="mt-2 text-sm text-slate-600">
            {selectedQuoteCodes.length
              ? `Đã chọn ${selectedQuoteCodes.length} mã. Đây là form phụ tùy chọn, không bắt buộc khi đã gửi Zalo/Email ở bước trên.`
              : "Form phụ tùy chọn, dùng khi cần gửi thêm thông tin kỹ thuật chi tiết."}
          </p>
        </div>
        <LeadForm initialRequestedCode={selectedQuoteText} />
      </section>
    </div>
  );
}
