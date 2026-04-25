-- Weekly wrapped prep scheduler scaffold.
-- This migration defines a function that invokes the Edge Function endpoint and
-- a cron schedule that runs Sundays at 05:00 America/Los_Angeles.

create extension if not exists pg_net;
create extension if not exists pg_cron;

create or replace function public.invoke_weekly_wrapped_prep()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  project_url text := current_setting('app.settings.supabase_url', true);
  service_role_key text := current_setting('app.settings.service_role_key', true);
  request_url text;
begin
  if project_url is null or project_url = '' then
    raise notice 'Missing app.settings.supabase_url; skipping weekly wrapped invocation.';
    return;
  end if;

  if service_role_key is null or service_role_key = '' then
    raise notice 'Missing app.settings.service_role_key; skipping weekly wrapped invocation.';
    return;
  end if;

  request_url := project_url || '/functions/v1/weekly-wrapped-prep';

  perform net.http_post(
    url := request_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object('trigger', 'pg_cron')
  );
end;
$$;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'weekly-wrapped-prep') then
    perform cron.unschedule('weekly-wrapped-prep');
  end if;

  perform cron.schedule(
    'weekly-wrapped-prep',
    '0 5 * * 0',
    $$select public.invoke_weekly_wrapped_prep();$$
  );
end;
$$;
