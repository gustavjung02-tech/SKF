"use client";

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
  name?: string;
};

const FILTER_OPTIONS_URL = "/data/skf-filter-options.json";
const CODE_INDEX_URL = "/data/skf-code-index.json";
const DEFAULT_QUICK_SUGGESTIONS = ["22212", "6225", "6379", "IR 90X100X26", "UCP208", "60X90X10"];
const TECHNICAL_CODE_PREFIXES = ["TMFT", "TKSA", "NUP", "UCP", "TIH", "NU", "NJ", "UC", "IR", "LG"];
const DIMENSION_TOLERANCE_MM = 0.5;

function normalizeCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normalizeText(value: string | undefined) {
  return (value ?? "").toLowerCase();
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

function getRecordDimensions(record: GroupRecord): DimensionValues {
  const parsedCodeDimensions = parseDimensionsFromCode(record.code);
  const explicitInner = getNumericField(record, ["d1_mm", "dMm", "d_mm", "innerDiameterMm"]);

  return {
    inner: explicitInner ?? parsedCodeDimensions.inner ?? getNumericField(record, ["boreMm"]),
    outer: getNumericField(record, ["outerDiameterMm", "outsideDiameterMm", "DMm", "D_mm"]) ?? parsedCodeDimensions.outer,
    width: getNumericField(record, ["widthMm", "thicknessMm", "bMm", "B_T_mm"]) ?? parsedCodeDimensions.width,
  };
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
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
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

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

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
        selectedSubCategory ||
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
          setError(loadError instanceof Error ? loadError.message : "KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u kÃ­ch thÆ°á»›c SKF.");
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

  const availableSubCategoryOptions = useMemo(() => {
    if (!filterOptions) {
      return [];
    }

    if (!selectedGroup) {
      return filterOptions.subCategories;
    }

    return buildFilterOptionsFromRecords(
      groupDataBySlug[selectedGroup] ?? [],
      (record) => (record.subCategory ? [record.subCategory] : []),
      filterOptions.subCategories,
    );
  }, [filterOptions, groupDataBySlug, selectedGroup]);

  const availableApplicationOptions = useMemo(() => {
    if (!filterOptions) {
      return [];
    }

    if (!selectedGroup && !selectedSubCategory) {
      return filterOptions.applications;
    }

    const records = selectedGroup ? groupDataBySlug[selectedGroup] ?? [] : codeIndex ?? allGroupData;
    const scopedRecords = records.filter((record) => {
      return (
        (!selectedGroup || record.productGroup === selectedGroup) &&
        (!selectedSubCategory || record.subCategory === selectedSubCategory)
      );
    });

    return buildFilterOptionsFromRecords(scopedRecords, getApplicationValues, filterOptions.applications);
  }, [allGroupData, codeIndex, filterOptions, groupDataBySlug, selectedGroup, selectedSubCategory]);

  useEffect(() => {
    if (!selectedSubCategory || availableSubCategoryOptions.length === 0) {
      return;
    }

    if (!hasFilterOption(availableSubCategoryOptions, selectedSubCategory)) {
      setSelectedSubCategory("");
      setSelectedApplication("");
    }
  }, [availableSubCategoryOptions, selectedSubCategory]);

  useEffect(() => {
    if (!selectedApplication || (!selectedGroup && !selectedSubCategory) || availableApplicationOptions.length === 0) {
      return;
    }

    if (!hasFilterOption(availableApplicationOptions, selectedApplication)) {
      setSelectedApplication("");
    }
  }, [availableApplicationOptions, selectedApplication, selectedGroup, selectedSubCategory]);

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
      !selectedSubCategory &&
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
    const matchedResults: Array<SearchRecord & { searchScore: number }> = [];

    for (const record of sourceData) {
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
      const matchesGroup = !selectedGroup || record.productGroup === selectedGroup;
      const matchesSubCategory = !selectedSubCategory || record.subCategory === selectedSubCategory;
      const matchesApplication = !selectedApplication || normalizeText(applicationTextResolved).includes(normalizeText(selectedApplication));
      const matchesIndustry = !selectedIndustry || normalizeText(industriesText).includes(normalizeText(selectedIndustry));
      const matchesMachineGroup = !selectedMachineGroup || normalizeText(machineGroupsText).includes(normalizeText(selectedMachineGroup));
      const matchesPriority = !selectedPriority || record.priority === selectedPriority;

      if (!queryMatch.matches || !matchesGroup || !matchesSubCategory || !matchesApplication || !matchesIndustry || !matchesMachineGroup || !matchesPriority || !dimensionMatch.matches) {
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
    selectedSubCategory,
    parsedInnerDiameter,
    parsedOuterDiameter,
    parsedWidth,
  ]);

  const quickSuggestions = DEFAULT_QUICK_SUGGESTIONS;

  const hasActiveSearch =
    Boolean(query.trim()) ||
    Boolean(selectedGroup) ||
    Boolean(selectedSubCategory) ||
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
    setSelectedSubCategory("");
    setSelectedApplication("");
  }

  function handleSubCategoryChange(value: string | null) {
    setSelectedSubCategory(value ?? "");
    setSelectedApplication("");
  }

  function resetFilters() {
    setSelectedGroup("");
    setSelectedSubCategory("");
    setSelectedApplication("");
    setSelectedIndustry("");
    setSelectedMachineGroup("");
    setSelectedPriority("");
    setInnerDiameter("");
    setOuterDiameter("");
    setWidth("");
    setError("");
  }

  function toggleQuoteItem(item: Pick<GroupRecord, "code" | "name" | "subCategory" | "productGroupLabel">) {
    setSelectedQuoteItems((current) => {
      const exists = current.some((selectedItem) => selectedItem.code === item.code);

      if (exists) {
        return current.filter((selectedItem) => selectedItem.code !== item.code);
      }

      return [
        ...current,
        {
          code: item.code,
          name: item.name ?? item.subCategory ?? item.productGroupLabel,
        },
      ];
    });
  }

  function buildQuoteMessage() {
    const itemLines = selectedQuoteItems.map((item, index) => {
      return `${index + 1}. ${item.code}${item.name ? ` - ${item.name}` : ""}`;
    });

    const dimensionLines = [
      innerDiameter.trim() ? `d: ${innerDiameter.trim()} mm` : "",
      outerDiameter.trim() ? `D: ${outerDiameter.trim()} mm` : "",
      width.trim() ? `B/T: ${width.trim()} mm` : "",
    ].filter(Boolean);

    return [
      "Tôi cần báo giá các mã SKF:",
      ...itemLines,
      "",
      "Vui lòng kiểm tra hàng, giá và thời gian giao.",
      ...(dimensionLines.length ? ["", "Thông số tìm kiếm:", ...dimensionLines] : []),
    ].join("\n");
  }

  async function copyQuoteMessage(message: string) {
    if (!navigator.clipboard?.writeText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(message);
      setCopyNotice("Đã sao chép nội dung báo giá. Anh/chị chỉ cần dán vào Zalo.");
      window.setTimeout(() => setCopyNotice(""), 4500);
    } catch {
      // Browser may block clipboard access; opening Zalo is still the primary action.
    }
  }

  function buildZaloHref(message: string) {
    const separator = siteConfig.zaloLink.includes("?") ? "&" : "?";
    return `${siteConfig.zaloLink}${separator}text=${encodeURIComponent(message)}`;
  }

  function handleSendZalo() {
    if (selectedQuoteItems.length === 0) {
      return;
    }

    const quoteMessage = buildQuoteMessage();
    void copyQuoteMessage(quoteMessage);
    window.open(buildZaloHref(quoteMessage), "_blank", "noopener,noreferrer");
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
              Nhập mã, chọn nhóm hoặc lọc theo kích thước d/D/B-T rồi chọn các mã cần THL báo giá.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            Hiển thị 50 kết quả đầu tiên.
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
              <Label>Gợi ý tra mã</Label>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.slice(0, 6).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition hover:border-blue-200 hover:bg-white"
                  >
                    {suggestion}
                  </button>
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

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label>Nhóm sản phẩm</Label>
                <Select value={selectedGroup} onValueChange={handleGroupChange}>
                  <SelectTrigger className="h-11 w-full bg-white">
                    <SelectValue placeholder="Chọn nhóm sản phẩm" />
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

              <div className="space-y-2">
                <Label>Loại sản phẩm</Label>
                <Select value={selectedSubCategory} onValueChange={handleSubCategoryChange}>
                  <SelectTrigger className="h-11 w-full bg-white">
                    <SelectValue placeholder="Chọn loại sản phẩm" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubCategoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              {totalMatches > 0 ? `Tìm thấy ${totalMatches} kết quả phù hợp.` : "Nhập mã hoặc chọn nhóm để bắt đầu."}
            </p>
          </div>

          {loadingOptions || loadingDataset ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
              <Loader2 className="size-4 animate-spin" />
              Đang tải dữ liệu
            </div>
          ) : null}
        </div>

        {error ? <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

        <div className="grid gap-4">
          {results.map((item) => {
            const isSelected = selectedQuoteCodes.includes(item.code);
            const applicationSummary = item.applicationTextResolved.split("|")[0]?.trim() || "-";

            return (
              <Card
                key={`${item.productGroup}-${item.id}-${item.code}`}
                className={`border-slate-200 shadow-sm transition ${
                  isSelected ? "border-blue-300 bg-blue-50/45 ring-1 ring-blue-200" : "bg-white"
                }`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex gap-3">
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

                      <div className="mt-3">
                        <p className="text-lg font-semibold text-slate-950">{item.code}</p>
                        <p className="mt-1 text-sm text-slate-600">{applicationSummary}</p>
                      </div>

                      <p className="mt-3 text-xs font-semibold text-blue-800">
                        {isSelected ? "Đã chọn báo giá" : "Chọn báo giá"}
                      </p>
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {!loadingDataset && !error && results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
              Không có kết quả phù hợp với bộ lọc hiện tại.
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
            <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex">
              <Button type="button" className="bg-blue-800 text-white hover:bg-blue-900" onClick={handleSendZalo}>
                <MessageCircle className="mr-2 size-4" />
                Gửi Zalo
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
