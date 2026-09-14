"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Lightbulb,
  Bug,
  MessageSquare,
  CheckCheck,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { NAV_ITEMS } from "./nav";
import { cn } from "@/lib/utils";
import {
  getAdminNotifications,
  markAllRequestsReviewed,
  type AdminNotificationItem,
} from "@/actions/admin";

interface AdminUser {
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  email?: string | null;
}

interface NotificationsData {
  unreadCount: number;
  items: AdminNotificationItem[];
}

interface HeaderProps {
  admin: AdminUser;
  initialNotifications?: NotificationsData;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function Header({
  admin,
  initialNotifications,
  collapsed,
  onToggleCollapse,
  onOpenMobile,
}: HeaderProps) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationsData>(
    initialNotifications || { unreadCount: 0, items: [] }
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const current = NAV_ITEMS.find((n) =>
    n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)
  );

  // Sync with initialNotifications when props change (e.g. server revalidations)
  useEffect(() => {
    if (initialNotifications) {
      setNotifications(initialNotifications);
    }
  }, [initialNotifications]);

  // Close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleToggleNotif = async () => {
    const nextState = !notifOpen;
    setNotifOpen(nextState);

    // Refresh dynamically when opening
    if (nextState) {
      setIsRefreshing(true);
      try {
        const fresh = await getAdminNotifications();
        setNotifications(fresh);
      } catch (err) {
        console.error("Failed to refresh notifications:", err);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleMarkAllReviewed = async () => {
    if (isMarking) return;
    setIsMarking(true);
    try {
      await markAllRequestsReviewed();
      setNotifications((prev) => ({
        unreadCount: 0,
        items: prev.items.map((i) => ({ ...i, status: "under_review" })),
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarking(false);
    }
  };

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
        {/* Dynamic Notifications Panel */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={handleToggleNotif}
            aria-label="Notifications"
            className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-blue-600 rounded-full ring-2 ring-white">
                {notifications.unreadCount > 9 ? "9+" : notifications.unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              {/* Panel Header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  {notifications.unreadCount > 0 ? (
                    <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 text-blue-700">
                      {notifications.unreadCount} new
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-500">
                      All caught up
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isRefreshing && (
                    <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                  )}
                  {notifications.unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllReviewed}
                      disabled={isMarking}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark reviewed
                    </button>
                  )}
                </div>
              </div>

              {/* Panel Body */}
              <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
                {notifications.items.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                      <Bell className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No requests yet</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                      When users submit feature requests or feedback, they will appear here.
                    </p>
                  </div>
                ) : (
                  notifications.items.map((item) => {
                    const isNew = item.status === "new";
                    const Icon =
                      item.category === "bug"
                        ? Bug
                        : item.category === "feature"
                        ? Lightbulb
                        : MessageSquare;
                    const iconColor =
                      item.category === "bug"
                        ? "text-rose-600 bg-rose-50"
                        : item.category === "feature"
                        ? "text-blue-600 bg-blue-50"
                        : "text-purple-600 bg-purple-50";

                    return (
                      <Link
                        key={item.id}
                        href="/admin/requests"
                        onClick={() => setNotifOpen(false)}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group cursor-pointer",
                          isNew && "bg-blue-50/40"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            iconColor
                          )}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </span>
                            {isNew && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                            <span className="font-medium text-slate-600 truncate max-w-[120px]">
                              {item.author}
                            </span>
                            <span>•</span>
                            <span>{formatRelativeTime(item.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>

              {/* Panel Footer */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  href="/admin/requests"
                  onClick={() => setNotifOpen(false)}
                  className="font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  Manage all requests
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <Link
                  href="/admin/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Notification center
                </Link>
              </div>
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
