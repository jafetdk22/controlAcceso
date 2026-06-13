-- =====================================================================
--  Access Control · Administración de negocios
--  Ejecutar en el SQL Editor DESPUÉS de schema.sql.
--  Agrega campos de contacto/horario y permite a usuarios autenticados
--  crear, editar y eliminar negocios desde el panel de administración.
-- =====================================================================

-- ---------- Nuevos campos del negocio ---------------------------------
alter table public.businesses add column if not exists phone      text;
alter table public.businesses add column if not exists email      text;
alter table public.businesses add column if not exists address    text;
alter table public.businesses add column if not exists open_time  text;          -- ej. '08:00'
alter table public.businesses add column if not exists close_time text;          -- ej. '18:00'
alter table public.businesses add column if not exists days       text;          -- ej. 'Lunes a Viernes'
alter table public.businesses add column if not exists active     boolean not null default true;

-- ---------- RLS: escritura para usuarios autenticados -----------------
-- La lectura pública ya está permitida por schema.sql (businesses_read_all).
-- Aquí habilitamos insert / update / delete solo para sesiones autenticadas
-- (el admin que inició sesión en el panel).
drop policy if exists "businesses_insert_auth" on public.businesses;
drop policy if exists "businesses_update_auth" on public.businesses;
drop policy if exists "businesses_delete_auth" on public.businesses;

create policy "businesses_insert_auth"
  on public.businesses for insert
  to authenticated
  with check (true);

create policy "businesses_update_auth"
  on public.businesses for update
  to authenticated
  using (true)
  with check (true);

create policy "businesses_delete_auth"
  on public.businesses for delete
  to authenticated
  using (true);
