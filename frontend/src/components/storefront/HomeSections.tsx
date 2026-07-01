import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Scissors, Layers, Truck, ShieldCheck, ArrowRight, Check } from "lucide-react";
import { Reveal } from "@/components/app/Reveal";
import { CardSlider } from "@/components/storefront/CardSlider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Luxury primitivlar ──────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-gold" />
      <span className="font-sans text-[0.7rem] uppercase tracking-[0.3em] text-gold">{children}</span>
    </div>
  );
}

export function GoldDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-px w-full", className)}
      style={{ background: "linear-gradient(90deg, transparent, rgb(var(--brand-400)/0.5), transparent)" }}
    />
  );
}

function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(rating) ? "fill-gold text-gold" : "text-charcoal-300"}
        />
      ))}
    </div>
  );
}

// ─── "Kaster kafolati" (Atelier Standard) ────────────────────
const FEATURES = [
  { icon: Layers, title: "Premium matolar", desc: "Italyan juni, ipak va kashmir — eng sara tolalardan tikilgan kiyimlar." },
  { icon: Scissors, title: "Mukammal o'lcham", desc: "Har bir kostyum nafis silueti bilan siz uchun bichilgandek o'tiradi." },
  { icon: Truck, title: "Ehtiyotkor yetkazish", desc: "Buyurtmangiz dazmollangan holda, maxsus qadoqlanib yetkaziladi." },
  { icon: ShieldCheck, title: "Sifat kafolati", desc: "Har bir tikuvga javobgarmiz — original Kaster sifati." },
];

export function KasterStandard() {
  return (
    <section className="border-y border-white/5 py-14 lg:py-24">
      <div className="container-page">
        <Reveal className="mb-10 text-center lg:mb-14">
          <div className="flex justify-center"><SectionLabel>Bizning va'damiz</SectionLabel></div>
          <h2 className="mt-4 font-serif text-3xl font-light text-charcoal sm:text-4xl lg:text-5xl">
            Kaster <em className="text-gold not-italic">standarti</em>
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[0.6rem] lg:grid-cols-4"
             style={{ background: "rgb(var(--brand-400)/0.12)" }}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
              <div className="glass-card h-full p-5 transition-transform duration-500 hover:-translate-y-1 sm:p-6 lg:p-8">
                <f.icon className="h-6 w-6 text-gold lg:h-7 lg:w-7" strokeWidth={1.6} />
                <h3 className="mt-4 font-serif text-base font-light text-charcoal sm:text-lg lg:mt-5 lg:text-xl">{f.title}</h3>
                <p className="mt-2 text-[0.8rem] leading-relaxed text-muted-foreground sm:text-sm lg:mt-3">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Brend hikoyasi + statistika ─────────────────────────────
const STATS: [string, string][] = [
  ["500+", "Mamnun mijoz"],
  ["100%", "Original mahsulot"],
  ["5.0", "O'rtacha baho"],
  ["24/7", "Qo'llab-quvvatlash"],
];

export function BrandStory() {
  return (
    <section className="container-page py-16 lg:py-28">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Rasm — mobilda pastroq (landshaft), desktopda portret */}
        <Reveal direction="right">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[0.7rem] shadow-float sm:aspect-[16/9] lg:aspect-[4/5]">
            <img
              src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80&auto=format&fit=crop"
              alt="Kaster ustaxonasi"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent 55%)" }} />
            {/* Suzuvchi statistika kartasi */}
            <div className="absolute -bottom-px right-6 hidden glass-strong rounded-t-[0.5rem] px-7 py-5 lg:block">
              <div className="font-serif text-4xl font-light text-gold">XVI</div>
              <div className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-charcoal-400">Yillik<br />tajriba</div>
            </div>
          </div>
        </Reveal>

        {/* Matn */}
        <Reveal direction="left" delay={100} className="lg:pl-6">
          <SectionLabel>Bizning hikoya</SectionLabel>
          <h2 className="mt-4 font-serif text-3xl font-light leading-[1.12] text-charcoal sm:text-4xl lg:text-5xl">
            Toshkent yuragida<br /><em className="italic text-gold">tug'ilgan nafosat</em>
          </h2>
          <p className="mt-6 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
            Kaster — bu shunchaki kiyim emas, balki erkak salobati va didining ifodasi. Har bir kostyum
            an'anaviy mahorat va zamonaviy uslub uyg'unligida, eng sara matolardan tikiladi.
          </p>
          <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
            Biz uchun har bir mijoz — alohida hikoya. Sizni siz gapirmasingizdan oldin tanitadigan
            kiyim yaratamiz.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 lg:mt-10 lg:gap-y-7">
            {STATS.map(([val, label]) => (
              <div key={label} className="border-l-2 border-gold pl-4">
                <div className="font-serif text-2xl font-light text-gold lg:text-3xl">{val}</div>
                <div className="mt-0.5 text-xs tracking-wide text-charcoal-400">{label}</div>
              </div>
            ))}
          </div>

          <Link
            to="/about"
            className="group mt-8 inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-gold transition-all hover:gap-5 lg:mt-10"
          >
            Biz haqimizda <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Mijozlar sharhlari ──────────────────────────────────────
const REVIEWS = [
  { name: "Jasur A.", role: "Tadbirkor", rating: 5, text: "Kostyum ideal o'tirdi — go'yo men uchun maxsus tikilgandek. Sifat kutganimdan ham yuqori bo'ldi.", avatar: "J" },
  { name: "Bobur M.", role: "IT direktor", rating: 5, text: "To'yim uchun olgan kostyumim mukammal edi. Operatorlar uslub bo'yicha juda yaxshi maslahat berishdi.", avatar: "B" },
  { name: "Sardor K.", role: "Advokat", rating: 5, text: "Mato, tikuv, detallar — hammasi haqiqiy did bilan. Bu mening uchinchi xaridim va oxirgisi emas.", avatar: "S" },
  { name: "Aziz R.", role: "Shifokor", rating: 5, text: "Yetkazib berish tez, qadoqlash chiroyli. Kaster — bu ishonchli brend.", avatar: "A" },
];

export function CustomerReviews() {
  return (
    <section className="py-16 lg:py-28" style={{ background: "rgb(var(--brand-500)/0.05)" }}>
      <div className="container-page">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4 lg:mb-14">
          <div>
            <SectionLabel>Mijozlar fikri</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-light text-charcoal sm:text-4xl lg:text-5xl">
              Janoblar <em className="italic text-gold">e'tirofi</em>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="font-serif text-lg text-gold">5.0</span>
            <span className="text-xs text-muted-foreground">· yuzlab sharh</span>
          </div>
        </Reveal>

        <CardSlider>
          {REVIEWS.map((r) => (
            <div key={r.name} className="w-[82vw] flex-shrink-0 snap-start sm:w-[360px] lg:w-[330px]">
              <div className="glass-card flex h-full flex-col rounded-[0.5rem] p-7">
                <StarRating rating={r.rating} />
                <p className="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground">"{r.text}"</p>
                <GoldDivider className="my-5" />
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full font-serif text-gold"
                        style={{ background: "rgb(var(--brand-400)/0.16)" }}>
                    {r.avatar}
                  </span>
                  <div>
                    <div className="font-serif text-sm text-charcoal">{r.name}</div>
                    <div className="text-[0.7rem] text-charcoal-400">{r.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardSlider>
      </div>
    </section>
  );
}

// ─── Newsletter — "Kaster doirasi" ───────────────────────────
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="container-page py-14 lg:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center"><SectionLabel>Maxsus a'zolik</SectionLabel></div>
        <h2 className="mt-4 font-serif text-3xl font-light text-charcoal sm:text-4xl lg:text-5xl">
          Kaster <em className="text-gold not-italic">doirasi</em>ga qo'shiling
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Yangi kolleksiyalar, maxsus takliflar va shaxsiy uslub maslahatlaridan birinchilardan bo'lib xabardor bo'ling.
        </p>

        {done ? (
          <div className="mt-8 flex items-center justify-center gap-2 text-gold">
            <Check className="h-5 w-5" /> Siz Kaster doirasiga qo'shildingiz!
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setDone(true); }}
            className="mx-auto mt-8 flex max-w-md items-center gap-2 border-b-2 border-gold pb-1"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email manzilingiz"
              className="flex-1 bg-transparent px-2 py-3 text-sm text-charcoal outline-none placeholder:text-charcoal-400"
            />
            <Button type="submit" size="sm" className="rounded-full px-6">Qo'shilish</Button>
          </form>
        )}
      </Reveal>
    </section>
  );
}
