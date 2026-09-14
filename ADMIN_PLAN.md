# CineTrack Admin Dashboard — Implementation Plan

Light-theme, premium, production-grade admin area at `/admin`.

## Decisions

- **Admin identity:** `profiles.role` (`'user' | 'admin'`), checked server-side.
- **Schema:** `feature_requests` table + `profiles.status` (`'active' | 'suspended'`) + `user_media_logs.completed_at`.
- **Reports / Notifications:** scaffolded with empty states (no tables yet).
- **Charts:** custom dependency-free SVG (line/area/bar) with tooltips.
- **Migration:** `drizzle/0001_admin.sql` (run in Supabase SQL editor).

## Authorization

- `src/lib/admin/auth.ts` — `getAdminProfile()` / `requireAdmin()`.
- `src/proxy.ts` — `admin` added to reserved routes; unauthenticated `/admin/*` → `/login`.
- Role gate in `(admin)/admin/layout.tsx` (server) + every admin server action re-checks role.

## Routes

| Sidebar | Route |
|---|---|
| Dashboard | `/admin` |
| Analytics | `/admin/analytics` |
| Users | `/admin/users` |
| User detail | `/admin/users/[id]` |
| Media | `/admin/media` |
| Libraries / Activity | `/admin/activity` |
| Reviews | `/admin/reviews` |
| Feature Requests | `/admin/requests` |
| Reports / Moderation | `/admin/reports` |
| Notifications | `/admin/notifications` |
| Settings | `/admin/settings` |

## Components (`src/components/admin/`)

`admin-layout.tsx`, `sidebar.tsx`, `header.tsx`, `stat-card.tsx`, `chart.tsx`,
`date-range-picker.tsx`, `data-table.tsx`, `pagination.tsx`, `status-badge.tsx`,
`empty-state.tsx`, `error-state.tsx`, `skeleton.tsx`, `confirm-dialog.tsx`,
`activity-list.tsx`, `filter-bar.tsx`, `theme.ts`.

## Data access & actions

- `src/lib/admin/queries.ts` — aggregates, time-series bucketing, popularity.
- `src/actions/admin.ts` — `updateFeatureRequest`, `suspendUser`, `unsuspendUser`, `submitFeatureRequest`.

## Metrics (real only)

- Users: total, new today/week/month, growth %, active (30d).
- Media: totals + movie/series/anime breakdown, added recently.
- Tracking: status counts, added today, completed today/week (`completed_at`).
- Community: reviews, ratings, feature requests, pending moderation.

## Execution order

1. Plan + migration + schema.
2. Auth + proxy guard.
3. Theme + shell + primitives.
4. Chart + controls + table + pagination + badges + dialogs.
5. Pages: Dashboard → Analytics → Users → User detail → Media → Activity → Reviews → Requests → scaffolds → Settings.
6. Actions + feedback-form persistence + `completed_at`.
7. `npm run lint` + `npm run build`.
