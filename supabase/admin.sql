-- =====================================================================
--  Access Control · Crear usuario administrador
--  Ejecutar en el SQL Editor de Supabase DESPUÉS de schema.sql.
--
--  Cambia el CORREO y la CONTRASEÑA antes de ejecutar (en ambos bloques).
--  pgcrypto ya viene habilitado por schema.sql (crypt / gen_salt).
-- =====================================================================

-- ---------- 1. Usuario en auth.users ----------------------------------
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,          -- email ya confirmado: permite login inmediato
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@edificio.com',                          -- 👈 tu correo
  crypt('CambiaEstaClave123!', gen_salt('bf')),  -- 👈 tu contraseña
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  '', '', '', ''
)
on conflict (email) do nothing;

-- ---------- 2. Identidad asociada (requerida por Supabase) -------------
insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  now(),
  now(),
  now()
from auth.users u
where u.email = 'admin@edificio.com'             -- 👈 mismo correo de arriba
  and not exists (
    select 1 from auth.identities i
    where i.user_id = u.id and i.provider = 'email'
  );
