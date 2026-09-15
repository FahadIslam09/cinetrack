"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowUpDown, Check, Loader2 } from "lucide-react";

export interface DropdownOption {
  id: string;
  label: string;
  shortLabel?: string;
  count?: number;
  dot?: string;
  icon?: React.ReactNode;
  color?: string;
}

export interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  align?: "left" | "right";
  className?: string;
  menuWidth?: string;
  ariaLabel?: string;
  suffixIcon?: "chevron" | "sort";
  triggerLabel?: string;
  buttonClassName?: string;
  highlightActive?: boolean;
  dropDirection?: "up" | "down" | "auto";
  isLoading?: boolean;
  variant?: "dark" | "light";
}

export function CustomDropdown({
  value,
  onChange,
  options,
  align = "left",
  className = "",
  menuWidth,
  ariaLabel,
  suffixIcon = "chevron",
  triggerLabel,
  buttonClassName,
  highlightActive,
  dropDirection = "auto",
  isLoading = false,
  variant = "dark",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(dropDirection === "up");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (dropDirection === "up") setOpenUpward(true);
    else if (dropDirection === "down") setOpenUpward(false);
  }, [dropDirection]);

  useEffect(() => {
    if (isOpen && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.id === value) || options[0];
  const isFiltered =
    highlightActive !== undefined
      ? highlightActive
      : value !== "all" && value !== "All" && value !== "recently_updated";

  const handleToggle = () => {
    if (!isOpen) {
      if (dropDirection === "up") {
        setOpenUpward(true);
      } else if (dropDirection === "down") {
        setOpenUpward(false);
      } else if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const scrollParent =
          dropdownRef.current.closest(".overflow-y-auto") ||
          dropdownRef.current.closest('[role="dialog"]') ||
          document.documentElement;
        const parentRect = scrollParent.getBoundingClientRect();

        const viewportBottom = window.innerHeight;
        const effectiveBottom =
          scrollParent && scrollParent !== document.documentElement
            ? Math.min(parentRect.bottom, viewportBottom)
            : viewportBottom;

        const viewportTop = 0;
        const effectiveTop =
          scrollParent && scrollParent !== document.documentElement
            ? Math.max(parentRect.top, viewportTop)
            : viewportTop;

        const spaceBelow = effectiveBottom - rect.bottom;
        const spaceAbove = rect.top - effectiveTop;

        const MENU_HEIGHT = 205;
        // Default: opens downward. If no space below and more clearance above, open upward
        if (spaceBelow < MENU_HEIGHT && spaceAbove > spaceBelow) {
          setOpenUpward(true);
        } else {
          setOpenUpward(false);
        }
      }
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const displayLabel = triggerLabel || selectedOption?.label;

  const isLight = variant === "light";

  return (
    <div ref={dropdownRef} className={`relative ${isOpen ? "z-50" : "z-10"} ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        className={`w-full px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-medium flex items-center justify-between gap-1 sm:gap-1.5 transition-all duration-150 cursor-pointer border select-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
          buttonClassName || "h-8 sm:h-9"
        } ${
          isLight
            ? isFiltered
              ? "bg-blue-50/80 border-blue-300 text-blue-700 font-semibold shadow-sm"
              : isOpen
              ? "bg-white border-blue-500 ring-2 ring-blue-100 text-slate-900 shadow-sm"
              : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm"
            : isFiltered
            ? "bg-[#3B9EFF]/12 border-[#3B9EFF]/60 text-[#3B9EFF] font-semibold shadow-[0_0_12px_rgba(59,158,255,0.12)]"
            : isOpen
            ? "bg-[#1A2330] border-[#3B9EFF] text-[#F5F7FA]"
            : "bg-[#151C27] hover:bg-[#1A2330] border-white/[0.08] hover:border-white/[0.14] text-[#A8B0BD] hover:text-[#F5F7FA]"
        }`}
      >
        <span className="flex items-center gap-1 sm:gap-1.5 truncate min-w-0">
          {selectedOption?.dot && (
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${selectedOption.dot} shrink-0`} />
          )}
          {selectedOption?.icon && (
            <span className={`shrink-0 ${isLight ? "text-blue-600" : "text-[#3B9EFF]"}`}>{selectedOption.icon}</span>
          )}
          <span className="truncate">
            {selectedOption?.shortLabel ? (
              <>
                <span className="hidden sm:inline">{displayLabel}</span>
                <span className="inline sm:hidden">{selectedOption.shortLabel}</span>
              </>
            ) : (
              displayLabel
            )}
          </span>
        </span>

        {isLoading ? (
          <Loader2 className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 animate-spin ${isLight ? "text-blue-600" : "text-[#3B9EFF]"}`} />
        ) : suffixIcon === "sort" ? (
          <ArrowUpDown
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 transition-colors ${
              isLight
                ? isFiltered || isOpen
                  ? "text-blue-600"
                  : "text-slate-400"
                : isFiltered || isOpen
                ? "text-[#3B9EFF]"
                : "text-[#6F7886]"
            }`}
          />
        ) : (
          <ChevronDown
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 transition-transform duration-200 ${
              isOpen
                ? isLight
                  ? "rotate-180 text-blue-600"
                  : "rotate-180 text-[#3B9EFF]"
                : isFiltered
                ? isLight
                  ? "text-blue-600"
                  : "text-[#3B9EFF]"
                : isLight
                ? "text-slate-400"
                : "text-[#6F7886]"
            }`}
          />
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 ${
            openUpward
              ? "bottom-full mb-1.5 origin-bottom animate-in fade-in zoom-in-95 slide-in-from-bottom-1"
              : "top-full mt-1.5 origin-top animate-in fade-in zoom-in-95 slide-in-from-top-1"
          } ${
            align === "right" ? "right-0" : "left-0"
          } ${menuWidth || "min-w-[170px] max-w-[280px]"} ${
            isLight
              ? "bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl shadow-slate-900/10 ring-1 ring-black/5"
              : "bg-[#121824]/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl shadow-black/80"
          } rounded-xl overflow-hidden p-1 duration-150`}
        >
          <div
            data-lenis-prevent="true"
            className={`max-h-[190px] overflow-y-auto overscroll-contain ${
              isLight ? "custom-scrollbar-light" : "custom-scrollbar"
            } pr-1.5 flex flex-col gap-0.5`}
          >
            {options.map((opt) => {
              const isSelected = opt.id === value;
              return (
                <button
                  key={opt.id}
                  ref={isSelected ? selectedItemRef : undefined}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors text-left outline-none focus:outline-none focus-visible:outline-none select-none ${
                    isLight
                      ? isSelected
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
                      : isSelected
                      ? "bg-[#3B9EFF]/15 text-[#3B9EFF] font-semibold"
                      : "text-[#A8B0BD] hover:text-[#F5F7FA] hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {opt.dot && <span className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`} />}
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className={`truncate ${opt.color || ""}`}>{opt.label}</span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {opt.count !== undefined && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          isLight
                            ? isSelected
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-500"
                            : isSelected
                            ? "bg-[#3B9EFF]/20 text-[#3B9EFF]"
                            : "bg-white/[0.05] text-[#6F7886]"
                        }`}
                      >
                        {opt.count}
                      </span>
                    )}
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 shrink-0 ${isLight ? "text-blue-600" : "text-[#3B9EFF]"}`} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
