"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { profiles, featureRequests } from "@/lib/db/schema";
import { getAdminProfile } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

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
    revalidatePath("/admin/requests");
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
  const category = ["feature", "bug", "general"].includes(params.category)
    ? params.category
    : "feature";
  const title = params.title?.trim().slice(0, 140);
  const description = params.description?.trim().slice(0, 4000);

  if (!title || !description) {
    return { error: "Title and description are required." };
  }

  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const [profile] = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1);
      if (profile) userId = profile.id;
    }
  } catch {
    // anonymous submission is fine
  }

  try {
    await db.insert(featureRequests).values({
      userId,
      email: params.email?.trim() || null,
      category: category as any,
      title,
      description,
    });
    revalidatePath("/admin/requests");
    return { success: true };
  } catch (err: any) {
    console.error("submitFeatureRequest error:", err);
    return { error: err.message || "Failed to submit request." };
  }
}
