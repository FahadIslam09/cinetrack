"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Compass, Film, Tv, BookmarkCheck } from "lucide-react";

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type");

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Film,
      isActive: pathname === "/",
    },
    {
      label: "Discover",
      href: "/discover",
      icon: Compass,
      isActive: pathname === "/discover" && !currentType,
    },
    {
      label: "Library",
      href: "/library",
      icon: BookmarkCheck,
      isActive: pathname === "/library",
    },
    {
      label: "Profile",
      href: "/profile",
      icon: () => (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      isActive: pathname.startsWith("/profile") || pathname.startsWith("/@"),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#151C27]/95 backdrop-blur-xl border-t border-white/[0.06] shadow-2xl">
      <div className="h-16 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 h-full py-1 gap-1 transition-colors ${
                item.isActive
                  ? "text-[#3B9EFF]"
                  : "text-[#A8B0BD] hover:text-[#F5F7FA]"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#3B9EFF]" />
                )}
              </div>
              <span className="text-[11px] font-medium tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function BottomNav() {
  return (
    <Suspense
      fallback={
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#151C27]/95 backdrop-blur-xl border-t border-white/[0.06] h-16" />
      }
    >
      <BottomNavContent />
    </Suspense>
  );
}
