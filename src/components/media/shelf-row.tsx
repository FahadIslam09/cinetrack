"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ShelfRowProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
}

export function ShelfRow({
  title,
  subtitle,
  badge,
  badgeColor = "text-[#3B9EFF] bg-[#3B9EFF]/10 border-[#3B9EFF]/20",
  actionHref,
  actionLabel = "Explore all",
  children,
}: ShelfRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -380 : 380;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="flex flex-col w-full my-4 sm:my-6">
      {/* Shelf Header */}
      <div className="px-4 flex items-center justify-between mb-3.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-lg sm:text-xl tracking-tight text-[#F5F7FA]">
              {title}
            </h2>
            {badge && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${badgeColor}`}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[#6F7886] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Actions & Shelf Chevrons */}
        <div className="flex items-center gap-2 shrink-0">
          {actionHref && (
            <Link
              href={actionHref}
              className="text-xs font-semibold text-[#6F7886] hover:text-[#F5F7FA] flex items-center gap-0.5 transition-colors mr-1"
            >
              <span>{actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Desktop Chevron Navigation Buttons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="w-8 h-8 rounded-lg bg-[#1A2330] hover:bg-[#253244] border border-white/[0.06] text-[#A8B0BD] hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-8 h-8 rounded-lg bg-[#1A2330] hover:bg-[#253244] border border-white/[0.06] text-[#A8B0BD] hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Shelf */}
      <div
        ref={scrollRef}
        className="flex gap-3.5 sm:gap-4 overflow-x-auto px-4 pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {children}
      </div>
    </section>
  );
}
