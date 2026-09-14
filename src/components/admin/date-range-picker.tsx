"use client";

import { useState, useEffect, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
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
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<RangeKey | null>(null);

  useEffect(() => {
    if (!isPending) setPendingKey(null);
  }, [isPending]);

  const setRange = (key: RangeKey) => {
    if (key === rangeKey || isPending) return;
    setPendingKey(key);
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", key);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const active = (PRESETS.find((p) => p.key === rangeKey) || PRESETS[1]).key;

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
      {PRESETS.map((p) => {
        const isButtonLoading = isPending && pendingKey === p.key;
        return (
          <button
            key={p.key}
            type="button"
            disabled={isPending}
            onClick={() => setRange(p.key)}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:cursor-wait",
              active === p.key
                ? "bg-slate-900 text-white"
                : isButtonLoading
                ? "bg-slate-100 text-slate-800"
                : "text-slate-500 hover:text-slate-800",
              isPending && !isButtonLoading && "opacity-60"
            )}
          >
            {isButtonLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
            <span>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}
