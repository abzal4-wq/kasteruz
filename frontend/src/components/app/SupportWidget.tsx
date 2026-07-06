import { useState } from "react";
import { MessageCircle, X, Phone, Send } from "lucide-react";
import { useStoreContact, telHref } from "@/hooks/useStoreContact";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

// Suzuvchi qo'llab-quvvatlash tugmasi — Telegram / WhatsApp / Qo'ng'iroq
export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const { data: contact } = useStoreContact();

  const phoneDigits = (contact?.phone ?? "").replace(/[^\d]/g, "");
  const telegram = (contact?.telegram ?? "").replace(/^@/, "");

  const channels = [
    telegram && {
      label: "Telegram",
      href: `https://t.me/${telegram}`,
      icon: Send,
      color: "bg-[#229ED9]",
      external: true,
    },
    phoneDigits && {
      label: "WhatsApp",
      href: `https://wa.me/${phoneDigits}`,
      icon: MessageCircle,
      color: "bg-[#25D366]",
      external: true,
    },
    contact?.phone && {
      label: "Qo'ng'iroq",
      href: telHref(contact.phone),
      icon: Phone,
      color: "bg-gold",
      external: false,
    },
  ].filter(Boolean) as {
    label: string;
    href: string;
    icon: typeof Send;
    color: string;
    external: boolean;
  }[];

  return (
    <div className="fab-lift fixed bottom-28 left-4 z-40 flex flex-col items-start gap-3 transition-[bottom] duration-300 lg:bottom-6">
      {/* Kanallar */}
      {open && (
        <div className="flex animate-[scale-in_0.2s_ease-out] flex-col gap-2.5">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              onClick={() => {
                haptic("light");
                setOpen(false);
              }}
              className="group flex items-center gap-3"
            >
              <span className={cn("flex h-11 w-11 items-center justify-center rounded-full text-white shadow-float", c.color)}>
                <c.icon className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-charcoal px-3 py-1.5 text-xs font-medium text-white shadow-glass-sm">
                {c.label}
              </span>
            </a>
          ))}
        </div>
      )}

      {/* Asosiy tugma */}
      <button
        onClick={() => {
          haptic("medium");
          setOpen((o) => !o);
        }}
        aria-label={open ? "Yopish" : "Yordam"}
        className={cn(
          "tap flex h-14 w-14 items-center justify-center rounded-full text-white shadow-float transition-all duration-300 hover:scale-105",
          open ? "rotate-90 bg-charcoal" : "bg-gold"
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
