-- ============================================================
-- Kaster.uz — Namuna ma'lumotlar (Seed)
-- ============================================================

-- ─── Store settings ──────────────────────────────────────────
insert into store_settings (key, value, description) values
  ('store_name',        'Kaster.uz',         'Do''kon nomi'),
  ('store_phone',       '+998 90 123 45 67',  'Asosiy telefon'),
  ('store_address',     'Toshkent, Abu Sahiy bozori, 12-do''kon', 'Manzil'),
  ('delivery_fee',      '25000',             'Standart yetkazish narxi (UZS)'),
  ('free_delivery_min', '500000',            'Bepul yetkazish minimal buyurtma (UZS)'),
  ('currency',          'UZS',               'Valyuta'),
  ('default_lang',      'uz',                'Standart til'),
  ('payme_enabled',     'false',             'Payme to''lovi yoqilganmi'),
  ('click_enabled',     'false',             'Click to''lovi yoqilganmi'),
  ('uzum_enabled',      'false',             'Uzum to''lovi yoqilganmi');

-- ─── Omborlar ────────────────────────────────────────────────
insert into warehouses (id, name, type, address) values
  ('a1000000-0000-0000-0000-000000000001', 'Abu Sahiy do''kon', 'store',     'Toshkent, Abu Sahiy bozori'),
  ('a1000000-0000-0000-0000-000000000002', 'Asosiy ombor',      'warehouse', 'Toshkent, Yunusobod');

-- ─── Kategoriyalar ───────────────────────────────────────────
insert into categories (id, name_uz, name_ru, slug, sort_order) values
  ('c1000000-0000-0000-0000-000000000001', 'Kostyumlar',   'Костюмы',    'kostyumlar',   1),
  ('c1000000-0000-0000-0000-000000000002', 'Shimlar',      'Брюки',      'shimlar',      2),
  ('c1000000-0000-0000-0000-000000000003', 'Ko''ylaklar',  'Рубашки',    'koylaklar',    3),
  ('c1000000-0000-0000-0000-000000000004', 'Aksessuarlar', 'Аксессуары', 'aksessuarlar', 4);

-- ─── Namuna mahsulotlar ──────────────────────────────────────
insert into products
  (id, sku, name_uz, name_ru, description_uz, description_ru,
   category_id, fabric, season, fit_type, base_price, cost_price, is_active, is_featured)
values
  (
    'p1000000-0000-0000-0000-000000000001',
    'KU-SUIT-001',
    'Klassik qora kostyum',
    'Классический чёрный костюм',
    'Yuqori sifatli jun-poliyester aralashmasidan tikilgan, slim fit. Ish uchun va maxsus tadbirlar uchun ideal.',
    'Пошит из высококачественной шерстяно-полиэстерной смеси, slim fit. Идеален для работы и особых мероприятий.',
    'c1000000-0000-0000-0000-000000000001',
    'Jun 70%, Poliyester 30%',
    'Barcha fasl',
    'slim',
    1290000,
    650000,
    true,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000002',
    'KU-SUIT-002',
    'Kul rang biznes kostyum',
    'Серый деловой костюм',
    'Regular fit, klassik biznes uslub. Yumshoq mato, qulay kesim.',
    'Regular fit, классический деловой стиль. Мягкая ткань, удобный крой.',
    'c1000000-0000-0000-0000-000000000001',
    'Poliyester 60%, Viskoza 40%',
    'Barcha fasl',
    'regular',
    980000,
    490000,
    true,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000003',
    'KU-PANT-001',
    'Klassik qora shim',
    'Классические чёрные брюки',
    'Klassik klassika, barcha kostumlar bilan mos keladi.',
    'Классика жанра, подходит ко всем пиджакам.',
    'c1000000-0000-0000-0000-000000000002',
    'Poliyester 65%, Viskoza 35%',
    'Barcha fasl',
    'regular',
    390000,
    180000,
    true,
    false
  ),
  (
    'p1000000-0000-0000-0000-000000000004',
    'KU-SHIRT-001',
    'Oq rasmiy ko''ylak',
    'Белая классическая рубашка',
    'Slim fit oq ko''ylak, nozik trikotaj mato.',
    'Белая рубашка slim fit, тонкий трикотаж.',
    'c1000000-0000-0000-0000-000000000003',
    '100% Paxta',
    'Barcha fasl',
    'slim',
    280000,
    120000,
    true,
    false
  );

-- ─── Variantlar (o'lcham × rang) ─────────────────────────────
-- Kostyum 1 (KU-SUIT-001) variantlari — qora
insert into product_variants (id, product_id, size, color, color_hex, sku) values
  ('v1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', '46', 'Qora', '#1A1A1A', 'KU-SUIT-001-46-BLK'),
  ('v1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', '48', 'Qora', '#1A1A1A', 'KU-SUIT-001-48-BLK'),
  ('v1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000001', '50', 'Qora', '#1A1A1A', 'KU-SUIT-001-50-BLK'),
  ('v1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000001', '52', 'Qora', '#1A1A1A', 'KU-SUIT-001-52-BLK'),
  ('v1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000001', '54', 'Qora', '#1A1A1A', 'KU-SUIT-001-54-BLK'),
  ('v1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000001', '56', 'Qora', '#1A1A1A', 'KU-SUIT-001-56-BLK');

-- Kostyum 2 (KU-SUIT-002) variantlari — kul rang
insert into product_variants (id, product_id, size, color, color_hex, sku) values
  ('v1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000002', '46', 'Kul rang', '#6B7280', 'KU-SUIT-002-46-GRY'),
  ('v1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000002', '48', 'Kul rang', '#6B7280', 'KU-SUIT-002-48-GRY'),
  ('v1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000002', '50', 'Kul rang', '#6B7280', 'KU-SUIT-002-50-GRY'),
  ('v1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000002', '52', 'Kul rang', '#6B7280', 'KU-SUIT-002-52-GRY');

-- Shim variantlari
insert into product_variants (id, product_id, size, color, color_hex, sku) values
  ('v1000000-0000-0000-0000-000000000011', 'p1000000-0000-0000-0000-000000000003', '46', 'Qora', '#1A1A1A', 'KU-PANT-001-46-BLK'),
  ('v1000000-0000-0000-0000-000000000012', 'p1000000-0000-0000-0000-000000000003', '48', 'Qora', '#1A1A1A', 'KU-PANT-001-48-BLK'),
  ('v1000000-0000-0000-0000-000000000013', 'p1000000-0000-0000-0000-000000000003', '50', 'Qora', '#1A1A1A', 'KU-PANT-001-50-BLK'),
  ('v1000000-0000-0000-0000-000000000014', 'p1000000-0000-0000-0000-000000000003', '52', 'Qora', '#1A1A1A', 'KU-PANT-001-52-BLK');

-- Ko'ylak variantlari
insert into product_variants (id, product_id, size, color, color_hex, sku) values
  ('v1000000-0000-0000-0000-000000000015', 'p1000000-0000-0000-0000-000000000004', '46', 'Oq', '#FFFFFF', 'KU-SHIRT-001-46-WHT'),
  ('v1000000-0000-0000-0000-000000000016', 'p1000000-0000-0000-0000-000000000004', '48', 'Oq', '#FFFFFF', 'KU-SHIRT-001-48-WHT'),
  ('v1000000-0000-0000-0000-000000000017', 'p1000000-0000-0000-0000-000000000004', '50', 'Oq', '#FFFFFF', 'KU-SHIRT-001-50-WHT');

-- ─── Inventar (Abu Sahiy do'konda) ───────────────────────────
insert into inventory (variant_id, warehouse_id, quantity, reorder_level) values
  ('v1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 5,  3),
  ('v1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 8,  3),
  ('v1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 10, 3),
  ('v1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 7,  3),
  ('v1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 4,  3),
  ('v1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 2,  3),
  ('v1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 6,  3),
  ('v1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 9,  3),
  ('v1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001', 12, 3),
  ('v1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000001', 3,  3),
  ('v1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000001', 15, 5),
  ('v1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000001', 20, 5),
  ('v1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000001', 18, 5),
  ('v1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000001', 10, 5),
  ('v1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000001', 25, 5),
  ('v1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000001', 30, 5),
  ('v1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000001', 22, 5);

-- ─── Namuna ta'minotchi ──────────────────────────────────────
insert into suppliers (id, name, phone, location) values
  ('s1000000-0000-0000-0000-000000000001', 'Yaqin Tekstil',  '+998 90 111 22 33', 'Toshkent, Chorsu'),
  ('s1000000-0000-0000-0000-000000000002', 'Premium Fabrics', '+998 91 222 33 44', 'Toshkent, Sergeli');

-- ─── Namuna promo-kod ─────────────────────────────────────────
insert into promo_codes (code, type, value, min_order, usage_limit) values
  ('KASTER10', 'percent', 10, 500000,  100),
  ('YANGI50',  'fixed',   50000, 0,    50);

-- ─── Namuna banner ────────────────────────────────────────────
insert into banners (image_url, title_uz, title_ru, position, sort_order, is_active) values
  ('/banners/hero-1.jpg', 'Yangi kolleksiya', 'Новая коллекция', 'hero', 1, true),
  ('/banners/hero-2.jpg', 'Yozgi chegirmalar', 'Летние скидки',   'hero', 2, true);
