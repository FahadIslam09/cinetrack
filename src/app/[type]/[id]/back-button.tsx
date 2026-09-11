"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface DetailsBackButtonProps {
  fallbackUrl?: string;
}

export function DetailsBackButton({ fallbackUrl = "/" }: DetailsBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined") {
      const hasHistory =
        (window.history.state && window.history.state.idx > 0) ||
        window.history.length > 1;

      if (hasHistory) {
        router.back();
        return;
      }
    }
    router.push(fallbackUrl);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Go back"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F141D]/80 hover:bg-[#1A2330] active:scale-95 text-[#F5F7FA] border border-white/15 backdrop-blur-md text-xs font-semibold shadow-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B9EFF]/50"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back</span>
    </button>
  );
}
