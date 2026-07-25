create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  email text not null,
  phone text not null,
  interest text not null check (char_length(interest) between 10 and 4000),
  source text not null default 'website_contact',
  language text not null default 'es' check (language in ('es', 'en')),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed', 'spam')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_email_idx on public.leads (lower(email));
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  time_zone text not null default 'America/Bogota',
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  google_event_id text unique,
  google_meet_url text,
  google_event_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index if not exists appointments_start_at_idx on public.appointments (start_at);
create index if not exists appointments_status_idx on public.appointments (status);

create table if not exists public.google_reviews (
  id uuid primary key default gen_random_uuid(),
  google_review_id text not null unique,
  author_name text not null,
  author_photo text,
  rating smallint not null check (rating between 1 and 5),
  review_text text,
  review_date timestamptz,
  language text check (language in ('es', 'en')),
  profile_url text,
  reply_text text,
  reply_date timestamptz,
  is_featured boolean not null default false,
  is_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists google_reviews_visible_idx on public.google_reviews (is_visible, is_featured, review_date desc);

alter table public.leads enable row level security;
alter table public.appointments enable row level security;
alter table public.google_reviews enable row level security;

revoke all on public.leads from anon, authenticated;
revoke all on public.appointments from anon, authenticated;
revoke all on public.google_reviews from anon, authenticated;
grant all on public.leads to service_role;
grant all on public.appointments to service_role;
grant all on public.google_reviews to service_role;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at before update on public.leads for each row execute function public.set_updated_at();
drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at before update on public.appointments for each row execute function public.set_updated_at();
drop trigger if exists google_reviews_set_updated_at on public.google_reviews;
create trigger google_reviews_set_updated_at before update on public.google_reviews for each row execute function public.set_updated_at();
