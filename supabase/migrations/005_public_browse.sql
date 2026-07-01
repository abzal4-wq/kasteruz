-- ============================================================
-- Ommaviy ko'rish: login faqat XARID uchun, ko'rish hammaga ochiq
-- (004_security_close.sql ni qaytaradi — katalog yana ommaviy)
-- Maxfiy jadvallar (orders, customers, profiles) himoyada qoladi.
-- ============================================================

-- categories
drop policy if exists "Kirganlar kategoriyani ko'radi" on categories;
create policy "Kategoriya ommaviy" on categories for select using (true);

-- products
drop policy if exists "Kirganlar aktiv mahsulotni ko'radi" on products;
create policy "Aktiv mahsulot ommaviy" on products
  for select using (is_active = true or is_staff());

-- product_variants
drop policy if exists "Kirganlar variantni ko'radi" on product_variants;
create policy "Variant ommaviy" on product_variants for select using (true);

-- product_images
drop policy if exists "Kirganlar rasmni ko'radi" on product_images;
create policy "Rasm ommaviy" on product_images for select using (true);

-- brands
drop policy if exists "Kirganlar aktiv brendni ko'radi" on brands;
create policy "Brend ommaviy" on brands
  for select using (is_active = true or is_staff());

-- banners
drop policy if exists "Kirganlar aktiv bannerni ko'radi" on banners;
create policy "Banner ommaviy" on banners
  for select using (is_active = true or is_staff());

-- store_settings (aloqa ma'lumoti)
drop policy if exists "Kirganlar sozlamani o'qiydi" on store_settings;
create policy "Sozlama ommaviy" on store_settings for select using (true);
