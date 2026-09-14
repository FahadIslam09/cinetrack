"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  Heart,
  CheckCheck,
  Loader2,
  Bookmark,
} from "lucide-react";
import {
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type UserNotificationItem,
} from "@/actions/notifications";

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffSec) || diffSec < 0) return "Just now";
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function NotificationDropdown({
  currentUser,
}: {
  currentUser?: {
    id?: string;
    username?: string | null;
  } | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<{
    unreadCount: number;
    items: UserNotificationItem[];
  }>({ unreadCount: 0, items: [] });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarking, startMarkTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial notifications if user is logged in
  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;

    getUserNotifications()
      .then((res) => {
        if (mounted) setNotifications(res);
      })
      .catch((err) => console.error("Failed to load initial notifications:", err));

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  // Handle click outside & escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && currentUser) {
      setIsRefreshing(true);
      try {
        const fresh = await getUserNotifications();
        setNotifications(fresh);
      } catch (err) {
        console.error("Failed to refresh notifications:", err);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleMarkAllRead = () => {
    startMarkTransition(async () => {
      setNotifications((prev) => ({
        unreadCount: 0,
        items: prev.items.map((it) => ({ ...it, isRead: true })),
      }));
      await markAllNotificationsRead();
    });
  };

  const handleItemClick = (item: UserNotificationItem) => {
    setIsOpen(false);
    if (!item.isRead) {
      setNotifications((prev) => ({
        unreadCount: Math.max(0, prev.unreadCount - 1),
        items: prev.items.map((it) =>
          it.id === item.id ? { ...it, isRead: true } : it
        ),
      }));
      markNotificationRead(item.id);
    }
  };

  if (!currentUser) {
    return (
      <Link
        href="/login"
        aria-label="Notifications"
        title="Sign in to view notifications"
        className="relative p-2 text-[#A8B0BD] hover:text-[#F5F7FA] hover:bg-[#1A2330] rounded-lg transition-colors shrink-0 cursor-pointer"
      >
        <Bell className="w-5 h-5 block" />
      </Link>
    );
  }

  const panelContent = (
    <>
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between bg-[#0E131E]/70">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#F5F7FA]">Notifications</p>
          {notifications.unreadCount > 0 ? (
            <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-md bg-[#3B9EFF]/15 text-[#3B9EFF]">
              {notifications.unreadCount} new
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-[11px] font-medium rounded-md bg-white/[0.06] text-[#6F7886]">
              All caught up
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isRefreshing && (
            <Loader2 className="w-3.5 h-3.5 text-[#3B9EFF] animate-spin" />
          )}
          {notifications.unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={isMarking}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3B9EFF] hover:text-[#60A5FA] cursor-pointer disabled:opacity-50 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Panel Body */}
      <div className="max-h-[340px] overflow-y-auto divide-y divide-white/[0.06] custom-scrollbar">
        {notifications.items.length === 0 ? (
          <div className="py-9 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-white/[0.05] text-[#6F7886] flex items-center justify-center mx-auto mb-2.5">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#F5F7FA]">No notifications yet</p>
            <p className="text-xs text-[#A8B0BD] mt-1 max-w-[240px] mx-auto leading-relaxed">
              When other users react to your reviews, they will appear here.
            </p>
          </div>
        ) : (
          notifications.items.map((item) => {
            const isNew = !item.isRead;
            const linkHref = item.link || "/library";

            return (
              <Link
                key={item.id}
                href={linkHref}
                onClick={() => handleItemClick(item)}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors group cursor-pointer ${
                  isNew ? "bg-[#3B9EFF]/[0.07]" : ""
                }`}
              >
                {/* Actor Avatar / Icon */}
                <div className="relative shrink-0 mt-0.5">
                  {item.actor?.avatarUrl ? (
                    <img
                      src={item.actor.avatarUrl}
                      alt={item.actor.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 bg-[#1A2330]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center ring-1 ring-rose-500/25">
                      <Heart className="w-4 h-4 fill-rose-500/30 text-rose-400" />
                    </div>
                  )}
                  {item.type === "review_reaction" && item.actor?.avatarUrl && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#121824] flex items-center justify-center text-rose-400 ring-1 ring-white/10">
                      <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-[#F5F7FA] truncate group-hover:text-[#3B9EFF] transition-colors">
                      {item.title}
                    </span>
                    {isNew && (
                      <span className="w-2 h-2 rounded-full bg-[#3B9EFF] shrink-0 shadow-[0_0_6px_rgba(59,158,255,0.6)]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#A8B0BD] line-clamp-2 mt-0.5 leading-snug">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-[#6F7886] mt-1.5 block">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Panel Footer */}
      <div className="px-4 py-2.5 bg-[#0E131E]/80 border-t border-white/[0.08] flex items-center justify-between text-xs">
        <Link
          href="/library"
          onClick={() => setIsOpen(false)}
          className="font-semibold text-[#3B9EFF] hover:text-[#60A5FA] inline-flex items-center gap-1.5 transition-colors"
        >
          <Bookmark className="w-3.5 h-3.5" />
          Your library
        </Link>
        <span className="text-[11px] text-[#6F7886]">
          CineTrack Activity
        </span>
      </div>
    </>
  );

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative p-2 text-[#A8B0BD] hover:text-[#F5F7FA] hover:bg-[#1A2330] rounded-lg transition-colors shrink-0 cursor-pointer"
      >
        <Bell className="w-5 h-5 block" />
        {notifications.unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#3B9EFF] rounded-full ring-2 ring-[#0F141D] shadow-[0_0_8px_rgba(59,158,255,0.45)] animate-in zoom-in-75 duration-150">
            {notifications.unreadCount > 9 ? "9+" : notifications.unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile Screen: Centered modal below header with backdrop */}
          <div className="sm:hidden">
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed inset-x-3 top-[70px] z-50 max-w-sm mx-auto rounded-2xl border border-white/[0.12] bg-[#121824]/98 backdrop-blur-2xl shadow-2xl shadow-black/90 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
              {panelContent}
            </div>
          </div>

          {/* Desktop Screen: Anchored directly below the bell icon */}
          <div className="hidden sm:block absolute right-0 top-full mt-2 w-96 rounded-2xl border border-white/[0.12] bg-[#121824]/95 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
            {panelContent}
          </div>
        </>
      )}
    </div>
  );
}
