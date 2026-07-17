import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Ruler, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Erkaklar ustki kiyimi uchun standart o'lchamlar (sm)
const SIZE_ROWS = [
  { size: "XS", chest: "84–88", waist: "70–74", length: "68" },
  { size: "S", chest: "89–94", waist: "75–80", length: "70" },
  { size: "M", chest: "95–100", waist: "81–86", length: "72" },
  { size: "L", chest: "101–106", waist: "87–92", length: "74" },
  { size: "XL", chest: "107–113", waist: "93–99", length: "76" },
  { size: "XXL", chest: "114–120", waist: "100–106", length: "78" },
  { size: "3XL", chest: "121–128", waist: "107–114", length: "80" },
];

// Bo'y va vazndan taxminiy o'lcham (soddalashtirilgan geristika)
function recommendSize(height: number, weight: number): string | null {
  if (!weight || weight < 35 || weight > 200) return null;
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
  let idx: number;
  if (weight < 55) idx = 0;
  else if (weight < 63) idx = 1;
  else if (weight < 73) idx = 2;
  else if (weight < 84) idx = 3;
  else if (weight < 96) idx = 4;
  else if (weight < 110) idx = 5;
  else idx = 6;
  // Baland bo'y + chegaradagi vazn → bir o'lcham kattaroq (uzunlik uchun)
  if (height >= 190 && idx < sizes.length - 1) idx += 1;
  return sizes[idx];
}

export function SizeGuide({ triggerClassName }: { triggerClassName?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"chart" | "finder">("chart");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const rec = recommendSize(Number(height), Number(weight));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn("inline-flex items-center gap-1 text-xs text-gold hover:underline", triggerClassName)}
        >
          <Ruler className="h-3.5 w-3.5" />
          {t("sizeGuide.trigger")}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">{t("sizeGuide.trigger")}</DialogTitle>
        </DialogHeader>

        {/* Tab tugmalari */}
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-black/5 p-1">
          <button
            onClick={() => setTab("chart")}
            className={cn(
              "rounded-md py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
              tab === "chart" ? "bg-white text-charcoal shadow-glass-sm" : "text-muted-foreground"
            )}
          >
            {t("sizeGuide.chartTab")}
          </button>
          <button
            onClick={() => setTab("finder")}
            className={cn(
              "rounded-md py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
              tab === "finder" ? "bg-white text-charcoal shadow-glass-sm" : "text-muted-foreground"
            )}
          >
            {t("sizeGuide.finderTab")}
          </button>
        </div>

        {tab === "chart" ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-black/5 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2.5 text-left font-semibold">{t("filters.size")}</th>
                  <th className="px-3 py-2.5 text-left font-semibold">{t("sizeGuide.chest")}</th>
                  <th className="px-3 py-2.5 text-left font-semibold">{t("sizeGuide.waist")}</th>
                  <th className="px-3 py-2.5 text-left font-semibold">{t("sizeGuide.length")}</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_ROWS.map((r) => (
                  <tr
                    key={r.size}
                    className={cn(
                      "border-t border-border transition-colors",
                      rec === r.size ? "bg-gold/10" : "hover:bg-black/[0.03]"
                    )}
                  >
                    <td className="px-3 py-2.5 font-semibold text-charcoal">
                      {r.size}
                      {rec === r.size && <span className="ml-1.5 text-[0.6rem] text-gold">← {t("sizeGuide.you")}</span>}
                    </td>
                    <td className="px-3 py-2.5 text-charcoal-400">{r.chest}</td>
                    <td className="px-3 py-2.5 text-charcoal-400">{r.waist}</td>
                    <td className="px-3 py-2.5 text-charcoal-400">{r.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-3 py-2 text-[0.65rem] text-muted-foreground">{t("sizeGuide.allCm")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("sizeGuide.finderHint")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal">{t("sizeGuide.height")}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  className="input-kaster w-full"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal">{t("sizeGuide.weight")}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="72"
                  className="input-kaster w-full"
                />
              </label>
            </div>

            {rec ? (
              <div className="flex items-center gap-3 rounded-lg border border-gold/30 bg-gold/10 p-4">
                <Sparkles className="h-5 w-5 flex-shrink-0 text-gold" />
                <div>
                  <p className="text-sm text-charcoal">{t("sizeGuide.recommended")}</p>
                  <p className="font-serif text-2xl font-light text-gold">{rec}</p>
                </div>
                <button
                  onClick={() => setTab("chart")}
                  className="ml-auto text-xs text-gold hover:underline"
                >
                  {t("sizeGuide.seeChart")}
                </button>
              </div>
            ) : (
              <p className="rounded-lg bg-black/5 p-4 text-center text-sm text-muted-foreground">
                {t("sizeGuide.enterWeight")}
              </p>
            )}
            <p className="text-[0.65rem] text-muted-foreground">
              {t("sizeGuide.disclaimer")}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
