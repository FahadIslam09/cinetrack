"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notifyNewUserRegistration } from "@/lib/telegram";

export interface AccountSecurityInfo {
  email: string;
  unconfirmedEmail?: string | null;
  providers: string[];
  hasPassword: boolean;
  isGoogleOnly: boolean;
  createdAt?: string | null;
  lastSignInAt?: string | null;
  username?: string | null;
}

export async function getAccountSecurityInfo(): Promise<AccountSecurityInfo | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const [profile] = await db
      .select({ username: profiles.username, status: profiles.status })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    const rawProviders: string[] =
      user.app_metadata?.providers ||
      (user.app_metadata?.provider ? [user.app_metadata.provider] : []);

    const hasEmailIdentity = Boolean(
      user.identities?.some((i: any) => i.provider === "email")
    );

    const isGoogleOnly =
      rawProviders.includes("google") &&
      !rawProviders.includes("email") &&
      !hasEmailIdentity;

    const hasPassword = !isGoogleOnly;

    return {
      email: user.email || "",
      unconfirmedEmail: (user as any).new_email || null,
      providers: rawProviders.length > 0 ? rawProviders : ["email"],
      hasPassword,
      isGoogleOnly,
      createdAt: user.created_at || null,
      lastSignInAt: user.last_sign_in_at || null,
      username: profile?.username || null,
    };
  } catch (err) {
    console.error("getAccountSecurityInfo error:", err);
    return null;
  }
}

export async function changeEmail(newEmail: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { error: "You must be signed in to change your email." };
    }

    const [profile] = await db
      .select({ status: profiles.status })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (profile?.status === "suspended" || profile?.status === "banned") {
      return { error: `Account is ${profile.status}. Modifying credentials is not allowed.` };
    }

    const trimmed = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmed || !emailRegex.test(trimmed)) {
      return { error: "Please enter a valid email address." };
    }

    if (trimmed === user.email?.toLowerCase()) {
      return { error: "This is already your current email address." };
    }

    const { data, error } = await supabase.auth.updateUser({
      email: trimmed,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already been registered") || msg.includes("email_exists")) {
        return { error: "This email address is already associated with another account." };
      }
      if (msg.includes("rate limit") || msg.includes("too many requests")) {
        return { error: "Too many attempts. Please wait a few minutes before trying again." };
      }
      return { error: error.message || "Failed to update email address." };
    }

    revalidatePath("/settings/account");

    return {
      success: true,
      needsConfirmation: true,
      email: trimmed,
      message:
        "A confirmation link has been sent to your new email address. Please click the link to verify and finalize the change.",
    };
  } catch (err: any) {
    console.error("changeEmail error:", err);
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function changePassword(params: {
  currentPassword?: string;
  newPassword: string;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { error: "You must be signed in to update your password." };
    }

    const [profile] = await db
      .select({ status: profiles.status })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (profile?.status === "suspended" || profile?.status === "banned") {
      return { error: `Account is ${profile.status}. Modifying credentials is not allowed.` };
    }

    const newPass = params.newPassword;
    if (!newPass || newPass.length < 8) {
      return { error: "New password must be at least 8 characters long." };
    }

    const rawProviders: string[] =
      user.app_metadata?.providers ||
      (user.app_metadata?.provider ? [user.app_metadata.provider] : []);
    const hasEmailIdentity = Boolean(
      user.identities?.some((i: any) => i.provider === "email")
    );
    const isGoogleOnly =
      rawProviders.includes("google") &&
      !rawProviders.includes("email") &&
      !hasEmailIdentity;

    // If user already has a password, verify current password first
    if (!isGoogleOnly) {
      const current = params.currentPassword?.trim();
      if (!current) {
        return { error: "Current password is required." };
      }

      const { error: verifyErr } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: current,
      });

      if (verifyErr) {
        return { error: "Current password is incorrect. Please check and try again." };
      }
    }

    // Update password
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPass,
    });

    if (updateErr) {
      return { error: updateErr.message || "Failed to update password." };
    }

    revalidatePath("/settings/account");

    return {
      success: true,
      message: isGoogleOnly
        ? "Password set successfully! You can now sign in using either Google or your email and password."
        : "Your password has been changed successfully.",
    };
  } catch (err: any) {
    console.error("changePassword error:", err);
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function notifyAccountCreated(
  email: string,
  method: string = "Email & Password"
) {
  try {
    if (!email || !email.includes("@")) return { success: false };
    await notifyNewUserRegistration({
      email: email.trim(),
      method,
    });
    return { success: true };
  } catch (err) {
    console.error("notifyAccountCreated error:", err);
    return { success: false };
  }
}

