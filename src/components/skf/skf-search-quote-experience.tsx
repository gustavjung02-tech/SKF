"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { Search, SlidersHorizontal, Loader2, RotateCcw, ArrowDownToLine } from "lucide-react";
import { useSearchParams } from "next/navigation";
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

const FILTER_OPTIONS_URL = "/data/skf-filter-options.json";
const CODE_INDEX_URL = "/data/skf-code-index.json";

function normalizeCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function normalizeText(value: string | undefined) {
  return (value ?? "").toLowerCase();
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

  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query);

  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedApplication, setSelectedApplication] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedMachineGroup, setSelectedMachineGroup] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

  const [codeIndex, setCodeIndex] = useState<GroupRecord[] | null>(null);
  const [groupDataBySlug, setGroupDataBySlug] = useState<Record<string, GroupRecord[]>>({});
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<SearchRecord[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [selectedQuoteCode, setSelectedQuoteCode] = useState("");

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

  const shouldLoadCodeIndex =
    !selectedGroup &&
    Boolean(
      deferredQuery.trim() ||
        selectedSubCategory ||
        selectedApplication ||
        selectedPriority,
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
    const sourceData = selectedGroup ? groupDataBySlug[selectedGroup] ?? null : codeIndex;
    const rawQuery = deferredQuery.trim();
    const normalizedQuery = normalizeCode(rawQuery);
    const loweredQuery = normalizeText(rawQuery);

    if (!sourceData) {
      setResults([]);
      setTotalMatches(0);
      return;
    }

    if (!selectedGroup && !rawQuery && !selectedSubCategory && !selectedApplication && !selectedPriority) {
      setResults([]);
      setTotalMatches(0);
      return;
    }

    let matchCount = 0;
    const nextResults: SearchRecord[] = [];

    for (const record of sourceData) {
      const applicationTextResolved = getApplicationText(record);
      const industriesText = getIndustriesText(record);
      const machineGroupsText = getMachineGroupsText(record);

      const matchesQuery =
        !rawQuery ||
        normalizeText(record.code).includes(loweredQuery) ||
        normalizeText(record.name).includes(loweredQuery) ||
        normalizeText(record.productGroupLabel).includes(loweredQuery) ||
        normalizeText(record.subCategory).includes(loweredQuery) ||
        normalizeText(applicationTextResolved).includes(loweredQuery) ||
        normalizeCode(record.code).includes(normalizedQuery) ||
        normalizeCode(record.normalizedCode ?? "").includes(normalizedQuery);

      const matchesGroup = !selectedGroup || record.productGroup === selectedGroup;
      const matchesSubCategory = !selectedSubCategory || record.subCategory === selectedSubCategory;
      const matchesApplication = !selectedApplication || normalizeText(applicationTextResolved).includes(normalizeText(selectedApplication));
      const matchesIndustry = !selectedIndustry || normalizeText(industriesText).includes(normalizeText(selectedIndustry));
      const matchesMachineGroup = !selectedMachineGroup || normalizeText(machineGroupsText).includes(normalizeText(selectedMachineGroup));
      const matchesPriority = !selectedPriority || record.priority === selectedPriority;

      if (!matchesQuery || !matchesGroup || !matchesSubCategory || !matchesApplication || !matchesIndustry || !matchesMachineGroup || !matchesPriority) {
        continue;
      }

      matchCount += 1;

      if (nextResults.length < 50) {
        nextResults.push({
          ...record,
          applicationTextResolved,
          industriesText,
          machineGroupsText,
        });
      }
    }

    setResults(nextResults);
    setTotalMatches(matchCount);
  }, [
    codeIndex,
    deferredQuery,
    groupDataBySlug,
    selectedApplication,
    selectedGroup,
    selectedIndustry,
    selectedMachineGroup,
    selectedPriority,
    selectedSubCategory,
  ]);

  function resetFilters() {
    setSelectedGroup("");
    setSelectedSubCategory("");
    setSelectedApplication("");
    setSelectedIndustry("");
    setSelectedMachineGroup("");
    setSelectedPriority("");
    setError("");
  }

  function handleQuoteRequest(code: string) {
    setSelectedQuoteCode(code);
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.28)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">Tra mã SKF</p>
            <h2 className="font-heading text-2xl font-bold text-slate-950 sm:text-3xl">
              Search theo code và lọc theo nhóm dữ liệu đã có
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              Dùng `skf-code-index.json` cho ô tra mã, dùng `skf-filter-options.json` để render bộ lọc, và chỉ load file nhóm trong `public/data/skf/` khi bạn chọn nhóm.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            Chỉ hiển thị 50 kết quả đầu tiên.
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-2">
              <Label htmlFor="skf-code-search">Tra mã SKF</Label>
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
            </div>

            <div className="space-y-2">
              <Label>Gợi ý tra mã</Label>
              <div className="flex flex-wrap gap-2">
                {(filterOptions?.suggestedQueries ?? []).slice(0, 6).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setQuery(suggestion)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
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
                Bộ lọc SKF
              </div>
              <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
                <RotateCcw className="mr-1 size-3.5" />
                Reset
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label>Nhóm sản phẩm</Label>
                <Select value={selectedGroup} onValueChange={(value) => setSelectedGroup(value ?? "")}>
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
                <Label>Phân nhóm</Label>
                <Select value={selectedSubCategory} onValueChange={(value) => setSelectedSubCategory(value ?? "")}>
                  <SelectTrigger className="h-11 w-full bg-white">
                    <SelectValue placeholder="Chọn phân nhóm" />
                  </SelectTrigger>
                  <SelectContent>
                    {(filterOptions?.subCategories ?? []).map((option) => (
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
                    {(filterOptions?.applications ?? []).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ngành</Label>
                <Select value={selectedIndustry} onValueChange={(value) => setSelectedIndustry(value ?? "")} disabled={!selectedGroup}>
                  <SelectTrigger className="h-11 w-full bg-white">
                    <SelectValue placeholder={selectedGroup ? "Chọn ngành" : "Chọn nhóm trước"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(filterOptions?.industries ?? []).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cụm máy</Label>
                <Select value={selectedMachineGroup} onValueChange={(value) => setSelectedMachineGroup(value ?? "")} disabled={!selectedGroup}>
                  <SelectTrigger className="h-11 w-full bg-white">
                    <SelectValue placeholder={selectedGroup ? "Chọn cụm máy" : "Chọn nhóm trước"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(filterOptions?.machineGroups ?? []).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ưu tiên</Label>
                <Select value={selectedPriority} onValueChange={(value) => setSelectedPriority(value ?? "")}>
                  <SelectTrigger className="h-11 w-full bg-white">
                    <SelectValue placeholder="Chọn mức ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    {(filterOptions?.priorities ?? []).map((option) => (
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

      <section className="space-y-4">
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
          {results.map((item) => (
            <Card key={`${item.productGroup}-${item.id}-${item.code}`} className="border-slate-200 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                        {item.productGroupLabel ?? item.productGroup}
                      </span>
                      {item.subCategory ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {item.subCategory}
                        </span>
                      ) : null}
                      {item.priority ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                          {item.priority}
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-lg font-semibold text-slate-950">{item.code}</p>
                      <p className="text-sm text-slate-600">{item.name || item.code}</p>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <p>
                        <span className="font-medium text-slate-900">Normalized:</span> {item.normalizedCode || "-"}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">Nhóm:</span> {item.productGroupLabel || "-"}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-medium text-slate-900">Ứng dụng:</span> {item.applicationTextResolved || "-"}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="h-11 bg-blue-800 text-white hover:bg-blue-900"
                    onClick={() => handleQuoteRequest(item.code)}
                  >
                    <ArrowDownToLine className="mr-2 size-4" />
                    {selectedQuoteCode === item.code ? "Đã chọn để báo giá" : "Gửi yêu cầu báo giá"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {!loadingDataset && !error && results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
              Không có kết quả phù hợp với bộ lọc hiện tại.
            </div>
          ) : null}
        </div>
      </section>

      <section id="lead-form" className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-heading text-xl font-bold text-slate-950">Form yêu cầu báo giá</h3>
          <p className="mt-2 text-sm text-slate-600">
            {selectedQuoteCode
              ? `Đã chọn mã ${selectedQuoteCode}. Form bên dưới sẽ điền sẵn mã này để bạn gửi yêu cầu báo giá.`
              : "Chọn một kết quả ở trên hoặc nhập trực tiếp mã SKF vào form bên dưới."}
          </p>
        </div>
        <LeadForm initialRequestedCode={selectedQuoteCode} />
      </section>
    </div>
  );
}
