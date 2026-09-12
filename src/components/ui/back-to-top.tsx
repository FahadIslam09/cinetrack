"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useLenis } from "lenis/react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const lenis = useLenis();

  // Listen to smooth scroll position via Lenis
  useLenis((l) => {
    const scroll = l.scroll;
    const limit =
      l.limit ||
      (typeof document !== "undefined"
        ? document.documentElement.scrollHeight - window.innerHeight
        : 1) ||
      1;
    setIsVisible(scroll > 280);
    setProgress(Math.min(Math.max(scroll / limit, 0), 1));
  });

  // Fallback scroll listener for resilience
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      setIsVisible(currentScroll > 280);
      setProgress(
        maxScroll > 0
          ? Math.min(Math.max(currentScroll / maxScroll, 0), 1)
          : 0
      );
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div
      className={`fixed bottom-20 md:bottom-8 right-4 sm:right-6 md:right-8 z-30 transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-3 scale-90 pointer-events-none"
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
        className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-[#151C27]/90 hover:bg-[#1A2434] active:scale-90 backdrop-blur-xl border border-white/10 hover:border-[#3B9EFF]/50 shadow-[0_8px_24px_rgba(0,0,0,0.45)] hover:shadow-[0_0_20px_rgba(59,158,255,0.3)] transition-all duration-300 cursor-pointer select-none"
      >
        {/* Circular Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-[2px]"
          viewBox="0 0 40 40"
        >
          {/* Track Circle */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            className="stroke-white/[0.08]"
            strokeWidth="2.5"
          />
          {/* Active Progress Ring */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke="#3B9EFF"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-150 ease-out"
          />
        </svg>

        {/* Up Arrow Icon */}
        <ArrowUp className="w-4 h-4 text-[#F5F7FA] group-hover:text-[#3B9EFF] group-hover:-translate-y-0.5 transition-all duration-200 stroke-[2.4]" />
      </button>
    </div>
  );
}
