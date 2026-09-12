"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Film, Plus } from "lucide-react";
import { QuickAddModal } from "../quick-add/quick-add-modal";
import { LogoIcon } from "@/components/ui/logo-icon";

import { HeaderSearch } from "./header-search";

interface AppHeaderProps {
  user?: {
    email?: string;
    avatarUrl?: string;
    username?: string;
  } | null;
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-[#0F141D]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_8px_rgba(0,0,0,0.04)] h-16 sm:h-[70px] flex items-center">
        <div className="w-full max-w-[834px] lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Brand & Navigation Links */}
          <div className="flex items-center gap-6 lg:gap-8 min-w-0">
            {/* Brand Logo & Badge */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0 group focus:outline-none"
            >
              <LogoIcon className="w-7 h-7" size={28} priority />
              <span className="font-bold text-lg tracking-tight text-[#F5F7FA]">
                Cine<span className="text-[#3B9EFF]">Track</span>
              </span>
            </Link>

            {/* Main Navigation Menu Links */}
            <nav
              className="hidden md:flex items-center gap-3 lg:gap-6 shrink-0 text-[13px] lg:text-[14px]"
              aria-label="Main Navigation"
            >
              <Link
                href="/"
                className={`relative py-2 font-semibold whitespace-nowrap transition-colors flex items-center gap-1 group ${
                  pathname === "/"
                    ? "text-[#F5F7FA]"
                    : "text-[#A8B0BD] hover:text-[#F5F7FA]"
                }`}
              >
                <span>Home</span>
                {pathname === "/" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#3B9EFF]" />
                )}
              </Link>
              <Link
                href="/discover"
                className={`relative py-2 font-semibold whitespace-nowrap transition-colors flex items-center gap-1 group ${
                  pathname === "/discover"
                    ? "text-[#F5F7FA]"
                    : "text-[#A8B0BD] hover:text-[#F5F7FA]"
                }`}
              >
                <span>Discover</span>
                {pathname === "/discover" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#3B9EFF]" />
                )}
              </Link>
              <Link
                href="/library"
                className={`relative py-2 font-semibold whitespace-nowrap transition-colors flex items-center gap-1 group ${
                  pathname === "/library"
                    ? "text-[#F5F7FA]"
                    : "text-[#A8B0BD] hover:text-[#F5F7FA]"
                }`}
              >
                <span>My Library</span>
                {pathname === "/library" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#3B9EFF]" />
                )}
              </Link>
            </nav>
          </div>

          {/* Right: Search Bar & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 shrink-0">
            {/* Search Input for Desktop / Tablet & Mobile Overlay */}
            <HeaderSearch
              isMobileOpen={isMobileSearchOpen}
              onCloseMobile={() => setIsMobileSearchOpen(false)}
            />

            {/* Quick Add Button - Hidden on mobile and iPad Mini */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsQuickAddOpen(true)}
              className="hidden md:inline-flex h-9 px-3 sm:px-3.5 rounded-lg bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-semibold text-xs sm:text-[13px] items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer"
              title="Add to Library"
            >
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap">Add</span>
            </button>

            {/* Mobile Search Icon Button (Immediately Beside Notification Bell) */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              aria-label="Search"
              className="md:hidden p-2 text-[#A8B0BD] hover:text-[#F5F7FA] hover:bg-[#1A2330] rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <Search className="w-5 h-5 block" />
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              suppressHydrationWarning
              aria-label="Notifications"
              className="relative p-2 text-[#A8B0BD] hover:text-[#F5F7FA] hover:bg-[#1A2330] rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <Bell className="w-5 h-5 block" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3B9EFF] ring-2 ring-[#0F141D]" />
            </button>

            {/* User Profile Avatar / Sign In */}
            {user ? (
              <Link
                href={user.username ? `/${user.username}` : "/library"}
                className="flex items-center shrink-0 pl-1"
                title="User Profile"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-white/[0.06] hover:border-white/[0.16] ring-1 ring-white/[0.08] hover:ring-[#3B9EFF]/50 transition-all"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#3B9EFF]/20 border border-[#3B9EFF]/40 flex items-center justify-center text-xs font-semibold text-[#3B9EFF]">
                    {user.email?.slice(0, 2).toUpperCase() || "U"}
                  </div>
                )}
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg bg-[#1A2330] hover:bg-[#253244] text-xs font-semibold text-[#F5F7FA] border border-white/[0.08] transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Add to Library Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        media={null}
      />
    </>
  );
}

