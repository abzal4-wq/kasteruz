# Kaster.uz — Tez sozlash qo'llanmasi

---

## 🎭 DEMO REJIM — hoziroq ko'rish (sozlashsiz!)

**Hech narsa sozlamasdan** loyihani darhol ko'rishingiz mumkin. Supabase ulanmagan bo'lsa,
loyiha avtomatik **demo rejimda** ishlaydi — namuna mahsulotlar, buyurtmalar va admin paneli bilan.

```bash
cd frontend
npm install     # birinchi marta
npm run dev
```

Keyin brauzerda oching: **http://localhost:5173**

**Demo rejimda nimalar ishlaydi:**
- ✅ Bosh sahifa, katalog, mahsulot sahifalari (6 ta namuna mahsulot)
- ✅ Savatga qo'shish, checkout, buyurtma berish
- ✅ Kirish (OTP) — **istalgan telefon va istalgan kodni** kiriting
- ✅ Admin panel: `/admin/login` — **istalgan email va parol**
- ✅ Dashboard, mahsulotlar, buyurtmalar, ombor, POS kassa, moliya

> Demo ma'lumotlar faqat brauzeringizda saqlanadi. Haqiqiy do'kon uchun pastdagi
> Supabase qadamlarini bajaring — `.env` to'ldirilgach demo rejim avtomatik o'chadi.

---

## 1-qadam: Supabase loyiha yaratish (haqiqiy ishlatish uchun)

1. [supabase.com](https://supabase.com) ga kiring → **New project**
2. Region: **Southeast Asia (Singapore)** — O'zbekistonga yaqin
3. Loyiha yaratilgandan keyin **Settings → API** ga o'ting va quyidagilarni nusxalang:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (maxfiy!)

## 2-qadam: Ma'lumotlar bazasi yaratish

Supabase **SQL Editor** ga o'ting va ketma-ket ishga tushiring:

```sql
-- 1. Asosiy jadvallar va RLS
```
→ `supabase/migrations/001_initial_schema.sql` faylini nusxalab yoping

```sql
-- 2. Funksiyalar va VIEW'lar
```
→ `supabase/migrations/002_functions.sql` faylini nusxalab yoping

```sql
-- 3. Namuna ma'lumotlar (ixtiyoriy)
```
→ `supabase/seed.sql` faylini nusxalab yoping

## 3-qadam: Auth sozlash (OTP)

1. **Authentication → Providers → Phone** → Enable
2. SMS Provider: **Twilio** yoki test rejimda **Supabase built-in**
3. Test uchun: Authentication → Users → Add user → telefon raqam qo'shib, OTP'ni confirm qiling

> Test rejimida SMS yuborilmaydi — **Supabase Dashboard → Auth → Users** dan OTP kodni ko'rasiz.

## 4-qadam: Storage sozlash

1. **Storage → New bucket**: `products` (Public: ✓)
2. **Storage → New bucket**: `banners` (Public: ✓)

## 5-qadam: `.env` to'ldirish

`frontend/.env` faylini oching:

```env
VITE_SUPABASE_URL=https://XXXXXXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

`backend/.env` faylini oching:

```env
SUPABASE_URL=https://XXXXXXXXXXXX.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
PORT=4000
```

## 6-qadam: Admin foydalanuvchi yaratish

1. Supabase **Authentication → Users → Add user** → email + parol kiriting
2. **SQL Editor** da:

```sql
INSERT INTO profiles (auth_user_id, full_name, role)
VALUES ('<AUTH_USER_UUID>', 'Ism Familiya', 'owner');
```

`<AUTH_USER_UUID>` ni Authentication → Users jadvalidan nusxalang.

## 7-qadam: Ishga tushirish

```bash
# Frontend (http://localhost:5173)
cd frontend
npm run dev

# Backend (http://localhost:4000) — alohida terminal
cd backend
npm run dev
```

## Manzillar

| Sahifa | URL |
|--------|-----|
| Bosh sahifa | http://localhost:5173 |
| Katalog | http://localhost:5173/catalog |
| Admin panel | http://localhost:5173/admin |
| Admin login | http://localhost:5173/admin/login |
| POS Kassa | http://localhost:5173/admin/pos |
| Ombor | http://localhost:5173/admin/inventory |
| Moliya | http://localhost:5173/admin/finance |
