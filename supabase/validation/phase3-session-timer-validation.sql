-- Phase 3 session/timer validation script.
-- Run in a Supabase SQL editor against a staging project with test users.

-- 1) Validate "start with no Pomodoro" and optional Pomodoro payload columns.
select id, is_pomodoro, pomodoro_focus_minutes, status
from public.study_sessions
order by created_at desc
limit 20;

-- 2) Validate inactivity reminder queue behavior (after scheduler runs).
select notification_type, status, count(*) as total
from public.session_notification_queue
group by notification_type, status
order by notification_type, status;

-- 3) Validate auto-stop reason and completed state.
select id, status, ended_reason, start_time, end_time, last_activity_at
from public.study_sessions
where ended_reason = 'inactivity_timeout'
order by end_time desc
limit 20;

-- 4) Validate heartbeat activity records.
select session_id, activity_type, count(*) as total
from public.study_session_activity
group by session_id, activity_type
order by total desc
limit 50;
