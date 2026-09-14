"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const start = useCallback(() => {
    setVisible(true);
    setProgress(25);
  }, []);

  const finish = useCallback(() => {
    setProgress(100);
    const t = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 200);
    return () => clearTimeout(t);
  }, []);

  // Listen to all link clicks inside the document
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (anchor.target === "_blank" || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      const current = window.location.pathname + window.location.search;
      // If navigating to a different internal route
      if (href !== current && (href.startsWith("/") || href.startsWith(window.location.origin))) {
        start();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [start]);

  // Gradually increment progress while loading
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + (90 - prev) * 0.2;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [visible]);

  // Finish on route / searchParam change
  useEffect(() => {
    finish();
  }, [pathname, searchParams, finish]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "150ms" : "250ms",
          opacity: visible || progress === 100 ? 1 : 0,
        }}
      />
    </div>
  );
}
