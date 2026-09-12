"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { useLenis } from "lenis/react";

const RADIUS = 17;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const circleRef = useRef<SVGCircleElement>(null);
  const lenis = useLenis();

  // Helper to update progress ring smoothly in exact sync with scroll
  const updateProgress = (currentScroll: number, maxLimit?: number) => {
    const limit =
      maxLimit && maxLimit > 0
        ? maxLimit
        : typeof document !== "undefined"
        ? Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
        : 1;

    const progress = Math.min(Math.max(currentScroll / limit, 0), 1);
    const offset = CIRCUMFERENCE * (1 - progress);

    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = `${offset}px`;
    }
  };

  // 1:1 synchronized frame update with Lenis smooth wheel physics
  useLenis((l) => {
    const scroll = l.scroll;
    setIsVisible(scroll > 280);

    const docLimit =
      typeof document !== "undefined"
        ? Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
        : 1;
    const limit = l.limit > 0 ? l.limit : docLimit;
    updateProgress(scroll, limit);
  });

  // Watch DOM size changes (e.g. clicking "See More" button adds items and expands page height)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      lenis?.resize();
      const scroll = lenis ? lenis.scroll : window.scrollY;
      const docLimit = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      setIsVisible(scroll > 280);
      updateProgress(scroll, lenis?.limit || docLimit);
    };

    // Recalibrate on initial mount
    handleResize();

    // ResizeObserver detects DOM expansion when "See More" adds cards
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      if (document.body) {
        resizeObserver.observe(document.body);
      }
    }

    // Native scroll fallback
    const handleScroll = () => {
      const scroll = window.scrollY;
      setIsVisible(scroll > 280);
      const docLimit = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      updateProgress(scroll, docLimit);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [lenis]);

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
          {/* Muted Track Ring */}
          <circle
            cx="20"
            cy="20"
            r={RADIUS}
            fill="none"
            className="stroke-white/[0.08]"
            strokeWidth="2.5"
          />
          {/* Synchronized Progress Ring */}
          <circle
            ref={circleRef}
            cx="20"
            cy="20"
            r={RADIUS}
            fill="none"
            stroke="#3B9EFF"
            strokeWidth="2.5"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            strokeLinecap="round"
          />
        </svg>

        <ArrowUp className="w-4 h-4 text-[#F5F7FA] group-hover:text-[#3B9EFF] group-hover:-translate-y-0.5 transition-all duration-200 stroke-[2.4]" />
      </button>
    </div>
  );
}
