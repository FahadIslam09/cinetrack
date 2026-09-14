"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
  className?: string;
  variant?: "text" | "pill" | "subtle";
}

export function BackButton({
  fallbackUrl = "/",
  label = "Back",
  className,
  variant = "text",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined") {
      const isSameOriginReferrer =
        typeof document !== "undefined" &&
        Boolean(document.referrer) &&
        document.referrer.startsWith(window.location.origin);

      const hasHistoryIndex =
        window.history.state &&
        typeof window.history.state.idx === "number" &&
        window.history.state.idx > 0;

      const hasHistoryLength = window.history.length > 1;

      if (hasHistoryIndex || isSameOriginReferrer || hasHistoryLength) {
        router.back();
        return;
      }
    }
    router.push(fallbackUrl);
  };

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F141D]/80 hover:bg-[#1A2330] active:scale-95 text-[#F5F7FA] border border-white/15 backdrop-blur-md text-xs font-semibold shadow-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B9EFF]/50",
          className
        )}
      >
        <ArrowLeft className="w-4 h-4 text-[#3B9EFF]" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Go back to previous page"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold text-[#A8B0BD] hover:text-white transition-colors cursor-pointer group active:scale-95",
        className
      )}
    >
      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-[#3B9EFF]" />
      <span>{label}</span>
    </button>
  );
}
