"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { NAV_ITEMS } from "./nav";
import { cn } from "@/lib/utils";

interface AdminUser {
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  email?: string | null;
}

interface HeaderProps {
  admin: AdminUser;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
}

export function Header({ admin, collapsed, onToggleCollapse, onOpenMobile }: HeaderProps) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const current = NAV_ITEMS.find((n) =>
    n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initials = (admin.fullName || admin.username || "A")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center gap-3 px-4">
      <button
        type="button"
        onClick={onOpenMobile}
        aria-label="Open menu"
        className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
      >
        <Menu className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label="Toggle sidebar"
        className="hidden lg:inline-flex p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
      >
        {collapsed ? (
          <PanelLeft className="w-5 h-5" />
        ) : (
          <PanelLeftClose className="w-5 h-5" />
        )}
      </button>

      <div className="flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-slate-400 font-medium">Admin</span>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-900 truncate">
          {current?.label || "Dashboard"}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <Bell className="w-5 h-5" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg p-4 z-50">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <p className="text-xs text-slate-500 mt-1">
                No new notifications.
              </p>
            </div>
          )}
        </div>

        {/* Profile */}
        <Link
          href={admin.username ? `/u/${admin.username}` : "/admin"}
          className="flex items-center gap-2 pl-2 ml-1 rounded-lg hover:bg-slate-100 py-1 pr-2 cursor-pointer"
        >
          {admin.avatarUrl ? (
            <img
              src={admin.avatarUrl}
              alt="Admin"
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
          )}
          <div className="hidden sm:block leading-tight text-left">
            <div className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
              {admin.fullName || admin.username}
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
              {admin.username ? `@${admin.username}` : "Admin"}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
