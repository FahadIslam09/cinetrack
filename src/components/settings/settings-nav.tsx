"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsNavProps {
  className?: string;
}

export function SettingsNav({ className }: SettingsNavProps) {
  const pathname = usePathname();
  const [navigatingHref, setNavigatingHref] = useState<string | null>(null);

  useEffect(() => {
    setNavigatingHref(null);
  }, [pathname]);

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
        const isNavigating = navigatingHref === tab.href && !tab.isActive;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            onClick={() => {
              if (!tab.isActive) {
                setNavigatingHref(tab.href);
              }
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer",
              tab.isActive
                ? "bg-[#3B9EFF] text-white shadow-sm"
                : isNavigating
                ? "bg-white/[0.08] text-white"
                : "text-[#A8B0BD] hover:text-[#F5F7FA] hover:bg-white/[0.04]"
            )}
          >
            {isNavigating ? (
              <Loader2 className="w-4 h-4 shrink-0 animate-spin text-[#3B9EFF]" />
            ) : (
              <Icon className="w-4 h-4 shrink-0" />
            )}
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
