-- =====================================================================
--  Access Control · Esquema Supabase
--  Ejecutar en el SQL Editor del proyecto (una sola vez).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Negocios ---------------------------------------------------
create table if not exists public.businesses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  logo_url    text,
  color       text default '#345196',
  description text,
  floor       text,
  created_at  timestamptz not null default now()
);

-- Migración para instalaciones previas
alter table public.businesses add column if not exists floor text;

create index if not exists idx_businesses_name on public.businesses (name);

-- ---------- Bitácora de accesos ---------------------------------------
create table if not exists public.access_logs (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses(id) on delete cascade,
  visitor_type text not null check (visitor_type in ('visitor', 'supplier')),
  full_name    text not null,
  id_document  text,
  company      text,
  reason       text,
  host_name    text,
  phone        text,
  entry_time   timestamptz not null default now(),
  exit_time    timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists idx_access_logs_business_time
  on public.access_logs (business_id, entry_time desc);
create index if not exists idx_access_logs_type
  on public.access_logs (visitor_type, entry_time desc);
create index if not exists idx_access_logs_entry_time
  on public.access_logs (entry_time desc);

-- ---------- RLS --------------------------------------------------------
-- Para un kiosko público basta con permitir lectura/escritura anónima.
-- En producción endurece esta política según tu modelo de auth.
alter table public.businesses    enable row level security;
alter table public.access_logs   enable row level security;

drop policy if exists "businesses_read_all"  on public.businesses;
drop policy if exists "access_logs_read_all" on public.access_logs;
drop policy if exists "access_logs_insert"   on public.access_logs;

create policy "businesses_read_all"
  on public.businesses for select
  using (true);

create policy "access_logs_read_all"
  on public.access_logs for select
  using (true);

create policy "access_logs_insert"
  on public.access_logs for insert
  with check (true);
