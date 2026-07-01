import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, Info, ShoppingBag, X } from "lucide-react";
import { useToastStore, type ToastKind } from "@/store/toast";
import { cn } from "@/lib/utils";

const ICON: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  cart: ShoppingBag,
};

const ICON_COLOR: Record<ToastKind, string> = {
  success: "text-emerald-400",
  error: "text-rose-400",
  info: "text-sky-400",
  cart: "text-gold",
};

// App-uslubidagi toast — yuqorida (mobil) / o'ngda (desktop)
export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:items-end sm:px-4">
      {toasts.map((t) => {
        const Icon = ICON[t.kind];
        return (
          <div
            key={t.id}
            className="glass-strong pointer-events-auto flex w-full max-w-sm animate-[toastIn_0.35s_cubic-bezier(0.22,1,0.36,1)] items-center gap-3 rounded-ios px-4 py-3 shadow-float"
            role="status"
          >
            {t.imageUrl ? (
              <img src={t.imageUrl} alt="" className="h-11 w-11 flex-shrink-0 rounded-lg object-cover" />
            ) : (
              <Icon className={cn("h-6 w-6 flex-shrink-0", ICON_COLOR[t.kind])} />
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-charcoal">{t.message}</p>
              {t.subtitle && (
                <p className="truncate text-xs text-charcoal-400">{t.subtitle}</p>
              )}
            </div>

            {t.action && (
              <Link
                to={t.action.to}
                onClick={() => dismiss(t.id)}
                className="tap flex-shrink-0 rounded-full bg-gold px-3.5 py-1.5 text-xs font-semibold text-white"
              >
                {t.action.label}
              </Link>
            )}

            <button
              onClick={() => dismiss(t.id)}
              className="tap flex-shrink-0 text-charcoal-300 hover:text-charcoal"
              aria-label="Yopish"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
