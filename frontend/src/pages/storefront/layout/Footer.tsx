import { Link } from "react-router-dom";
import { Instagram, Send, Phone, MapPin, Mail, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LogoCrest } from "@/components/brand/Logo";
import { useStoreContact, telHref } from "@/hooks/useStoreContact";

export function Footer() {
  const { t } = useTranslation();
  const { data: contact } = useStoreContact();

  return (
    <footer className="container-page mt-8 pb-6 sm:mt-14 sm:pb-8 lg:mt-20">
      <div className="frame-double px-4 py-7 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
        {/* Blanka boshi — gerb + wordmark */}
        <div className="text-center">
          <LogoCrest size={30} className="mx-auto text-gold" />
          <div className="mt-2.5 font-display text-lg font-semibold uppercase tracking-[0.32em] text-charcoal sm:mt-4 sm:text-3xl sm:tracking-[0.4em]">
            Kaster
          </div>
          <div className="mt-1.5 text-[0.5rem] uppercase tracking-[0.34em] text-gold sm:mt-2 sm:text-[0.56rem] sm:tracking-[0.44em]">
            Sartoria · Est. MMXXIV · Toshkent
          </div>
          <p className="mx-auto mt-3.5 max-w-md font-serif text-[0.88rem] italic leading-relaxed text-charcoal-500 sm:mt-5 sm:text-base">
            {contact?.about || t("footer.aboutText")}
          </p>
          <div className="mt-5 flex justify-center gap-3 sm:mt-6">
            {contact?.instagram && (
              <a
                href={`https://instagram.com/${contact.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center border border-charcoal/25 text-charcoal transition-colors hover:border-gold hover:text-gold sm:h-10 sm:w-10"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
              </a>
            )}
            {contact?.telegram && (
              <a
                href={`https://t.me/${contact.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center border border-charcoal/25 text-charcoal transition-colors hover:border-gold hover:text-gold sm:h-10 sm:w-10"
                aria-label="Telegram"
              >
                <Send className="h-4 w-4" strokeWidth={1.5} />
              </a>
            )}
          </div>
        </div>

        {/* Ornament ajratkich */}
        <div className="my-6 flex items-center gap-3 sm:my-10 lg:my-12">
          <div className="h-px flex-1 bg-charcoal/15" />
          <span className="text-[0.5rem] text-gold">◆</span>
          <div className="h-px flex-1 bg-charcoal/15" />
        </div>

        {/* Uch ustun — reestr (mobilda 2 ustun, aloqa pastda to'liq) */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 text-left sm:grid-cols-3 sm:gap-10">
          {/* Katalog */}
          <div>
            <h4 className="text-[0.58rem] uppercase tracking-[0.26em] text-gold sm:text-[0.62rem] sm:tracking-[0.3em]">
              {t("footer.catalog")}
            </h4>
            <ul className="mt-2.5 space-y-1.5 font-serif text-[0.88rem] text-charcoal-600 sm:mt-4 sm:space-y-2.5 sm:text-[1.02rem]">
              <li><Link to="/catalog/kostyumlar" className="transition-colors hover:text-gold">{t("nav.suits")}</Link></li>
              <li><Link to="/catalog/shimlar" className="transition-colors hover:text-gold">{t("nav.pants")}</Link></li>
              <li><Link to="/catalog/koylaklar" className="transition-colors hover:text-gold">{t("nav.shirts")}</Link></li>
              <li><Link to="/catalog/aksessuarlar" className="transition-colors hover:text-gold">{t("nav.accessories")}</Link></li>
            </ul>
          </div>

          {/* Yordam */}
          <div>
            <h4 className="text-[0.58rem] uppercase tracking-[0.26em] text-gold sm:text-[0.62rem] sm:tracking-[0.3em]">
              {t("footer.help")}
            </h4>
            <ul className="mt-2.5 space-y-1.5 font-serif text-[0.88rem] text-charcoal-600 sm:mt-4 sm:space-y-2.5 sm:text-[1.02rem]">
              <li><Link to="/delivery" className="transition-colors hover:text-gold">{t("footer.delivery")}</Link></li>
              <li><Link to="/returns" className="transition-colors hover:text-gold">{t("footer.returns")}</Link></li>
              <li><Link to="/size-guide" className="transition-colors hover:text-gold">{t("footer.sizeGuide")}</Link></li>
              <li><Link to="/about" className="transition-colors hover:text-gold">Maison haqida</Link></li>
            </ul>
          </div>

          {/* Aloqa */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-[0.58rem] uppercase tracking-[0.26em] text-gold sm:text-[0.62rem] sm:tracking-[0.3em]">
              {t("footer.contacts")}
            </h4>
            <ul className="mt-3 space-y-2.5 text-[0.82rem] text-charcoal-600 sm:mt-4 sm:space-y-3 sm:text-sm">
              {contact?.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" strokeWidth={1.5} />
                  {contact.map_url ? (
                    <a href={contact.map_url} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gold">
                      {contact.address}
                    </a>
                  ) : (
                    <span>{contact.address}</span>
                  )}
                </li>
              )}
              {contact?.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 flex-shrink-0 text-gold" strokeWidth={1.5} />
                  <a href={telHref(contact.phone)} className="transition-colors hover:text-gold">{contact.phone}</a>
                </li>
              )}
              {contact?.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 flex-shrink-0 text-gold" strokeWidth={1.5} />
                  <a href={`mailto:${contact.email}`} className="transition-colors hover:text-gold">{contact.email}</a>
                </li>
              )}
              {contact?.hours && (
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 flex-shrink-0 text-gold" strokeWidth={1.5} />
                  <span>{contact.hours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Blanka etagi */}
        <div className="mt-7 border-t border-charcoal/15 pt-4 sm:mt-12 sm:pt-6">
          <div className="flex flex-col items-center gap-3.5 sm:gap-4 md:flex-row md:justify-between">
            <span className="text-[0.62rem] tracking-wide text-charcoal-400 sm:text-[0.66rem]">{t("footer.rights")}</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {["Payme", "Click", "Uzum", "Humo"].map((c) => (
                <span
                  key={c}
                  className="border border-charcoal/15 px-2 py-0.5 text-[0.52rem] uppercase tracking-[0.14em] text-charcoal-400 sm:px-2.5 sm:py-1 sm:text-[0.56rem] sm:tracking-[0.16em]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
