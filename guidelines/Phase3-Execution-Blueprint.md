# Studii Phase 3 Execution Blueprint

This document translates the Phase 3 product scope into implementation order for the current Supabase-backed codebase.

## Outcomes and KPIs

- DAU/MAU ratio: target `>= 35%`
- Average sessions per user per week: target `>= 4`
- 14-day retention: target `>= 35%`
- Invitations sent per user: target `>= 2`
- Widget engagement rate: target `>= 20%`

## Completed Foundation in This Repo

- Added Supabase migration `supabase/migrations/20260425114500_phase3_social_habits_core.sql`.
- Migration includes core Phase 3 tables:
  - `user_presence`
  - `study_sessions`
  - `study_session_invites`
  - `study_session_participants`
  - `referrals`
  - `user_streaks`
  - supporting: `friend_relations`, `notification_tokens`, `weekly_goals`, `goal_progress`
- Added RLS policies for ownership boundaries, invite access, and friend-based visibility.
- Added indexes and `updated_at` triggers for performance and consistency.

## Recommended Build Sequence (6-8 Weeks)

### Week 1-2: Presence + Live Session Join

- Implement a client heartbeat loop for `user_presence.last_heartbeat_at`.
- Define offline TTL rule (`now() - last_heartbeat_at > threshold`) in read logic.
- Subscribe to Realtime updates for:
  - `user_presence`
  - `study_sessions`
  - `study_session_participants`
- Add UI sections:
  - Active friends
  - Quick "Join Session" action
  - Active session subject + elapsed duration

### Week 3: Streak and Reminder Pipeline

- Add streak update SQL function or Edge Function worker:
  - Updates `user_streaks.current_daily_streak`
  - Updates `user_streaks.current_weekly_streak`
  - Advances `last_study_date`
- Add reminder scheduler:
  - "streak at risk" notifications
  - rate limiting and per-user preferences
- Add a home streak card with daily progress status.

### Week 4: Scheduled Sessions + Invites

- Build create-session flow over `study_sessions`.
- Build invite flow over `study_session_invites`.
- Trigger reminder notifications ahead of `start_time`.
- Add deep links from push notifications into session details/join flow.

### Week 5: Widgets (iOS + Android)

- Widget data source reads:
  - friend activity count
  - streak status
  - quick start state
- Keep refresh policy battery-aware with bounded polling.
- Add event tracking for widget impressions and taps.

### Week 6: Referrals and Growth Loops

- Create invite-code generation and attribution flow using `referrals`.
- Add milestone-triggered share prompts (streak and wrapped moments).
- Add cosmetic reward unlock rules (badges, profile flair).

### Week 7-8: Reliability, QA, and Hardening

- Validate RLS with integration tests for unauthorized reads/writes.
- Add load tests for presence fan-out and session join spikes.
- Add retry policies and DLQ-like failure logging for push jobs.
- Review cost profile for Realtime channels and scheduled jobs.

## API / Worker Contracts to Add Next

- Presence APIs:
  - `upsert_presence(user_id, status, active_session_id, subject)`
  - `mark_presence_offline(user_id)`
- Session APIs:
  - `create_study_session(...)`
  - `join_study_session(session_id)`
  - `leave_study_session(session_id)`
  - `invite_to_study_session(session_id, invited_user_id[])`
- Background workers:
  - streak recompute worker
  - scheduled reminders worker
  - referral milestone worker

## Guardrails

- Never expose service role keys in client apps.
- Keep all privileged logic in Edge Functions or trusted backend jobs.
- Enforce RLS-first development:
  - write policy
  - write test
  - then ship feature

