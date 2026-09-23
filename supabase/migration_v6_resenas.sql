-- v6: reseñas verificadas. Solo un cliente con sesión iniciada que YA RECIBIÓ el producto
-- (pedido en estado "entregado") puede dejar una reseña, y solo una por producto.
-- Ejecutar una vez en Supabase → SQL Editor. Es seguro ejecutarlo más de una vez.

create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_name text not null check (length(trim(author_name)) between 1 and 60),
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (length(comment) <= 1000),
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

alter table public.reviews enable row level security;

-- Todos pueden leer las reseñas
drop policy if exists "todos leen resenas" on public.reviews;
create policy "todos leen resenas" on public.reviews for select to anon, authenticated using (true);

-- Solo quien recibió el producto puede escribir su reseña
drop policy if exists "compradores verificados escriben" on public.reviews;
create policy "compradores verificados escriben" on public.reviews for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.orders o
      where (o.user_id = auth.uid() or lower(o.customer_email) = lower(auth.jwt() ->> 'email'))
        and o.status = 'entregado'
        and o.items @> jsonb_build_array(jsonb_build_object('productId', product_id))
    )
  );

-- El autor puede borrar su reseña; el administrador puede borrar cualquiera
drop policy if exists "autor o admin borra" on public.reviews;
create policy "autor o admin borra" on public.reviews for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Mantiene el promedio y el total de reseñas de cada producto
create or replace function public.refresh_product_rating() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid text;
begin
  if tg_op = 'DELETE' then pid := old.product_id; else pid := new.product_id; end if;
  update public.products p set
    reviews_count = (select count(*) from public.reviews r where r.product_id = pid),
    rating = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.product_id = pid), 0)
  where p.id = pid;
  return null;
end;
$$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();
