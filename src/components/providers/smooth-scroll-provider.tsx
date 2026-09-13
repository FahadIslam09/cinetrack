"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

function RouteScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    // Only reset scroll to top if not navigating directly to a hash
    if (typeof window !== "undefined" && !window.location.hash) {
      lenis?.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenis]);

  return null;
}

function AnchorScrollHandler() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    if (!lenis) return;

    // Handle smooth scrolling when clicking on any anchor link with a hash
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Check if this is an in-page section link (#section or /#section on root)
      let targetSelector = "";
      if (href.startsWith("#") && href.length > 1) {
        targetSelector = href;
      } else if (href.startsWith("/#") && pathname === "/") {
        targetSelector = href.slice(1);
      }

      if (!targetSelector || targetSelector === "#") return;

      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        e.preventDefault();
        lenis.scrollTo(targetElement as HTMLElement, {
          offset: -80, // Offset for sticky/fixed navigation header
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        // Update URL hash without browser instant jump
        window.history.pushState(null, "", targetSelector);
      }
    };

    // Also handle initial landing hash navigation if URL was loaded with a hash
    if (typeof window !== "undefined" && window.location.hash) {
      const initialElement = document.querySelector(window.location.hash);
      if (initialElement) {
        const timer = setTimeout(() => {
          lenis.scrollTo(initialElement as HTMLElement, {
            offset: -80,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }, 150);
        return () => clearTimeout(timer);
      }
    }

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, [lenis, pathname]);

  return null;
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        duration: 1.1,
        smoothWheel: true,
      }}
    >
      <RouteScrollReset />
      <AnchorScrollHandler />
      {children}
    </ReactLenis>
  );
}
