"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, ne, inArray } from "drizzle-orm";
import { isValidHttpsUrl } from "@/lib/security";

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
  "about",
  "contact",
  "feedback",
  "terms",
  "privacy",
  "cinetrack",
  "support",
  "help",
  "user",
  "root",
  "explore",
]);

export interface UpdateProfileParams {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  backdropUrl?: string;
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
    const trimmedBackdrop = params.backdropUrl?.trim() || null;

    if (trimmedAvatar && !isValidHttpsUrl(trimmedAvatar)) {
      return { error: "Avatar URL must be a valid https URL." };
    }

    if (trimmedBackdrop && !isValidHttpsUrl(trimmedBackdrop)) {
      return { error: "Backdrop URL must be a valid https URL." };
    }

    // Get current profile
    const [existing] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (existing?.status === "suspended" || existing?.status === "banned") {
      return { error: `Account is ${existing.status}. Profile updates are disabled.` };
    }

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
          ...(trimmedBackdrop ? { backdropUrl: trimmedBackdrop } : {}),
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
        backdropUrl: trimmedBackdrop,
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
        backdropUrl: trimmedBackdrop || existing?.backdropUrl,
      },
    };
  } catch (err: any) {
    console.error("Profile update error:", err);
    return { error: err.message || "Failed to update profile." };
  }
}

/**
 * Check if the currently authenticated user needs to complete their initial profile setup.
 */
export async function getProfileSetupStatus() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { authenticated: false, needsSetup: false };
    }

    const [profile] = await db
      .select({
        id: profiles.id,
        username: profiles.username,
        fullName: profiles.fullName,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (profile && profile.username && !profile.username.startsWith("temp_pending_")) {
      return {
        authenticated: true,
        needsSetup: false,
        profile,
      };
    }

    return {
      authenticated: true,
      needsSetup: true,
      initialDisplayName:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "",
      email: user.email || "",
      avatarUrl: user.user_metadata?.avatar_url || null,
    };
  } catch (err) {
    console.error("Check profile setup status error:", err);
    return { authenticated: false, needsSetup: false };
  }
}

/**
 * Validate and check real-time availability of a username against format rules and database.
 */
export async function checkUsernameAvailability(rawUsername: string) {
  const username = rawUsername.trim().toLowerCase().replace(/^@/, "");

  if (!username) {
    return { available: false, error: "Username is required." };
  }

  if (username.length < 3) {
    return { available: false, error: "Username must be at least 3 characters." };
  }

  if (username.length > 25) {
    return { available: false, error: "Username must be 25 characters or fewer." };
  }

  if (!/^[a-z0-9._]+$/.test(username)) {
    return {
      available: false,
      error: "Only lowercase letters, numbers, underscores, and dots allowed.",
    };
  }

  if (/^[._]/.test(username) || /[._]$/.test(username)) {
    return {
      available: false,
      error: "Username cannot start or end with a dot or underscore.",
    };
  }

  if (/\.\./.test(username) || /__/.test(username) || /\._|\_\./.test(username)) {
    return {
      available: false,
      error: "Username cannot contain consecutive punctuation.",
    };
  }

  if (RESERVED_USERNAMES.has(username)) {
    return { available: false, error: `Username @${username} is reserved.` };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [conflict] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(
        user
          ? and(eq(profiles.username, username), ne(profiles.id, user.id))
          : eq(profiles.username, username)
      )
      .limit(1);

    if (conflict) {
      return { available: false, error: "Username already taken." };
    }

    return { available: true, username };
  } catch (err: any) {
    console.error("Availability check error:", err);
    return { available: false, error: "Unable to verify username right now." };
  }
}

/**
 * Generate intelligent, verified-available username suggestions based on display name and input.
 */
export async function generateUsernameSuggestions(
  displayName: string,
  currentInput?: string
) {
  const cleanedName = displayName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const nameParts = displayName.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const candidates: string[] = [];

  if (nameParts.length >= 2) {
    const first = nameParts[0].replace(/[^a-z0-9]/g, "");
    const last = nameParts[nameParts.length - 1].replace(/[^a-z0-9]/g, "");
    if (first && last) {
      candidates.push(`${first}${last}`);
      candidates.push(`${first}.${last}`);
      candidates.push(`${first}_${last}`);
      candidates.push(`${first}${last}01`);
      candidates.push(`${first}${last}7`);
    }
  } else if (cleanedName.length >= 2) {
    candidates.push(cleanedName);
    candidates.push(`${cleanedName}01`);
    candidates.push(`${cleanedName}_cine`);
    candidates.push(`${cleanedName}.film`);
  }

  if (currentInput) {
    const cleanInput = currentInput.trim().toLowerCase().replace(/^@/, "").replace(/[^a-z0-9._]/g, "");
    if (cleanInput.length >= 2) {
      candidates.push(`${cleanInput}01`);
      candidates.push(`${cleanInput}_`);
      candidates.push(`${cleanInput}.official`);
    }
  }

  // Filter candidates that meet format & reserved rules
  const validCandidates = Array.from(new Set(candidates)).filter((c) => {
    return (
      c.length >= 3 &&
      c.length <= 25 &&
      !RESERVED_USERNAMES.has(c) &&
      /^[a-z0-9][a-z0-9._]*[a-z0-9]$/.test(c) &&
      !/\.\./.test(c) &&
      !/__/.test(c)
    );
  });

  if (validCandidates.length === 0) return [];

  try {
    const takenRows = await db
      .select({ username: profiles.username })
      .from(profiles)
      .where(inArray(profiles.username, validCandidates));

    const takenSet = new Set(takenRows.map((r) => r.username.toLowerCase()));
    return validCandidates.filter((c) => !takenSet.has(c)).slice(0, 4);
  } catch (err) {
    console.error("Suggestions check error:", err);
    return [];
  }
}

/**
 * Complete initial profile setup for newly authenticated user.
 */
export async function completeProfileSetup(params: {
  displayName: string;
  username: string;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required to complete profile setup." };
    }

    const trimmedName = params.displayName?.trim().slice(0, 50);
    if (!trimmedName || trimmedName.length < 2) {
      return { error: "Display name must be at least 2 characters." };
    }

    const availCheck = await checkUsernameAvailability(params.username);
    if (!availCheck.available || !availCheck.username) {
      return { error: availCheck.error || "Please choose a valid and available username." };
    }

    const finalUsername = availCheck.username;

    // Check if profile exists already
    const [existing] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (existing) {
      await db
        .update(profiles)
        .set({
          fullName: trimmedName,
          username: finalUsername,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, user.id));
    } else {
      await db.insert(profiles).values({
        id: user.id,
        username: finalUsername,
        fullName: trimmedName,
        avatarUrl: user.user_metadata?.avatar_url || null,
        preferredCountry: "US",
        isPublic: true,
      });
    }

    // Sync Supabase user metadata
    await supabase.auth.updateUser({
      data: {
        full_name: trimmedName,
        user_name: finalUsername,
      },
    });

    revalidatePath("/library");
    revalidatePath("/profile");
    revalidatePath("/");
    revalidatePath(`/${finalUsername}`);
    revalidatePath(`/u/${finalUsername}`);

    return {
      success: true,
      username: finalUsername,
      displayName: trimmedName,
    };
  } catch (err: any) {
    console.error("Complete profile setup error:", err);
    return { error: err.message || "Failed to complete profile setup." };
  }
}

/**
 * Secure server-side image upload handler.
 * Verifies authentication, validates MIME and size (<=5MB), and proxies upload to ImgBB.
 */
export async function uploadProfileImage(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required to upload images." };
    }

    const [existing] = await db
      .select({ status: profiles.status })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (existing?.status === "suspended" || existing?.status === "banned") {
      return { success: false, error: `Account is ${existing.status}.` };
    }

    const file = formData.get("image") as File | null;
    if (!file || typeof file === "string") {
      return { success: false, error: "No image file provided." };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid image format. Only JPEG, PNG, WEBP, and GIF are supported.",
      };
    }

    // 5MB maximum limit
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Image size must not exceed 5MB." };
    }

    const imgbbKey = process.env.IMGBB_API_KEY || "991f94ae55c7ee215507ec80b51bfa5b";
    const uploadData = new FormData();
    uploadData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
      method: "POST",
      body: uploadData,
    });

    if (!res.ok) {
      return { success: false, error: "Image upload provider returned an error." };
    }

    const json = await res.json();
    const uploadedUrl = json?.data?.display_url || json?.data?.url;

    if (!uploadedUrl || !isValidHttpsUrl(uploadedUrl)) {
      return { success: false, error: "Failed to obtain secure uploaded image URL." };
    }

    return { success: true, url: uploadedUrl };
  } catch (err: any) {
    console.error("uploadProfileImage error:", err);
    return { success: false, error: "Failed to upload image. Please try again." };
  }
}
