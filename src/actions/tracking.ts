"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { mediaItems, userMediaLogs, profiles } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { NormalizedMedia } from "@/lib/media/normalize";
import { eq, and } from "drizzle-orm";
import { RatingCategory, isValidRating, parseRating } from "@/lib/rating";

export interface LogMediaParams {
  media: NormalizedMedia;
  status: "watching" | "completed" | "plan_to_watch" | "on_hold" | "dropped";
  rating?: RatingCategory | null;
  episodesWatched?: number;
  currentSeason?: number;
  currentEpisode?: number;
  reviewText?: string | null;
  containsSpoilers?: boolean;
  isFavorite?: boolean;
}

export async function upsertMediaLog(params: LogMediaParams) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required to log titles." };
    }

    // Ensure profile row exists
    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (!existingProfile) {
      const generatedUsername =
        user.user_metadata?.user_name ||
        user.email?.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") ||
        `user_${user.id.slice(0, 8)}`;

      await db
        .insert(profiles)
        .values({
          id: user.id,
          username: generatedUsername.slice(0, 15),
          fullName: user.user_metadata?.full_name || user.email?.split("@")[0],
          avatarUrl: user.user_metadata?.avatar_url,
          preferredCountry: "US",
        })
        .onConflictDoNothing();
    }

    const {
      media,
      status,
      rating,
      episodesWatched = 0,
      currentSeason = 1,
      currentEpisode = 1,
      reviewText,
      containsSpoilers = false,
      isFavorite = false,
    } = params;

    if (rating !== undefined && rating !== null && !isValidRating(rating)) {
      return { error: "Invalid rating. Allowed categories: poor, average, good, masterpiece." };
    }
    const finalRating = rating ? parseRating(rating) : null;

    // Atomic transaction: upsert media_items first, then user_media_logs
    await db.transaction(async (tx) => {
      // 1. Upsert metadata
      await tx
        .insert(mediaItems)
        .values({
          id: media.id,
          source: media.source,
          sourceId: media.sourceId,
          mediaType: media.mediaType,
          title: media.title,
          originalTitle: media.originalTitle,
          posterPath: media.posterPath,
          backdropPath: media.backdropPath,
          releaseDate: media.releaseDate,
          totalEpisodes: media.totalEpisodes,
          runtime: media.runtime,
          genres: media.genres,
          streamingProviders: media.streamingProviders || {},
          synopsis: media.synopsis,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: mediaItems.id,
          set: {
            title: media.title,
            posterPath: media.posterPath,
            backdropPath: media.backdropPath,
            totalEpisodes: media.totalEpisodes,
            runtime: media.runtime,
            genres: media.genres,
            streamingProviders: media.streamingProviders || {},
            synopsis: media.synopsis,
            updatedAt: new Date(),
          },
        });

      // 2. Upsert user log
      await tx
        .insert(userMediaLogs)
        .values({
          userId: user.id,
          mediaId: media.id,
          status,
          rating: finalRating,
          episodesWatched,
          currentSeason,
          currentEpisode,
          reviewText: reviewText?.trim() || null,
          containsSpoilers,
          isFavorite,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [userMediaLogs.userId, userMediaLogs.mediaId],
          set: {
            status,
            rating: finalRating,
            episodesWatched,
            currentSeason,
            currentEpisode,
            reviewText: reviewText?.trim() || null,
            containsSpoilers,
            isFavorite,
            updatedAt: new Date(),
          },
        });
    });

    revalidatePath("/library");
    revalidatePath("/");
    revalidatePath(`/${media.mediaType}/${media.sourceId}`);

    return { success: true };
  } catch (err: any) {
    console.error("upsertMediaLog error:", err);
    return { error: err.message || "Failed to save log." };
  }
}

export async function incrementEpisode(mediaId: string, totalEpisodes: number = 1) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const [existing] = await db
      .select()
      .from(userMediaLogs)
      .where(
        and(
          eq(userMediaLogs.userId, user.id),
          eq(userMediaLogs.mediaId, mediaId)
        )
      )
      .limit(1);

    if (!existing) return { error: "Log not found" };

    const newEpisodeCount = existing.episodesWatched + 1;
    const newCurrentEpisode = (existing.currentEpisode || 1) + 1;
    const shouldComplete =
      totalEpisodes > 1 && newEpisodeCount >= totalEpisodes;

    await db
      .update(userMediaLogs)
      .set({
        episodesWatched: newEpisodeCount,
        currentEpisode: newCurrentEpisode,
        status: shouldComplete ? "completed" : existing.status,
        updatedAt: new Date(),
      })
      .where(eq(userMediaLogs.id, existing.id));

    revalidatePath("/library");
    revalidatePath("/");

    return { success: true, count: newEpisodeCount };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getUserMediaLog(mediaId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const [log] = await db
      .select()
      .from(userMediaLogs)
      .where(
        and(
          eq(userMediaLogs.userId, user.id),
          eq(userMediaLogs.mediaId, mediaId)
        )
      )
      .limit(1);

    return log || null;
  } catch {
    return null;
  }
}

export async function deleteMediaLog(mediaId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required to remove items." };
    }

    await db
      .delete(userMediaLogs)
      .where(
        and(
          eq(userMediaLogs.userId, user.id),
          eq(userMediaLogs.mediaId, mediaId)
        )
      );

    revalidatePath("/library");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error("deleteMediaLog error:", err);
    return { error: err.message || "Failed to remove item from library." };
  }
}
