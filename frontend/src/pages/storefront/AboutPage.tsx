import { Link } from "react-router-dom";
import {
  MapPin, Phone, Clock, Award, Scissors, Truck, ArrowRight, Instagram, Send,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useStoreContact, telHref } from "@/hooks/useStoreContact";

const STAT_KEYS = ["experience", "clients", "models", "sizes"] as const;
const VALUE_ICONS = [Scissors, Award, Truck];

export default function AboutPage() {
  const { t } = useTranslation();
  const { data: contact } = useStoreContact();
  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative mx-3 mt-3 overflow-hidden rounded-ios-lg bg-[#0f0b07] shadow-float lg:mx-4">
        <div className="container-page relative z-10 py-20 text-center">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold">
            {t("about.eyebrow")}
          </p>
          <h1 className="mx-auto mt-5 max-w-2xl font-serif text-4xl font-light leading-tight text-cream md:text-6xl">
            {t("about.heroTitle")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-cream/70">
            {t("about.heroText")}
          </p>
        </div>
      </section>

      {/* ─── Statistika ───────────────────────────────────── */}
      <section className="container-page py-12">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {STAT_KEYS.map((k) => (
            <div key={k} className="glass-card rounded-ios p-6 text-center">
              <p className="font-serif text-3xl font-medium text-gold">{t(`about.stats.${k}.value`)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t(`about.stats.${k}.label`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Afzalliklar ──────────────────────────────────── */}
      <section className="container-page py-4">
        <div className="glass-card grid grid-cols-1 gap-8 rounded-ios-lg p-10 text-center md:grid-cols-3">
          {["quality", "delivery", "fit"].map((k) => (
            <div key={k}>
              <h3 className="font-serif text-lg font-medium text-charcoal">
                {t(`about.perks.${k}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(`about.perks.${k}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bizning hikoya ───────────────────────────────── */}
      <section className="container-page py-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-ios-lg shadow-glass">
            <img
              src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=900&q=80&auto=format&fit=crop"
              alt={t("about.workshopAlt")}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="font-sans text-xs uppercase tracking-widest text-gold">
              {t("about.storyEyebrow")}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-light text-charcoal">
              {t("about.storyTitle")}
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>{t("about.storyP1")}</p>
              <p>{t("about.storyP2")}</p>
              <p>{t("about.storyP3")}</p>
            </div>
            <Button asChild className="mt-7">
              <Link to="/catalog">
                {t("about.viewCollection")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Qadriyatlar ──────────────────────────────────── */}
      <section className="container-page py-12">
        <div className="mb-8 text-center">
          <p className="font-sans text-xs uppercase tracking-widest text-gold">
            {t("about.whyUsEyebrow")}
          </p>
          <h2 className="mt-2 font-serif text-3xl font-light text-charcoal">
            {t("about.valuesTitle")}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {["craft", "quality", "delivery"].map((k, i) => {
            const Icon = VALUE_ICONS[i];
            return (
              <div key={k} className="glass-card rounded-ios p-7 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
                  <Icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-medium text-charcoal">
                  {t(`about.values.${k}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`about.values.${k}.text`)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Manzil va aloqa ──────────────────────────────── */}
      <section className="container-page pb-16 pt-8">
        <div className="glass-card overflow-hidden rounded-ios-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-10">
              <h2 className="font-serif text-2xl font-light text-charcoal">
                {t("about.findUs")}
              </h2>
              <ul className="mt-6 space-y-5 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gold/15">
                    <MapPin className="h-5 w-5 text-gold" />
                  </span>
                  <div>
                    <p className="font-medium text-charcoal">{t("about.address")}</p>
                    <p className="text-muted-foreground">
                      {contact?.address ?? "Toshkent, Abu Sahiy bozori"}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gold/15">
                    <Phone className="h-5 w-5 text-gold" />
                  </span>
                  <div>
                    <p className="font-medium text-charcoal">{t("checkout.phone")}</p>
                    <a href={telHref(contact?.phone ?? "")} className="text-muted-foreground hover:text-gold">
                      {contact?.phone ?? "+998 90 123 45 67"}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gold/15">
                    <Clock className="h-5 w-5 text-gold" />
                  </span>
                  <div>
                    <p className="font-medium text-charcoal">{t("about.hours")}</p>
                    <p className="text-muted-foreground">{contact?.hours ?? "Har kuni 9:00 – 20:00"}</p>
                  </div>
                </li>
              </ul>

              <div className="mt-7 flex gap-3">
                {contact?.instagram && (
                  <a
                    href={`https://instagram.com/${contact.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap flex h-11 w-11 items-center justify-center rounded-full glass text-charcoal hover:text-gold"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {contact?.telegram && (
                  <a
                    href={`https://t.me/${contact.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap flex h-11 w-11 items-center justify-center rounded-full glass text-charcoal hover:text-gold"
                    aria-label="Telegram"
                  >
                    <Send className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            <div className="min-h-[280px] bg-white/5">
              <iframe
                title={t("about.mapTitle")}
                src="https://www.openstreetmap.org/export/embed.html?bbox=69.2,41.29,69.26,41.33&layer=mapnik"
                className="h-full min-h-[280px] w-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
