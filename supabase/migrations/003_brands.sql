-- ============================================================
-- Brendlar jadvali + logos storage bucket
-- ============================================================

create table if not exists brands (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  tagline          text not null default '',
  logo_url         text,
  logo_blend_mode  text not null default 'normal',
  bg_color         text not null default '#1A1A2E',
  text_color       text not null default '#FFFFFF',
  accent_color     text not null default '#D4A843',
  is_active        boolean not null default true,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists idx_brands_sort on brands(sort_order) where is_active = true;

-- ─── RLS ─────────────────────────────────────────────────────
alter table brands enable row level security;

create policy "Aktiv brendlar ommaviy ko'rinadi" on brands
  for select using (is_active = true or is_staff());

create policy "Admin brendlarni boshqaradi" on brands for all
  using (is_admin_or_above()) with check (is_admin_or_above());

-- ─── Storage: logos bucket ────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'logos', 'logos', true,
  5242880,  -- 5 MB
  array['image/png','image/jpeg','image/webp','image/svg+xml']
)
on conflict (id) do nothing;

create policy "Logos ommaviy ko'rinadi" on storage.objects
  for select using (bucket_id = 'logos');

create policy "Admin logos yuklaydi" on storage.objects
  for insert with check (
    bucket_id = 'logos'
    and (select is_admin_or_above())
  );

create policy "Admin logos yangilaydi" on storage.objects
  for update using (
    bucket_id = 'logos'
    and (select is_admin_or_above())
  );

create policy "Admin logos o'chiradi" on storage.objects
  for delete using (
    bucket_id = 'logos'
    and (select is_admin_or_above())
  );
