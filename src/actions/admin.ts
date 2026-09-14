"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { profiles, featureRequests } from "@/lib/db/schema";
import { getAdminProfile } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { notifyNewRequest } from "@/lib/telegram";
import { eq, desc, count } from "drizzle-orm";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

const REQUEST_STATUSES = [
  "new",
  "under_review",
  "planned",
  "in_progress",
  "completed",
  "declined",
] as const;
const PRIORITIES = ["low", "medium", "high"] as const;

export async function updateFeatureRequest(params: {
  id: string;
  status?: string;
  priority?: string;
  adminNotes?: string | null;
}) {
  const admin = await getAdminProfile();
  if (!admin) return { error: "Unauthorized" };

  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (params.status && REQUEST_STATUSES.includes(params.status as any)) {
    set.status = params.status;
  }
  if (params.priority && PRIORITIES.includes(params.priority as any)) {
    set.priority = params.priority;
  }
  if (params.adminNotes !== undefined) {
    set.adminNotes = params.adminNotes?.trim() || null;
  }

  try {
    await db
      .update(featureRequests)
      .set(set)
      .where(eq(featureRequests.id, params.id));
    revalidatePath("/admin");
    revalidatePath("/admin/requests");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (err: any) {
    console.error("updateFeatureRequest error:", err);
    return { error: err.message || "Failed to update request." };
  }
}

export async function setUserSuspended(userId: string, suspended: boolean) {
  const admin = await getAdminProfile();
  if (!admin) return { error: "Unauthorized" };

  if (userId === admin.id) {
    return { error: "Cannot suspend your own account." };
  }

  try {
    const [target] = await db
      .select({ role: profiles.role })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (!target) return { error: "User not found." };
    if (target.role === "admin") {
      return { error: "Cannot suspend an admin account." };
    }

    await db
      .update(profiles)
      .set({ status: suspended ? "suspended" : "active", updatedAt: new Date() })
      .where(eq(profiles.id, userId));
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (err: any) {
    console.error("setUserSuspended error:", err);
    return { error: err.message || "Failed to update user status." };
  }
}

export async function submitFeatureRequest(params: {
  category: string;
  title: string;
  description: string;
  email?: string | null;
}) {
  try {
    const headersList = await headers();
    const clientIp =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "anonymous";

    const rateLimit = checkRateLimit(`feedback:${clientIp}`, {
      limit: 5,
      windowMs: 10 * 60 * 1000, // 5 submissions per 10 minutes
    });

    if (!rateLimit.allowed) {
      return {
        error: "Too many submissions. Please wait a few minutes before submitting another request.",
      };
    }

    const category = ["feature", "bug", "general"].includes(params.category)
      ? params.category
      : "feature";
    const title = params.title?.trim().slice(0, 140);
    const description = params.description?.trim().slice(0, 4000);

    if (!title || !description) {
      return { error: "Title and description are required." };
    }

    if (title.length < 3) {
      return { error: "Title must be at least 3 characters long." };
    }

    const rawEmail = params.email?.trim() || null;
    if (rawEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(rawEmail) || rawEmail.length > 150) {
        return { error: "Please enter a valid email address." };
      }
    }

    let userId: string | null = null;
    let submitterUsername: string | null = null;
    let submitterEmail = rawEmail;

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const [profile] = await db
          .select({ id: profiles.id, username: profiles.username })
          .from(profiles)
          .where(eq(profiles.id, user.id))
          .limit(1);
        if (profile) {
          userId = profile.id;
          submitterUsername = profile.username;
        }
        if (!submitterEmail && user.email) {
          submitterEmail = user.email;
        }
      }
    } catch {
      // anonymous submission is fine
    }

    await db.insert(featureRequests).values({
      userId,
      email: submitterEmail,
      category: category as any,
      title,
      description,
    });

    // Send instant Telegram alert asynchronously
    notifyNewRequest({
      title,
      description,
      category,
      email: submitterEmail,
      username: submitterUsername,
    }).catch((err) => {
      console.error("Failed to send Telegram notification for request:", err);
    });

    revalidatePath("/admin");
    revalidatePath("/admin/requests");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (err: any) {
    console.error("submitFeatureRequest error:", err);
    return { error: "Failed to submit request. Please try again later." };
  }
}

export type AdminNotificationItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  author: string;
};

export async function getAdminNotifications(): Promise<{
  unreadCount: number;
  items: AdminNotificationItem[];
}> {
  const admin = await getAdminProfile();
  if (!admin) return { unreadCount: 0, items: [] };

  try {
    const [unreadRes] = await db
      .select({ n: count(featureRequests.id) })
      .from(featureRequests)
      .where(eq(featureRequests.status, "new"));

    const recent = await db
      .select({
        id: featureRequests.id,
        title: featureRequests.title,
        description: featureRequests.description,
        category: featureRequests.category,
        status: featureRequests.status,
        createdAt: featureRequests.createdAt,
        email: featureRequests.email,
        username: profiles.username,
      })
      .from(featureRequests)
      .leftJoin(profiles, eq(featureRequests.userId, profiles.id))
      .orderBy(desc(featureRequests.createdAt))
      .limit(6);

    return {
      unreadCount: unreadRes?.n ?? 0,
      items: recent.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        author: r.username ? `@${r.username}` : r.email || "Anonymous",
      })),
    };
  } catch (err) {
    console.error("getAdminNotifications error:", err);
    return { unreadCount: 0, items: [] };
  }
}

export async function markAllRequestsReviewed() {
  const admin = await getAdminProfile();
  if (!admin) return { error: "Unauthorized" };

  try {
    await db
      .update(featureRequests)
      .set({ status: "under_review", updatedAt: new Date() })
      .where(eq(featureRequests.status, "new"));

    revalidatePath("/admin");
    revalidatePath("/admin/requests");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (err: any) {
    console.error("markAllRequestsReviewed error:", err);
    return { error: err.message || "Failed to update requests." };
  }
}
