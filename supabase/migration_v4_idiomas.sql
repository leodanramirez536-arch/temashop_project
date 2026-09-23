-- v4: nombres y descripciones de productos en inglés
-- Ejecutar una vez en Supabase → SQL Editor. Es seguro ejecutarlo más de una vez.

alter table public.products add column if not exists title_en text;
alter table public.products add column if not exists description_en text;

-- Traducciones de los productos actuales (solo se llenan si están vacías)
update public.products set
  title_en = coalesce(title_en, v.t),
  description_en = coalesce(description_en, v.d)
from (values
  ('p-001', 'AMOLED Pro Smartwatch with GPS', '1.9" AMOLED display, heart rate and blood oxygen monitoring, built-in GPS and up to 10 days of battery life.'),
  ('p-002', 'Wireless Noise-Cancelling Headphones', 'Active noise cancellation (ANC), 40-hour battery, fast USB-C charging and high-fidelity sound.'),
  ('p-003', 'Air Sport Running Shoes', 'Cushioned sole, breathable mesh and a lightweight design for running or everyday wear.'),
  ('p-004', 'XL 6L Digital Air Fryer', 'Oil-free cooking with 8 presets, touch screen and a dishwasher-safe nonstick basket.'),
  ('p-005', 'Stainless Steel Moka Pot Espresso Maker', 'Rich espresso-style coffee in minutes. Works on all stovetops, including induction.'),
  ('p-006', 'Vitamin C Face Serum 1 fl oz (30 ml)', 'Brightens and evens skin tone. With hyaluronic acid and vitamin E. Suitable for all skin types.'),
  ('p-007', 'Insulated Sports Water Bottle 34 oz (1 L)', 'Keeps drinks cold for 24 hours and hot for 12. BPA-free stainless steel with a leak-proof lid.'),
  ('p-008', 'Polarized Aviator Sunglasses', 'Polarized lenses with UV400 protection and a lightweight metal frame. Case included.')
) as v(id, t, d)
where public.products.id = v.id;
