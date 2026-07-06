import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Scissors, Layers, Truck, ShieldCheck, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Reveal } from "@/components/app/Reveal";
import { CardSlider } from "@/components/storefront/CardSlider";
import { LogoCrest } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

// ─── Héritage primitivlar ────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-gold/60" />
      <span className="text-[0.5rem] text-gold">◆</span>
      <span className="font-sans text-[0.66rem] uppercase tracking-[0.32em] text-gold">{children}</span>
      <span className="text-[0.5rem] text-gold">◆</span>
      <span className="h-px w-8 bg-gold/60" />
    </div>
  );
}

// Bo'lim sarlavhasi — Rim raqami + ornament + serif titul
export function SectionHeading({
  numeral,
  eyebrow,
  title,
  sub,
  more,
  align = "center",
}: {
  numeral: string;
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  more?: { to: string; label: string };
  align?: "center" | "left";
}) {
  const centered = align === "center";
  return (
    <div className={cn("relative", centered && "text-center")}>
      <div className={cn("flex items-center gap-2.5 sm:gap-3", centered && "justify-center")}>
        <span className="font-serif text-xs italic text-charcoal-300 sm:text-sm">{numeral}</span>
        <span className="h-px w-6 bg-gold/60 sm:w-8" />
        <span className="font-sans text-[0.58rem] uppercase tracking-[0.28em] text-gold sm:text-[0.64rem] sm:tracking-[0.32em]">{eyebrow}</span>
        <span className="h-px w-6 bg-gold/60 sm:w-8" />
        <span className="font-serif text-xs italic text-charcoal-300 sm:text-sm">{numeral}</span>
      </div>
      <h2 className="mt-2.5 font-serif text-[1.65rem] font-medium leading-tight text-charcoal sm:mt-4 sm:text-5xl lg:text-[3.4rem]">
        {title}
      </h2>
      {sub && (
        <p className={cn("mt-2.5 max-w-md font-serif text-[0.88rem] italic leading-relaxed text-charcoal-500 sm:mt-4 sm:text-base", centered && "mx-auto")}>
          {sub}
        </p>
      )}
      {more && (
        <Link
          to={more.to}
          className={cn(
            "group mt-4 inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.26em] text-charcoal-400 transition-colors hover:text-gold sm:mt-5",
            !centered && "mt-4"
          )}
        >
          {more.label}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      )}
    </div>
  );
}

export function GoldDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgb(var(--brand-400)/0.5))" }} />
      <span className="text-[0.5rem] text-gold/70">◆</span>
      <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgb(var(--brand-400)/0.5), transparent)" }} />
    </div>
  );
}

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(rating) ? "fill-gold text-gold" : "text-charcoal-200"}
        />
      ))}
    </div>
  );
}

// ─── "Atelier qoidalari" (Kaster standarti) ──────────────────
const FEATURES = [
  { icon: Layers, numeral: "I", title: "Premium matolar", desc: "Italyan juni, ipak va kashmir — eng sara tolalardan tikilgan kiyimlar." },
  { icon: Scissors, numeral: "II", title: "Mukammal bichim", desc: "Har bir kostyum nafis silueti bilan siz uchun bichilgandek o'tiradi." },
  { icon: Truck, numeral: "III", title: "Ehtiyotkor yetkazish", desc: "Buyurtmangiz dazmollangan holda, maxsus qadoqlanib yetkaziladi." },
  { icon: ShieldCheck, numeral: "IV", title: "Sifat kafolati", desc: "Har bir tikuvga javobgarmiz — original Kaster sifati." },
];

export function KasterStandard() {
  return (
    <section className="py-8 sm:py-14 lg:py-24">
      <div className="container-page">
        <Reveal className="mb-6 sm:mb-12 lg:mb-16">
          <SectionHeading
            numeral="✦"
            eyebrow="Maison va'dasi"
            title={<>Atelier <em className="italic text-gold">qoidalari</em></>}
          />
        </Reveal>

        <div className="frame-double">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div
                  className={cn(
                    "relative h-full border-charcoal/10 px-3 py-5 text-center sm:px-7 sm:py-9 lg:px-8 lg:py-12",
                    [
                      "",
                      "border-l",
                      "border-t lg:border-l lg:border-t-0",
                      "border-l border-t lg:border-t-0",
                    ][i]
                  )}
                >
                  <div className="font-serif text-xs italic text-charcoal-300 sm:text-sm">{f.numeral}</div>
                  <f.icon className="mx-auto mt-2.5 h-5 w-5 text-gold sm:mt-3 sm:h-6 sm:w-6" strokeWidth={1.2} />
                  <h3 className="mt-2.5 font-serif text-[0.95rem] font-medium leading-snug text-charcoal sm:mt-4 sm:text-xl lg:text-[1.35rem]">{f.title}</h3>
                  <div className="mx-auto mt-2.5 h-px w-8 bg-gold/50 sm:mt-3" />
                  <p className="mt-2.5 text-[0.7rem] leading-relaxed text-muted-foreground sm:mt-3 sm:text-[0.8rem]">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Maison hikoyasi — drop-cap + ramkalangan surat ──────────
const STATS: [string, string][] = [
  ["500+", "Mamnun mijoz"],
  ["100%", "Original mahsulot"],
  ["5.0", "O'rtacha baho"],
  ["24/7", "Qo'llab-quvvatlash"],
];

export function BrandStory() {
  return (
    <section className="container-page py-9 sm:py-16 lg:py-28">
      <div className="grid items-center gap-7 lg:grid-cols-2 lg:gap-20">
        {/* Surat — qog'oz passe-partout ichida (osilgan kartina) */}
        <Reveal direction="right">
          <div className="frame-double p-3 sm:p-4">
            <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[16/9] lg:aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80&auto=format&fit=crop"
                alt="Kaster ustaxonasi"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent 55%)" }} />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <div className="font-serif text-3xl font-medium text-cream lg:text-4xl">XVI</div>
                  <div className="mt-0.5 text-[0.56rem] uppercase tracking-[0.24em] text-cream/70">Yillik tajriba</div>
                </div>
                <LogoCrest size={30} className="text-cream/80" />
              </div>
            </div>
          </div>
        </Reveal>

        {/* Matn — drop-cap bilan */}
        <Reveal direction="left" delay={100}>
          <SectionHeading
            align="left"
            numeral="✦"
            eyebrow="Maison hikoyasi"
            title={<>Toshkent yuragida<br /><em className="italic text-gold">tug'ilgan nafosat</em></>}
          />
          <p className="dropcap mt-5 max-w-lg text-[0.88rem] leading-[1.85] text-muted-foreground sm:mt-7 sm:text-[0.95rem] sm:leading-[1.9]">
            Kaster — bu shunchaki kiyim emas, balki erkak salobati va didining ifodasi. Har bir kostyum
            an'anaviy mahorat va zamonaviy uslub uyg'unligida, eng sara matolardan tikiladi. Biz uchun
            har bir mijoz — alohida hikoya: sizni siz gapirmasingizdan oldin tanitadigan kiyim yaratamiz.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 sm:mt-9 sm:gap-x-8 sm:gap-y-7">
            {STATS.map(([val, label], i) => (
              <div key={label}>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-serif text-xs italic text-charcoal-300">{["I", "II", "III", "IV"][i]}</span>
                  <span className="font-serif text-lg font-medium text-charcoal sm:text-2xl lg:text-3xl">{val}</span>
                </div>
                <div className="mt-1.5 stitch-h w-16" />
                <div className="mt-1.5 text-[0.58rem] uppercase tracking-[0.16em] text-charcoal-400 sm:text-[0.62rem] sm:tracking-[0.18em]">{label}</div>
              </div>
            ))}
          </div>

          <Link
            to="/about"
            className="group mt-6 inline-flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.24em] text-gold transition-all hover:gap-5 sm:mt-10 sm:text-[0.66rem]"
          >
            To'liq hikoya <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Janoblar e'tirofi (sharhlar) ────────────────────────────
const REVIEWS = [
  { name: "Jasur A.", role: "Tadbirkor", rating: 5, text: "Kostyum ideal o'tirdi — go'yo men uchun maxsus tikilgandek. Sifat kutganimdan ham yuqori bo'ldi." },
  { name: "Bobur M.", role: "IT direktor", rating: 5, text: "To'yim uchun olgan kostyumim mukammal edi. Uslub bo'yicha juda yaxshi maslahat berishdi." },
  { name: "Sardor K.", role: "Advokat", rating: 5, text: "Mato, tikuv, detallar — hammasi haqiqiy did bilan. Bu mening uchinchi xaridim va oxirgisi emas." },
  { name: "Aziz R.", role: "Shifokor", rating: 5, text: "Yetkazib berish tez, qadoqlash chiroyli. Kaster — bu ishonchli maison." },
];

export function CustomerReviews() {
  return (
    <section className="py-9 sm:py-16 lg:py-28" style={{ background: "rgb(var(--brand-500)/0.045)" }}>
      <div className="container-page">
        <Reveal className="mb-6 sm:mb-12 lg:mb-16">
          <SectionHeading
            numeral="✦"
            eyebrow="Mijozlar kitobi"
            title={<>Janoblar <em className="italic text-gold">e'tirofi</em></>}
            sub="Beshdan besh — yuzlab minnatdor janobning dastxati."
          />
        </Reveal>

        <CardSlider>
          {REVIEWS.map((r, i) => (
            <div key={r.name} className="w-[70vw] flex-shrink-0 snap-start sm:w-[360px] lg:w-[330px]">
              <div className="frame-double flex h-full flex-col p-4 sm:p-8">
                <div className="flex items-start justify-between">
                  <span className="font-serif text-4xl font-medium leading-[0.6] text-gold/40 sm:text-6xl">"</span>
                  <span className="font-serif text-xs italic text-charcoal-300">{["I", "II", "III", "IV"][i]}</span>
                </div>
                <p className="mt-2.5 flex-1 font-serif text-[0.88rem] font-light italic leading-relaxed text-charcoal-600 sm:mt-4 sm:text-[1.05rem]">
                  {r.text}
                </p>
                <GoldDivider className="my-4 sm:my-6" />
                <div className="text-center">
                  <div className="font-serif text-base font-medium text-charcoal sm:text-lg">{r.name}</div>
                  <div className="mt-0.5 text-[0.56rem] uppercase tracking-[0.2em] text-charcoal-400 sm:text-[0.6rem] sm:tracking-[0.22em]">{r.role}</div>
                  <div className="mt-2 flex justify-center sm:mt-2.5"><StarRating rating={r.rating} /></div>
                </div>
              </div>
            </div>
          ))}
        </CardSlider>
      </div>
    </section>
  );
}

// ─── Taklifnoma — "Kaster doirasi" ───────────────────────────
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="container-page py-8 sm:py-14 lg:py-24">
      <Reveal>
        <div className="frame-double mx-auto max-w-3xl px-4 py-8 text-center sm:px-12 sm:py-12 lg:py-16">
          <LogoCrest size={30} className="mx-auto text-gold" />
          <p className="mt-3.5 text-[0.56rem] uppercase tracking-[0.3em] text-gold sm:mt-5 sm:text-[0.62rem] sm:tracking-[0.34em]">Taklifnoma</p>
          <h2 className="mt-2 font-serif text-[1.45rem] font-medium leading-tight text-charcoal sm:mt-3 sm:text-4xl lg:text-[2.9rem]">
            Kaster <em className="italic text-gold">doirasi</em>ga qo'shiling
          </h2>
          <p className="mx-auto mt-2.5 max-w-md font-serif text-[0.88rem] italic leading-relaxed text-charcoal-500 sm:mt-4 sm:text-base">
            Yangi kolleksiyalar, yopiq takliflar va shaxsiy uslub maslahatlari — faqat doira a'zolari uchun.
          </p>

          {done ? (
            <div className="mt-6 flex items-center justify-center gap-2 font-serif text-lg italic text-gold sm:mt-9">
              <Check className="h-5 w-5" /> Xush kelibsiz — siz endi doiradasiz.
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setDone(true); }}
              className="mx-auto mt-6 flex max-w-md flex-col items-stretch gap-3 sm:mt-9 sm:flex-row sm:items-end sm:gap-4"
            >
              <div className="flex-1 border-b border-charcoal/30 transition-colors focus-within:border-gold">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email manzilingiz"
                  className="w-full bg-transparent px-1 py-3 text-center font-serif text-base italic text-charcoal outline-none placeholder:text-charcoal-300 sm:text-left"
                />
              </div>
              <button type="submit" className="btn-press tap px-7 py-3 text-[0.6rem] font-semibold uppercase tracking-[0.24em] sm:px-8 sm:py-3.5 sm:text-[0.62rem]">
                Qo'shilish
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}
