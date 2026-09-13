"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Compass,
  Film,
  BookmarkCheck,
  Plus,
  MoreHorizontal,
  X,
  ChevronRight,
  Info,
  Mail,
  Lightbulb,
  FileText,
  Shield,
} from "lucide-react";
import { QuickAddModal } from "@/components/quick-add/quick-add-modal";

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Close sheet on route change
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  // Close sheet on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMoreOpen(false);
    };
    if (isMoreOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMoreOpen]);

  const moreLinks = [
    {
      label: "About",
      href: "/about",
      icon: Info,
    },
    {
      label: "Contact",
      href: "/contact",
      icon: Mail,
    },
    {
      label: "Terms and Conditions",
      href: "/terms",
      icon: FileText,
    },
    {
      label: "Privacy Policy",
      href: "/privacy",
      icon: Shield,
    },
  ];

  const isMoreActive =
    isMoreOpen ||
    ["/about", "/contact", "/feedback", "/terms", "/privacy"].includes(pathname);

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
        (![
          "/",
          "/discover",
          "/search",
          "/login",
          "/about",
          "/contact",
          "/feedback",
          "/terms",
          "/privacy",
        ].includes(pathname) &&
          !pathname.startsWith("/movie") &&
          !pathname.startsWith("/series") &&
          !pathname.startsWith("/anime") &&
          !pathname.startsWith("/tv")),
    },
  ];

  return (
    <>
      {/* Backdrop for More Sheet */}
      {isMoreOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-up Sheet for More links */}
      {isMoreOpen && (
        <div
          className="md:hidden fixed bottom-16 left-0 right-0 z-50 p-4 pb-6 bg-[#151C27] border-t border-white/10 rounded-t-2xl shadow-[0_-12px_32px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom duration-200 ease-out"
          role="dialog"
          aria-label="More navigation links"
        >
          {/* Subtle drag indicator handle */}
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3" />

          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F7886]">
              More Links
            </span>
            <button
              type="button"
              onClick={() => setIsMoreOpen(false)}
              className="p-1 text-[#6F7886] hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Eye-catching Highlighted Feature Request Card */}
          <Link
            href="/feedback"
            onClick={() => setIsMoreOpen(false)}
            className="flex items-center justify-between p-3.5 mb-3 rounded-2xl bg-gradient-to-r from-[#3B9EFF]/15 to-[#3B9EFF]/5 hover:from-[#3B9EFF]/20 hover:to-[#3B9EFF]/10 border border-[#3B9EFF]/30 transition-all cursor-pointer group shadow-[0_0_16px_rgba(59,158,255,0.08)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#3B9EFF]/20 border border-[#3B9EFF]/30 flex items-center justify-center text-[#3B9EFF] shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold text-[#F5F7FA] block leading-tight">
                  Need a New Feature?
                </span>
                <span className="text-[11px] text-[#3B9EFF] mt-0.5 block">
                  Request a feature or report a bug
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#3B9EFF] text-white shrink-0">
              Request
            </span>
          </Link>

          <div className="space-y-1">
            {moreLinks.map((link) => {
              const Icon = link.icon;
              const isCurrent = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMoreOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-[#3B9EFF]/15 text-[#3B9EFF] font-semibold"
                      : "text-[#F5F7FA] hover:bg-white/[0.06] active:bg-white/[0.1] font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isCurrent ? "text-[#3B9EFF]" : "text-[#A8B0BD]"
                      }`}
                    />
                    <span className="text-sm">{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6F7886]" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe bg-[#151C27]/95 backdrop-blur-xl border-t border-white/[0.06] shadow-2xl">
        <div className="h-16 flex items-center justify-around px-1 sm:px-2">
          {navItems.map((item) => {
            if (item.isPrimary) {
              return (
                <button
                  key={item.label}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setIsAddOpen(true)}
                  className="flex flex-col items-center justify-center min-w-[48px] h-full py-1 gap-0.5 group focus:outline-none cursor-pointer"
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
                className={`flex flex-col items-center justify-center min-w-[44px] h-full py-1 gap-1 transition-colors cursor-pointer ${
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

          {/* Right Corner: "More" Button */}
          <button
            type="button"
            onClick={() => setIsMoreOpen((prev) => !prev)}
            className={`flex flex-col items-center justify-center min-w-[44px] h-full py-1 gap-1 transition-colors cursor-pointer ${
              isMoreActive
                ? "text-[#3B9EFF]"
                : "text-[#A8B0BD] hover:text-[#F5F7FA]"
            }`}
            aria-expanded={isMoreOpen}
            aria-label="More navigation links"
          >
            <div className="relative">
              <MoreHorizontal className="w-5 h-5" />
              {isMoreActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#3B9EFF]" />
              )}
            </div>
            <span className="text-[11px] font-medium tracking-tight">More</span>
          </button>
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
