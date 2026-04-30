"use client";

import Image from "next/image";
import { Fragment, type FormEvent, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
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
  buildQuoteRequest,
  buildZaloQuoteMessage,
  exportQuoteRequestJson,
  saveQuoteRequestDraft,
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
const FACEBOOK_PAGE_URL = "https://www.facebook.com/SKF.CongNghiep/";
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
const RFQ_ZALO_FALLBACK_LINK = "https://zalo.me/0969155751";

type QuoteItemDraft = {
  quantity: string;
  customerNote: string;
};

const EMPTY_CUSTOMER_FORM: QuoteRequestCustomerForm = {
  name: "",
  phone: "",
  zalo: "",
  company: "",
  province: "",
  note: "",
};

function FacebookMarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M13.7 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.6 1.6-1.6h1.7V3c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.6-4.3 4.5v2.2H8v3.2h2.7V21h3z" />
    </svg>
  );
}

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
        const data = await fetchJson<FilterOptions>(FILTER_OPTIONS_URL);
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
        .filter((slug) => !groupDataBySlug[slug]);

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

    const nextResults = matchedResults
      .sort((first, second) => {
        const scoreDiff = second.searchScore - first.searchScore;
        if (scoreDiff !== 0) {
          return scoreDiff;
        }

        return getRecordNormalizedCode(first).localeCompare(getRecordNormalizedCode(second));
      })
      .slice(0, 50)
      .map(({ searchScore, ...record }) => record);

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

  const quickSuggestionGroups = useMemo(() => {
    if (selectedGroup === "vong-bi-skf") {
      return [{ label: "Vòng bi", codes: BEARING_FOCUSED_SUGGESTIONS }];
    }

    return QUICK_SUGGESTION_GROUPS;
  }, [selectedGroup]);

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
      return;
    }

    setQuoteFormError("");
    setIsQuoteModalOpen(true);
  }

  async function handleCreateQuoteRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedQuoteItems.length === 0) {
      setQuoteFormError("Vui lòng chọn ít nhất 1 mã trước khi gửi yêu cầu báo giá.");
      return;
    }

    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      setQuoteFormError("Vui lòng nhập tối thiểu Họ tên và SĐT/Zalo.");
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

    const rfq = buildQuoteRequest(rfqItems, {
      ...customerForm,
      zalo: customerForm.zalo.trim() || customerForm.phone.trim(),
    });

    const rfqJson = exportQuoteRequestJson(rfq);
    if (/"priceVnd"|"priceText"|"sellPrice"|"costPrice"/.test(rfqJson)) {
      setQuoteFormError("RFQ không hợp lệ vì có trường giá.");
      return;
    }

    saveQuoteRequestDraft(rfq);

    const quoteMessage = buildZaloQuoteMessage(rfq);
    await tryCopyQuoteMessage(quoteMessage);

    setCopyNotice("Đã tạo phiếu yêu cầu báo giá và copy nội dung Zalo.");
    window.setTimeout(() => setCopyNotice(""), 5500);
    setIsQuoteModalOpen(false);
    setQuoteFormError("");
    window.open(siteConfig.zaloLink || RFQ_ZALO_FALLBACK_LINK, "_blank", "noopener,noreferrer");
  }

  function closeQuoteModal() {
    setIsQuoteModalOpen(false);
    setQuoteFormError("");
  }

  const selectedQuoteCodes = selectedQuoteItems.map((item) => item.code);
  const selectedQuoteText = selectedQuoteCodes.join(", ");

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.28)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Tra mã SKF</p>
            <h2 className="font-heading text-2xl font-bold text-slate-950 sm:text-3xl">
              Tra nhanh mã SKF và chọn sản phẩm cần báo giá
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Nhập mã, chọn nhóm hoặc lọc theo kích thước d/D/B-T rồi chọn các mã cần gửi báo giá.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <p>Hiển thị 50 kết quả đầu tiên.</p>
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1877F2] hover:underline"
            >
              <FacebookMarkIcon className="size-3.5" />
              Fanpage SKF Công Nghiệp
            </a>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <form className="space-y-2" onSubmit={handleSearchSubmit}>
              <Label htmlFor="skf-code-search">Mã sản phẩm</Label>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="skf-code-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="6205, 6308, NU308, LGHP 2"
                    className="h-12 pl-11"
                  />
                </div>
                <Button type="submit" className="h-12 bg-blue-800 px-5 text-white hover:bg-blue-900">
                  <Search className="mr-2 size-4" />
                  Tìm sản phẩm
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="skf-inner-diameter" className="text-xs">Trục trong d</Label>
                  <Input
                    id="skf-inner-diameter"
                    inputMode="decimal"
                    value={innerDiameter}
                    onChange={(event) => setInnerDiameter(event.target.value)}
                    placeholder="20"
                    className="h-9 px-3 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="skf-outer-diameter" className="text-xs">Trục ngoài D</Label>
                  <Input
                    id="skf-outer-diameter"
                    inputMode="decimal"
                    value={outerDiameter}
                    onChange={(event) => setOuterDiameter(event.target.value)}
                    placeholder="52"
                    className="h-9 px-3 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="skf-width" className="text-xs">Độ dày B/T</Label>
                  <Input
                    id="skf-width"
                    inputMode="decimal"
                    value={width}
                    onChange={(event) => setWidth(event.target.value)}
                    placeholder="15"
                    className="h-9 px-3 text-sm"
                  />
                </div>
              </div>
              {dimensionWarning ? <p className="text-xs font-medium text-red-600">{dimensionWarning}</p> : null}
            </form>

            <div className="space-y-2">
              <Label>Gợi ý nhanh</Label>
              <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                {quickSuggestionGroups.map((group) => (
                  <div key={group.label} className="flex flex-wrap items-center gap-x-1.5 text-[12px] leading-5">
                    <span className="font-semibold text-slate-600">{group.label}:</span>
                    {group.codes.map((suggestion, index) => (
                      <Fragment key={suggestion}>
                        <button
                          type="button"
                          onClick={() => handleQuickSuggestion(suggestion)}
                          className="font-medium text-blue-800 transition hover:text-blue-900 hover:underline"
                        >
                          {suggestion}
                        </button>
                        {index < group.codes.length - 1 ? <span className="text-slate-400">·</span> : null}
                      </Fragment>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <SlidersHorizontal className="size-4 text-blue-700" />
                Bộ lọc nhanh
              </div>
              <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
                <RotateCcw className="mr-1 size-3.5" />
                Reset
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 group-filter">
                <Label>Nhóm sản phẩm</Label>
                <Select value={selectedGroup} onValueChange={handleGroupChange}>
                  <SelectTrigger className="h-11 w-full bg-white">
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
                {selectedGroupLabel ? <p className="text-xs text-slate-500">{selectedGroupLabel}</p> : null}
              </div>

              <div className="space-y-2">
                <Label>Ứng dụng</Label>
                <Select value={selectedApplication} onValueChange={(value) => setSelectedApplication(value ?? "")}>
                  <SelectTrigger className="h-11 w-full bg-white">
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
            </div>
          </div>
        </div>
      </section>

      <section ref={resultsRef} className="scroll-mt-24 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-xl font-bold text-slate-950">Kết quả tra mã SKF</h3>
            <p className="text-sm text-slate-600">
              {totalMatches > 0
                ? `Tìm thấy ${totalMatches} kết quả phù hợp.`
                : hasActiveSearch
                  ? "Không có kết quả phù hợp với điều kiện hiện tại."
                  : "Nhập mã hoặc chọn nhóm để bắt đầu."}
            </p>
          </div>

          {loadingOptions || loadingDataset ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
              <Loader2 className="size-4 animate-spin" />
              {selectedGroup && loadingDataset ? "Đang tải dữ liệu nhóm sản phẩm..." : "Đang tải dữ liệu"}
            </div>
          ) : null}
        </div>

        {error ? <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

        <div className="grid gap-4">
          {results.map((item) => {
            const isSelected = selectedQuoteCodes.includes(item.code);
            const applicationSummary = item.applicationTextResolved.split("|")[0]?.trim() || "-";
            const specsSummary = buildSpecsSummary(item);
            const thumbnail = resolveResultCardImage(item);

            return (
              <Card
                key={`${item.productGroup}-${item.id}-${item.code}`}
                className={`border-slate-200 shadow-sm transition ${
                  isSelected ? "border-blue-300 bg-blue-50/45 ring-1 ring-blue-200" : "bg-white"
                }`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex gap-3 sm:gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleQuoteItem(item)}
                      className="mt-1 size-4 rounded border-slate-300 text-blue-800"
                      aria-label={`Chọn ${item.code} để báo giá`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleQuoteItem(item)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex gap-3 sm:gap-4">
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 sm:size-[78px]">
                          <Image
                            src={thumbnail.src}
                            alt={thumbnail.alt}
                            fill
                            sizes="(max-width: 640px) 64px, 78px"
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                          {item.productGroupLabel ?? item.productGroup}
                        </span>
                        {item.subCategory ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {item.subCategory}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-2">
                        <p className="truncate text-base font-semibold text-slate-950 sm:text-lg">{item.code}</p>
                        <p className="mt-1 truncate text-sm text-slate-600">{applicationSummary}</p>
                        {specsSummary ? <p className="mt-1 text-xs font-medium text-slate-500">{specsSummary}</p> : null}
                      </div>

                      <p className="mt-2 text-xs font-semibold text-blue-800">
                        {isSelected ? "Đã chọn báo giá" : "Chọn báo giá"}
                      </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {!loadingDataset && !error && results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
              Không có kết quả phù hợp.
            </div>
          ) : null}
        </div>
      </section>

      {selectedQuoteItems.length > 0 ? (
        <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 rounded-2xl border border-blue-200 bg-white/95 p-3 shadow-[0_22px_48px_-26px_rgba(15,23,42,0.55)] backdrop-blur lg:bottom-5 lg:left-auto lg:right-5 lg:w-[520px]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950">Đã chọn {selectedQuoteItems.length} sản phẩm</p>
              <p className="truncate text-xs text-slate-500">{selectedQuoteText}</p>
              {copyNotice ? <p className="mt-1 text-xs font-medium text-emerald-700">{copyNotice}</p> : null}
            </div>
            <div className="grid gap-2 sm:flex">
              <Button type="button" className="bg-blue-800 text-white hover:bg-blue-900" onClick={openQuoteModal}>
                <MessageCircle className="mr-2 size-4" />
                Gửi yêu cầu báo giá
              </Button>
              <Button asChild type="button" variant="outline" className="border-[#D9E6FB] text-[#1877F2] hover:bg-[#EEF4FF]">
                <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noreferrer">
                  <FacebookMarkIcon className="mr-2 size-4" />
                  Fanpage
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-slate-200 text-slate-600"
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

      {isQuoteModalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-3">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-xl font-bold text-slate-950">Phiếu yêu cầu báo giá</h3>
                <p className="mt-1 text-sm text-slate-600">Nhập nhanh thông tin khách và số lượng theo từng mã đã chọn.</p>
              </div>
              <Button type="button" variant="outline" className="border-slate-200 text-slate-600" onClick={closeQuoteModal}>
                <X className="mr-1 size-4" />
                Đóng
              </Button>
            </div>

            <form className="space-y-4" onSubmit={handleCreateQuoteRequest}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="rfq-customer-name">Họ tên</Label>
                  <Input
                    id="rfq-customer-name"
                    value={customerForm.name}
                    onChange={(event) => updateCustomerForm("name", event.target.value)}
                    placeholder="Nguyen Van A"
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
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rfq-customer-company">Công ty/đơn vị</Label>
                  <Input
                    id="rfq-customer-company"
                    value={customerForm.company}
                    onChange={(event) => updateCustomerForm("company", event.target.value)}
                    placeholder="Ten nha may"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rfq-customer-province">Tỉnh/thành</Label>
                  <Input
                    id="rfq-customer-province"
                    value={customerForm.province}
                    onChange={(event) => updateCustomerForm("province", event.target.value)}
                    placeholder="TP.HCM"
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
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`rfq-note-${item.code}`}>Ghi chú riêng</Label>
                            <Input
                              id={`rfq-note-${item.code}`}
                              value={draft.customerNote}
                              onChange={(event) => updateQuoteItemDraft(item.code, { customerNote: event.target.value })}
                              placeholder="Vi du: can hang chinh hang, giao truoc thu 6"
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
                <Button type="submit" className="bg-blue-800 text-white hover:bg-blue-900">
                  <MessageCircle className="mr-2 size-4" />
                  Gửi yêu cầu báo giá
                </Button>
                <Button type="button" variant="outline" className="border-slate-200 text-slate-600" onClick={closeQuoteModal}>
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <section id="lead-form" className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-heading text-xl font-bold text-slate-950">Kênh phụ: form yêu cầu báo giá</h3>
          <p className="mt-2 text-sm text-slate-600">
            {selectedQuoteCodes.length
              ? `Ưu tiên bấm Gửi Zalo để gửi nhanh ${selectedQuoteCodes.length} mã: ${selectedQuoteText}. Form bên dưới vẫn được điền sẵn nếu cần gửi qua email.`
              : "Ưu tiên chọn sản phẩm và gửi Zalo. Form bên dưới chỉ dùng khi cần gửi thêm thông tin qua email."}
          </p>
        </div>
        <LeadForm initialRequestedCode={selectedQuoteText} />
      </section>
    </div>
  );
}
