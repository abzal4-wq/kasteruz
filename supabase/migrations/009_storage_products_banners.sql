-- ============================================================
-- 009_storage_products_banners.sql
-- `products` va `banners` storage bucketlarini yaratish + RLS.
-- Sabab: admin paneldan rasm yuklaganda 400 xato — bu bucketlar
-- (logos'dan farqli) SQL bilan yaratilmagan edi.
-- ============================================================

-- ─── Bucketlar (ommaviy o'qish, admin yozadi) ───────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 10485760,  -- 10 MB
        array['image/png','image/jpeg','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 10485760;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('banners', 'banners', true, 10485760,
        array['image/png','image/jpeg','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 10485760;

-- ─── RLS siyosatlari (idempotent: avval o'chirib, keyin yaratamiz) ───
-- products
drop policy if exists "Mahsulot rasmlari ommaviy" on storage.objects;
create policy "Mahsulot rasmlari ommaviy" on storage.objects
  for select using (bucket_id = 'products');

drop policy if exists "Admin mahsulot rasm yuklaydi" on storage.objects;
create policy "Admin mahsulot rasm yuklaydi" on storage.objects
  for insert with check (bucket_id = 'products' and (select is_admin_or_above()));

drop policy if exists "Admin mahsulot rasm yangilaydi" on storage.objects;
create policy "Admin mahsulot rasm yangilaydi" on storage.objects
  for update using (bucket_id = 'products' and (select is_admin_or_above()));

drop policy if exists "Admin mahsulot rasm o'chiradi" on storage.objects;
create policy "Admin mahsulot rasm o'chiradi" on storage.objects
  for delete using (bucket_id = 'products' and (select is_admin_or_above()));

-- banners
drop policy if exists "Banner rasmlari ommaviy" on storage.objects;
create policy "Banner rasmlari ommaviy" on storage.objects
  for select using (bucket_id = 'banners');

drop policy if exists "Admin banner rasm yuklaydi" on storage.objects;
create policy "Admin banner rasm yuklaydi" on storage.objects
  for insert with check (bucket_id = 'banners' and (select is_admin_or_above()));

drop policy if exists "Admin banner rasm yangilaydi" on storage.objects;
create policy "Admin banner rasm yangilaydi" on storage.objects
  for update using (bucket_id = 'banners' and (select is_admin_or_above()));

drop policy if exists "Admin banner rasm o'chiradi" on storage.objects;
create policy "Admin banner rasm o'chiradi" on storage.objects
  for delete using (bucket_id = 'banners' and (select is_admin_or_above()));
