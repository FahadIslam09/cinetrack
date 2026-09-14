"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomDropdown, type DropdownOption } from "@/components/ui/custom-dropdown";

function usePushParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const push = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return { push, isPending };
}

export function SearchBar({
  param = "q",
  placeholder = "Search…",
  initialValue = "",
}: {
  param?: string;
  placeholder?: string;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [isTyping, setIsTyping] = useState(false);
  const { push, isPending } = usePushParam();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(initialValue);
    setIsTyping(false);
  }, [initialValue]);

  const onChange = (v: string) => {
    setValue(v);
    setIsTyping(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setIsTyping(false);
      push(param, v);
    }, 300);
  };

  const isLoading = isTyping || isPending;

  return (
    <div className="relative">
      {isLoading ? (
        <Loader2 className="w-4 h-4 text-blue-500 animate-spin absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      ) : (
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-shadow"
      />
      {value && !isLoading && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export interface FilterOption {
  value: string;
  label: string;
  dot?: string;
  icon?: React.ReactNode;
}

export function FilterSelect({
  param,
  label,
  options,
  defaultValue = "all",
  className,
}: {
  param: string;
  label: string;
  options: FilterOption[];
  defaultValue?: string;
  className?: string;
}) {
  const { push, isPending } = usePushParam();
  const searchParams = useSearchParams();
  const value = searchParams.get(param) || defaultValue;

  const dropdownOptions: DropdownOption[] = options.map((o) => ({
    id: o.value,
    label: o.label,
    dot: o.dot,
    icon: o.icon,
  }));

  const isFiltered = value !== defaultValue;

  return (
    <CustomDropdown
      variant="light"
      value={value}
      onChange={(newVal) => push(param, newVal === defaultValue ? null : newVal)}
      options={dropdownOptions}
      highlightActive={isFiltered}
      isLoading={isPending}
      ariaLabel={label}
      className={className}
      buttonClassName="h-9 px-3 rounded-xl text-xs font-medium"
      menuWidth="min-w-[160px]"
    />
  );
}

