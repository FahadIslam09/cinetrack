"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, ne } from "drizzle-orm";

const RESERVED_USERNAMES = new Set([
  "api",
  "_next",
  "auth",
  "discover",
  "landing",
  "library",
  "login",
  "profile",
  "search",
  "movie",
  "series",
  "anime",
  "tv",
  "u",
  "admin",
  "settings",
]);

export interface UpdateProfileParams {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

export async function updateProfile(params: UpdateProfileParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required to update profile." };
    }

    const trimmedName = params.displayName?.trim().slice(0, 50) || null;
    const trimmedBio = params.bio?.trim().slice(0, 160) || null;
    const trimmedAvatar = params.avatarUrl?.trim() || null;

    // Get current profile
    const [existing] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    let targetUsername = existing?.username;

    // Validate username if provided
    if (params.username) {
      const cleanUsername = params.username.trim().toLowerCase().replace(/^@/, "");
      
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
        return {
          error: "Username must be 3–20 characters and contain only letters, numbers, and underscores.",
        };
      }

      if (RESERVED_USERNAMES.has(cleanUsername)) {
        return {
          error: `Username "@${cleanUsername}" is reserved. Please choose a different handle.`,
        };
      }

      // Check uniqueness if changed
      if (cleanUsername !== existing?.username) {
        const [conflict] = await db
          .select({ id: profiles.id })
          .from(profiles)
          .where(and(eq(profiles.username, cleanUsername), ne(profiles.id, user.id)))
          .limit(1);

        if (conflict) {
          return {
            error: `Username "@${cleanUsername}" is already taken. Please pick another.`,
          };
        }

        targetUsername = cleanUsername;
      }
    }

    if (existing) {
      await db
        .update(profiles)
        .set({
          fullName: trimmedName,
          username: targetUsername || existing.username,
          bio: trimmedBio,
          ...(trimmedAvatar ? { avatarUrl: trimmedAvatar } : {}),
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, user.id));
    } else {
      const generatedUsername =
        targetUsername ||
        user.user_metadata?.user_name ||
        user.email?.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") ||
        `user_${user.id.slice(0, 8)}`;

      await db.insert(profiles).values({
        id: user.id,
        username: generatedUsername.slice(0, 15).toLowerCase(),
        fullName: trimmedName,
        bio: trimmedBio,
        avatarUrl: trimmedAvatar || user.user_metadata?.avatar_url,
        preferredCountry: "US",
      });
      targetUsername = generatedUsername.slice(0, 15).toLowerCase();
    }

    revalidatePath("/library");
    if (existing?.username) {
      revalidatePath(`/${existing.username}`);
      revalidatePath(`/u/${existing.username}`);
    }
    if (targetUsername && targetUsername !== existing?.username) {
      revalidatePath(`/${targetUsername}`);
      revalidatePath(`/u/${targetUsername}`);
    }

    return {
      success: true,
      updated: {
        fullName: trimmedName,
        username: targetUsername,
        bio: trimmedBio,
        avatarUrl: trimmedAvatar || existing?.avatarUrl,
      },
    };
  } catch (err: any) {
    console.error("Profile update error:", err);
    return { error: err.message || "Failed to update profile." };
  }
}
