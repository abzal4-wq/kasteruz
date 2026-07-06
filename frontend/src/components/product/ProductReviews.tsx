import { useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { useProductReviews, reviewAverage, useSubmitReview } from "@/hooks/useReviews";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { toast } from "@/store/toast";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

// Yulduzlar qatori (faqat ko'rsatish uchun)
function StarRow({ value, className }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            className ?? "h-4 w-4",
            i <= Math.round(value) ? "fill-gold text-gold" : "fill-transparent text-charcoal-300"
          )}
        />
      ))}
    </span>
  );
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "";
  }
}

export function ProductReviews({ productId }: { productId: string }) {
  const { data: reviews = [], isLoading } = useProductReviews(productId);
  const customer = useAuthStore((s) => s.customer);
  const submit = useSubmitReview(productId);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const average = reviewAverage(reviews);
  const count = reviews.length;
  const alreadyReviewed = !!customer && reviews.some((r) => r.customer_id === customer.id);

  function handleSubmit() {
    if (rating < 1) {
      toast.error("Yulduz tanlang");
      return;
    }
    submit.mutate(
      { rating, comment },
      {
        onSuccess: () => {
          haptic("success");
          toast.success("Sharhingiz uchun rahmat!");
          setRating(0);
          setComment("");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Xatolik"),
      }
    );
  }

  return (
    <section className="mt-10 border-t border-border pt-8">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-widest">Sharhlar</h4>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <StarRow value={average} className="h-4 w-4" />
            <span className="text-sm text-charcoal">
              {average.toFixed(1)} <span className="text-muted-foreground">· {count} ta</span>
            </span>
          </div>
        )}
      </div>

      {/* Sharh qoldirish */}
      {!customer ? (
        <div className="mt-5 rounded-lg bg-black/5 p-4 text-sm text-muted-foreground">
          Sharh qoldirish uchun{" "}
          <Link to="/auth" className="font-medium text-gold hover:underline">
            tizimga kiring
          </Link>
          .
        </div>
      ) : alreadyReviewed ? (
        <div className="mt-5 rounded-lg border border-gold/25 bg-gold/5 p-4 text-sm text-charcoal">
          Siz bu mahsulotga sharh qoldirgansiz. Rahmat!
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-border p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-charcoal">Bahoyingiz</p>
          <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setRating(i);
                  haptic("light");
                }}
                onMouseEnter={() => setHover(i)}
                aria-label={`${i} yulduz`}
                className="tap p-0.5"
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors",
                    i <= (hover || rating) ? "fill-gold text-gold" : "fill-transparent text-charcoal-300"
                  )}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Mahsulot haqida fikringiz (ixtiyoriy)"
            rows={3}
            maxLength={500}
            className="input-kaster mt-3 w-full resize-none"
          />
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              className="text-xs font-semibold uppercase tracking-wider"
              disabled={submit.isPending}
              onClick={handleSubmit}
            >
              {submit.isPending ? "Yuborilmoqda…" : "Sharh qoldirish"}
            </Button>
          </div>
        </div>
      )}

      {/* Ro'yxat */}
      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Yuklanmoqda…</p>
        ) : count === 0 ? (
          <p className="text-sm text-muted-foreground">Hali sharhlar yo'q. Birinchi bo'ling!</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="border-b border-border/60 pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 font-serif text-sm text-gold">
                    {(r.author_name ?? "M").charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-charcoal">{r.author_name ?? "Mijoz"}</span>
                </div>
                <span className="text-xs text-muted-foreground">{fmtDate(r.created_at)}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <StarRow value={r.rating} className="h-3.5 w-3.5" />
              </div>
              {r.comment && <p className="mt-2 text-sm leading-relaxed text-charcoal-400">{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
