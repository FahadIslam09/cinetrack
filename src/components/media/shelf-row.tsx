import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ShelfRowProps {
  title: string;
  badge?: string;
  actionHref?: string;
  actionLabel?: string;
  accentColor?: string; // e.g. "bg-[#3B9EFF]" or "bg-[#F5C84B]"
  children: React.ReactNode;
}

export function ShelfRow({
  title,
  badge,
  actionHref,
  actionLabel = "Explore all",
  accentColor = "bg-[#3B9EFF]",
  children,
}: ShelfRowProps) {
  return (
    <section className="flex flex-col gap-3 w-full my-4">
      {/* Header */}
      <div className="px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-4 ${accentColor} rounded-full shrink-0`} />
          <h2 className="font-bold text-base sm:text-lg tracking-tight text-[#F5F7FA]">
            {title}
          </h2>
          {badge && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-white/[0.08] text-[#A8B0BD]">
              {badge}
            </span>
          )}
        </div>

        {actionHref && (
          <Link
            href={actionHref}
            className="text-xs font-medium text-[#A8B0BD] hover:text-[#F5F7FA] flex items-center gap-0.5 transition-colors"
          >
            <span>{actionLabel}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="flex gap-3 overflow-x-auto px-4 py-1 no-scrollbar snap-x snap-mandatory">
        {children}
      </div>
    </section>
  );
}
