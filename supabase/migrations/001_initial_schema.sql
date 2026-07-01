-- ============================================================
-- Kaster.uz — To'liq boshlang'ich schema
-- Supabase (PostgreSQL) + RLS
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- matn qidirish uchun

-- ─── Helper: updated_at trigger ──────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- KATALOG
-- ============================================================

create table categories (
  id           uuid primary key default gen_random_uuid(),
  name_uz      text not null,
  name_ru      text not null,
  slug         text not null unique,
  parent_id    uuid references categories(id) on delete set null,
  image_url    text,
  sort_order   int not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger categories_updated_at before update on categories
  for each row execute function set_updated_at();
create index on categories(parent_id);
create index on categories(slug);

-- ─────────────────────────────────────────────────────────────

create table products (
  id               uuid primary key default gen_random_uuid(),
  sku              text not null unique,
  name_uz          text not null,
  name_ru          text not null,
  description_uz   text,
  description_ru   text,
  category_id      uuid not null references categories(id),
  brand            text,
  fabric           text,          -- mato: "Poliyester", "Jungli jun", ...
  season           text,          -- "Yoz", "Qish", "Barcha fasl"
  fit_type         text,          -- "slim", "regular", "comfort"
  base_price       bigint not null,   -- UZS, butun son (tiyin yo'q)
  sale_price       bigint,            -- chegirma narxi, null = yo'q
  cost_price       bigint,            -- tannarx (ERP)
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  search_vector    tsvector generated always as (
    to_tsvector('simple', coalesce(name_uz,'') || ' ' || coalesce(name_ru,''))
  ) stored,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger products_updated_at before update on products
  for each row execute function set_updated_at();
create index on products(category_id);
create index on products(is_active, is_featured);
create index on products using gin(search_vector);

-- ─────────────────────────────────────────────────────────────

create table product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references products(id) on delete cascade,
  size           text not null,       -- "46", "48", "50", "52", "54", "56"
  color          text not null,
  color_hex      text,
  barcode        text unique,
  sku            text not null unique,
  price_override bigint,              -- null = products.base_price ishlatiladi
  created_at     timestamptz not null default now()
);
create index on product_variants(product_id);

-- ─────────────────────────────────────────────────────────────

create table product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  variant_id  uuid references product_variants(id) on delete set null,
  url         text not null,
  alt         text,
  sort_order  int not null default 0,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on product_images(product_id);


-- ============================================================
-- OMBOR / INVENTAR
-- ============================================================

create table warehouses (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  type      text not null check (type in ('store','warehouse')),
  address   text,
  is_active boolean not null default true
);

create table inventory (
  id                uuid primary key default gen_random_uuid(),
  variant_id        uuid not null references product_variants(id) on delete cascade,
  warehouse_id      uuid not null references warehouses(id),
  quantity          int not null default 0 check (quantity >= 0),
  reserved_quantity int not null default 0 check (reserved_quantity >= 0),
  reorder_level     int not null default 5,
  updated_at        timestamptz not null default now(),
  unique (variant_id, warehouse_id)
);
create trigger inventory_updated_at before update on inventory
  for each row execute function set_updated_at();
create index on inventory(warehouse_id);
create index on inventory(variant_id);

-- available = quantity - reserved_quantity
create view inventory_available as
  select
    i.*,
    (i.quantity - i.reserved_quantity) as available,
    p.name_uz, p.name_ru, pv.size, pv.color
  from inventory i
  join product_variants pv on pv.id = i.variant_id
  join products p on p.id = pv.product_id;

create table stock_movements (
  id             uuid primary key default gen_random_uuid(),
  variant_id     uuid not null references product_variants(id),
  warehouse_id   uuid not null references warehouses(id),
  type           text not null check (type in (
                   'in','out','transfer','adjustment','sale','return','reserved','unreserved'
                 )),
  quantity       int not null,   -- musbat yoki manfiy
  reference_type text,           -- 'order', 'purchase_order', 'manual', ...
  reference_id   uuid,
  note           text,
  created_by     uuid references auth.users(id),
  created_at     timestamptz not null default now()
);
create index on stock_movements(variant_id);
create index on stock_movements(warehouse_id);
create index on stock_movements(type);
create index on stock_movements(created_at);


-- ============================================================
-- TA'MINOT
-- ============================================================

create table suppliers (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  phone     text,
  location  text,
  notes     text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table purchase_orders (
  id              uuid primary key default gen_random_uuid(),
  supplier_id     uuid not null references suppliers(id),
  warehouse_id    uuid not null references warehouses(id),
  status          text not null default 'draft' check (
                    status in ('draft','ordered','partial','received','cancelled')
                  ),
  total_amount    bigint not null default 0,
  expected_date   date,
  received_at     timestamptz,
  notes           text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger purchase_orders_updated_at before update on purchase_orders
  for each row execute function set_updated_at();

create table purchase_order_items (
  id          uuid primary key default gen_random_uuid(),
  po_id       uuid not null references purchase_orders(id) on delete cascade,
  variant_id  uuid not null references product_variants(id),
  quantity    int not null check (quantity > 0),
  received_qty int not null default 0,
  unit_cost   bigint not null
);
create index on purchase_order_items(po_id);


-- ============================================================
-- MIJOZLAR
-- ============================================================

create table customers (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  full_name    text,
  phone        text not null unique,
  email        text,
  birthday     date,
  total_orders int not null default 0,
  total_spent  bigint not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger customers_updated_at before update on customers
  for each row execute function set_updated_at();
create index on customers(phone);
create index on customers(auth_user_id);

create table addresses (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references customers(id) on delete cascade,
  region       text not null default 'Toshkent',
  district     text,
  address_line text not null,
  landmark     text,
  latitude     numeric(10,7),
  longitude    numeric(10,7),
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index on addresses(customer_id);


-- ============================================================
-- BUYURTMALAR / SOTUV
-- ============================================================

create sequence order_number_seq start 10001;

create table orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text not null unique default ('KU-' || nextval('order_number_seq')::text),
  customer_id         uuid references customers(id) on delete set null,
  channel             text not null default 'online' check (
                        channel in ('online','offline','pos','instagram','telegram')
                      ),
  status              text not null default 'new' check (
                        status in ('new','confirmed','packed','shipped',
                                   'delivered','cancelled','returned','refunded')
                      ),
  subtotal            bigint not null,
  discount_total      bigint not null default 0,
  delivery_fee        bigint not null default 0,
  total               bigint not null,
  payment_status      text not null default 'pending' check (
                        payment_status in ('pending','paid','partial','refunded','failed')
                      ),
  payment_method      text check (
                        payment_method in ('payme','click','uzum','cash','transfer')
                      ),
  delivery_method     text not null default 'delivery' check (
                        delivery_method in ('delivery','pickup')
                      ),
  delivery_address_id uuid references addresses(id) on delete set null,
  promo_code_id       uuid,   -- references promo_codes added later
  note                text,
  created_by          uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();
create index on orders(customer_id);
create index on orders(status);
create index on orders(created_at);
create index on orders(channel);

create table order_items (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references orders(id) on delete cascade,
  variant_id            uuid references product_variants(id) on delete set null,
  product_name_snapshot text not null,
  size                  text,
  color                 text,
  sku_snapshot          text,
  quantity              int not null check (quantity > 0),
  unit_price            bigint not null,
  total                 bigint not null
);
create index on order_items(order_id);

create table order_status_history (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  status      text not null,
  note        text,
  changed_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);
create index on order_status_history(order_id);

create table payments (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders(id),
  provider        text not null check (
                    provider in ('payme','click','uzum','cash','transfer')
                  ),
  amount          bigint not null,
  status          text not null default 'pending' check (
                    status in ('pending','completed','failed','refunded')
                  ),
  transaction_id  text,
  raw_payload     jsonb,
  created_at      timestamptz not null default now()
);
create index on payments(order_id);
create index on payments(transaction_id);

create table shipments (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references orders(id),
  provider         text,    -- 'own', 'bts', 'yandex'
  tracking_number  text,
  status           text not null default 'preparing' check (
                     status in ('preparing','in_transit','delivered','returned','failed')
                   ),
  cost             bigint,
  shipped_at       timestamptz,
  delivered_at     timestamptz,
  created_at       timestamptz not null default now()
);
create index on shipments(order_id);


-- ============================================================
-- MARKETING
-- ============================================================

create table promo_codes (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  type         text not null check (type in ('percent','fixed')),
  value        bigint not null,       -- % yoki UZS
  min_order    bigint not null default 0,
  usage_limit  int,                   -- null = cheksiz
  used_count   int not null default 0,
  starts_at    timestamptz,
  ends_at      timestamptz,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);
create index on promo_codes(code);
create index on promo_codes(is_active);

-- promo_code_id foreign key orders jadvaliga qo'shamiz
alter table orders
  add constraint fk_orders_promo
  foreign key (promo_code_id) references promo_codes(id) on delete set null;

create table banners (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  link        text,
  title_uz    text,
  title_ru    text,
  position    text not null default 'hero' check (
                position in ('hero','category','popup','notification_bar')
              ),
  sort_order  int not null default 0,
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table wishlists (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (customer_id, product_id)
);
create index on wishlists(customer_id);


-- ============================================================
-- MOLIYA
-- ============================================================

create table expenses (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,   -- 'ijara', 'maosh', 'yetkazish', 'reklama', ...
  amount      bigint not null,
  description text,
  date        date not null default current_date,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);
create index on expenses(date);
create index on expenses(category);

-- Daromad / sof foyda VIEW
create view finance_summary as
  with daily_expenses as (
    select date_trunc('day', created_at) as day, sum(amount) as total
    from expenses
    group by date_trunc('day', created_at)
  )
  select
    date_trunc('day', o.created_at)    as day,
    count(distinct o.id)               as orders_count,
    sum(o.total)                       as revenue,
    sum(o.discount_total)              as discounts,
    sum(o.delivery_fee)                as delivery_income,
    coalesce(de.total, 0)              as expenses,
    sum(o.total) - coalesce(de.total, 0) as profit
  from orders o
  left join daily_expenses de on date_trunc('day', o.created_at) = de.day
  where o.status not in ('cancelled','returned','refunded')
    and o.payment_status = 'paid'
  group by date_trunc('day', o.created_at), de.total;


-- ============================================================
-- ADMIN / XAVFSIZLIK
-- ============================================================

create table profiles (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  full_name    text not null,
  phone        text,
  role         text not null default 'seller' check (
                 role in ('owner','admin','manager','seller','storekeeper')
               ),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

create table audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor       uuid references auth.users(id),
  action      text not null,
  entity      text not null,
  entity_id   text,
  before_data jsonb,
  after_data  jsonb,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index on audit_log(actor);
create index on audit_log(entity, entity_id);
create index on audit_log(created_at);

create table store_settings (
  key         text primary key,
  value       text not null,
  description text,
  updated_at  timestamptz not null default now()
);
create trigger store_settings_updated_at before update on store_settings
  for each row execute function set_updated_at();


-- ============================================================
-- REALTIME — buyurtmalar va inventar jonli yangilanishi
-- ============================================================
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table inventory;
alter publication supabase_realtime add table order_status_history;


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Helper funksiya: joriy foydalanuvchi rolini qaytaradi
create or replace function get_my_role()
returns text language sql security definer stable as $$
  select role from profiles where auth_user_id = auth.uid()
$$;

-- Helper: admin yoki undan yuqori
create or replace function is_admin_or_above()
returns boolean language sql security definer stable as $$
  select get_my_role() in ('owner','admin','manager')
$$;

-- Helper: xodim (barcha admin rollari)
create or replace function is_staff()
returns boolean language sql security definer stable as $$
  select get_my_role() in ('owner','admin','manager','seller','storekeeper')
$$;

-- ─── categories ──────────────────────────────────────────────
alter table categories enable row level security;
create policy "Hamma ko'rishi mumkin" on categories for select using (true);
create policy "Staff o'zgartira oladi" on categories for all
  using (is_staff()) with check (is_staff());

-- ─── products ────────────────────────────────────────────────
alter table products enable row level security;
create policy "Hamma aktiv mahsulotlarni ko'radi" on products
  for select using (is_active = true or is_staff());
create policy "Staff mahsulot boshqaradi" on products for all
  using (is_staff()) with check (is_staff());

-- ─── product_variants ────────────────────────────────────────
alter table product_variants enable row level security;
create policy "Hamma variantlarni ko'radi" on product_variants for select using (true);
create policy "Staff variant boshqaradi" on product_variants for all
  using (is_staff()) with check (is_staff());

-- ─── product_images ──────────────────────────────────────────
alter table product_images enable row level security;
create policy "Hamma rasmlarni ko'radi" on product_images for select using (true);
create policy "Staff rasm boshqaradi" on product_images for all
  using (is_staff()) with check (is_staff());

-- ─── warehouses ──────────────────────────────────────────────
alter table warehouses enable row level security;
create policy "Staff omborni ko'radi" on warehouses for select using (is_staff());
create policy "Admin ombor boshqaradi" on warehouses for all
  using (is_admin_or_above()) with check (is_admin_or_above());

-- ─── inventory ───────────────────────────────────────────────
alter table inventory enable row level security;
create policy "Staff inventarni ko'radi" on inventory for select using (is_staff());
create policy "Storekeeper inventar yangilaydi" on inventory for update
  using (is_staff()) with check (is_staff());
create policy "Admin inventar boshqaradi" on inventory for all
  using (is_staff()) with check (is_staff());

-- ─── stock_movements ─────────────────────────────────────────
alter table stock_movements enable row level security;
create policy "Staff harakatlarni ko'radi" on stock_movements for select using (is_staff());
create policy "Staff harakat qo'shadi" on stock_movements for insert
  with check (is_staff());

-- ─── suppliers ───────────────────────────────────────────────
alter table suppliers enable row level security;
create policy "Staff ta'minotchini ko'radi" on suppliers for select using (is_staff());
create policy "Manager ta'minotchi boshqaradi" on suppliers for all
  using (is_admin_or_above()) with check (is_admin_or_above());

-- ─── purchase_orders ─────────────────────────────────────────
alter table purchase_orders enable row level security;
create policy "Staff kirimni ko'radi" on purchase_orders for select using (is_staff());
create policy "Staff kirim qo'shadi" on purchase_orders for all
  using (is_staff()) with check (is_staff());

-- ─── purchase_order_items ────────────────────────────────────
alter table purchase_order_items enable row level security;
create policy "Staff kirim elementlarini ko'radi" on purchase_order_items for select using (is_staff());
create policy "Staff kirim element qo'shadi" on purchase_order_items for all
  using (is_staff()) with check (is_staff());

-- ─── customers ───────────────────────────────────────────────
alter table customers enable row level security;
create policy "Mijoz o'z ma'lumotini ko'radi" on customers
  for select using (auth_user_id = auth.uid() or is_staff());
create policy "Mijoz o'z ma'lumotini yangilaydi" on customers
  for update using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
create policy "Staff mijozni boshqaradi" on customers for all
  using (is_staff()) with check (is_staff());
create policy "Yangi mijoz yaratish" on customers for insert
  with check (auth_user_id = auth.uid() or is_staff());

-- ─── addresses ───────────────────────────────────────────────
alter table addresses enable row level security;
create policy "Mijoz o'z manzilini ko'radi" on addresses
  for select using (
    customer_id in (select id from customers where auth_user_id = auth.uid())
    or is_staff()
  );
create policy "Mijoz o'z manzilini boshqaradi" on addresses for all
  using (
    customer_id in (select id from customers where auth_user_id = auth.uid())
    or is_staff()
  )
  with check (
    customer_id in (select id from customers where auth_user_id = auth.uid())
    or is_staff()
  );

-- ─── orders ──────────────────────────────────────────────────
alter table orders enable row level security;
create policy "Mijoz o'z buyurtmasini ko'radi" on orders
  for select using (
    customer_id in (select id from customers where auth_user_id = auth.uid())
    or is_staff()
  );
create policy "Mijoz buyurtma beradi" on orders for insert
  with check (
    customer_id in (select id from customers where auth_user_id = auth.uid())
    or is_staff()
  );
create policy "Staff buyurtmani yangilaydi" on orders for update
  using (is_staff()) with check (is_staff());

-- ─── order_items ─────────────────────────────────────────────
alter table order_items enable row level security;
create policy "Buyurtma elementi ko'rinadi" on order_items
  for select using (
    order_id in (
      select o.id from orders o
      join customers c on c.id = o.customer_id
      where c.auth_user_id = auth.uid()
    )
    or is_staff()
  );
create policy "Order item qo'shish" on order_items for insert
  with check (is_staff() or
    order_id in (
      select o.id from orders o
      join customers c on c.id = o.customer_id
      where c.auth_user_id = auth.uid()
    )
  );

-- ─── order_status_history ────────────────────────────────────
alter table order_status_history enable row level security;
create policy "Buyurtma tarixi ko'rinadi" on order_status_history
  for select using (
    order_id in (
      select o.id from orders o
      join customers c on c.id = o.customer_id
      where c.auth_user_id = auth.uid()
    )
    or is_staff()
  );
create policy "Staff holat qo'shadi" on order_status_history for insert
  with check (is_staff());

-- ─── payments ────────────────────────────────────────────────
alter table payments enable row level security;
create policy "Mijoz o'z to'lovini ko'radi" on payments
  for select using (
    order_id in (
      select o.id from orders o
      join customers c on c.id = o.customer_id
      where c.auth_user_id = auth.uid()
    )
    or is_staff()
  );
create policy "To'lov qo'shish" on payments for insert
  with check (is_staff());

-- ─── shipments ───────────────────────────────────────────────
alter table shipments enable row level security;
create policy "Yetkazish ko'rinadi" on shipments
  for select using (
    order_id in (
      select o.id from orders o
      join customers c on c.id = o.customer_id
      where c.auth_user_id = auth.uid()
    )
    or is_staff()
  );
create policy "Staff yetkazish boshqaradi" on shipments for all
  using (is_staff()) with check (is_staff());

-- ─── promo_codes ─────────────────────────────────────────────
alter table promo_codes enable row level security;
create policy "Aktiv promo-kodlar ko'rinadi" on promo_codes
  for select using (is_active = true or is_staff());
create policy "Admin promo boshqaradi" on promo_codes for all
  using (is_admin_or_above()) with check (is_admin_or_above());

-- ─── banners ─────────────────────────────────────────────────
alter table banners enable row level security;
create policy "Aktiv bannerlar ko'rinadi" on banners
  for select using (is_active = true or is_staff());
create policy "Admin banner boshqaradi" on banners for all
  using (is_admin_or_above()) with check (is_admin_or_above());

-- ─── wishlists ───────────────────────────────────────────────
alter table wishlists enable row level security;
create policy "Mijoz o'z wishlistini ko'radi" on wishlists
  for select using (
    customer_id in (select id from customers where auth_user_id = auth.uid())
  );
create policy "Mijoz wishlist boshqaradi" on wishlists for all
  using (
    customer_id in (select id from customers where auth_user_id = auth.uid())
  )
  with check (
    customer_id in (select id from customers where auth_user_id = auth.uid())
  );

-- ─── expenses ────────────────────────────────────────────────
alter table expenses enable row level security;
create policy "Manager xarajat ko'radi" on expenses for select using (is_admin_or_above());
create policy "Manager xarajat qo'shadi" on expenses for all
  using (is_admin_or_above()) with check (is_admin_or_above());

-- ─── profiles ────────────────────────────────────────────────
alter table profiles enable row level security;
create policy "O'z profilini ko'radi" on profiles
  for select using (auth_user_id = auth.uid() or is_admin_or_above());
create policy "Admin profil boshqaradi" on profiles for all
  using (is_admin_or_above()) with check (is_admin_or_above());
create policy "Profil yaratish" on profiles for insert
  with check (auth_user_id = auth.uid());

-- ─── audit_log ───────────────────────────────────────────────
alter table audit_log enable row level security;
create policy "Admin audit ko'radi" on audit_log for select using (is_admin_or_above());
create policy "Tizim audit yozadi" on audit_log for insert with check (true);

-- ─── store_settings ──────────────────────────────────────────
alter table store_settings enable row level security;
create policy "Hamma sozlamalarni o'qiydi" on store_settings for select using (true);
create policy "Admin sozlamalarni o'zgartiradi" on store_settings for all
  using (is_admin_or_above()) with check (is_admin_or_above());
