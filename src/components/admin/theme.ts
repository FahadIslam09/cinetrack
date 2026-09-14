// Admin light-theme tokens & semantic color maps (shared, no client-only exports)

export const ADMIN = {
  accent: "#2563EB",
  accentHover: "#1D4ED8",
  accentSoft: "#EFF6FF",
  accentBorder: "#BFDBFE",
} as const;

export type WatchStatus =
  | "watching"
  | "completed"
  | "plan_to_watch"
  | "on_hold"
  | "dropped";

export type RequestStatus =
  | "new"
  | "under_review"
  | "planned"
  | "in_progress"
  | "completed"
  | "declined";

export interface BadgeColors {
  label: string;
  text: string;
  bg: string;
  border: string;
  dot: string;
}

export const WATCH_STATUS: Record<WatchStatus, BadgeColors> = {
  watching: {
    label: "Watching",
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Completed",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  plan_to_watch: {
    label: "Want to Watch",
    text: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  on_hold: {
    label: "On Hold",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  dropped: {
    label: "Dropped",
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

export const REQUEST_STATUS: Record<RequestStatus, BadgeColors> = {
  new: {
    label: "New",
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  under_review: {
    label: "Under Review",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  planned: {
    label: "Planned",
    text: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  in_progress: {
    label: "In Progress",
    text: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
  completed: {
    label: "Completed",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  declined: {
    label: "Declined",
    text: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

export const REQUEST_STATUS_ORDER: RequestStatus[] = [
  "new",
  "under_review",
  "planned",
  "in_progress",
  "completed",
  "declined",
];

export const PRIORITY: Record<"low" | "medium" | "high", BadgeColors> = {
  low: {
    label: "Low",
    text: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  medium: {
    label: "Medium",
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  high: {
    label: "High",
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

export const REQUEST_CATEGORY: Record<
  "feature" | "bug" | "general",
  BadgeColors
> = {
  feature: {
    label: "Feature",
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  bug: {
    label: "Bug",
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  general: {
    label: "General",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
};

export const ACCOUNT_STATUS: Record<"active" | "suspended", BadgeColors> = {
  active: {
    label: "Active",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  suspended: {
    label: "Suspended",
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};
