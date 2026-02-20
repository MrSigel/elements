# Twitch Overlay Studio

Production-ready Next.js + Supabase system for configuring, managing, and publishing Twitch overlay widgets with real persisted state and realtime updates.

## Stack
- Next.js App Router + TypeScript + Tailwind CSS
- Supabase Postgres/Auth/Realtime/Storage
- Zustand, React Hook Form, Zod
- Vitest

## Setup
1. Copy `.env.example` to `.env.local` and fill values.
2. Install deps: `npm install`
3. Start Supabase local stack: `supabase start`
4. Apply migrations: `supabase db reset`
5. Run app: `npm run dev`

## OAuth
- Visit `/onboarding` and click Twitch sign-in.
- Callback exchanges code, fetches Twitch profile, creates/links Supabase user, channel, and owner role.

## Core Routes
- Dashboard: `/overlays`, `/widgets`, `/frontpages`, `/moderation`, `/logs`
- Overlay runtime: `/o/[overlayToken]`
- Viewer pages: `/v/[viewerToken]/bonushunt`, `/v/[viewerToken]/tournament`, `/v/[viewerToken]/requests`

## Widget Event Model
All dashboard actions must write via `POST /api/widgets/action`, which calls SQL function `apply_widget_event` to atomically:
- append to `widget_events`
- upsert `widget_snapshots`
- append `audit_logs`

## Ingestion
- Current playing ingestion: `POST /api/ingest/current-playing`
- Required header: `x-ingest-signature = sha256(rawBody + INGEST_SHARED_SECRET)`

## Required Twitch scopes
- `user:read:email`
- `channel:read:subscriptions`
- `moderator:read:chat_messages`
- `moderator:manage:chat_messages`

## Notes
- No mock data or simulator endpoints are included.
- Tokens are real DB records and can be rotated/revoked.

