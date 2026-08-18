-- Harden tables that predate the DTS 3.0 website integration.
-- Existing policies remain in place; enabling RLS makes them effective.
alter table if exists public.chat_sessions enable row level security;
alter table if exists public.contact_requests enable row level security;

alter function public.prevent_more_than_five_active_admins()
  set search_path = public;
