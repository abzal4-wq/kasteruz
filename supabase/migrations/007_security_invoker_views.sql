-- ============================================================
-- 007_security_invoker_views.sql
-- Security Advisor "Security Definer View" (5 xato) tuzatish.
--
-- Postgres'da view'lar standart holda SECURITY DEFINER bo'lib,
-- yaratuvchi (owner) huquqi bilan ishlaydi va RLS'ni chetlab o'tadi.
-- security_invoker = on qo'yilsa — view so'ragan foydalanuvchi
-- huquqi/RLS'i bilan ishlaydi. Admin baribir hammasini ko'radi,
-- oddiy/anonim foydalanuvchi esa asosiy jadval RLS'i bilan cheklanadi.
-- ============================================================

alter view inventory_available set (security_invoker = on);
alter view finance_summary     set (security_invoker = on);
alter view low_stock_alert     set (security_invoker = on);
alter view sales_report        set (security_invoker = on);
alter view top_products        set (security_invoker = on);
