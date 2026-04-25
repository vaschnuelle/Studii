-- Phase 3 addendum: resilient session timer, optional Pomodoro, inactivity reminders, and auto-stop.

create extension if not exists pg_cron;

alter table public.study_sessions
  add column if not exists is_pomodoro boolean not null default false,
  add column if not exists pomodoro_focus_minutes integer null check (pomodoro_focus_minutes is null or pomodoro_focus_minutes > 0),
  add column if not exists ended_reason text null check (ended_reason in ('manual_stop', 'completed', 'inactivity_timeout')),
  add column if not exists last_activity_at timestamptz not null default timezone('utc', now()),
  add column if not exists inactivity_reminder_sent_at timestamptz null,
  add column if not exists inactivity_reminder_count integer not null default 0 check (inactivity_reminder_count >= 0);

create table if not exists public.study_session_activity (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('start', 'heartbeat', 'pause', 'resume', 'notification_ack', 'manual_stop')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.session_notification_queue (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_type text not null check (notification_type in ('inactivity_warning', 'session_auto_stopped')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'processed', 'failed')),
  created_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz null
);

create index if not exists idx_study_session_activity_session_created
  on public.study_session_activity (session_id, created_at desc);
create index if not exists idx_study_session_activity_user_created
  on public.study_session_activity (user_id, created_at desc);
create index if not exists idx_session_notification_queue_status_created
  on public.session_notification_queue (status, created_at);
create index if not exists idx_study_sessions_last_activity_status
  on public.study_sessions (status, last_activity_at);

alter table public.study_session_activity enable row level security;
alter table public.session_notification_queue enable row level security;

drop policy if exists "study_session_activity_select_session_visible" on public.study_session_activity;
create policy "study_session_activity_select_session_visible"
on public.study_session_activity
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.study_sessions ss
    where ss.id = session_id
      and (ss.creator_user_id = auth.uid() or public.are_friends(auth.uid(), ss.creator_user_id))
  )
);

drop policy if exists "study_session_activity_insert_own_visible_session" on public.study_session_activity;
create policy "study_session_activity_insert_own_visible_session"
on public.study_session_activity
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.study_sessions ss
    where ss.id = session_id
      and (
        ss.creator_user_id = auth.uid()
        or exists (
          select 1
          from public.study_session_participants ssp
          where ssp.session_id = ss.id and ssp.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "session_notification_queue_select_own" on public.session_notification_queue;
create policy "session_notification_queue_select_own"
on public.session_notification_queue
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "session_notification_queue_insert_own" on public.session_notification_queue;
create policy "session_notification_queue_insert_own"
on public.session_notification_queue
for insert
to authenticated
with check (user_id = auth.uid());

drop trigger if exists study_sessions_set_updated_at on public.study_sessions;
create trigger study_sessions_set_updated_at
before update on public.study_sessions
for each row
execute function public.set_updated_at_timestamp();

-- Records a heartbeat and keeps session/presence activity fresh.
-- This is called by clients while a study session is active.
create or replace function public.record_session_heartbeat(
  p_session_id uuid,
  p_subject text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  update public.study_sessions
  set
    last_activity_at = timezone('utc', now()),
    subject = coalesce(p_subject, subject)
  where id = p_session_id
    and status = 'active'
    and (
      creator_user_id = v_user_id
      or exists (
        select 1
        from public.study_session_participants ssp
        where ssp.session_id = p_session_id
          and ssp.user_id = v_user_id
      )
    );

  insert into public.study_session_activity (session_id, user_id, activity_type)
  values (p_session_id, v_user_id, 'heartbeat');

  insert into public.user_presence (user_id, status, active_session_id, subject, last_heartbeat_at)
  values (v_user_id, 'studying', p_session_id, p_subject, timezone('utc', now()))
  on conflict (user_id)
  do update set
    status = 'studying',
    active_session_id = excluded.active_session_id,
    subject = excluded.subject,
    last_heartbeat_at = excluded.last_heartbeat_at;
end;
$$;

-- Queues inactivity reminders for active sessions that have not had activity for 4h30m.
create or replace function public.queue_session_inactivity_reminders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  queued_count integer := 0;
begin
  with candidates as (
    select ss.id, ss.creator_user_id, ss.subject
    from public.study_sessions ss
    where ss.status = 'active'
      and ss.last_activity_at <= timezone('utc', now()) - interval '4 hours 30 minutes'
      and (
        ss.inactivity_reminder_sent_at is null
        or ss.inactivity_reminder_sent_at <= timezone('utc', now()) - interval '1 hour'
      )
  ), inserted as (
    insert into public.session_notification_queue (session_id, user_id, notification_type, payload)
    select
      c.id,
      c.creator_user_id,
      'inactivity_warning',
      jsonb_build_object('subject', c.subject, 'message', 'Your study session will end after 5 hours of inactivity.')
    from candidates c
    returning 1
  )
  select count(*) into queued_count from inserted;

  update public.study_sessions ss
  set
    inactivity_reminder_sent_at = timezone('utc', now()),
    inactivity_reminder_count = ss.inactivity_reminder_count + 1
  where ss.id in (
    select c.id
    from public.study_sessions c
    where c.status = 'active'
      and c.last_activity_at <= timezone('utc', now()) - interval '4 hours 30 minutes'
      and (
        c.inactivity_reminder_sent_at is null
        or c.inactivity_reminder_sent_at <= timezone('utc', now()) - interval '1 hour'
      )
  );

  return queued_count;
end;
$$;

-- Auto-stops active sessions after 5 hours of inactivity and marks ended_reason.
create or replace function public.auto_stop_inactive_study_sessions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  stopped_count integer := 0;
begin
  with stale_sessions as (
    update public.study_sessions ss
    set
      status = 'completed',
      end_time = coalesce(ss.end_time, timezone('utc', now())),
      ended_reason = 'inactivity_timeout'
    where ss.status = 'active'
      and ss.last_activity_at <= timezone('utc', now()) - interval '5 hours'
    returning ss.id, ss.creator_user_id, ss.subject
  ), stopped as (
    insert into public.session_notification_queue (session_id, user_id, notification_type, payload)
    select
      s.id,
      s.creator_user_id,
      'session_auto_stopped',
      jsonb_build_object('subject', s.subject, 'message', 'Session auto-stopped after inactivity.')
    from stale_sessions s
    returning 1
  )
  select count(*) into stopped_count from stopped;

  update public.user_presence up
  set
    status = 'idle',
    active_session_id = null
  where up.active_session_id in (
    select ss.id
    from public.study_sessions ss
    where ss.status = 'completed'
      and ss.ended_reason = 'inactivity_timeout'
      and ss.end_time >= timezone('utc', now()) - interval '10 minutes'
  );

  return stopped_count;
end;
$$;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'session-inactivity-reminders') then
    perform cron.unschedule('session-inactivity-reminders');
  end if;
  if exists (select 1 from cron.job where jobname = 'auto-stop-inactive-sessions') then
    perform cron.unschedule('auto-stop-inactive-sessions');
  end if;

  perform cron.schedule(
    'session-inactivity-reminders',
    '*/10 * * * *',
    $$select public.queue_session_inactivity_reminders();$$
  );

  perform cron.schedule(
    'auto-stop-inactive-sessions',
    '*/5 * * * *',
    $$select public.auto_stop_inactive_study_sessions();$$
  );
end;
$$;
