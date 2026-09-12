"use client";

import { useEffect } from "react";

let lockCount = 0;
let previousHtmlOverflow = "";
let previousBodyOverflow = "";

/**
 * Universal scroll-lock hook for all modals.
 * Locks both <html> and <body> and applies .modal-open CSS class to override CSS defaults.
 */
export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (!lock) return;

    if (lockCount === 0) {
      previousHtmlOverflow = document.documentElement.style.overflow;
      previousBodyOverflow = document.body.style.overflow;

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.documentElement.classList.add("modal-open");
      document.body.classList.add("modal-open");
    }
    lockCount++;

    return () => {
      lockCount--;
      if (lockCount <= 0) {
        lockCount = 0;
        document.documentElement.style.overflow = previousHtmlOverflow;
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.classList.remove("modal-open");
        document.body.classList.remove("modal-open");
      }
    };
  }, [lock]);
}
