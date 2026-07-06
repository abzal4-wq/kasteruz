// Supabase jadvallar uchun TypeScript turlari

export type Role = "owner" | "admin" | "manager" | "seller" | "storekeeper";
export type Channel = "online" | "offline" | "pos" | "instagram" | "telegram";
export type OrderStatus =
  | "new" | "confirmed" | "packed" | "shipped"
  | "delivered" | "cancelled" | "returned" | "refunded";
export type PaymentStatus = "pending" | "paid" | "partial" | "refunded" | "failed";
export type PaymentMethod = "payme" | "click" | "uzum" | "cash" | "transfer";
export type DeliveryMethod = "delivery" | "pickup";
export type FitType = "slim" | "regular" | "comfort";
export type WarehouseType = "store" | "warehouse";
export type StockMovementType =
  | "in" | "out" | "transfer" | "adjustment"
  | "sale" | "return" | "reserved" | "unreserved";

export interface Category {
  id: string;
  name_uz: string;
  name_ru: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name_uz: string;
  name_ru: string;
  description_uz: string | null;
  description_ru: string | null;
  category_id: string;
  brand: string | null;
  fabric: string | null;
  season: string | null;
  fit_type: FitType | null;
  base_price: number;
  sale_price: number | null;
  cost_price: number | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // Relations (join qilinganda)
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  color_hex: string | null;
  barcode: string | null;
  sku: string;
  price_override: number | null;
  created_at: string;
  // Relations
  product?: Product;
  inventory?: Inventory[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  alt: string | null;
  color: string | null; // qaysi rang variantiga tegishli (null = umumiy)
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  type: WarehouseType;
  address: string | null;
  is_active: boolean;
}

export interface Inventory {
  id: string;
  variant_id: string;
  warehouse_id: string;
  quantity: number;
  reserved_quantity: number;
  reorder_level: number;
  updated_at: string;
  // Virtual
  available?: number;
}

export interface StockMovement {
  id: string;
  variant_id: string;
  warehouse_id: string;
  type: StockMovementType;
  quantity: number;
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  auth_user_id: string | null;
  full_name: string | null;
  phone: string;
  email: string | null;
  birthday: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  customer_id: string;
  region: string;
  district: string | null;
  address_line: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  channel: Channel;
  status: OrderStatus;
  subtotal: number;
  discount_total: number;
  delivery_fee: number;
  total: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  delivery_method: DeliveryMethod;
  delivery_address_id: string | null;
  promo_code_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  customer?: Customer;
  items?: OrderItem[];
  payments?: Payment[];
  shipments?: Shipment[];
  delivery_address?: Address;
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string | null;
  product_name_snapshot: string;
  size: string | null;
  color: string | null;
  sku_snapshot: string | null;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: PaymentMethod;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  transaction_id: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  provider: string | null;
  tracking_number: string | null;
  status: "preparing" | "in_transit" | "delivered" | "returned" | "failed";
  cost: number | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order: number;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  image_url: string;
  link: string | null;
  title_uz: string | null;
  title_ru: string | null;
  position: "hero" | "category" | "popup" | "notification_bar";
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  warehouse_id: string;
  status: "draft" | "ordered" | "partial" | "received" | "cancelled";
  total_amount: number;
  expected_date: string | null;
  received_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  variant_id: string;
  quantity: number;
  received_qty: number;
  unit_cost: number;
  variant?: ProductVariant;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
  created_by: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreSetting {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

// ─── Savatcha (client-side) ──────────────────────────────────
export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  size: string;
  color: string;
  colorHex: string | null;
  imageUrl: string | null;
  price: number;
  quantity: number;
}

// ─── Mahsulot sharhi ─────────────────────────────────────────
export interface ProductReview {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  author_name: string | null;
  created_at: string;
}
