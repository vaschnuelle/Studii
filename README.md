
# Studii Mockup (Supabase)

Studii Mockup now uses Supabase for auth, storage, and scheduled processing.  
The original design source is available at [Figma](https://www.figma.com/design/esFS9lcfDGlQxV3NojUxfX/Studii-Mockup).

## Environment Variables

Create a `.env` file (or copy `.env.example`) with:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ENABLE_BROWSER_NOTIFICATIONS` (optional; set to `true` to opt in to browser notification prompts for inactivity UX)

When these are missing, the app stays fully functional in demo mode and does not attempt Supabase reads.

## Local Setup

1. Install dependencies:
   - `npm install`
2. Configure env:
   - copy `.env.example` to `.env`
   - set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Run the app:
   - `npm run dev`

## Database Migrations (Schema + RLS)

Migrations live in `supabase/migrations` and include:

- `users` table: `user_id` (`auth.users.id`) + `stats` (`jsonb`)
- `wrapped_summaries` table: wrapped fields mapped from `WrappedSummaryRecord`
- uniqueness constraint on `(user_id, period_id)`
- indexes for `user_id` and `period_id`
- RLS policies to allow authenticated users to read/write only their own rows
- Phase 3 social/habit tables:
  - `friend_relations`, `user_presence`, `study_sessions`, `study_session_invites`, `study_session_participants`
  - `referrals`, `user_streaks`, `notification_tokens`, `weekly_goals`, `goal_progress`
  - RLS policies enforcing own-row, invitee/creator, and friend-visibility boundaries
- Phase 3 timer resilience addendum:
  - `study_sessions` columns: `is_pomodoro`, `pomodoro_focus_minutes`, `last_activity_at`, `ended_reason`, `inactivity_reminder_*`
  - new tables: `study_session_activity`, `session_notification_queue`
  - SQL jobs/functions:
    - `record_session_heartbeat`
    - `queue_session_inactivity_reminders`
    - `auto_stop_inactive_study_sessions`
  - cron jobs:
    - reminder queue every 10 minutes
    - inactivity auto-stop every 5 minutes

Apply migrations using Supabase CLI:

- `supabase start` (optional for local stack)
- `supabase db push`

## Phase 3 Addendum Behavior Notes

- **Start Study Session does not require Pomodoro**
  - Users can immediately start in free-form stopwatch mode.
- **Pomodoro is optional**
  - Users can opt in and choose focus minutes.
- **Background/restart timer accuracy**
  - Timer state persists in local storage and computes elapsed from persisted timestamps.
  - UI timer remains accurate through tab backgrounding and reloads.
- **Inactivity handling**
  - Client heartbeats keep session activity fresh.
  - Server queues inactivity warnings for stale active sessions.
  - Server auto-stops sessions after 5 hours inactivity with `ended_reason='inactivity_timeout'`.
- **Signup/auth**
  - New signup route: `/signup`
  - New sign-in route: `/signin`
  - Uses Supabase Auth `signUp` with client-side validation.

## Validation and Tests

- Unit tests:
  - `npm run test`
  - coverage includes:
    - start payload with no Pomodoro
    - optional Pomodoro payload
    - background timer elapsed calculation
    - signup validation success/failure
- SQL validation script for staging:
  - `supabase/validation/phase3-session-timer-validation.sql`
  - validates reminder queueing, auto-stop outcomes, and activity logging

## Weekly Wrapped Scheduler

Firebase scheduled functions were replaced with a Supabase-compatible scaffold:

- Edge Function: `supabase/functions/weekly-wrapped-prep/index.ts`
- SQL scheduler bridge:
  - migration `20260425113500_weekly_wrapped_scheduler.sql`
  - `pg_cron` schedule: Sundays at 05:00
  - invokes the Edge Function through `pg_net`

### Required Scheduler Configuration

Set these Postgres settings before enabling cron in production:

- `app.settings.supabase_url` = your Supabase project URL
- `app.settings.service_role_key` = service role key used by scheduled invocation

Then deploy function and migrations:

- `supabase functions deploy weekly-wrapped-prep`
- `supabase db push`

The provided weekly function is a runnable scaffold that preserves the weekly wrapped-prep intent and upserts one summary per user for the current period.

## Migration Notes (Firebase -> Supabase)

- Auth:
  - Firebase Auth -> Supabase Auth (`supabase.auth`)
- User stats cache:
  - Firestore `users/{uid}.stats` -> Postgres `public.users.stats`
- Wrapped summaries:
  - Firestore `wrappedSummaries/{uid__period}` -> Postgres `public.wrapped_summaries` with unique `(user_id, period_id)`
- Scheduler:
  - Firebase scheduled function -> Supabase Edge Function + `pg_cron` SQL trigger path
- Frontend behavior:
  - Demo baseline still computes first
  - Supabase values overlay when env is configured and user is authenticated
  