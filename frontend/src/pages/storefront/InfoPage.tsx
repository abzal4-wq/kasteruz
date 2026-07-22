import { useLocation, Link } from "react-router-dom";
import { Truck, RotateCcw, Ruler, Shield, FileText, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal } from "@/components/app/Reveal";

type Topic = "delivery" | "returns" | "size-guide" | "privacy" | "terms";

const SIZES = [
  { size: "46", chest: "92", waist: "80", height: "170–176" },
  { size: "48", chest: "96", waist: "84", height: "172–178" },
  { size: "50", chest: "100", waist: "88", height: "174–180" },
  { size: "52", chest: "104", waist: "92", height: "176–182" },
  { size: "54", chest: "108", waist: "96", height: "178–184" },
  { size: "56", chest: "112", waist: "100", height: "180–186" },
];

const ICONS: Record<Topic, typeof Truck> = {
  delivery: Truck,
  returns: RotateCcw,
  "size-guide": Ruler,
  privacy: Shield,
  terms: FileText,
};

function topicFromPath(path: string): Topic {
  if (path.includes("returns")) return "returns";
  if (path.includes("size-guide")) return "size-guide";
  if (path.includes("privacy")) return "privacy";
  if (path.includes("terms")) return "terms";
  return "delivery";
}

export default function InfoPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const topic = topicFromPath(pathname);
  const Icon = ICONS[topic];

  return (
    <div className="container-page max-w-3xl py-12">
      <Reveal>
        <Link to="/" className="tap mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> {t("nav.home")}
        </Link>

        <div className="mb-10 border-b border-foreground/10 pb-8">
          <p className="flex items-center gap-2.5 text-[0.7rem] uppercase tracking-[0.3em] text-gold">
            <span className="h-px w-8 bg-gold" />
            {t(`info.${topic}.eyebrow`)}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <Icon className="h-6 w-6" />
            </span>
            <h1 className="font-serif text-4xl font-light text-charcoal lg:text-5xl">{t(`info.${topic}.title`)}</h1>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="glass-card rounded-[0.6rem] p-7 lg:p-9">
          {topic === "delivery" && (
            <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
              <Para title={t("info.delivery.p1Title")}>{t("info.delivery.p1")}</Para>
              <Para title={t("info.delivery.p2Title")}>{t("info.delivery.p2")}</Para>
              <Para title={t("info.delivery.p3Title")}>{t("info.delivery.p3")}</Para>
              <Para title={t("info.delivery.p4Title")}>{t("info.delivery.p4")}</Para>
            </div>
          )}

          {topic === "returns" && (
            <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
              <Para title={t("info.returns.p1Title")}>{t("info.returns.p1")}</Para>
              <Para title={t("info.returns.p2Title")}>{t("info.returns.p2")}</Para>
              <Para title={t("info.returns.p3Title")}>{t("info.returns.p3")}</Para>
              <Para title={t("info.returns.p4Title")}>{t("info.returns.p4")}</Para>
            </div>
          )}

          {topic === "size-guide" && (
            <div>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                {t("info.sizeGuide.intro")}
              </p>
              <div className="overflow-hidden rounded-2xl border border-foreground/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-foreground/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-semibold">{t("filters.size")}</th>
                      <th className="px-4 py-3 font-semibold">{t("sizeGuide.chest")}</th>
                      <th className="px-4 py-3 font-semibold">{t("sizeGuide.waist")}</th>
                      <th className="px-4 py-3 font-semibold">{t("info.sizeGuide.height")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/8">
                    {SIZES.map((r) => (
                      <tr key={r.size} className="transition-colors hover:bg-foreground/5">
                        <td className="px-4 py-3 font-semibold text-charcoal">{r.size}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.chest} sm</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.waist} sm</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.height} sm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {topic === "privacy" && (
            <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
              <Para title={t("info.privacy.p1Title")}>{t("info.privacy.p1")}</Para>
              <Para title={t("info.privacy.p2Title")}>{t("info.privacy.p2")}</Para>
              <Para title={t("info.privacy.p3Title")}>{t("info.privacy.p3")}</Para>
            </div>
          )}

          {topic === "terms" && (
            <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
              <Para title={t("info.terms.p1Title")}>{t("info.terms.p1")}</Para>
              <Para title={t("info.terms.p2Title")}>{t("info.terms.p2")}</Para>
              <Para title={t("info.terms.p3Title")}>{t("info.terms.p3")}</Para>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}

function Para({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 font-sans text-sm font-semibold text-charcoal">{title}</h3>
      <p>{children}</p>
    </div>
  );
}
