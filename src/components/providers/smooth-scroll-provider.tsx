"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

function RouteScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    // Reset scroll to top smoothly on page route changes
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);

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
      {children}
    </ReactLenis>
  );
}
