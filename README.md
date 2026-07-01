# Kaster.uz — Onlayn do'kon + Admin + ERP

Toshkent, Abu Sahiy bozoridagi "Kaster uz" kostyum-shim do'koni uchun onlayn platforma.

## Texnologiyalar

- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui
- **State:** TanStack Query (server) + Zustand (savat/auth)
- **Forma:** React Hook Form + Zod
- **i18n:** i18next (UZ / RU)
- **Backend:** Node.js + Express (to'lov webhook, biznes-logika)
- **DB/Auth/Storage:** Supabase (PostgreSQL + RLS + Auth + Storage + Realtime)

## Loyiha tuzilmasi

```
kaster_uz/
├── frontend/              # React storefront + admin panel
│   ├── src/
│   │   ├── app/           # App.tsx (routing)
│   │   ├── components/    # UI (shadcn) + brand + product + auth
│   │   ├── pages/
│   │   │   ├── storefront/  # Mijoz tomoni
│   │   │   └── admin/       # Admin + ERP
│   │   ├── hooks/        # useProducts, useLang, useBanners
│   │   ├── store/        # cart.ts, auth.ts (Zustand)
│   │   ├── lib/          # supabase.ts, utils.ts
│   │   ├── i18n/         # uz.json, ru.json
│   │   └── types/        # database.ts
├── backend/              # Express API
│   └── src/
│       ├── routes/       # orders, payments, sms, inventory
│       └── lib/          # supabase (service role)
└── supabase/
    ├── migrations/       # 001_initial_schema.sql, 002_functions.sql
    └── seed.sql          # Namuna ma'lumotlar
```

## O'rnatish

### 0. Talab: Node.js 18+

Node.js o'rnatilganligini tekshiring: `node -v`. Bo'lmasa — https://nodejs.org dan LTS versiyani o'rnating.

### 1. Supabase loyihasini sozlash

1. https://supabase.com da yangi loyiha yarating.
2. SQL Editor'da quyidagilarni ketma-ket ishga tushiring:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_functions.sql`
   - `supabase/seed.sql` (namuna data)
3. **Authentication → Providers → Phone** ni yoqing (Eskiz/Twilio SMS sozlamasi bilan).
4. **Storage** da `products` va `banners` nomli public bucket yarating.
5. Project Settings → API dan `URL`, `anon key`, `service_role key` ni nusxalang.

### 2. Environment

`.env.example` ni nusxalab to'ldiring:

```bash
# frontend/.env
cp .env.example frontend/.env

# backend/.env
cp .env.example backend/.env
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

### 4. Backend

```bash
cd backend
npm install
npm run dev      # http://localhost:4000
```

## Admin foydalanuvchi yaratish

1. Supabase **Authentication → Users → Add user** orqali email/parol bilan foydalanuvchi yarating.
2. SQL Editor'da profil qo'shing:

```sql
insert into profiles (auth_user_id, full_name, role)
values ('<USER_UUID>', 'Egasi', 'owner');
```

3. `/admin/login` orqali kiring.

## Bosqichlar holati

- [x] **1-qadam:** Schema + RLS + seed + loyiha tuzilmasi
- [x] **2-qadam:** Dizayn tizimi (Tailwind, UI komponentlar)
- [x] **3-qadam:** Storefront MVP (katalog, mahsulot, savat, OTP login, checkout COD)
- [x] **4-qadam:** Admin MVP (mahsulot CRUD, buyurtma, dashboard)
- [ ] **5-qadam:** To'lov integratsiyasi (Payme/Click/Uzum) — backend tayyor, ulanish kerak
- [ ] **6-qadam:** SMS xabarlar (Eskiz) — backend tayyor
- [ ] **7-qadam:** ERP to'liq (ta'minot, POS, moliya, hisobotlar)

## Deploy (Vercel)

- **Frontend:** Vercel'ga `frontend/` papkasini import qiling. `vercel.json` SPA rewrite bilan tayyor.
- **Backend:** Railway/Render'ga `backend/` ni deploy qiling (doimiy server webhook'lar uchun).
