"use client";

import { useEffect } from "react";

let activeLockCount = 0;
let lockedScrollY = 0;
let originalHtmlOverflow = "";
let originalBodyOverflow = "";
let originalBodyPosition = "";
let originalBodyTop = "";
let originalBodyLeft = "";
let originalBodyRight = "";
let originalBodyWidth = "";
let originalBodyPaddingRight = "";

function isTargetScrollable(target: HTMLElement | null): boolean {
  let curr = target;
  while (curr && curr !== document.body && curr !== document.documentElement) {
    if (
      curr.classList.contains("modal-scrollbar") ||
      curr.classList.contains("custom-scrollbar") ||
      curr.classList.contains("dropdown-scrollbar") ||
      curr.classList.contains("overflow-y-auto") ||
      curr.getAttribute("data-modal-scroll") === "true"
    ) {
      return true;
    }

    if (
      (curr.tagName === "TEXTAREA" || curr.tagName === "SELECT") &&
      curr.scrollHeight > curr.clientHeight
    ) {
      return true;
    }

    curr = curr.parentElement;
  }
  return false;
}

// Touchmove handler: prevents dragging background through overlay/backdrop on mobile,
// while letting scrollable containers scroll with 100% native momentum.
const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 0) return;
  const target = e.target as HTMLElement | null;
  if (!isTargetScrollable(target)) {
    e.preventDefault();
  }
};

// Keyboard handler: blocks space, page up/down on background when modal is open
const handleKeyDown = (e: KeyboardEvent) => {
  const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
  if (!scrollKeys.includes(e.key)) return;

  const target = e.target as HTMLElement | null;
  if (
    target &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable)
  ) {
    return;
  }

  if (!isTargetScrollable(target)) {
    e.preventDefault();
  }
};

/**
 * Universal scroll-lock hook for all modals.
 * Locks body via position: fixed (preventing any background movement) and
 * avoids layout shifts by compensating scrollbar width.
 */
export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (!lock) return;

    const html = document.documentElement;
    const body = document.body;

    if (activeLockCount === 0) {
      lockedScrollY = window.scrollY || html.scrollTop || 0;
      const scrollbarWidth = window.innerWidth - html.clientWidth;

      originalHtmlOverflow = html.style.overflow;
      originalBodyOverflow = body.style.overflow;
      originalBodyPosition = body.style.position;
      originalBodyTop = body.style.top;
      originalBodyLeft = body.style.left;
      originalBodyRight = body.style.right;
      originalBodyWidth = body.style.width;
      originalBodyPaddingRight = body.style.paddingRight;

      html.classList.add("modal-open");
      body.classList.add("modal-open");

      html.style.setProperty("overflow", "hidden", "important");
      html.style.setProperty("overscroll-behavior", "none", "important");

      body.style.position = "fixed";
      body.style.top = `-${lockedScrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";

      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
        html.style.setProperty("--scrollbar-compensation", `${scrollbarWidth}px`);
      }

      document.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
      document.addEventListener("keydown", handleKeyDown, { passive: false, capture: true });
    }

    activeLockCount++;

    return () => {
      activeLockCount = Math.max(0, activeLockCount - 1);

      if (activeLockCount === 0) {
        html.classList.remove("modal-open");
        body.classList.remove("modal-open");

        html.style.overflow = originalHtmlOverflow;
        body.style.overflow = originalBodyOverflow;
        body.style.position = originalBodyPosition;
        body.style.top = originalBodyTop;
        body.style.left = originalBodyLeft;
        body.style.right = originalBodyRight;
        body.style.width = originalBodyWidth;
        body.style.paddingRight = originalBodyPaddingRight;
        html.style.removeProperty("--scrollbar-compensation");

        document.removeEventListener("touchmove", handleTouchMove, { capture: true });
        document.removeEventListener("keydown", handleKeyDown, { capture: true });

        window.scrollTo(0, lockedScrollY);
      }
    };
  }, [lock]);
}
