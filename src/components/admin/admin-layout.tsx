"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { TopLoader } from "./top-loader";
import { cn } from "@/lib/utils";

import type { AdminNotificationItem } from "@/actions/admin";

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

export function AdminShell({
  admin,
  initialNotifications,
  children,
}: {
  admin: AdminUser;
  initialNotifications?: NotificationsData;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopLoader />
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-200",
          collapsed ? "lg:pl-[68px]" : "lg:pl-60"
        )}
      >
        <Header
          admin={admin}
          initialNotifications={initialNotifications}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
