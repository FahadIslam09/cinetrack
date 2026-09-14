import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  icon: LucideIcon;
  iconClassName?: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  timestamp: string;
}

export function ActivityList({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                item.iconClassName || "bg-slate-100 text-slate-500"
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-700 leading-snug">{item.title}</div>
              {item.meta && <div className="text-xs text-slate-400 mt-0.5">{item.meta}</div>}
            </div>
            <span className="text-xs text-slate-400 shrink-0">{item.timestamp}</span>
          </li>
        );
      })}
    </ul>
  );
}
