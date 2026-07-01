import { Link } from "react-router-dom";
import { Instagram, Send, Phone, MapPin, Mail, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/brand/Logo";
import { useStoreContact, telHref } from "@/hooks/useStoreContact";

export function Footer() {
  const { t } = useTranslation();
  const { data: contact } = useStoreContact();

  return (
    <footer className="footer-dark mx-3 mb-3 mt-14 rounded-ios-lg text-cream lg:mx-4 lg:mt-20">
      <div className="container-page py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brend */}
          <div className="col-span-2 lg:col-span-1">
            <Logo variant="light" className="items-start" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
              {contact?.about || t("footer.aboutText")}
            </p>
            <div className="mt-6 flex gap-3">
              {contact?.instagram && (
                <a
                  href={`https://instagram.com/${contact.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center border border-cream/20 transition-colors hover:border-gold hover:text-gold"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {contact?.telegram && (
                <a
                  href={`https://t.me/${contact.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center border border-cream/20 transition-colors hover:border-gold hover:text-gold"
                  aria-label="Telegram"
                >
                  <Send className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Katalog */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-gold">
              {t("footer.catalog")}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
              <li><Link to="/catalog/kostyumlar" className="hover:text-gold">{t("nav.suits")}</Link></li>
              <li><Link to="/catalog/shimlar" className="hover:text-gold">{t("nav.pants")}</Link></li>
              <li><Link to="/catalog/koylaklar" className="hover:text-gold">{t("nav.shirts")}</Link></li>
              <li><Link to="/catalog/aksessuarlar" className="hover:text-gold">{t("nav.accessories")}</Link></li>
            </ul>
          </div>

          {/* Yordam */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-gold">
              {t("footer.help")}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
              <li><Link to="/delivery" className="hover:text-gold">{t("footer.delivery")}</Link></li>
              <li><Link to="/returns" className="hover:text-gold">{t("footer.returns")}</Link></li>
              <li><Link to="/size-guide" className="hover:text-gold">{t("footer.sizeGuide")}</Link></li>
              <li><Link to="/about" className="hover:text-gold">Biz haqimizda</Link></li>
            </ul>
          </div>

          {/* Aloqa */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-gold">
              {t("footer.contacts")}
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-cream/70">
              {contact?.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
                  {contact.map_url ? (
                    <a href={contact.map_url} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                      {contact.address}
                    </a>
                  ) : (
                    <span>{contact.address}</span>
                  )}
                </li>
              )}
              {contact?.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 flex-shrink-0 text-gold" />
                  <a href={telHref(contact.phone)} className="hover:text-gold">{contact.phone}</a>
                </li>
              )}
              {contact?.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 flex-shrink-0 text-gold" />
                  <a href={`mailto:${contact.email}`} className="hover:text-gold">{contact.email}</a>
                </li>
              )}
              {contact?.hours && (
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 flex-shrink-0 text-gold" />
                  <span>{contact.hours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-5 border-t border-cream/10 pt-6 md:flex-row md:justify-between">
          <span className="text-xs text-cream/50">{t("footer.rights")}</span>
          <div className="flex items-center gap-2">
            {["Payme", "Click", "Uzum", "Humo"].map((c) => (
              <span
                key={c}
                className="rounded border border-cream/15 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.15em] text-cream/55"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
