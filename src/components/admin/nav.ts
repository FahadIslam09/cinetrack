import {
  LayoutDashboard,
  Users,
  Film,
  Library,
  MessageSquare,
  Lightbulb,
  Flag,
  Bell,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/media", label: "Media", icon: Film },
  { href: "/admin/activity", label: "Libraries & Activity", icon: Library },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/requests", label: "Feature Requests", icon: Lightbulb },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];
