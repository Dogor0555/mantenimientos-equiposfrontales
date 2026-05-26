-- ═══════════════════════════════════════════════════════════════
--  MANTENIMIENTO TRACTORES — Supabase Setup Completo
--  Ejecuta en: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ── 1. TABLA PRINCIPAL ──────────────────────────────────────────
create table if not exists public.registros_mantenimiento (
  id            uuid primary key default gen_random_uuid(),
  fecha         date not null,
  turno         text not null,
  operador      text not null,
  equipo        text not null,
  engrase       boolean not null default false,
  sopleteo      boolean not null default false,
  foto_url      text,
  observaciones text,
  created_at    timestamptz not null default now()
);

-- ── 2. RLS ──────────────────────────────────────────────────────
alter table public.registros_mantenimiento enable row level security;

-- Lectura pública (operadores ven confirmación, admins ven todo)
create policy "Lectura pública"
  on public.registros_mantenimiento for select
  using (true);

-- Inserción pública (operadores sin login pueden guardar)
create policy "Inserción pública"
  on public.registros_mantenimiento for insert
  with check (true);

-- Solo admins autenticados pueden borrar
create policy "Borrado solo admin"
  on public.registros_mantenimiento for delete
  using (auth.role() = 'authenticated');

-- ── 3. ÍNDICES ──────────────────────────────────────────────────
create index if not exists idx_reg_fecha   on public.registros_mantenimiento (fecha desc);
create index if not exists idx_reg_equipo  on public.registros_mantenimiento (equipo);
create index if not exists idx_reg_oper    on public.registros_mantenimiento (operador);

-- ── 4. STORAGE ──────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('fotos-mantenimiento', 'fotos-mantenimiento', true)
on conflict do nothing;

create policy "Subida pública fotos"
  on storage.objects for insert
  with check (bucket_id = 'fotos-mantenimiento');

create policy "Lectura pública fotos"
  on storage.objects for select
  using (bucket_id = 'fotos-mantenimiento');

-- ── 5. CREAR USUARIO ADMIN ──────────────────────────────────────
-- Después de correr este SQL, ve a:
-- Authentication → Users → Add user
-- Y crea tu usuario admin con email y contraseña.
-- Esas mismas credenciales usas en /login
