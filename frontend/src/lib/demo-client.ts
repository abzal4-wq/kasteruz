// ============================================================
// Mock Supabase client — IS_DEMO bo'lganda haqiqiy Supabase
// o'rniga ishlatiladi. Demo ma'lumotlar ustida ishlaydi.
// PostgREST query builder'ning ishlatiladigan qismini taqlid qiladi.
// ============================================================
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  demoProducts, demoVariants, demoImages, demoInventory,
  demoCategories, demoWarehouses, demoBanners, demoPromoCodes,
  demoSuppliers, demoStoreSettings, demoOrders, demoOrderItems,
  demoCustomers, demoExpenses,
} from "./demo-data";

type Row = Record<string, any>;

// ─── In-memory DB (o'zgaruvchan) ─────────────────────────────
const db: Record<string, Row[]> = {
  products: demoProducts,
  product_variants: demoVariants,
  product_images: demoImages,
  inventory: demoInventory,
  categories: demoCategories,
  warehouses: demoWarehouses,
  banners: demoBanners,
  promo_codes: demoPromoCodes,
  suppliers: demoSuppliers,
  store_settings: demoStoreSettings,
  orders: demoOrders,
  order_items: demoOrderItems,
  customers: demoCustomers,
  expenses: demoExpenses,
  addresses: [],
  stock_movements: [],
  order_status_history: [],
  payments: [],
  shipments: [],
  profiles: [],
  purchase_orders: [],
  purchase_order_items: [],
  wishlists: [],
  product_reviews: [],
};

// ─── Demo ma'lumotlarni localStorage'da saqlash ──────────────
// Buyurtma oqimi jadvallarini saqlaymiz — sahifa yangilanganda yo'qolmasin
const PERSIST_KEY = "kaster-demo-db";
const PERSIST_TABLES = ["orders", "order_items", "addresses", "order_status_history", "payments", "product_reviews"];

function persistDb() {
  try {
    const obj: Record<string, Row[]> = {};
    for (const t of PERSIST_TABLES) obj[t] = db[t];
    localStorage.setItem(PERSIST_KEY, JSON.stringify(obj));
  } catch {
    /* localStorage yo'q yoki to'la */
  }
}

function loadPersistedDb() {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw) as Record<string, Row[]>;
    for (const t of PERSIST_TABLES) {
      if (!Array.isArray(obj[t])) continue;
      // Birlashtiramiz: seed (demo) yozuvlar yo'qolmasin, saqlanganlar qo'shilsin
      const byId = new Map<any, Row>((db[t] ?? []).map((r) => [r.id, r]));
      for (const r of obj[t]) byId.set(r.id, r);
      db[t] = Array.from(byId.values());
    }
  } catch {
    /* buzilgan ma'lumot — e'tiborsiz */
  }
}

// Modul yuklanganda saqlangan buyurtmalarni tiklash
loadPersistedDb();

// ─── Munosabatlar (embed resolution uchun) ───────────────────
// parentTable -> targetTable -> {type, fk}
const REL: Record<string, Record<string, { type: "one" | "many"; fk: string }>> = {
  products: {
    categories: { type: "one", fk: "category_id" },
    product_variants: { type: "many", fk: "product_id" },
    product_images: { type: "many", fk: "product_id" },
  },
  product_variants: {
    inventory: { type: "many", fk: "variant_id" },
    products: { type: "one", fk: "product_id" },
    product_images: { type: "many", fk: "product_id" },
  },
  orders: {
    order_items: { type: "many", fk: "order_id" },
    customers: { type: "one", fk: "customer_id" },
    addresses: { type: "one", fk: "delivery_address_id" },
    payments: { type: "many", fk: "order_id" },
    shipments: { type: "many", fk: "order_id" },
  },
  order_items: {
    product_variants: { type: "one", fk: "variant_id" },
  },
};

let idCounter = 1000;
function genId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${++idCounter}`;
}

// ─── View'larni hisoblash ────────────────────────────────────
function computeView(view: string): Row[] {
  if (view === "inventory_available") {
    return db.inventory.map((i) => {
      const pv = db.product_variants.find((v) => v.id === i.variant_id);
      const p = pv && db.products.find((x) => x.id === pv.product_id);
      const w = db.warehouses.find((x) => x.id === i.warehouse_id);
      return {
        ...i,
        available: i.quantity - i.reserved_quantity,
        name_uz: p?.name_uz, name_ru: p?.name_ru,
        size: pv?.size, color: pv?.color, sku: pv?.sku,
        warehouse_name: w?.name,
      };
    });
  }
  if (view === "low_stock_alert") {
    return computeView("inventory_available").filter(
      (r) => r.available <= r.reorder_level
    );
  }
  return [];
}

function getRows(table: string): Row[] {
  if (db[table]) return db[table];
  if (table.endsWith("_available") || table.endsWith("_alert")) return computeView(table);
  return [];
}

// ─── Select string parser (embed'lar bilan) ──────────────────
interface ParsedSelect {
  columns: string[] | "*";
  embeds: { alias: string; table: string; select: string }[];
}

function splitTopLevel(str: string): string[] {
  const parts: string[] = [];
  let depth = 0, cur = "";
  for (const ch of str) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { parts.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function parseSelect(str: string): ParsedSelect {
  const cleaned = str.replace(/\s+/g, " ").trim();
  const tokens = splitTopLevel(cleaned);
  const columns: string[] = [];
  const embeds: ParsedSelect["embeds"] = [];

  for (const tok of tokens) {
    const parenIdx = tok.indexOf("(");
    if (parenIdx === -1) {
      columns.push(tok);
    } else {
      const head = tok.slice(0, parenIdx).trim();
      const inner = tok.slice(parenIdx + 1, tok.lastIndexOf(")"));
      let alias: string, table: string;
      if (head.includes(":")) {
        const [a, t] = head.split(":");
        alias = a.trim();
        table = t.trim();
      } else {
        alias = head;
        table = head;
      }
      embeds.push({ alias, table, select: inner });
    }
  }
  return { columns: columns.includes("*") ? "*" : columns, embeds };
}

// Munosabatni topish (alias bilan asl jadval nomi farq qilishi mumkin)
function resolveRel(parentTable: string, embed: { alias: string; table: string }) {
  const rels = REL[parentTable];
  if (!rels) return null;
  if (rels[embed.table]) return { table: embed.table, ...rels[embed.table] };
  // alias jadval nomi bo'lishi mumkin (masalan "inventory", "payments")
  if (rels[embed.alias]) return { table: embed.alias, ...rels[embed.alias] };
  return null;
}

function applyEmbeds(parentTable: string, row: Row, embeds: ParsedSelect["embeds"]): Row {
  const result: Row = { ...row };
  for (const embed of embeds) {
    const rel = resolveRel(parentTable, embed);
    if (!rel) { result[embed.alias] = rel === null ? null : []; continue; }

    const targetRows = getRows(rel.table);
    const sub = parseSelect(embed.select);

    if (rel.type === "one") {
      const match = targetRows.find((t) => t.id === row[rel.fk]);
      result[embed.alias] = match
        ? applyEmbeds(rel.table, match, sub.embeds)
        : null;
    } else {
      const matches = targetRows.filter((t) => t[rel.fk] === row.id);
      result[embed.alias] = matches.map((m) => applyEmbeds(rel.table, m, sub.embeds));
    }
  }
  return result;
}

// ─── Query Builder ───────────────────────────────────────────
class DemoQuery implements PromiseLike<{ data: any; error: any }> {
  private filters: ((r: Row) => boolean)[] = [];
  private orderCol: string | null = null;
  private orderAsc = true;
  private limitN: number | null = null;
  private isSingle = false;
  private isMaybe = false;
  private selectStr = "*";
  private mode: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: any = null;
  private returning = false;

  constructor(private table: string) {}

  select(str = "*") {
    this.selectStr = str;
    if (this.mode !== "select") this.returning = true;
    return this;
  }
  insert(payload: any) { this.mode = "insert"; this.payload = payload; return this; }
  update(payload: any) { this.mode = "update"; this.payload = payload; return this; }
  upsert(payload: any) { this.mode = "upsert"; this.payload = payload; return this; }
  delete() { this.mode = "delete"; return this; }

  eq(col: string, val: any) { this.filters.push((r) => r[col] === val); return this; }
  neq(col: string, val: any) { this.filters.push((r) => r[col] !== val); return this; }
  gt(col: string, val: any) { this.filters.push((r) => r[col] > val); return this; }
  gte(col: string, val: any) { this.filters.push((r) => r[col] >= val); return this; }
  lt(col: string, val: any) { this.filters.push((r) => r[col] < val); return this; }
  lte(col: string, val: any) { this.filters.push((r) => r[col] <= val); return this; }
  in(col: string, arr: any[]) { this.filters.push((r) => arr.includes(r[col])); return this; }
  ilike(col: string, pattern: string) {
    const rx = new RegExp("^" + pattern.replace(/%/g, ".*").replace(/_/g, ".") + "$", "i");
    this.filters.push((r) => rx.test(String(r[col] ?? "")));
    return this;
  }
  like(col: string, pattern: string) { return this.ilike(col, pattern); }
  not(col: string, _op: string, val: any) {
    if (Array.isArray(val)) this.filters.push((r) => !val.includes(r[col]));
    else this.filters.push((r) => r[col] !== val);
    return this;
  }
  is(col: string, val: any) { this.filters.push((r) => r[col] === val); return this; }
  textSearch(_col: string, query: string) {
    const q = query.toLowerCase();
    this.filters.push((r) =>
      JSON.stringify(r).toLowerCase().includes(q)
    );
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = opts?.ascending ?? true;
    return this;
  }
  limit(n: number) { this.limitN = n; return this; }
  range() { return this; }
  maybeSingle() { this.isMaybe = true; this.isSingle = true; return this; }
  single() { this.isSingle = true; return this; }

  private exec(): { data: any; error: any } {
    try {
      // ─── Yozish operatsiyalari ───
      if (this.mode === "insert" || this.mode === "upsert") {
        const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
        const inserted = rows.map((r) => this.prepareInsert(r));
        if (db[this.table]) db[this.table].push(...inserted);
        if (PERSIST_TABLES.includes(this.table)) persistDb();
        const out = inserted.map((r) => this.shape(r));
        const data = this.isSingle ? out[0] ?? null : (this.returning ? out : null);
        return { data, error: null };
      }

      if (this.mode === "update") {
        const target = getRows(this.table);
        const updated: Row[] = [];
        for (const row of target) {
          if (this.filters.every((f) => f(row))) {
            Object.assign(row, this.payload, { updated_at: new Date().toISOString() });
            updated.push(row);
          }
        }
        if (PERSIST_TABLES.includes(this.table)) persistDb();
        const out = updated.map((r) => this.shape(r));
        const data = this.isSingle ? out[0] ?? null : (this.returning ? out : null);
        return { data, error: null };
      }

      if (this.mode === "delete") {
        const arr = db[this.table];
        if (arr) {
          for (let i = arr.length - 1; i >= 0; i--) {
            if (this.filters.every((f) => f(arr[i]))) arr.splice(i, 1);
          }
        }
        if (PERSIST_TABLES.includes(this.table)) persistDb();
        return { data: null, error: null };
      }

      // ─── O'qish ───
      let rows = getRows(this.table).filter((r) => this.filters.every((f) => f(r)));

      if (this.orderCol) {
        const col = this.orderCol, asc = this.orderAsc;
        rows = [...rows].sort((a, b) => {
          if (a[col] === b[col]) return 0;
          return (a[col] > b[col] ? 1 : -1) * (asc ? 1 : -1);
        });
      }
      if (this.limitN != null) rows = rows.slice(0, this.limitN);

      const shaped = rows.map((r) => this.shape(r));

      if (this.isSingle) {
        if (shaped.length === 0) {
          return {
            data: null,
            error: this.isMaybe ? null : { message: "Qator topilmadi", code: "PGRST116" },
          };
        }
        return { data: shaped[0], error: null };
      }
      return { data: shaped, error: null };
    } catch (e: any) {
      return { data: null, error: { message: e?.message ?? "Demo xato" } };
    }
  }

  private prepareInsert(r: Row): Row {
    const row: Row = { ...r };
    if (!row.id) row.id = genId(this.table.slice(0, 3));
    if (!row.created_at) row.created_at = new Date().toISOString();
    if (this.table === "orders" && !row.order_number) {
      row.order_number = "KU-" + (10000 + db.orders.length + 1);
    }
    return row;
  }

  private shape(row: Row): Row {
    const parsed = parseSelect(this.selectStr);
    if (parsed.embeds.length === 0) return { ...row };
    return applyEmbeds(this.table, row, parsed.embeds);
  }

  then<TR = { data: any; error: any }, TE = never>(
    onF?: ((v: { data: any; error: any }) => TR | PromiseLike<TR>) | null,
    onR?: ((reason: any) => TE | PromiseLike<TE>) | null
  ): PromiseLike<TR | TE> {
    return Promise.resolve(this.exec()).then(onF, onR);
  }
}

// ─── Auth mock ───────────────────────────────────────────────
const SESSION_KEY = "kaster-demo-session";
type AuthCb = (event: string, session: any) => void;
const authCallbacks: AuthCb[] = [];

function loadSession(): any {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveSession(session: any) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}
function emit(event: string, session: any) {
  authCallbacks.forEach((cb) => cb(event, session));
}

const demoAuth = {
  async getSession() {
    return { data: { session: loadSession() }, error: null };
  },
  async getUser() {
    const s = loadSession();
    return { data: { user: s?.user ?? null }, error: null };
  },
  onAuthStateChange(cb: AuthCb) {
    authCallbacks.push(cb);
    return { data: { subscription: { unsubscribe() {
      const i = authCallbacks.indexOf(cb);
      if (i >= 0) authCallbacks.splice(i, 1);
    } } } };
  },
  async signInWithOtp() {
    return { data: {}, error: null };
  },
  async verifyOtp({ phone }: { phone: string; token: string; type: string }) {
    const user = { id: "demo-customer-user", phone, email: null };
    const session = { user, access_token: "demo-token" };
    // Mijoz yozuvini ta'minlash
    let cust = db.customers.find((c) => c.auth_user_id === user.id);
    if (!cust) {
      cust = {
        id: "cust-demo-1", auth_user_id: user.id, full_name: "Demo mijoz",
        phone, email: null, total_orders: 0, total_spent: 0,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      db.customers.push(cust);
    }
    saveSession(session);
    emit("SIGNED_IN", session);
    return { data: { user, session }, error: null };
  },
  // Google (OAuth) — demo rejimda redirect yo'q, sessiya darhol yaratiladi
  async signInWithOAuth({ provider }: { provider: string; options?: any }) {
    const user = { id: "demo-google-user", email: "demo.google@kaster.uz", phone: null };
    const session = { user, access_token: "demo-google-token" };
    // Mijoz yozuvini ta'minlash
    let cust = db.customers.find((c) => c.auth_user_id === user.id);
    if (!cust) {
      cust = {
        id: "cust-google-1", auth_user_id: user.id, full_name: "Google mijoz",
        phone: user.email, email: user.email, total_orders: 0, total_spent: 0,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      db.customers.push(cust);
    }
    saveSession(session);
    emit("SIGNED_IN", session);
    return { data: { provider, url: null }, error: null };
  },
  async signInWithPassword({ email }: { email: string; password: string }) {
    const user = { id: "demo-admin-user", email, phone: null };
    const session = { user, access_token: "demo-admin-token" };
    // Admin profilini ta'minlash
    let prof = db.profiles.find((p) => p.auth_user_id === user.id);
    if (!prof) {
      prof = {
        id: "prof-demo-1", auth_user_id: user.id, full_name: "Demo Admin",
        phone: null, role: "owner", is_active: true,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      db.profiles.push(prof);
    }
    saveSession(session);
    emit("SIGNED_IN", session);
    return { data: { user, session }, error: null };
  },
  async signOut() {
    saveSession(null);
    emit("SIGNED_OUT", null);
    return { error: null };
  },
};

// ─── Storage / Realtime / RPC no-op'lar ──────────────────────
const demoStorage = {
  from() {
    return {
      async upload() { return { data: { path: "demo/file" }, error: null }; },
      getPublicUrl(path: string) {
        return { data: { publicUrl: path } };
      },
      async remove() { return { data: null, error: null }; },
      async list() { return { data: [], error: null }; },
    };
  },
};

export function createDemoClient() {
  return {
    from(table: string) { return new DemoQuery(table); },
    auth: demoAuth,
    storage: demoStorage,
    async rpc(fn: string, params: any) {
      // Promo-kod tekshiruvi
      if (fn === "apply_promo_code") {
        const code = (params?.p_code ?? "").toUpperCase();
        const promo = db.promo_codes.find((p) => p.code === code && p.is_active);
        if (!promo) return { data: { valid: false, error: "promo_not_found" }, error: null };
        const subtotal = params?.p_subtotal ?? 0;
        if (subtotal < promo.min_order)
          return { data: { valid: false, error: "min_order_not_met", min_order: promo.min_order }, error: null };
        const discount = promo.type === "percent"
          ? Math.floor((subtotal * promo.value) / 100)
          : Math.min(promo.value, subtotal);
        return { data: { valid: true, promo_id: promo.id, code: promo.code, type: promo.type, value: promo.value, discount }, error: null };
      }
      return { data: null, error: null };
    },
    channel() {
      const ch: any = {
        on() { return ch; },
        subscribe() { return ch; },
      };
      return ch;
    },
    removeChannel() { /* no-op */ },
  };
}
