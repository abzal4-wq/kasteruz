-- ============================================================
-- XAVFSIZLIK: Saytni to'liq yopish
-- Katalog ma'lumotlari faqat KIRGAN (authenticated) foydalanuvchilarga
-- ko'rinadi. Anonim (kirmagan) so'rovlar bo'sh qaytadi.
-- Maxfiy ma'lumotlar (orders, customers, profiles) allaqachon RLS bilan himoyalangan.
-- ============================================================

-- Helper: kirган foydalanuvchimi?
create or replace function is_authenticated()
returns boolean language sql stable as $$
  select auth.uid() is not null
$$;

-- ─── categories ──────────────────────────────────────────────
drop policy if exists "Hamma ko'rishi mumkin" on categories;
create policy "Kirganlar kategoriyani ko'radi" on categories
  for select using (is_authenticated());

-- ─── products ────────────────────────────────────────────────
drop policy if exists "Hamma aktiv mahsulotlarni ko'radi" on products;
create policy "Kirganlar aktiv mahsulotni ko'radi" on products
  for select using (is_authenticated() and (is_active = true or is_staff()));

-- ─── product_variants ────────────────────────────────────────
drop policy if exists "Hamma variantlarni ko'radi" on product_variants;
create policy "Kirganlar variantni ko'radi" on product_variants
  for select using (is_authenticated());

-- ─── product_images ──────────────────────────────────────────
drop policy if exists "Hamma rasmlarni ko'radi" on product_images;
create policy "Kirganlar rasmni ko'radi" on product_images
  for select using (is_authenticated());

-- ─── inventory (ombor — faqat staff) ─────────────────────────
-- (mavjud bo'lsa qoldiramiz; storefront stokni variant orqali ko'radi)

-- ─── brands ──────────────────────────────────────────────────
drop policy if exists "Aktiv brendlar ommaviy ko'rinadi" on brands;
create policy "Kirganlar aktiv brendni ko'radi" on brands
  for select using (is_authenticated() and (is_active = true or is_staff()));

-- ─── banners ─────────────────────────────────────────────────
drop policy if exists "Aktiv bannerlar ko'rinadi" on banners;
create policy "Kirganlar aktiv bannerni ko'radi" on banners
  for select using (is_authenticated() and (is_active = true or is_staff()));

-- ─── store_settings (aloqa ma'lumoti — kirganlar o'qiydi) ────
drop policy if exists "Hamma sozlamalarni o'qiydi" on store_settings;
create policy "Kirganlar sozlamani o'qiydi" on store_settings
  for select using (is_authenticated());
