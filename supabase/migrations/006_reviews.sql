-- ============================================================
-- 002_reviews.sql — Mahsulot sharhlari (yulduz + izoh)
-- ============================================================

create table product_reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  author_name text,
  created_at  timestamptz not null default now(),
  unique (product_id, customer_id)   -- bitta mijoz — bitta sharh
);
create index on product_reviews(product_id);

-- ─── RLS ─────────────────────────────────────────────────────
alter table product_reviews enable row level security;

-- Sharhlarni hamma (mehmon ham) o'qiy oladi
create policy "Sharhlarni hamma ko'radi" on product_reviews
  for select using (true);

-- Mijoz faqat o'z nomidan sharh qoldiradi
create policy "Mijoz sharh qoldiradi" on product_reviews
  for insert with check (
    customer_id in (select id from customers where auth_user_id = auth.uid())
  );

-- Mijoz o'z sharhini tahrirlaydi
create policy "Mijoz o'z sharhini tahrirlaydi" on product_reviews
  for update using (
    customer_id in (select id from customers where auth_user_id = auth.uid())
  );

-- Mijoz o'z sharhini o'chiradi
create policy "Mijoz o'z sharhini o'chiradi" on product_reviews
  for delete using (
    customer_id in (select id from customers where auth_user_id = auth.uid())
  );
