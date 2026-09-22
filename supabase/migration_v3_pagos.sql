-- TemaShop v3: acepta Zelle y Cash App como métodos de pago
create or replace function public.place_order(
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
