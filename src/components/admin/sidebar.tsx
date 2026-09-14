"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, Film, Loader2, LogOut, X } from "lucide-react";
import { NAV_ITEMS } from "./nav";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [navigatingHref, setNavigatingHref] = useState<string | null>(null);

  useEffect(() => {
    setNavigatingHref(null);
  }, [pathname]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-slate-200 transition-all duration-200",
          collapsed ? "lg:w-[68px]" : "lg:w-60",
          "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            "flex items-center gap-2.5 h-14 px-4 border-b border-slate-200 shrink-0",
            collapsed && "lg:justify-center lg:px-0"
          )}
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Film className="w-4 h-4" />
          </div>
          {!collapsed && (
            <span className="font-bold text-slate-900 tracking-tight whitespace-nowrap">
              Cine<span className="text-blue-600">Track</span>{" "}
              <span className="text-slate-400 font-medium text-xs">Admin</span>
            </span>
          )}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="lg:hidden ml-auto p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const isNavigating = navigatingHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (item.href !== pathname) {
                    setNavigatingHref(item.href);
                  }
                  onCloseMobile();
                }}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer",
                  collapsed && "lg:justify-center lg:px-0",
                  active
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : isNavigating
                    ? "bg-blue-50/60 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {isNavigating ? (
                  <Loader2 className="w-[18px] h-[18px] shrink-0 animate-spin text-blue-600" />
                ) : (
                  <Icon
                    className={cn(
                      "w-[18px] h-[18px] shrink-0",
                      active ? "text-blue-600" : "text-slate-400"
                    )}
                  />
                )}
                {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                {!collapsed && isNavigating && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse ml-auto shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2.5 py-3 border-t border-slate-200 space-y-0.5 shrink-0">
          <Link
            href="/"
            onClick={onCloseMobile}
            title={collapsed ? "View site" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer",
              collapsed && "lg:justify-center lg:px-0"
            )}
          >
            <ExternalLink className="w-[18px] h-[18px] text-slate-400 shrink-0" />
            {!collapsed && <span>View site</span>}
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            title={collapsed ? "Sign out" : undefined}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer",
              collapsed && "lg:justify-center lg:px-0"
            )}
          >
            <LogOut className="w-[18px] h-[18px] text-slate-400 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
