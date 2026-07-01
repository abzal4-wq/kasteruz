-- ============================================================
-- Kaster.uz — Database funksiyalari
-- ============================================================

-- ─── Inventar upsert ─────────────────────────────────────────
-- Inventar qatorini yaratish yoki mavjudini yangilash
create or replace function upsert_inventory(
  p_variant_id   uuid,
  p_warehouse_id uuid,
  p_delta        int
) returns void language plpgsql security definer as $$
begin
  insert into inventory (variant_id, warehouse_id, quantity)
  values (p_variant_id, p_warehouse_id, greatest(0, p_delta))
  on conflict (variant_id, warehouse_id)
  do update set
    quantity = greatest(0, inventory.quantity + p_delta),
    updated_at = now();
end;
$$;

-- ─── Stokni rezerv qilish ─────────────────────────────────────
create or replace function reserve_stock(
  p_variant_id   uuid,
  p_warehouse_id uuid,
  p_quantity     int,
  p_order_id     uuid
) returns boolean language plpgsql security definer as $$
declare
  v_available int;
begin
  select (quantity - reserved_quantity) into v_available
  from inventory
  where variant_id = p_variant_id
    and warehouse_id = p_warehouse_id;

  if v_available is null or v_available < p_quantity then
    return false;
  end if;

  update inventory
  set reserved_quantity = reserved_quantity + p_quantity,
      updated_at = now()
  where variant_id = p_variant_id
    and warehouse_id = p_warehouse_id;

  insert into stock_movements
    (variant_id, warehouse_id, type, quantity, reference_type, reference_id)
  values
    (p_variant_id, p_warehouse_id, 'reserved', -p_quantity, 'order', p_order_id);

  return true;
end;
$$;

-- ─── Rezervni bo'shatish ──────────────────────────────────────
create or replace function release_reserve(
  p_variant_id   uuid,
  p_warehouse_id uuid,
  p_quantity     int,
  p_order_id     uuid
) returns void language plpgsql security definer as $$
begin
  update inventory
  set reserved_quantity = greatest(0, reserved_quantity - p_quantity),
      updated_at = now()
  where variant_id = p_variant_id
    and warehouse_id = p_warehouse_id;

  insert into stock_movements
    (variant_id, warehouse_id, type, quantity, reference_type, reference_id)
  values
    (p_variant_id, p_warehouse_id, 'unreserved', p_quantity, 'order', p_order_id);
end;
$$;

-- ─── Sotish: rezervdan chiqarish + actualdan ayirish ─────────
create or replace function confirm_sale(
  p_variant_id   uuid,
  p_warehouse_id uuid,
  p_quantity     int,
  p_order_id     uuid
) returns boolean language plpgsql security definer as $$
declare
  v_inv inventory;
begin
  select * into v_inv
  from inventory
  where variant_id = p_variant_id
    and warehouse_id = p_warehouse_id
  for update;

  if not found then return false; end if;

  update inventory
  set quantity = greatest(0, quantity - p_quantity),
      reserved_quantity = greatest(0, reserved_quantity - p_quantity),
      updated_at = now()
  where variant_id = p_variant_id
    and warehouse_id = p_warehouse_id;

  insert into stock_movements
    (variant_id, warehouse_id, type, quantity, reference_type, reference_id)
  values
    (p_variant_id, p_warehouse_id, 'sale', -p_quantity, 'order', p_order_id);

  return true;
end;
$$;

-- ─── Promo-kodni tekshirish va qo'llash ──────────────────────
create or replace function apply_promo_code(
  p_code      text,
  p_subtotal  bigint
) returns jsonb language plpgsql security definer as $$
declare
  v_promo promo_codes;
  v_discount bigint;
begin
  select * into v_promo
  from promo_codes
  where code = upper(p_code)
    and is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at   is null or ends_at   >= now())
    and (usage_limit is null or used_count < usage_limit);

  if not found then
    return jsonb_build_object('valid', false, 'error', 'promo_not_found');
  end if;

  if p_subtotal < v_promo.min_order then
    return jsonb_build_object(
      'valid', false,
      'error', 'min_order_not_met',
      'min_order', v_promo.min_order
    );
  end if;

  v_discount := case v_promo.type
    when 'percent' then (p_subtotal * v_promo.value / 100)
    when 'fixed'   then least(v_promo.value, p_subtotal)
  end;

  return jsonb_build_object(
    'valid',    true,
    'promo_id', v_promo.id,
    'code',     v_promo.code,
    'type',     v_promo.type,
    'value',    v_promo.value,
    'discount', v_discount
  );
end;
$$;

-- ─── Mijozlar statistikasini yangilash (trigger) ─────────────
create or replace function update_customer_stats()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'delivered' and new.payment_status = 'paid' then
    update customers
    set total_orders = total_orders + 1,
        total_spent  = total_spent + new.total,
        updated_at   = now()
    where id = new.customer_id;
  end if;
  return new;
end;
$$;

create trigger orders_update_customer_stats
  after update on orders
  for each row
  when (old.status is distinct from new.status)
  execute function update_customer_stats();

-- ─── Kam qolgan tovarlar VIEW ─────────────────────────────────
create view low_stock_alert as
  select
    i.variant_id,
    i.warehouse_id,
    i.quantity,
    i.reserved_quantity,
    (i.quantity - i.reserved_quantity) as available,
    i.reorder_level,
    p.name_uz,
    p.name_ru,
    pv.size,
    pv.color,
    pv.sku,
    w.name as warehouse_name
  from inventory i
  join product_variants pv on pv.id = i.variant_id
  join products p on p.id = pv.product_id
  join warehouses w on w.id = i.warehouse_id
  where (i.quantity - i.reserved_quantity) <= i.reorder_level
    and p.is_active = true;

-- ─── Sotuv hisoboti VIEW ─────────────────────────────────────
create view sales_report as
  select
    date_trunc('day', o.created_at)::date as date,
    o.channel,
    count(distinct o.id)                   as orders_count,
    sum(oi.quantity)                        as items_sold,
    sum(o.subtotal)                         as subtotal,
    sum(o.discount_total)                   as discounts,
    sum(o.delivery_fee)                     as delivery_income,
    sum(o.total)                            as revenue
  from orders o
  join order_items oi on oi.order_id = o.id
  where o.status not in ('cancelled', 'returned', 'refunded')
  group by date_trunc('day', o.created_at)::date, o.channel;

-- ─── Top mahsulotlar VIEW ────────────────────────────────────
create view top_products as
  select
    p.id,
    p.name_uz,
    p.name_ru,
    p.sku,
    sum(oi.quantity)          as total_sold,
    sum(oi.total)             as total_revenue,
    count(distinct oi.order_id) as orders_count
  from order_items oi
  join orders o on o.id = oi.order_id
  join product_variants pv on pv.id = oi.variant_id
  join products p on p.id = pv.product_id
  where o.status not in ('cancelled', 'returned', 'refunded')
  group by p.id, p.name_uz, p.name_ru, p.sku
  order by total_sold desc;
