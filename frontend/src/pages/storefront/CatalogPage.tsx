import { useState, useMemo } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { SlidersHorizontal, X, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProducts, useCategories, type ProductFilters } from "@/hooks/useProducts";
import { useLang } from "@/hooks/useLang";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { Reveal } from "@/components/app/Reveal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useBrands } from "@/hooks/useBrands";

const ALL_SIZES = ["46", "48", "50", "52", "54", "56"];
const ALL_FITS = [
  { value: "slim", label: "Slim fit" },
  { value: "regular", label: "Regular fit" },
  { value: "comfort", label: "Comfort fit" },
];

export default function CatalogPage() {
  const { t } = useTranslation();
  const { pick } = useLang();
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("search") ?? undefined;
  const brandParam = searchParams.get("brand") ?? undefined;

  const [sizes, setSizes] = useState<string[]>([]);
  const [fitType, setFitType] = useState<string>("");
  const [sort, setSort] = useState<ProductFilters["sort"]>("newest");
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: categories } = useCategories();
  const { data: allBrands } = useBrands(true);
  const currentCategory = categories?.find((c) => c.slug === categorySlug);
  const currentBrand = allBrands?.find((b) => b.id === brandParam);

  const filters: ProductFilters = useMemo(
    () => ({
      categorySlug,
      brand: brandParam,
      search: searchQuery,
      sizes: sizes.length ? sizes : undefined,
      fitType: fitType || undefined,
      sort,
    }),
    [categorySlug, brandParam, searchQuery, sizes, fitType, sort]
  );

  const { data: products, isLoading } = useProducts(filters);

  function toggleSize(size: string) {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  function resetFilters() {
    setSizes([]);
    setFitType("");
    if (brandParam) navigate("/catalog");
  }

  const hasActiveFilters = sizes.length > 0 || fitType !== "" || !!brandParam;

  // Filtr paneli (sheet va desktop uchun umumiy)
  const FilterContent = () => (
    <div className="space-y-8">
      {/* O'lcham */}
      <div>
        <h4 className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-charcoal">
          {t("filters.size")}
        </h4>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                "tap flex h-11 w-11 items-center justify-center rounded-full text-sm font-medium transition-all",
                sizes.includes(size)
                  ? "bg-gold text-white shadow-glass-sm"
                  : "glass text-charcoal"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Fason */}
      <div>
        <h4 className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-charcoal">
          {t("filters.fitType")}
        </h4>
        <div className="space-y-2">
          {ALL_FITS.map((fit) => (
            <button
              key={fit.value}
              onClick={() => setFitType(fitType === fit.value ? "" : fit.value)}
              className={cn(
                "tap flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all",
                fitType === fit.value
                  ? "bg-gold text-white shadow-glass-sm"
                  : "glass text-charcoal"
              )}
            >
              {fit.label}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={resetFilters} className="w-full">
          <X className="mr-2 h-4 w-4" />
          {t("filters.reset")}
        </Button>
      )}
    </div>
  );

  const eyebrow = currentBrand
    ? "Brend"
    : searchQuery
    ? "Qidiruv natijasi"
    : currentCategory
    ? "Kolleksiya"
    : "Butun katalog";
  const heading = currentBrand
    ? currentBrand.name
    : searchQuery
    ? `"${searchQuery}"`
    : currentCategory
    ? pick(currentCategory, "name")
    : t("nav.catalog");

  return (
    <div className="container-page py-10">
      {/* ─── Editorial sarlavha ───────────────────────── */}
      <Reveal>
        <div className="mb-9 border-b border-foreground/10 pb-7">
          <div className="flex items-start gap-4">
            {currentBrand && (
              <button
                onClick={() => navigate("/catalog")}
                className="tap mt-2 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-foreground/8 text-charcoal transition-colors hover:bg-foreground/15"
                aria-label="Orqaga"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0">
              <p className="flex items-center gap-2.5 font-sans text-[0.7rem] uppercase tracking-[0.3em] text-gold">
                <span className="h-px w-8 bg-gold" />
                {eyebrow}
              </p>
              <h1
                className={cn(
                  "mt-3 text-charcoal",
                  currentBrand
                    ? "font-sans text-4xl font-bold tracking-[0.06em] md:text-6xl"
                    : "font-serif text-4xl font-light md:text-6xl"
                )}
              >
                {heading}
              </h1>
              {!isLoading && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {products?.length ?? 0} {t("common.pieces")}
                </p>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ─── Telegram-uslubidagi folder tablar (kategoriyalar) ── */}
      {!searchQuery && (
        <div className="no-scrollbar -mx-4 mb-7 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <Link
            to="/catalog"
            className={cn(
              "tap whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all",
              !categorySlug
                ? "bg-gold text-white shadow-glass-sm"
                : "glass text-charcoal"
            )}
          >
            Hammasi
          </Link>
          {categories?.map((c) => (
            <Link
              key={c.id}
              to={`/catalog/${c.slug}`}
              className={cn(
                "tap whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all",
                categorySlug === c.slug
                  ? "bg-gold text-white shadow-glass-sm"
                  : "glass text-charcoal"
              )}
            >
              {pick(c, "name")}
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-10">
        {/* Desktop filtr paneli */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <Reveal direction="right">
            <div className="glass-card sticky top-24 rounded-[0.6rem] p-6 shadow-glass-sm">
              <h3 className="mb-5 font-serif text-lg font-medium text-charcoal">{t("filters.title")}</h3>
              <FilterContent />
            </div>
          </Reveal>
        </aside>

        {/* Mahsulotlar */}
        <div className="flex-1">
          {/* Yuqori panel: filtr tugma + saralash */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  {t("filters.title")}
                  {hasActiveFilters && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center bg-gold text-[0.65rem] text-white">
                      {sizes.length + (fitType ? 1 : 0)}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{t("filters.title")}</SheetTitle>
                </SheetHeader>
                <div className="px-6 pb-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            <div className="ml-auto w-44">
              <Select value={sort} onValueChange={(v) => setSort(v as ProductFilters["sort"])}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder={t("filters.sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t("filters.sortNewest")}</SelectItem>
                  <SelectItem value="price_asc">{t("filters.sortPriceAsc")}</SelectItem>
                  <SelectItem value="price_desc">{t("filters.sortPriceDesc")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products?.map((product, i) => (
                  <Reveal key={product.id} delay={Math.min(i, 7) * 60} direction="up">
                    <ProductCard product={product} />
                  </Reveal>
                ))}
          </div>

          {!isLoading && (!products || products.length === 0) && (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">{t("common.noResults")}</p>
              {hasActiveFilters && (
                <Button variant="link" onClick={resetFilters} className="mt-2">
                  {t("filters.reset")}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
