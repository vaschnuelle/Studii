-- Repairs legacy profiles table shapes to match current app expectations.

alter table if exists public.profiles
add column if not exists full_name text;

alter table if exists public.profiles
add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table if exists public.profiles
add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table if exists public.profiles
add column if not exists avatar_url text;

update public.profiles
set full_name = coalesce(nullif(trim(full_name), ''), nullif(trim(username), ''), 'Studii User')
where full_name is null or trim(full_name) = '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_full_name_length_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
    add constraint profiles_full_name_length_check
    check (char_length(full_name) between 1 and 120);
  end if;
end;
$$;

alter table public.profiles
alter column full_name set not null;
