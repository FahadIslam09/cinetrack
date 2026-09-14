"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsNavProps {
  className?: string;
}

export function SettingsNav({ className }: SettingsNavProps) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Profile",
      href: "/settings",
      icon: User,
      isActive: pathname === "/settings" || pathname === "/settings/profile",
    },
    {
      label: "Account & Security",
      href: "/settings/account",
      icon: ShieldCheck,
      isActive: pathname === "/settings/account",
    },
  ];

  return (
    <nav
      className={cn(
        "flex items-center gap-1.5 p-1 rounded-xl bg-[#151C27] border border-white/[0.08] overflow-x-auto scrollbar-none",
        className
      )}
      aria-label="Settings Tabs"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer",
              tab.isActive
                ? "bg-[#3B9EFF] text-white shadow-sm"
                : "text-[#A8B0BD] hover:text-[#F5F7FA] hover:bg-white/[0.04]"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
