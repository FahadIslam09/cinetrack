"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type RangeKey = "7" | "30" | "90" | "365";

const PRESETS: { key: RangeKey; label: string }[] = [
  { key: "7", label: "7D" },
  { key: "30", label: "30D" },
  { key: "90", label: "90D" },
  { key: "365", label: "1Y" },
];

export function DateRangePicker({
  rangeKey = "30",
}: {
  rangeKey?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setRange = (key: RangeKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", key);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const active = (PRESETS.find((p) => p.key === rangeKey) || PRESETS[1]).key;

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
      {PRESETS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => setRange(p.key)}
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer",
            active === p.key
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
