-- =============================================================
-- 0005_seed.sql
-- Demo data: categories + products (no images yet).
-- Safe to re-run (uses ON CONFLICT on slug).
--
-- NOTE: this does NOT create an admin user. Create the admin via
-- Supabase Auth (dashboard or CLI), then promote their profile:
--   update public.profiles set role = 'admin' where id = '<uuid>';
-- =============================================================

-- ---------------- Categories ----------------
insert into public.categories (name, slug, description, sort_order) values
  ('Ropa para niños', 'ropa-ninos', 'Polos, pantalones y conjuntos cómodos', 1),
  ('Juguetes',        'juguetes',   'Juguetes educativos y de entretenimiento', 2),
  ('Accesorios',      'accesorios', 'Gorros, mochilas y más', 3),
  ('Calzado',         'calzado',    'Zapatillas y sandalias para niños', 4)
on conflict (slug) do nothing;

-- ---------------- Products ----------------
-- Helper pattern: look up category id by slug inline.
insert into public.products
  (category_id, name, slug, description, price, compare_price, stock, sku, is_featured)
values
  ((select id from public.categories where slug = 'ropa-ninos'),
   'Polo algodón pima', 'polo-algodon-pima',
   'Polo 100% algodón pima, suave y fresco. Tallas 2 a 10 años.',
   39.90, 49.90, 50, 'YK-POL-001', true),

  ((select id from public.categories where slug = 'ropa-ninos'),
   'Conjunto deportivo', 'conjunto-deportivo',
   'Conjunto polo + short ideal para el día a día.',
   69.90, null, 30, 'YK-CON-001', true),

  ((select id from public.categories where slug = 'juguetes'),
   'Set de bloques 100 piezas', 'set-bloques-100',
   'Bloques de construcción coloridos, estimulan la creatividad.',
   59.90, 79.90, 25, 'YK-JUG-001', true),

  ((select id from public.categories where slug = 'juguetes'),
   'Rompecabezas 48 piezas', 'rompecabezas-48',
   'Rompecabezas educativo de animales.',
   24.90, null, 40, 'YK-JUG-002', false),

  ((select id from public.categories where slug = 'accesorios'),
   'Gorro de lana', 'gorro-lana',
   'Gorro tejido abrigador para temporada de frío.',
   25.00, null, 60, 'YK-ACC-001', false),

  ((select id from public.categories where slug = 'accesorios'),
   'Mochila escolar', 'mochila-escolar',
   'Mochila resistente con compartimentos múltiples.',
   89.90, 109.90, 20, 'YK-ACC-002', true),

  ((select id from public.categories where slug = 'calzado'),
   'Zapatillas casuales', 'zapatillas-casuales',
   'Zapatillas livianas con suela antideslizante.',
   79.90, null, 35, 'YK-CAL-001', false),

  ((select id from public.categories where slug = 'calzado'),
   'Sandalias verano', 'sandalias-verano',
   'Sandalias cómodas y frescas para el verano.',
   45.00, 59.00, 45, 'YK-CAL-002', false)
on conflict (slug) do nothing;
