alter table public.appointments
  add column if not exists request_id text;

create unique index if not exists appointments_request_id_idx
  on public.appointments (request_id)
  where request_id is not null;

create unique index if not exists appointments_active_start_idx
  on public.appointments (start_at)
  where status in ('pending', 'confirmed');

create table if not exists public.site_content (
  key text primary key,
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
revoke all on public.site_content from anon, authenticated;
grant all on public.site_content to service_role;

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();
