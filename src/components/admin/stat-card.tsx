import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName?: string;
  delta?: number | null;
  deltaLabel?: string;
  hint?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  delta,
  deltaLabel,
  hint,
}: StatCardProps) {
  const deltaPct = typeof delta === "number" ? Math.round(delta) : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            iconClassName || "bg-blue-50 text-blue-600"
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 leading-none tracking-tight">
          {value}
        </div>
        {deltaPct !== null ? (
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md",
                deltaPct > 0
                  ? "text-emerald-700 bg-emerald-50"
                  : deltaPct < 0
                  ? "text-rose-700 bg-rose-50"
                  : "text-slate-600 bg-slate-100"
              )}
            >
              {deltaPct > 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : deltaPct < 0 ? (
                <ArrowDownRight className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {Math.abs(deltaPct)}%
            </span>
            {deltaLabel && (
              <span className="text-slate-400">{deltaLabel}</span>
            )}
          </div>
        ) : hint ? (
          <p className="text-xs text-slate-400 mt-1.5">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
