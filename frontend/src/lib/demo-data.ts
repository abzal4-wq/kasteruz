// ============================================================
// Demo ma'lumotlar — Supabase ulanmaganda ishlatiladi
// Brauzerda darhol ko'rish uchun (seed.sql asosida)
// ============================================================

// Supabase sozlanmaganmi? (placeholder qiymatlar yoki bo'sh)
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const IS_DEMO =
  !url || url.includes("your-project") || url.trim() === "";

const now = new Date().toISOString();

// ─── Kategoriyalar ───────────────────────────────────────────
export const demoCategories = [
  { id: "cat-1", name_uz: "Kostyumlar", name_ru: "Костюмы", slug: "kostyumlar", parent_id: null, image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80&auto=format&fit=crop", sort_order: 1, is_active: true, created_at: now, updated_at: now },
  { id: "cat-2", name_uz: "Shimlar", name_ru: "Брюки", slug: "shimlar", parent_id: null, image_url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80&auto=format&fit=crop", sort_order: 2, is_active: true, created_at: now, updated_at: now },
  { id: "cat-3", name_uz: "Ko'ylaklar", name_ru: "Рубашки", slug: "koylaklar", parent_id: null, image_url: "https://images.unsplash.com/photo-1602810316693-3667c854239a?w=600&q=80&auto=format&fit=crop", sort_order: 3, is_active: true, created_at: now, updated_at: now },
  { id: "cat-4", name_uz: "Aksessuarlar", name_ru: "Аксессуары", slug: "aksessuarlar", parent_id: null, image_url: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=80&auto=format&fit=crop", sort_order: 4, is_active: true, created_at: now, updated_at: now },
];

// ─── Mahsulot ta'riflari (variant/rasm avtomatik quriladi) ──
interface DemoProductDef {
  id: string;
  sku: string;
  name_uz: string;
  name_ru: string;
  description_uz: string;
  description_ru: string;
  category_id: string;
  fabric: string;
  season: string;
  fit_type: "slim" | "regular" | "comfort";
  base_price: number;
  sale_price: number | null;
  cost_price: number;
  is_featured: boolean;
  colors: { color: string; color_hex: string; images: string[] }[];
  sizes: string[];
  brand?: string;
}

const productDefs: DemoProductDef[] = [
  // ─── Bugaso brendiga tegishli mahsulotlar ───────────────────
  {
    id: "prod-7",
    sku: "BG-SUIT-001",
    name_uz: "Bugaso Navy Premium Kostyum",
    name_ru: "Bugaso Premium Костюм Navy",
    description_uz: "Italiya usulida tikilgan, premium jun mato. Bugaso brendining flagman modeli — to'y va rasmiy tadbirlar uchun ideal.",
    description_ru: "Сшит в итальянском стиле, премиальная шерстяная ткань. Флагманская модель бренда Bugaso.",
    category_id: "cat-1",
    fabric: "Jun 90%, Poliyester 10%",
    season: "Barcha fasl",
    fit_type: "slim",
    base_price: 2490000,
    sale_price: 2190000,
    cost_price: 1200000,
    is_featured: true,
    colors: [
      { color: "To'q ko'k", color_hex: "#1E3A5F", images: ["https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&auto=format&fit=crop", "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&auto=format&fit=crop"] },
      { color: "Qora", color_hex: "#1A1A1A", images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80&auto=format&fit=crop"] },
    ],
    sizes: ["48", "50", "52", "54"],
    brand: "bugaso",
  },
  {
    id: "prod-8",
    sku: "BG-PANT-001",
    name_uz: "Bugaso Slim Shim",
    name_ru: "Bugaso Slim Брюки",
    description_uz: "Bugaso brendi premium shimi. Italiya kroi, yumshoq mato, slim fit. Har qanday pidjak bilan mos keladi.",
    description_ru: "Премиальные брюки от Bugaso. Итальянский крой, мягкая ткань.",
    category_id: "cat-2",
    fabric: "Jun 75%, Poliyester 25%",
    season: "Barcha fasl",
    fit_type: "slim",
    base_price: 690000,
    sale_price: null,
    cost_price: 320000,
    is_featured: false,
    colors: [
      { color: "To'q ko'k", color_hex: "#1E3A5F", images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80&auto=format&fit=crop"] },
      { color: "Kul rang", color_hex: "#6B7280", images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80&auto=format&fit=crop"] },
    ],
    sizes: ["46", "48", "50", "52", "54", "56"],
    brand: "bugaso",
  },
  // ─── Salvari brendiga tegishli mahsulotlar ──────────────────
  {
    id: "prod-9",
    sku: "SL-SUIT-001",
    name_uz: "Salvarini Klassik Kostyum",
    name_ru: "Salvari Классический Костюм",
    description_uz: "Salvari brendining eng mashhur modeli. Yuqori sifatli viskoza aralashmasi, regular fit. Ofis va maxsus tadbirlar uchun mukammal.",
    description_ru: "Самая популярная модель Salvari. Высококачественная вискозная смесь, regular fit.",
    category_id: "cat-1",
    fabric: "Poliyester 55%, Viskoza 45%",
    season: "Barcha fasl",
    fit_type: "regular",
    base_price: 1790000,
    sale_price: 1590000,
    cost_price: 880000,
    is_featured: true,
    colors: [
      { color: "Qora", color_hex: "#1A1A1A", images: ["https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=800&q=80&auto=format&fit=crop", "https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=800&q=80&auto=format&fit=crop"] },
      { color: "Jigarrang", color_hex: "#6B4226", images: ["https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&auto=format&fit=crop"] },
    ],
    sizes: ["46", "48", "50", "52", "54"],
    brand: "salvarini",
  },
  {
    id: "prod-10",
    sku: "SL-SHIRT-001",
    name_uz: "Salvarini Premium Ko'ylak",
    name_ru: "Salvari Premium Рубашка",
    description_uz: "Slim fit premium ko'ylak, Salvari brendidan. Yumshoq paxta, nozik to'qima. Har qanday kostyum ostiga mos.",
    description_ru: "Премиальная рубашка slim fit от Salvari. Мягкий хлопок, тонкое плетение.",
    category_id: "cat-3",
    fabric: "100% Paxta (premium)",
    season: "Barcha fasl",
    fit_type: "slim",
    base_price: 390000,
    sale_price: null,
    cost_price: 170000,
    is_featured: false,
    colors: [
      { color: "Oq", color_hex: "#FFFFFF", images: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80&auto=format&fit=crop"] },
      { color: "Moviy", color_hex: "#A7C7E7", images: ["https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=80&auto=format&fit=crop"] },
    ],
    sizes: ["46", "48", "50", "52"],
    brand: "salvarini",
  },
  // ─── Saco brendiga tegishli mahsulotlar ─────────────────────
  {
    id: "prod-11",
    sku: "SC-SUIT-001",
    name_uz: "Saco Zamonaviy Kostyum",
    name_ru: "Saco Современный Костюм",
    description_uz: "Saco brendining zamonaviy modeli. Casual-chic uslub, comfort fit. Har kunlik va yarim rasmiy tadbirlar uchun.",
    description_ru: "Современная модель Saco. Casual-chic стиль, comfort fit.",
    category_id: "cat-1",
    fabric: "Poliyester 60%, Paxta 40%",
    season: "Yoz-Bahor",
    fit_type: "comfort",
    base_price: 1390000,
    sale_price: 1190000,
    cost_price: 680000,
    is_featured: true,
    colors: [
      { color: "Kul rang", color_hex: "#6B7280", images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&auto=format&fit=crop", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80&auto=format&fit=crop"] },
    ],
    sizes: ["46", "48", "50", "52", "54", "56"],
    brand: "saco",
  },
  {
    id: "prod-12",
    sku: "SC-PANT-001",
    name_uz: "Saco Comfort Shim",
    name_ru: "Saco Comfort Брюки",
    description_uz: "Saco comfort shimi. Yumshoq mato, keng kesim, kundalik kiyim uchun qulay. Chino uslub.",
    description_ru: "Брюки comfort от Saco. Мягкая ткань, широкий крой.",
    category_id: "cat-2",
    fabric: "100% Paxta, 2% Elastan",
    season: "Barcha fasl",
    fit_type: "comfort",
    base_price: 490000,
    sale_price: null,
    cost_price: 220000,
    is_featured: false,
    colors: [
      { color: "Bej", color_hex: "#D2B48C", images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80&auto=format&fit=crop"] },
      { color: "Zaytun", color_hex: "#6B7C4A", images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80&auto=format&fit=crop"] },
    ],
    sizes: ["46", "48", "50", "52", "54"],
    brand: "saco",
  },
  // ─── Kaster o'z mahsulotlari ─────────────────────────────────
  {
    id: "prod-1",
    sku: "KU-SUIT-001",
    name_uz: "Klassik qora kostyum",
    name_ru: "Классический чёрный костюм",
    description_uz: "Yuqori sifatli jun-poliyester aralashmasidan tikilgan, slim fit. Ish uchun va maxsus tadbirlar uchun ideal. Nafis kesim, qulay va zamonaviy ko'rinish.",
    description_ru: "Пошит из высококачественной шерстяно-полиэстерной смеси, slim fit. Идеален для работы и особых мероприятий.",
    category_id: "cat-1",
    fabric: "Jun 70%, Poliyester 30%",
    season: "Barcha fasl",
    fit_type: "slim",
    base_price: 1290000,
    sale_price: 1090000,
    cost_price: 650000,
    is_featured: true,
    colors: [
      { color: "Qora", color_hex: "#1A1A1A", images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80&auto=format&fit=crop", "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=800&q=80&auto=format&fit=crop"] },
    ],
    sizes: ["46", "48", "50", "52", "54", "56"],
  },
  {
    id: "prod-2",
    sku: "KU-SUIT-002",
    name_uz: "Kul rang biznes kostyum",
    name_ru: "Серый деловой костюм",
    description_uz: "Regular fit, klassik biznes uslub. Yumshoq mato, qulay kesim. Kundalik ofis kiyimi uchun ajoyib tanlov.",
    description_ru: "Regular fit, классический деловой стиль. Мягкая ткань, удобный крой.",
    category_id: "cat-1",
    fabric: "Poliyester 60%, Viskoza 40%",
    season: "Barcha fasl",
    fit_type: "regular",
    base_price: 980000,
    sale_price: null,
    cost_price: 490000,
    is_featured: true,
    colors: [
      { color: "Kul rang", color_hex: "#6B7280", images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&auto=format&fit=crop", "https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=800&q=80&auto=format&fit=crop"] },
      { color: "To'q ko'k", color_hex: "#1E3A5F", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80&auto=format&fit=crop"] },
    ],
    sizes: ["46", "48", "50", "52"],
  },
  {
    id: "prod-3",
    sku: "KU-PANT-001",
    name_uz: "Klassik qora shim",
    name_ru: "Классические чёрные брюки",
    description_uz: "Klassik klassika, barcha pidjaklar bilan mos keladi. Bardoshli mato, aniq kesim.",
    description_ru: "Классика жанра, подходит ко всем пиджакам.",
    category_id: "cat-2",
    fabric: "Poliyester 65%, Viskoza 35%",
    season: "Barcha fasl",
    fit_type: "regular",
    base_price: 390000,
    sale_price: 320000,
    cost_price: 180000,
    is_featured: true,
    colors: [
      { color: "Qora", color_hex: "#1A1A1A", images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80&auto=format&fit=crop"] },
    ],
    sizes: ["46", "48", "50", "52", "54"],
  },
  {
    id: "prod-4",
    sku: "KU-SHIRT-001",
    name_uz: "Oq rasmiy ko'ylak",
    name_ru: "Белая классическая рубашка",
    description_uz: "Slim fit oq ko'ylak, nozik paxta mato. Har qanday kostyum ostiga mukammal mos keladi.",
    description_ru: "Белая рубашка slim fit, тонкий хлопок.",
    category_id: "cat-3",
    fabric: "100% Paxta",
    season: "Barcha fasl",
    fit_type: "slim",
    base_price: 280000,
    sale_price: null,
    cost_price: 120000,
    is_featured: true,
    colors: [
      { color: "Oq", color_hex: "#FFFFFF", images: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80&auto=format&fit=crop"] },
      { color: "Moviy", color_hex: "#A7C7E7", images: ["https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=80&auto=format&fit=crop"] },
    ],
    sizes: ["46", "48", "50", "52"],
  },
  {
    id: "prod-5",
    sku: "KU-SUIT-003",
    name_uz: "To'q ko'k uch qismli kostyum",
    name_ru: "Тёмно-синий костюм-тройка",
    description_uz: "Pidjak, jiletka va shim — uch qismli to'plam. To'y va tantanalar uchun nafis yechim.",
    description_ru: "Пиджак, жилет и брюки — комплект из трёх предметов.",
    category_id: "cat-1",
    fabric: "Jun 80%, Poliyester 20%",
    season: "Qish",
    fit_type: "slim",
    base_price: 1690000,
    sale_price: 1490000,
    cost_price: 820000,
    is_featured: false,
    colors: [
      { color: "To'q ko'k", color_hex: "#1E3A5F", images: ["https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&auto=format&fit=crop"] },
    ],
    sizes: ["48", "50", "52", "54"],
  },
  {
    id: "prod-6",
    sku: "KU-PANT-002",
    name_uz: "Bej chino shim",
    name_ru: "Бежевые чино",
    description_uz: "Comfort fit chino shim, kundalik kiyim uchun. Yumshoq paxta mato, erkin harakat.",
    description_ru: "Чино comfort fit, для повседневной носки.",
    category_id: "cat-2",
    fabric: "98% Paxta, 2% Elastan",
    season: "Yoz",
    fit_type: "comfort",
    base_price: 350000,
    sale_price: null,
    cost_price: 160000,
    is_featured: false,
    colors: [
      { color: "Bej", color_hex: "#D2B48C", images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80&auto=format&fit=crop"] },
    ],
    sizes: ["46", "48", "50", "52", "54"],
  },
];

// ─── Flat jadvallarni qurish ─────────────────────────────────
export const demoProducts: any[] = [];
export const demoVariants: any[] = [];
export const demoImages: any[] = [];
export const demoInventory: any[] = [];

const STORE_WAREHOUSE = "wh-1";
let variantCounter = 0;
let imageCounter = 0;

for (const def of productDefs) {
  demoProducts.push({
    id: def.id,
    sku: def.sku,
    name_uz: def.name_uz,
    name_ru: def.name_ru,
    description_uz: def.description_uz,
    description_ru: def.description_ru,
    category_id: def.category_id,
    brand: def.brand ?? "kaster",
    fabric: def.fabric,
    season: def.season,
    fit_type: def.fit_type,
    base_price: def.base_price,
    sale_price: def.sale_price,
    cost_price: def.cost_price,
    is_active: true,
    is_featured: def.is_featured,
    created_at: now,
    updated_at: now,
  });

  // Rasmlar (mahsulot darajasida)
  def.colors.forEach((c, ci) => {
    c.images.forEach((imgUrl, ii) => {
      demoImages.push({
        id: `img-${++imageCounter}`,
        product_id: def.id,
        variant_id: null,
        url: imgUrl,
        alt: def.name_uz,
        sort_order: ci * 10 + ii,
        is_primary: ci === 0 && ii === 0,
        created_at: now,
      });
    });
  });

  // Variantlar (rang × o'lcham) + inventar
  for (const c of def.colors) {
    for (const size of def.sizes) {
      const vid = `var-${++variantCounter}`;
      demoVariants.push({
        id: vid,
        product_id: def.id,
        size,
        color: c.color,
        color_hex: c.color_hex,
        barcode: null,
        sku: `${def.sku}-${size}-${c.color.slice(0, 3).toUpperCase()}`,
        price_override: null,
        created_at: now,
      });
      // Tasodifiy stok (3..25)
      const qty = 3 + Math.floor(Math.random() * 22);
      demoInventory.push({
        id: `inv-${variantCounter}`,
        variant_id: vid,
        warehouse_id: STORE_WAREHOUSE,
        quantity: qty,
        reserved_quantity: 0,
        reorder_level: 5,
        updated_at: now,
      });
    }
  }
}

// ─── Omborlar ────────────────────────────────────────────────
export const demoWarehouses = [
  { id: "wh-1", name: "Abu Sahiy do'kon", type: "store", address: "Toshkent, Abu Sahiy bozori", is_active: true },
  { id: "wh-2", name: "Asosiy ombor", type: "warehouse", address: "Toshkent, Yunusobod", is_active: true },
];

// ─── Brendlar (brand carousel) ───────────────────────────────
export const demoBrands: any[] = [
  { id: "brand-1", name: "SALVARINI", tagline: "Timeless Elegance", logo_url: null, logo_blend_mode: "normal", bg_color: "#E8F3F7", text_color: "#1A1A2E", accent_color: "#1A1A2E", is_active: true, sort_order: 1, created_at: now },
  { id: "brand-2", name: "SACO",      tagline: "suits you!",        logo_url: null, logo_blend_mode: "normal", bg_color: "#5A5A5A", text_color: "#FFFFFF", accent_color: "#D4A843", is_active: true, sort_order: 2, created_at: now },
  { id: "brand-3", name: "BUGASO",    tagline: "Premium Menswear",  logo_url: null, logo_blend_mode: "normal", bg_color: "#0A0805", text_color: "#D4A843", accent_color: "#D4A843", is_active: true, sort_order: 3, created_at: now },
];

// ─── Bannerlar ───────────────────────────────────────────────
export const demoBanners = [
  { id: "ban-1", image_url: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600&q=80&auto=format&fit=crop", link: "/catalog", title_uz: "Yangi kolleksiya", title_ru: "Новая коллекция", position: "hero", sort_order: 1, starts_at: null, ends_at: null, is_active: true, created_at: now },
];

// ─── Promo-kodlar ────────────────────────────────────────────
export const demoPromoCodes = [
  { id: "promo-1", code: "KASTER10", type: "percent", value: 10, min_order: 500000, usage_limit: 100, used_count: 0, starts_at: null, ends_at: null, is_active: true, created_at: now },
  { id: "promo-2", code: "YANGI50", type: "fixed", value: 50000, min_order: 0, usage_limit: 50, used_count: 0, starts_at: null, ends_at: null, is_active: true, created_at: now },
];

// ─── Ta'minotchilar ──────────────────────────────────────────
export const demoSuppliers = [
  { id: "sup-1", name: "Yaqin Tekstil", phone: "+998 90 111 22 33", location: "Toshkent, Chorsu", notes: "Kostyum matolari", is_active: true, created_at: now },
  { id: "sup-2", name: "Premium Fabrics", phone: "+998 91 222 33 44", location: "Toshkent, Sergeli", notes: "Import matolar", is_active: true, created_at: now },
];

// ─── Store settings ──────────────────────────────────────────
export const demoStoreSettings = [
  { key: "store_name", value: "Kaster.uz", description: null, updated_at: now },
  { key: "delivery_fee", value: "25000", description: null, updated_at: now },
  { key: "free_delivery_min", value: "500000", description: null, updated_at: now },
];

// ─── Namuna buyurtmalar (admin panel bo'sh ko'rinmasligi uchun) ─
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString();

export const demoOrders: any[] = [
  {
    id: "ord-1", order_number: "KU-10001", customer_id: "cust-demo-1", channel: "online",
    status: "delivered", subtotal: 1090000, discount_total: 0, delivery_fee: 0, total: 1090000,
    payment_status: "paid", payment_method: "cash", delivery_method: "delivery",
    delivery_address_id: null, promo_code_id: null, note: null, created_by: null,
    created_at: daysAgo(2), updated_at: daysAgo(2),
  },
  {
    id: "ord-2", order_number: "KU-10002", customer_id: "cust-demo-1", channel: "pos",
    status: "delivered", subtotal: 320000, discount_total: 0, delivery_fee: 0, total: 320000,
    payment_status: "paid", payment_method: "cash", delivery_method: "pickup",
    delivery_address_id: null, promo_code_id: null, note: null, created_by: null,
    created_at: daysAgo(1), updated_at: daysAgo(1),
  },
  {
    id: "ord-3", order_number: "KU-10003", customer_id: "cust-demo-1", channel: "online",
    status: "new", subtotal: 980000, discount_total: 0, delivery_fee: 25000, total: 1005000,
    payment_status: "pending", payment_method: "payme", delivery_method: "delivery",
    delivery_address_id: null, promo_code_id: null, note: null, created_by: null,
    created_at: daysAgo(0), updated_at: daysAgo(0),
  },
];

export const demoOrderItems: any[] = [
  { id: "oi-1", order_id: "ord-1", variant_id: "var-1", product_name_snapshot: "Klassik qora kostyum", size: "50", color: "Qora", sku_snapshot: null, quantity: 1, unit_price: 1090000, total: 1090000 },
  { id: "oi-2", order_id: "ord-2", variant_id: null, product_name_snapshot: "Klassik qora shim", size: "48", color: "Qora", sku_snapshot: null, quantity: 1, unit_price: 320000, total: 320000 },
  { id: "oi-3", order_id: "ord-3", variant_id: null, product_name_snapshot: "Kul rang biznes kostyum", size: "50", color: "Kul rang", sku_snapshot: null, quantity: 1, unit_price: 980000, total: 980000 },
];

export const demoCustomers: any[] = [
  { id: "cust-demo-1", auth_user_id: "demo-customer-user", full_name: "Aziz Karimov", phone: "+998901234567", email: null, birthday: null, total_orders: 2, total_spent: 1410000, created_at: daysAgo(5), updated_at: now },
];

export const demoExpenses: any[] = [
  { id: "exp-1", category: "Ijara", amount: 3000000, description: "Do'kon ijarasi (oylik)", date: daysAgo(3).split("T")[0], created_by: null, created_at: daysAgo(3) },
  { id: "exp-2", category: "Reklama", amount: 500000, description: "Instagram reklama", date: daysAgo(1).split("T")[0], created_by: null, created_at: daysAgo(1) },
];
