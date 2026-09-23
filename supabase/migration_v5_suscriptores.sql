-- v5: lista de correos de clientes interesados (ofertas y novedades)
-- Ejecutar una vez en Supabase → SQL Editor. Es seguro ejecutarlo más de una vez.

create table if not exists public.subscribers (
  id bigint generated always as identity primary key,
  email text not null unique check (position('@' in email) > 1 and length(email) <= 254),
  lang text not null default 'en' check (lang in ('en', 'es')),
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- Cualquier visitante puede suscribirse (solo insertar, no puede ver la lista)
drop policy if exists "cualquiera se suscribe" on public.subscribers;
create policy "cualquiera se suscribe" on public.subscribers for insert to anon, authenticated
  with check (true);

-- Solo el administrador ve, edita o borra la lista
drop policy if exists "admin gestiona suscriptores" on public.subscribers;
create policy "admin gestiona suscriptores" on public.subscribers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
