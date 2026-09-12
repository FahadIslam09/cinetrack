# CineTrack Development Rules & Constraints

## Core Rules
- **No AI-slop stars/sparkles**: Never use `<Sparkles />` or 4-point star cluster icons. Use suitable contextual icons instead.
- **No browser checks**: You don't need to open the browser to check. User will check and let you know.
- **Don't commit without permission**: Never commit automatically. Commit only when user explicitly tells you to.
- **Strictly scoped edits**: Wherever told to edit, edit only that exact spot and the section connected to it. Don't delete or change anything else.

## UI & Architecture Standards
- **UNIFIED CARD DESIGN**: Use the same `MediaCard` design site-wide (identical to `/library`). Pass all props (`userRating`, `status`, `userEpisodes`, `seasons`, `reviewText`, `fromUsername`).
- **DROPDOWN ROW LAYOUT**: Dropdowns (Platform with logos, Genres, Rating) must sit side by side in ONE line across mobile and desktop (`grid grid-cols-3` or `flex`).
- **MEDIA TYPE TABS**: Keep media formats (All Media, Movies, Series, Anime) in a single horizontal row above dropdowns.
- **REUSE EXISTING COMPONENTS**: Always reuse `CustomDropdown`. Do not build new dropdown abstractions.
- **DISCOVER PAGE**: Show only titles added to the platform by users (`userMediaLogs` + `mediaItems`, falling back to `demoLibraryItems`). Categorize titles by ratings (Masterpieces, Good, Average, Poor).
- **NO CLIENT EXPORTS TO RSC**: Never export raw arrays/objects from `"use client"` files to Server Components (breaks in Turbopack). Keep constants in `src/lib/...` (e.g. `src/lib/media/providers.ts`).
- **TERSE SMART CAVEMAN**: Technical substance only. Drop fluff, pleasantries, hedging, filler. Short, direct, clear.
