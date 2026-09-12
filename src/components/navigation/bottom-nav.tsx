"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Compass, Film, Tv, BookmarkCheck, Plus } from "lucide-react";
import { QuickAddModal } from "@/components/quick-add/quick-add-modal";

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type");
  const [isAddOpen, setIsAddOpen] = useState(false);

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
      label: "Add",
      href: "#",
      icon: Plus,
      isActive: isAddOpen,
      isPrimary: true,
    },
    {
      label: "Library",
      href: "/library",
      icon: BookmarkCheck,
      isActive:
        pathname === "/library" ||
        pathname.startsWith("/u/") ||
        (!["/", "/discover", "/search", "/login"].includes(pathname) &&
          !pathname.startsWith("/movie") &&
          !pathname.startsWith("/series") &&
          !pathname.startsWith("/anime") &&
          !pathname.startsWith("/tv")),
    },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#151C27]/95 backdrop-blur-xl border-t border-white/[0.06] shadow-2xl">
        <div className="h-16 flex items-center justify-around px-2">
          {navItems.map((item) => {
            if (item.isPrimary) {
              return (
                <button
                  key={item.label}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setIsAddOpen(true)}
                  className="flex flex-col items-center justify-center min-w-[52px] h-full py-1 gap-0.5 group focus:outline-none cursor-pointer"
                  aria-label="Add to Library"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 ${
                      isAddOpen
                        ? "bg-[#5AAFFF] text-white shadow-[#3B9EFF]/40 ring-2 ring-[#3B9EFF]/50"
                        : "bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white shadow-[#3B9EFF]/25"
                    }`}
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#3B9EFF] tracking-tight">
                    {item.label}
                  </span>
                </button>
              );
            }

            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[48px] h-full py-1 gap-1 transition-colors ${
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

      {/* Add to Library Modal */}
      <QuickAddModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        media={null}
      />
    </>
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
