-- =========================================================
-- TemaShop v2 - Migración para lanzamiento (idempotente: se puede ejecutar varias veces)
-- Ejecutar en: Supabase → SQL Editor
-- =========================================================

-- ---------- ADMIN: solo si el correo del admin está CONFIRMADO ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and lower(u.email) = 'miguelgraphalterna@gmail.com'
      and u.email_confirmed_at is not null
  );
$$;

-- ---------- CONFIGURACIÓN DE LA TIENDA ----------
create table if not exists public.store_settings (
  id int primary key default 1 check (id = 1),
  free_shipping_threshold numeric(10,2) not null default 25,
  shipping_fee numeric(10,2) not null default 4.99,
  currency text not null default 'USD'
);
insert into public.store_settings (id) values (1) on conflict (id) do nothing;
alter table public.store_settings enable row level security;
drop policy if exists "config visible" on public.store_settings;
create policy "config visible" on public.store_settings for select using (true);
drop policy if exists "admin edita config" on public.store_settings;
create policy "admin edita config" on public.store_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- CUPONES (se validan en el servidor) ----------
create table if not exists public.coupons (
  code text primary key,
  percent int not null check (percent between 1 and 90),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.coupons enable row level security;
drop policy if exists "admin gestiona cupones" on public.coupons;
create policy "admin gestiona cupones" on public.coupons for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
insert into public.coupons (code, percent) values ('TEMASHOP10', 10) on conflict (code) do nothing;

create or replace function public.check_coupon(p_code text) returns int
language sql stable security definer set search_path = public as $$
  select coalesce((select percent from public.coupons
                   where code = upper(trim(p_code)) and active), 0);
$$;
grant execute on function public.check_coupon(text) to anon, authenticated;

-- ---------- PRODUCTOS ----------
alter table public.products add column if not exists active boolean not null default true;
-- Quitar calificaciones y ventas inventadas: desde ahora solo cuentan ventas reales
update public.products set rating = 0, reviews_count = 0, sales_count = 0
  where reviews_count > 0 and not exists (select 1 from public.orders);
alter table public.products alter column rating set default 0;

-- ---------- PEDIDOS ----------
alter table public.orders add column if not exists customer_phone text not null default '';
alter table public.orders add column if not exists discount numeric(10,2) not null default 0;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists payment_status text not null default 'pendiente';
alter table public.orders add column if not exists paypal_order_id text;
alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
update public.orders set status = 'pendiente' where status not in ('pendiente','confirmado','enviado','entregado','cancelado');
alter table public.orders alter column status set default 'pendiente';
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pendiente','confirmado','enviado','entregado','cancelado'));
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('pendiente','pagado','reembolsado'));

create sequence if not exists public.order_number_seq start 100001;

drop policy if exists "cliente ve sus pedidos" on public.orders;
create policy "cliente ve sus pedidos" on public.orders for select to authenticated
  using (user_id = auth.uid() or lower(customer_email) = lower(auth.jwt() ->> 'email'));

-- El trigger anterior ya no hace falta (place_order asigna el correo)
drop trigger if exists orders_force_email on public.orders;

-- Si el admin cancela un pedido, se devuelve el stock
create or replace function public.restore_stock_on_cancel() returns trigger
language plpgsql security definer set search_path = public as $$
declare it jsonb;
begin
  if new.status = 'cancelado' and old.status <> 'cancelado' then
    for it in select * from jsonb_array_elements(old.items) loop
      update public.products
         set stock = stock + (it ->> 'quantity')::int,
             sales_count = greatest(0, sales_count - (it ->> 'quantity')::int)
       where id = it ->> 'productId';
    end loop;
  end if;
  return new;
end; $$;
drop trigger if exists orders_restore_stock on public.orders;
create trigger orders_restore_stock after update of status on public.orders
  for each row execute function public.restore_stock_on_cancel();

-- ---------- CREAR PEDIDO (precios, cupón y envío se calculan aquí) ----------
drop function if exists public.place_order(text, text, jsonb, jsonb, text);
drop function if exists public.place_order(text, text, text, jsonb, jsonb, text, text);
create function public.place_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address jsonb,
  p_items jsonb,
  p_payment_method text,
  p_coupon text default null
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  it jsonb;
  prod public.products;
  qty int;
  line_items jsonb := '[]'::jsonb;
  v_subtotal numeric(10,2) := 0;
  v_percent int := 0;
  v_discount numeric(10,2) := 0;
  v_shipping numeric(10,2);
  cfg public.store_settings;
  v_email text;
  new_order public.orders;
begin
  if p_payment_method not in ('cash_on_delivery', 'paypal', 'zelle', 'cashapp') then
    raise exception 'Método de pago no válido';
  end if;
  if coalesce(length(trim(p_customer_name)), 0) < 2 or length(p_customer_name) > 120 then
    raise exception 'Nombre no válido';
  end if;
  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', p_customer_email)));
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Correo no válido';
  end if;
  if coalesce(length(trim(p_customer_phone)), 0) < 7 or length(p_customer_phone) > 30 then
    raise exception 'Teléfono no válido';
  end if;
  if coalesce(length(trim(p_address ->> 'street')), 0) < 3 or coalesce(length(trim(p_address ->> 'city')), 0) < 2 then
    raise exception 'Dirección no válida';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'Demasiados artículos en un pedido';
  end if;

  for it in select * from jsonb_array_elements(p_items) loop
    qty := (it ->> 'quantity')::int;
    if qty is null or qty < 1 or qty > 99 then
      raise exception 'Cantidad no válida';
    end if;
    select * into prod from public.products where id = it ->> 'productId' and active for update;
    if not found then
      raise exception 'Un producto de tu carrito ya no está disponible';
    end if;
    if prod.stock < qty then
      raise exception 'Stock insuficiente para %', prod.title;
    end if;

    update public.products
       set stock = stock - qty, sales_count = sales_count + qty
     where id = prod.id;

    v_subtotal := v_subtotal + prod.price * qty;
    line_items := line_items || jsonb_build_object(
      'productId', prod.id, 'title', prod.title, 'price', prod.price,
      'quantity', qty, 'imageUrl', prod.image_url);
  end loop;

  if p_coupon is not null and length(trim(p_coupon)) > 0 then
    v_percent := public.check_coupon(p_coupon);
    if v_percent = 0 then
      raise exception 'El cupón no es válido';
    end if;
  end if;
  v_discount := round(v_subtotal * v_percent / 100.0, 2);

  select * into cfg from public.store_settings where id = 1;
  v_shipping := case when v_subtotal >= cfg.free_shipping_threshold then 0 else cfg.shipping_fee end;

  insert into public.orders (id, order_number, customer_name, customer_email, customer_phone, address,
                             items, payment_method, payment_status, status, subtotal, discount,
                             coupon_code, shipping, total, user_id)
  values ('ord-' || gen_random_uuid(),
          'TS-' || nextval('public.order_number_seq'),
          trim(p_customer_name), v_email, trim(p_customer_phone),
          jsonb_build_object(
            'street', left(trim(p_address ->> 'street'), 200),
            'city', left(trim(p_address ->> 'city'), 80),
            'state', left(trim(coalesce(p_address ->> 'state', '')), 80),
            'zipCode', left(trim(coalesce(p_address ->> 'zipCode', '')), 20),
            'notes', left(trim(coalesce(p_address ->> 'notes', '')), 300)),
          line_items, p_payment_method, 'pendiente', 'pendiente',
          v_subtotal, v_discount,
          case when v_percent > 0 then upper(trim(p_coupon)) end,
          v_shipping, v_subtotal - v_discount + v_shipping, auth.uid())
  returning * into new_order;

  return new_order;
end;
$$;
grant execute on function public.place_order(text, text, text, jsonb, jsonb, text, text) to anon, authenticated;

-- ---------- CONSULTAR UN PEDIDO SIN CUENTA (número + correo) ----------
create or replace function public.get_order_public(p_order_number text, p_email text)
returns setof public.orders
language sql stable security definer set search_path = public as $$
  select * from public.orders
  where order_number = upper(trim(p_order_number))
    and lower(customer_email) = lower(trim(p_email))
  limit 1;
$$;
grant execute on function public.get_order_public(text, text) to anon, authenticated;

-- ---------- FOTOS DE PRODUCTOS (Supabase Storage) ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "fotos productos publicas" on storage.objects;
create policy "fotos productos publicas" on storage.objects for select
  using (bucket_id = 'product-images');
drop policy if exists "admin sube fotos" on storage.objects;
create policy "admin sube fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admin borra fotos" on storage.objects;
create policy "admin borra fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
