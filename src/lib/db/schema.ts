import {
  pgTable,
  text,
  uuid,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// 1. Profiles Table
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),
    username: text("username").notNull().unique(),
    fullName: text("full_name"),
    avatarUrl: text("avatar_url"),
    backdropUrl: text("backdrop_url"),
    bio: text("bio"),
    preferredCountry: text("preferred_country").default("US").notNull(),
    isPublic: boolean("is_public").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("profiles_username_idx").on(table.username)]
);

// 2. Media Items Table (Metadata cache)
export const mediaItems = pgTable(
  "media_items",
  {
    id: text("id").primaryKey(), // 'tmdb:movie:123', 'tmdb:tv:456', 'anilist:789'
    source: text("source").notNull(), // 'tmdb' | 'anilist'
    sourceId: text("source_id").notNull(),
    mediaType: text("media_type").notNull(), // 'movie' | 'series' | 'anime'
    title: text("title").notNull(),
    originalTitle: text("original_title"),
    posterPath: text("poster_path"),
    backdropPath: text("backdrop_path"),
    releaseDate: text("release_date"),
    totalEpisodes: integer("total_episodes").default(1),
    runtime: integer("runtime"), // in minutes
    genres: text("genres").array().default([]),
    streamingProviders: jsonb("streaming_providers").default({}),
    synopsis: text("synopsis"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("media_source_idx").on(table.source, table.sourceId),
  ]
);

// 3. User Tracking Logs & Reviews Table
export const userMediaLogs = pgTable(
  "user_media_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    mediaId: text("media_id")
      .references(() => mediaItems.id, { onDelete: "cascade" })
      .notNull(),
    status: text("status").notNull(), // 'watching' | 'completed' | 'plan_to_watch' | 'on_hold' | 'dropped'
    rating: text("rating"), // 'poor' | 'average' | 'good' | 'great' | 'masterpiece' | null
    episodesWatched: integer("episodes_watched").default(0).notNull(),
    currentSeason: integer("current_season").default(1),
    currentEpisode: integer("current_episode").default(1),
    reviewText: text("review_text"),
    containsSpoilers: boolean("contains_spoilers").default(false).notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_media_unique_idx").on(table.userId, table.mediaId),
  ]
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type MediaItem = typeof mediaItems.$inferSelect;
export type NewMediaItem = typeof mediaItems.$inferInsert;
export type UserMediaLog = typeof userMediaLogs.$inferSelect;
export type NewUserMediaLog = typeof userMediaLogs.$inferInsert;
