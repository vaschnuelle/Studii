-- Studii Phase 3 core social + habit schema for Supabase.
-- Adds real-time presence, sessions, invites, streaks, referrals, goals, and supporting RLS.

create extension if not exists pgcrypto;

-- Reusable updated_at trigger function from earlier migrations.
create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- Returns whether two users have an accepted friendship edge.
-- This function is used by RLS policies to gate social visibility.
create or replace function public.are_friends(left_user_id uuid, right_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.friend_relations fr
    where fr.status = 'accepted'
      and (
        (fr.requester_user_id = left_user_id and fr.addressee_user_id = right_user_id)
        or
        (fr.requester_user_id = right_user_id and fr.addressee_user_id = left_user_id)
      )
  );
$$;

create table if not exists public.friend_relations (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  addressee_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint friend_relations_unique_edge unique (requester_user_id, addressee_user_id),
  constraint friend_relations_no_self_edge check (requester_user_id <> addressee_user_id)
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  start_time timestamptz not null,
  end_time timestamptz null,
  status text not null check (status in ('scheduled', 'active', 'completed', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_presence (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null check (status in ('studying', 'idle', 'offline')),
  active_session_id uuid null references public.study_sessions(id) on delete set null,
  subject text null,
  last_heartbeat_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.study_session_invites (
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  invited_user_id uuid not null references auth.users(id) on delete cascade,
  invite_status text not null check (invite_status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (session_id, invited_user_id)
);

create table if not exists public.study_session_participants (
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default timezone('utc', now()),
  left_at timestamptz null,
  primary key (session_id, user_id)
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_user_id uuid not null references auth.users(id) on delete cascade,
  invitee_user_id uuid null references auth.users(id) on delete set null,
  invite_code text not null unique,
  attributed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_daily_streak integer not null default 0 check (current_daily_streak >= 0),
  current_weekly_streak integer not null default 0 check (current_weekly_streak >= 0),
  last_study_date date null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('ios', 'android')),
  token text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint notification_tokens_unique_token unique (token)
);

create table if not exists public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_key text not null,
  target_minutes integer not null check (target_minutes > 0),
  achieved_minutes integer not null default 0 check (achieved_minutes >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint weekly_goals_unique_user_week unique (user_id, week_key)
);

create table if not exists public.goal_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.weekly_goals(id) on delete cascade,
  source_session_id uuid null references public.study_sessions(id) on delete set null,
  minutes_delta integer not null check (minutes_delta > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_friend_relations_requester on public.friend_relations (requester_user_id);
create index if not exists idx_friend_relations_addressee on public.friend_relations (addressee_user_id);
create index if not exists idx_friend_relations_status on public.friend_relations (status);

create index if not exists idx_study_sessions_creator on public.study_sessions (creator_user_id);
create index if not exists idx_study_sessions_start_time on public.study_sessions (start_time);
create index if not exists idx_study_sessions_status on public.study_sessions (status);

create index if not exists idx_user_presence_status on public.user_presence (status);
create index if not exists idx_user_presence_heartbeat on public.user_presence (last_heartbeat_at);
create index if not exists idx_user_presence_active_session on public.user_presence (active_session_id);

create index if not exists idx_study_session_invites_invited_user on public.study_session_invites (invited_user_id);
create index if not exists idx_referrals_inviter on public.referrals (inviter_user_id);
create index if not exists idx_referrals_invitee on public.referrals (invitee_user_id);
create index if not exists idx_notification_tokens_user on public.notification_tokens (user_id);
create index if not exists idx_weekly_goals_user on public.weekly_goals (user_id);
create index if not exists idx_goal_progress_user on public.goal_progress (user_id);
create index if not exists idx_goal_progress_goal on public.goal_progress (goal_id);

alter table public.friend_relations enable row level security;
alter table public.study_sessions enable row level security;
alter table public.user_presence enable row level security;
alter table public.study_session_invites enable row level security;
alter table public.study_session_participants enable row level security;
alter table public.referrals enable row level security;
alter table public.user_streaks enable row level security;
alter table public.notification_tokens enable row level security;
alter table public.weekly_goals enable row level security;
alter table public.goal_progress enable row level security;

drop policy if exists "friend_relations_select_participants" on public.friend_relations;
create policy "friend_relations_select_participants"
on public.friend_relations
for select
to authenticated
using (auth.uid() = requester_user_id or auth.uid() = addressee_user_id);

drop policy if exists "friend_relations_insert_requester" on public.friend_relations;
create policy "friend_relations_insert_requester"
on public.friend_relations
for insert
to authenticated
with check (auth.uid() = requester_user_id);

drop policy if exists "friend_relations_update_participants" on public.friend_relations;
create policy "friend_relations_update_participants"
on public.friend_relations
for update
to authenticated
using (auth.uid() = requester_user_id or auth.uid() = addressee_user_id)
with check (auth.uid() = requester_user_id or auth.uid() = addressee_user_id);

drop policy if exists "friend_relations_delete_requester" on public.friend_relations;
create policy "friend_relations_delete_requester"
on public.friend_relations
for delete
to authenticated
using (auth.uid() = requester_user_id);

drop policy if exists "study_sessions_select_visible" on public.study_sessions;
create policy "study_sessions_select_visible"
on public.study_sessions
for select
to authenticated
using (
  auth.uid() = creator_user_id
  or public.are_friends(auth.uid(), creator_user_id)
  or exists (
    select 1
    from public.study_session_invites ssi
    where ssi.session_id = id
      and ssi.invited_user_id = auth.uid()
  )
);

drop policy if exists "study_sessions_insert_creator" on public.study_sessions;
create policy "study_sessions_insert_creator"
on public.study_sessions
for insert
to authenticated
with check (auth.uid() = creator_user_id);

drop policy if exists "study_sessions_update_creator" on public.study_sessions;
create policy "study_sessions_update_creator"
on public.study_sessions
for update
to authenticated
using (auth.uid() = creator_user_id)
with check (auth.uid() = creator_user_id);

drop policy if exists "study_sessions_delete_creator" on public.study_sessions;
create policy "study_sessions_delete_creator"
on public.study_sessions
for delete
to authenticated
using (auth.uid() = creator_user_id);

drop policy if exists "user_presence_select_visible" on public.user_presence;
create policy "user_presence_select_visible"
on public.user_presence
for select
to authenticated
using (auth.uid() = user_id or public.are_friends(auth.uid(), user_id));

drop policy if exists "user_presence_insert_own" on public.user_presence;
create policy "user_presence_insert_own"
on public.user_presence
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_presence_update_own" on public.user_presence;
create policy "user_presence_update_own"
on public.user_presence
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_presence_delete_own" on public.user_presence;
create policy "user_presence_delete_own"
on public.user_presence
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "study_session_invites_select_creator_or_invitee" on public.study_session_invites;
create policy "study_session_invites_select_creator_or_invitee"
on public.study_session_invites
for select
to authenticated
using (
  invited_user_id = auth.uid()
  or exists (
    select 1
    from public.study_sessions ss
    where ss.id = session_id
      and ss.creator_user_id = auth.uid()
  )
);

drop policy if exists "study_session_invites_insert_creator" on public.study_session_invites;
create policy "study_session_invites_insert_creator"
on public.study_session_invites
for insert
to authenticated
with check (
  exists (
    select 1
    from public.study_sessions ss
    where ss.id = session_id
      and ss.creator_user_id = auth.uid()
  )
);

drop policy if exists "study_session_invites_update_creator_or_invitee" on public.study_session_invites;
create policy "study_session_invites_update_creator_or_invitee"
on public.study_session_invites
for update
to authenticated
using (
  invited_user_id = auth.uid()
  or exists (
    select 1
    from public.study_sessions ss
    where ss.id = session_id
      and ss.creator_user_id = auth.uid()
  )
)
with check (
  invited_user_id = auth.uid()
  or exists (
    select 1
    from public.study_sessions ss
    where ss.id = session_id
      and ss.creator_user_id = auth.uid()
  )
);

drop policy if exists "study_session_invites_delete_creator" on public.study_session_invites;
create policy "study_session_invites_delete_creator"
on public.study_session_invites
for delete
to authenticated
using (
  exists (
    select 1
    from public.study_sessions ss
    where ss.id = session_id
      and ss.creator_user_id = auth.uid()
  )
);

drop policy if exists "study_session_participants_select_visible" on public.study_session_participants;
create policy "study_session_participants_select_visible"
on public.study_session_participants
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.study_sessions ss
    where ss.id = session_id
      and (
        ss.creator_user_id = auth.uid()
        or public.are_friends(auth.uid(), ss.creator_user_id)
      )
  )
);

drop policy if exists "study_session_participants_insert_self_or_creator" on public.study_session_participants;
create policy "study_session_participants_insert_self_or_creator"
on public.study_session_participants
for insert
to authenticated
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.study_sessions ss
    where ss.id = session_id
      and ss.creator_user_id = auth.uid()
  )
);

drop policy if exists "study_session_participants_update_self_or_creator" on public.study_session_participants;
create policy "study_session_participants_update_self_or_creator"
on public.study_session_participants
for update
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.study_sessions ss
    where ss.id = session_id
      and ss.creator_user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.study_sessions ss
    where ss.id = session_id
      and ss.creator_user_id = auth.uid()
  )
);

drop policy if exists "referrals_select_visible" on public.referrals;
create policy "referrals_select_visible"
on public.referrals
for select
to authenticated
using (auth.uid() = inviter_user_id or auth.uid() = invitee_user_id);

drop policy if exists "referrals_insert_inviter" on public.referrals;
create policy "referrals_insert_inviter"
on public.referrals
for insert
to authenticated
with check (auth.uid() = inviter_user_id);

drop policy if exists "referrals_update_inviter_or_invitee" on public.referrals;
create policy "referrals_update_inviter_or_invitee"
on public.referrals
for update
to authenticated
using (auth.uid() = inviter_user_id or auth.uid() = invitee_user_id)
with check (auth.uid() = inviter_user_id or auth.uid() = invitee_user_id);

drop policy if exists "referrals_delete_inviter" on public.referrals;
create policy "referrals_delete_inviter"
on public.referrals
for delete
to authenticated
using (auth.uid() = inviter_user_id);

drop policy if exists "user_streaks_select_visible" on public.user_streaks;
create policy "user_streaks_select_visible"
on public.user_streaks
for select
to authenticated
using (auth.uid() = user_id or public.are_friends(auth.uid(), user_id));

drop policy if exists "user_streaks_insert_own" on public.user_streaks;
create policy "user_streaks_insert_own"
on public.user_streaks
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_streaks_update_own" on public.user_streaks;
create policy "user_streaks_update_own"
on public.user_streaks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_streaks_delete_own" on public.user_streaks;
create policy "user_streaks_delete_own"
on public.user_streaks
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "notification_tokens_select_own" on public.notification_tokens;
create policy "notification_tokens_select_own"
on public.notification_tokens
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "notification_tokens_insert_own" on public.notification_tokens;
create policy "notification_tokens_insert_own"
on public.notification_tokens
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "notification_tokens_update_own" on public.notification_tokens;
create policy "notification_tokens_update_own"
on public.notification_tokens
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "notification_tokens_delete_own" on public.notification_tokens;
create policy "notification_tokens_delete_own"
on public.notification_tokens
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "weekly_goals_select_visible" on public.weekly_goals;
create policy "weekly_goals_select_visible"
on public.weekly_goals
for select
to authenticated
using (auth.uid() = user_id or public.are_friends(auth.uid(), user_id));

drop policy if exists "weekly_goals_insert_own" on public.weekly_goals;
create policy "weekly_goals_insert_own"
on public.weekly_goals
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "weekly_goals_update_own" on public.weekly_goals;
create policy "weekly_goals_update_own"
on public.weekly_goals
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "weekly_goals_delete_own" on public.weekly_goals;
create policy "weekly_goals_delete_own"
on public.weekly_goals
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "goal_progress_select_visible" on public.goal_progress;
create policy "goal_progress_select_visible"
on public.goal_progress
for select
to authenticated
using (auth.uid() = user_id or public.are_friends(auth.uid(), user_id));

drop policy if exists "goal_progress_insert_own" on public.goal_progress;
create policy "goal_progress_insert_own"
on public.goal_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "goal_progress_update_own" on public.goal_progress;
create policy "goal_progress_update_own"
on public.goal_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "goal_progress_delete_own" on public.goal_progress;
create policy "goal_progress_delete_own"
on public.goal_progress
for delete
to authenticated
using (auth.uid() = user_id);

drop trigger if exists friend_relations_set_updated_at on public.friend_relations;
create trigger friend_relations_set_updated_at
before update on public.friend_relations
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists study_sessions_set_updated_at on public.study_sessions;
create trigger study_sessions_set_updated_at
before update on public.study_sessions
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists user_presence_set_updated_at on public.user_presence;
create trigger user_presence_set_updated_at
before update on public.user_presence
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists study_session_invites_set_updated_at on public.study_session_invites;
create trigger study_session_invites_set_updated_at
before update on public.study_session_invites
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists referrals_set_updated_at on public.referrals;
create trigger referrals_set_updated_at
before update on public.referrals
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists user_streaks_set_updated_at on public.user_streaks;
create trigger user_streaks_set_updated_at
before update on public.user_streaks
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists notification_tokens_set_updated_at on public.notification_tokens;
create trigger notification_tokens_set_updated_at
before update on public.notification_tokens
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists weekly_goals_set_updated_at on public.weekly_goals;
create trigger weekly_goals_set_updated_at
before update on public.weekly_goals
for each row
execute function public.set_updated_at_timestamp();
