-- =========================================================
-- TemaShop - Esquema de base de datos (Supabase / Postgres)
-- Ejecutar en: Supabase → SQL Editor
-- =========================================================

-- Correo del administrador (solo este usuario puede editar productos y ver pedidos)
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(lower(auth.jwt() ->> 'email') = 'miguelgraphalterna@gmail.com', false);
$$;

-- ---------- PRODUCTOS ----------
create table if not exists public.products (
  id text primary key default ('p-' || floor(extract(epoch from now()) * 1000)::bigint),
  title text not null,
  description text not null default '',
  category text not null,
  price numeric(10,2) not null check (price > 0),
  original_price numeric(10,2) not null,
  stock integer not null default 0 check (stock >= 0),
  image_url text not null default '',
  rating numeric(2,1) not null default 4.8,
  reviews_count integer not null default 0,
  sales_count integer not null default 0,
  is_flash_deal boolean not null default false,
  badge text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "productos visibles para todos" on public.products;
create policy "productos visibles para todos" on public.products
  for select using (true);

drop policy if exists "solo admin crea productos" on public.products;
create policy "solo admin crea productos" on public.products
  for insert to authenticated with check (public.is_admin());

drop policy if exists "solo admin edita productos" on public.products;
create policy "solo admin edita productos" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "solo admin borra productos" on public.products;
create policy "solo admin borra productos" on public.products
  for delete to authenticated using (public.is_admin());

-- ---------- PEDIDOS ----------
create table if not exists public.orders (
  id text primary key,
  order_number text not null unique,
  created_at timestamptz not null default now(),
  status text not null default 'Procesando',
  customer_name text not null,
  customer_email text not null,
  address jsonb not null,
  items jsonb not null,
  payment_method text not null,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null,
  total numeric(10,2) not null
);

alter table public.orders enable row level security;

drop policy if exists "solo admin ve pedidos" on public.orders;
create policy "solo admin ve pedidos" on public.orders
  for select to authenticated using (public.is_admin());

drop policy if exists "solo admin edita pedidos" on public.orders;
create policy "solo admin edita pedidos" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Los clientes NO insertan directo: usan place_order(), que valida precios y stock.
revoke insert, update, delete on public.orders from anon, authenticated;
grant update on public.orders to authenticated;

-- ---------- FUNCIÓN PARA CREAR PEDIDOS ----------
-- Recalcula precios desde la base de datos (el cliente no puede cambiar precios)
-- y descuenta el stock de forma segura.
create or replace function public.place_order(
  p_customer_name text,
  p_customer_email text,
  p_address jsonb,
  p_items jsonb,           -- [{ "productId": "...", "quantity": 2 }, ...]
  p_payment_method text
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  it jsonb;
  prod public.products;
  qty int;
  line_items jsonb := '[]'::jsonb;
  v_subtotal numeric(10,2) := 0;
  v_shipping numeric(10,2);
  new_order public.orders;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;

  for it in select * from jsonb_array_elements(p_items) loop
    qty := greatest(1, (it ->> 'quantity')::int);
    select * into prod from public.products where id = it ->> 'productId' for update;
    if not found then
      raise exception 'Producto no encontrado';
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

  v_shipping := case when v_subtotal >= 35 then 0 else 4.99 end;

  insert into public.orders (id, order_number, customer_name, customer_email, address, items,
                             payment_method, subtotal, shipping, total)
  values ('ord-' || floor(extract(epoch from clock_timestamp()) * 1000)::bigint || '-' || floor(random() * 1000)::int,
          'TS-' || lpad(floor(random() * 1000000)::text, 6, '0'),
          trim(p_customer_name), lower(trim(p_customer_email)), p_address, line_items,
          p_payment_method, v_subtotal, v_shipping, v_subtotal + v_shipping)
  returning * into new_order;

  return new_order;
end;
$$;

grant execute on function public.place_order(text, text, jsonb, jsonb, text) to anon, authenticated;

-- ---------- PRODUCTOS INICIALES ----------
insert into public.products (id, title, description, category, price, original_price, stock, image_url, rating, reviews_count, sales_count, is_flash_deal, badge) values
('p-001','Smartwatch AMOLED Pro con GPS','Pantalla AMOLED de 1.9", monitor de ritmo cardíaco, oxígeno en sangre, GPS integrado y batería de hasta 10 días.','Tecnología',49.99,129.99,35,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',4.8,1243,5320,true,'MÁS VENDIDO'),
('p-002','Auriculares Inalámbricos con Cancelación de Ruido','Cancelación activa de ruido (ANC), 40 horas de batería, carga rápida USB-C y sonido de alta fidelidad.','Tecnología',39.99,89.99,50,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',4.7,987,4100,true,'OFERTA'),
('p-003','Zapatillas Deportivas Air Sport','Suela amortiguada, malla transpirable y diseño ligero para correr o uso diario.','Moda y Calzado',34.50,69.00,60,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',4.6,642,2890,false,null),
('p-004','Freidora de Aire Digital XL 6L','Cocina sin aceite con 8 programas preestablecidos, pantalla táctil y cesta antiadherente apta para lavavajillas.','Hogar y Cocina',59.99,119.99,25,'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',4.9,2210,7600,true,'TOP'),
('p-005','Cafetera Italiana Moka Acero Inoxidable','Café intenso estilo espresso en minutos. Compatible con todo tipo de cocinas, incluida inducción.','Hogar y Cocina',19.99,34.99,80,'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',4.5,410,1500,false,null),
('p-006','Suero Facial Vitamina C 30ml','Ilumina y unifica el tono de la piel. Con ácido hialurónico y vitamina E. Apto para todo tipo de piel.','Belleza y Cuidado',12.99,29.99,120,'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',4.7,1780,6400,true,null),
('p-007','Botella Térmica Deportiva 1L','Mantiene bebidas frías 24h y calientes 12h. Acero inoxidable libre de BPA con tapa antigoteo.','Deportes y Aire Libre',14.99,24.99,90,'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',4.6,530,2100,false,null),
('p-008','Gafas de Sol Aviador Polarizadas','Lentes polarizados con protección UV400 y montura metálica ligera. Incluye estuche.','Accesorios',16.99,39.99,70,'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',4.4,380,1320,true,'NUEVO')
on conflict (id) do nothing;

-- ---------- PEDIDOS DE CADA CLIENTE ----------
create policy "cliente ve sus pedidos" on public.orders
  for select to authenticated
  using (lower(customer_email) = lower(auth.jwt() ->> 'email'));

-- Si el cliente inició sesión, el pedido se guarda con su correo real
create or replace function public.force_order_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.jwt() ->> 'email' is not null and not public.is_admin() then
    new.customer_email := lower(auth.jwt() ->> 'email');
  end if;
  return new;
end; $$;

create trigger orders_force_email before insert on public.orders
  for each row execute function public.force_order_email();
