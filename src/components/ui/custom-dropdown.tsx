"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowUpDown, Check, Loader2 } from "lucide-react";

export interface DropdownOption {
  id: string;
  label: string;
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
        setOpenUpward(spaceBelow < MENU_HEIGHT && spaceAbove > spaceBelow);
      }
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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

  return (
    <div ref={dropdownRef} className={`relative ${isOpen ? "z-50" : "z-10"} ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        className={`w-full px-3 rounded-xl text-xs font-medium flex items-center justify-between gap-1.5 transition-all duration-150 cursor-pointer border select-none ${
          buttonClassName || "h-9"
        } ${
          isFiltered
            ? "bg-[#3B9EFF]/12 border-[#3B9EFF]/60 text-[#3B9EFF] font-semibold shadow-[0_0_12px_rgba(59,158,255,0.12)]"
            : isOpen
            ? "bg-[#1A2330] border-[#3B9EFF]/50 text-[#F5F7FA] ring-2 ring-[#3B9EFF]/20"
            : "bg-[#151C27] hover:bg-[#1A2330] border-white/[0.08] hover:border-white/[0.18] text-[#A8B0BD] hover:text-[#F5F7FA]"
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {selectedOption?.dot && (
            <span className={`w-2 h-2 rounded-full ${selectedOption.dot} shrink-0`} />
          )}
          {selectedOption?.icon && (
            <span className="shrink-0 text-[#3B9EFF]">{selectedOption.icon}</span>
          )}
          <span className="truncate">{displayLabel}</span>
        </span>

        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 shrink-0 text-[#3B9EFF] animate-spin" />
        ) : suffixIcon === "sort" ? (
          <ArrowUpDown
            className={`w-3.5 h-3.5 shrink-0 transition-colors ${
              isFiltered || isOpen ? "text-[#3B9EFF]" : "text-[#6F7886]"
            }`}
          />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#3B9EFF]" : isFiltered ? "text-[#3B9EFF]" : "text-[#6F7886]"
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
          } ${menuWidth || "min-w-[170px]"} max-w-[280px] bg-[#121824]/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl shadow-black/80 rounded-xl overflow-hidden p-1 duration-150`}
        >
          <div className="max-h-[190px] overflow-y-auto custom-scrollbar pr-1.5 flex flex-col gap-0.5">
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
                  className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors text-left ${
                    isSelected
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
                          isSelected
                            ? "bg-[#3B9EFF]/20 text-[#3B9EFF]"
                            : "bg-white/[0.05] text-[#6F7886]"
                        }`}
                      >
                        {opt.count}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#3B9EFF] shrink-0" />}
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
