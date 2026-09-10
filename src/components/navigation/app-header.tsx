"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Film } from "lucide-react";

interface AppHeaderProps {
  user?: {
    email?: string;
    avatarUrl?: string;
    username?: string;
  } | null;
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-[#151C27]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-sm">
      <div className="h-16 max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#3B9EFF]/15 border border-[#3B9EFF]/30 flex items-center justify-center text-[#3B9EFF] transition-transform group-hover:scale-105">
            <Film className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-[#F5F7FA]">
            Cine<span className="text-[#3B9EFF]">Track</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className={`transition-colors ${
              pathname === "/" ? "text-[#3B9EFF]" : "text-[#A8B0BD] hover:text-[#F5F7FA]"
            }`}
          >
            Home
          </Link>
          <Link
            href="/discover"
            className={`transition-colors ${
              pathname === "/discover" ? "text-[#3B9EFF]" : "text-[#A8B0BD] hover:text-[#F5F7FA]"
            }`}
          >
            Discover
          </Link>
          <Link
            href="/discover?type=movie"
            className={`transition-colors ${
              pathname.includes("type=movie") ? "text-[#3B9EFF]" : "text-[#A8B0BD] hover:text-[#F5F7FA]"
            }`}
          >
            Movies
          </Link>
          <Link
            href="/discover?type=series"
            className={`transition-colors ${
              pathname.includes("type=series") ? "text-[#3B9EFF]" : "text-[#A8B0BD] hover:text-[#F5F7FA]"
            }`}
          >
            TV Shows
          </Link>
          <Link
            href="/discover?type=anime"
            className={`transition-colors ${
              pathname.includes("type=anime") ? "text-[#3B9EFF]" : "text-[#A8B0BD] hover:text-[#F5F7FA]"
            }`}
          >
            Anime
          </Link>
          <Link
            href="/library"
            className={`transition-colors ${
              pathname === "/library" ? "text-[#3B9EFF]" : "text-[#A8B0BD] hover:text-[#F5F7FA]"
            }`}
          >
            My Library
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#A8B0BD] hover:text-[#F5F7FA] hover:bg-white/[0.04] transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </Link>

          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[#A8B0BD] hover:text-[#F5F7FA] hover:bg-white/[0.04] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#3B9EFF] ring-2 ring-[#151C27]" />
          </button>

          {user ? (
            <Link
              href={user.username ? `/@${user.username}` : "/library"}
              className="w-10 h-10 flex items-center justify-center ml-1"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
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
              className="ml-2 px-3 py-1.5 rounded-lg bg-[#3B9EFF] text-xs font-semibold text-white hover:bg-[#5AAFFF] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
