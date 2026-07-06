-- ============================================================
-- 008_variant_images.sql
-- Bitta model — har rang varianti o'z suratida.
-- Rasmlar saytning o'zida: /products/*.jpg (Vercel public)
-- ============================================================

-- Rasm qaysi rang variantiga tegishli (null = umumiy rasm)
alter table product_images add column if not exists color text;

-- ─── Eski (mos kelmaydigan) rasmlarni almashtiramiz ───
delete from product_images
where product_id in (
  select id from products
  where sku in ('KU-ACC-001','KU-SHIRT-001','KU-PANT-001','SC-SUIT-001','SV-SUIT-001','BG-SUIT-001')
);

-- ─── Yangi rasmlar (har rang o'z suratida) ───
insert into product_images (product_id, url, alt, color, is_primary, sort_order)
select p.id, v.url, v.alt, v.color, v.is_primary, v.sort_order
from (values
  -- Ipak galstuk
  ('KU-ACC-001',  '/products/ku-acc-001-toq-kok.jpg',   'Ipak galstuk — to''q ko''k',        'To''q ko''k', true,  0),
  ('KU-ACC-001',  '/products/ku-acc-001-bordo.jpg',     'Ipak galstuk — bordo',              'Bordo',       false, 1),
  -- Oq rasmiy ko'ylak
  ('KU-SHIRT-001','/products/ku-shirt-001-oq.jpg',      'Rasmiy ko''ylak — oq',              'Oq',          true,  0),
  ('KU-SHIRT-001','/products/ku-shirt-001-havorang.jpg','Rasmiy ko''ylak — havorang',        'Havorang',    false, 1),
  -- Klassik qora shim
  ('KU-PANT-001', '/products/ku-pant-001-qora.jpg',     'Klassik shim — qora',               'Qora',        true,  0),
  ('KU-PANT-001', '/products/ku-pant-001-bej.jpg',      'Klassik shim — bej',                'Bej',         false, 1),
  ('KU-PANT-001', '/products/ku-pant-001-kul-rang.jpg', 'Klassik shim — kul rang',           'Kul rang',    false, 2),
  -- Saco Business Kostyum
  ('SC-SUIT-001', '/products/sc-suit-001-qora.jpg',     'Saco kostyum — qora',               'Qora',        true,  0),
  ('SC-SUIT-001', '/products/sc-suit-001-kul-rang.jpg', 'Saco kostyum — kul rang',           'Kul rang',    false, 1),
  -- Salvarini Klassik Kostyum
  ('SV-SUIT-001', '/products/sv-suit-001-kul-rang.jpg', 'Salvarini kostyum — kul rang',      'Kul rang',    true,  0),
  ('SV-SUIT-001', '/products/sv-suit-001-toq-kok.jpg',  'Salvarini kostyum — to''q ko''k',   'To''q ko''k', false, 1),
  ('SV-SUIT-001', '/products/sv-suit-001-bordo.jpg',    'Salvarini kostyum — bordo',         'Bordo',       false, 2),
  -- Bugaso Navy Premium Kostyum
  ('BG-SUIT-001', '/products/bg-suit-001-toq-kok.jpg',  'Bugaso kostyum — to''q ko''k',      'To''q ko''k', true,  0),
  ('BG-SUIT-001', '/products/bg-suit-001-qora.jpg',     'Bugaso kostyum — qora',             'Qora',        false, 1)
) as v(psku, url, alt, color, is_primary, sort_order)
join products p on p.sku = v.psku;

-- ─── Yangi rang variantlari (o'lchamlar mavjud ranglar bilan bir xil) ───
insert into product_variants (product_id, size, color, color_hex, sku)
select p.id, v.size, v.color, v.color_hex, v.vsku
from (values
  -- Ipak galstuk: + Bordo
  ('KU-ACC-001',  'Universal', 'Bordo',      '#6E3239', 'KU-ACC-001-BRD'),
  -- Oq ko'ylak: + Havorang
  ('KU-SHIRT-001','46', 'Havorang', '#A9C6E2', 'KU-SHIRT-001-HAV-46'),
  ('KU-SHIRT-001','48', 'Havorang', '#A9C6E2', 'KU-SHIRT-001-HAV-48'),
  ('KU-SHIRT-001','50', 'Havorang', '#A9C6E2', 'KU-SHIRT-001-HAV-50'),
  ('KU-SHIRT-001','52', 'Havorang', '#A9C6E2', 'KU-SHIRT-001-HAV-52'),
  -- Qora shim: + Bej, + Kul rang
  ('KU-PANT-001', '46', 'Bej',      '#B9A27C', 'KU-PANT-001-BEJ-46'),
  ('KU-PANT-001', '48', 'Bej',      '#B9A27C', 'KU-PANT-001-BEJ-48'),
  ('KU-PANT-001', '50', 'Bej',      '#B9A27C', 'KU-PANT-001-BEJ-50'),
  ('KU-PANT-001', '52', 'Bej',      '#B9A27C', 'KU-PANT-001-BEJ-52'),
  ('KU-PANT-001', '54', 'Bej',      '#B9A27C', 'KU-PANT-001-BEJ-54'),
  ('KU-PANT-001', '46', 'Kul rang', '#8A8D93', 'KU-PANT-001-KUL-46'),
  ('KU-PANT-001', '48', 'Kul rang', '#8A8D93', 'KU-PANT-001-KUL-48'),
  ('KU-PANT-001', '50', 'Kul rang', '#8A8D93', 'KU-PANT-001-KUL-50'),
  ('KU-PANT-001', '52', 'Kul rang', '#8A8D93', 'KU-PANT-001-KUL-52'),
  ('KU-PANT-001', '54', 'Kul rang', '#8A8D93', 'KU-PANT-001-KUL-54'),
  -- Saco: + Kul rang
  ('SC-SUIT-001', '48', 'Kul rang', '#6E7B85', 'SC-SUIT-001-KUL-48'),
  ('SC-SUIT-001', '50', 'Kul rang', '#6E7B85', 'SC-SUIT-001-KUL-50'),
  ('SC-SUIT-001', '52', 'Kul rang', '#6E7B85', 'SC-SUIT-001-KUL-52'),
  ('SC-SUIT-001', '54', 'Kul rang', '#6E7B85', 'SC-SUIT-001-KUL-54'),
  -- Salvarini: + To'q ko'k, + Bordo
  ('SV-SUIT-001', '46', 'To''q ko''k', '#2C3E5D', 'SV-SUIT-001-TK-46'),
  ('SV-SUIT-001', '48', 'To''q ko''k', '#2C3E5D', 'SV-SUIT-001-TK-48'),
  ('SV-SUIT-001', '50', 'To''q ko''k', '#2C3E5D', 'SV-SUIT-001-TK-50'),
  ('SV-SUIT-001', '52', 'To''q ko''k', '#2C3E5D', 'SV-SUIT-001-TK-52'),
  ('SV-SUIT-001', '46', 'Bordo',      '#6E3239', 'SV-SUIT-001-BRD-46'),
  ('SV-SUIT-001', '48', 'Bordo',      '#6E3239', 'SV-SUIT-001-BRD-48'),
  ('SV-SUIT-001', '50', 'Bordo',      '#6E3239', 'SV-SUIT-001-BRD-50'),
  ('SV-SUIT-001', '52', 'Bordo',      '#6E3239', 'SV-SUIT-001-BRD-52'),
  -- Bugaso: + Qora
  ('BG-SUIT-001', '48', 'Qora',      '#1A1A1A', 'BG-SUIT-001-QOR-48'),
  ('BG-SUIT-001', '50', 'Qora',      '#1A1A1A', 'BG-SUIT-001-QOR-50'),
  ('BG-SUIT-001', '52', 'Qora',      '#1A1A1A', 'BG-SUIT-001-QOR-52'),
  ('BG-SUIT-001', '54', 'Qora',      '#1A1A1A', 'BG-SUIT-001-QOR-54')
) as v(psku, size, color, color_hex, vsku)
join products p on p.sku = v.psku
on conflict (sku) do nothing;
