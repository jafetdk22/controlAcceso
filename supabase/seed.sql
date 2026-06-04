-- =====================================================================
--  Access Control · Datos de ejemplo
--  Ejecuta DESPUÉS de schema.sql.  Genera negocios + 90 días de tráfico.
-- =====================================================================

-- ---------- Negocios ---------------------------------------------------
insert into public.businesses (name, slug, logo_url, color, description, floor) values
  ('Aurora Studios',       'aurora-studios',   'https://api.dicebear.com/9.x/shapes/svg?seed=aurora&backgroundColor=345196',  '#345196', 'Estudio de diseño y producción audiovisual',  'Piso 3'),
  ('Helix Biotech',        'helix-biotech',    'https://api.dicebear.com/9.x/shapes/svg?seed=helix&backgroundColor=0f766e',   '#0f766e', 'Laboratorio de biotecnología avanzada',       'Piso 7'),
  ('Northwind Logistics',  'northwind',        'https://api.dicebear.com/9.x/shapes/svg?seed=northwind&backgroundColor=b45309', '#b45309', 'Centro de operaciones logísticas',            'Piso 1'),
  ('Lumen Capital',        'lumen-capital',    'https://api.dicebear.com/9.x/shapes/svg?seed=lumen&backgroundColor=1e293b',   '#1e293b', 'Gestión patrimonial y banca privada',         'Piso 10'),
  ('Vertex Architects',    'vertex',           'https://api.dicebear.com/9.x/shapes/svg?seed=vertex&backgroundColor=7c3aed',   '#7c3aed', 'Despacho de arquitectura corporativa',        'Piso 5'),
  ('Solera Coffee Co.',    'solera-coffee',    'https://api.dicebear.com/9.x/shapes/svg?seed=solera&backgroundColor=92400e',  '#92400e', 'Tostadora y cafetería de especialidad',       'Planta Baja')
on conflict (slug) do update set
  floor = excluded.floor;

-- ---------- Tráfico simulado de los últimos 90 días --------------------
-- Genera ~3,500 registros con distribución horaria realista.
with cfg as (
  select
    90 as days,
    array['Lucía Pérez','Carlos Hernández','María García','Diego Ramírez','Sofía Torres',
          'Andrés López','Camila Castro','Mateo Vargas','Valentina Ríos','Sebastián Mora',
          'Ana Salazar','Joaquín Núñez','Renata Vega','Emilio Carrillo','Daniela Quintero',
          'Tomás Fuentes','Isabela Soto','Bruno Aguilar','Mariana Ortiz','Iván Beltrán']::text[] as names,
    array['DHL Express','FedEx','Estafeta','Coca-Cola FEMSA','Grupo Bimbo','Office Depot',
          'Sigma Alimentos','Cisco Systems','Microsoft','Heineken','PepsiCo','Cemex',
          'Walmart Supply','Liverpool','El Palacio de Hierro']::text[] as companies,
    array['Reunión de trabajo','Entrega de paquete','Mantenimiento','Entrevista',
          'Visita comercial','Auditoría','Soporte técnico','Capacitación',
          'Entrega de insumos','Junta directiva']::text[] as reasons,
    array['Recepción','Andrea Méndez','Pablo Rivas','Gerencia General','Operaciones',
          'Ricardo Solís','Carla Domínguez','Marco Villanueva']::text[] as hosts
)
insert into public.access_logs
  (business_id, visitor_type, full_name, id_document, company, reason, host_name, phone, entry_time, exit_time)
select
  b.id,
  case when random() < 0.62 then 'visitor' else 'supplier' end as visitor_type,
  (select names[1 + floor(random() * array_length(names,1))::int] from cfg),
  case when random() < 0.8
    then 'INE-' || lpad(floor(random()*99999999)::int::text, 8, '0')
    else null end,
  case when random() < 0.45
    then (select companies[1 + floor(random() * array_length(companies,1))::int] from cfg)
    else null end,
  (select reasons[1 + floor(random() * array_length(reasons,1))::int] from cfg),
  (select hosts[1 + floor(random() * array_length(hosts,1))::int] from cfg),
  case when random() < 0.7
    then '+52 55 ' || lpad(floor(random()*99999999)::int::text, 8, '0')
    else null end,
  -- timestamp pseudoaleatorio en los últimos 90 días, sesgado a horario laboral
  (now()
    - (floor(random() * (select days from cfg)) || ' days')::interval
    - (floor(7 + random() * 12) || ' hours')::interval
    - (floor(random() * 60) || ' minutes')::interval) as entry_time,
  case when random() < 0.85
    then (now()
      - (floor(random() * (select days from cfg)) || ' days')::interval
      - (floor(1 + random() * 5) || ' hours')::interval)
    else null end as exit_time
from public.businesses b,
     generate_series(1, 580) g
where exists (select 1 from public.businesses);
