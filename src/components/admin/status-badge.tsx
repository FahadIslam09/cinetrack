import { cn } from "@/lib/utils";
import type { BadgeColors } from "./theme";

interface StatusBadgeProps {
  colors: BadgeColors;
  className?: string;
}

export function StatusBadge({ colors, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium whitespace-nowrap",
        colors.text,
        colors.bg,
        colors.border,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
      {colors.label}
    </span>
  );
}
