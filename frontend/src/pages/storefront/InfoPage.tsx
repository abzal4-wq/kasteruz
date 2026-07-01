import { useLocation, Link } from "react-router-dom";
import { Truck, RotateCcw, Ruler, Shield, FileText, ArrowLeft } from "lucide-react";
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

const META: Record<Topic, { icon: typeof Truck; title: string; eyebrow: string }> = {
  delivery:     { icon: Truck,     title: "Yetkazib berish", eyebrow: "Xizmat" },
  returns:      { icon: RotateCcw, title: "Qaytarish va almashtirish", eyebrow: "Xizmat" },
  "size-guide": { icon: Ruler,     title: "O'lcham jadvali", eyebrow: "Yordam" },
  privacy:      { icon: Shield,    title: "Maxfiylik siyosati", eyebrow: "Huquqiy" },
  terms:        { icon: FileText,  title: "Foydalanish shartlari", eyebrow: "Huquqiy" },
};

function topicFromPath(path: string): Topic {
  if (path.includes("returns")) return "returns";
  if (path.includes("size-guide")) return "size-guide";
  if (path.includes("privacy")) return "privacy";
  if (path.includes("terms")) return "terms";
  return "delivery";
}

export default function InfoPage() {
  const { pathname } = useLocation();
  const topic = topicFromPath(pathname);
  const meta = META[topic];
  const Icon = meta.icon;

  return (
    <div className="container-page max-w-3xl py-12">
      <Reveal>
        <Link to="/" className="tap mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> Bosh sahifa
        </Link>

        <div className="mb-10 border-b border-foreground/10 pb-8">
          <p className="flex items-center gap-2.5 text-[0.7rem] uppercase tracking-[0.3em] text-gold">
            <span className="h-px w-8 bg-gold" />
            {meta.eyebrow}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <Icon className="h-6 w-6" />
            </span>
            <h1 className="font-serif text-4xl font-light text-charcoal lg:text-5xl">{meta.title}</h1>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="glass-card rounded-[0.6rem] p-7 lg:p-9">
          {topic === "delivery" && (
            <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
              <Para title="Toshkent bo'ylab">1–2 ish kuni ichida kuryer orqali yetkazib beramiz. Narxi — 25 000 so'm.</Para>
              <Para title="Bepul yetkazish">500 000 so'mdan yuqori xaridlarда yetkazib berish butunlay bepul.</Para>
              <Para title="Viloyatlarga">BTS yoki Pochta orqali 2–5 ish kunida. Narx hudud va og'irlikka qarab hisoblanadi.</Para>
              <Para title="Olib ketish">Abu Sahiy bozoridagi do'konimizdan o'zingiz bepul olib ketishingiz mumkin.</Para>
            </div>
          )}

          {topic === "returns" && (
            <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
              <Para title="7 kun muddat">Mahsulotni qabul qilganingizdan so'ng 7 kun ichida qaytarishingiz mumkin.</Para>
              <Para title="Shartlar">Mahsulot asl holatда, kiyilmagan, etiketkasi va o'rami bilan bo'lishi kerak.</Para>
              <Para title="Almashtirish">O'lcham yoki rang mos kelmasa — bepul almashtiramiz (mavjud bo'lsa).</Para>
              <Para title="Pulni qaytarish">Qaytarish tasdiqlangach, 3–5 ish kunida to'liq summa qaytariladi.</Para>
            </div>
          )}

          {topic === "size-guide" && (
            <div>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                O'lchamlar santimetrда. Aniq mos kelishi uchun ko'krak va bel aylanasini o'lchang.
              </p>
              <div className="overflow-hidden rounded-2xl border border-foreground/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-foreground/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-semibold">O'lcham</th>
                      <th className="px-4 py-3 font-semibold">Ko'krak</th>
                      <th className="px-4 py-3 font-semibold">Bel</th>
                      <th className="px-4 py-3 font-semibold">Bo'y</th>
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
              <Para title="Ma'lumotlar himoyasi">Shaxsiy ma'lumotlaringiz (ism, telefon, manzil) faqat buyurtmani yetkazish uchun ishlatiladi.</Para>
              <Para title="Uchinchi tomon">Ma'lumotlaringiz uchinchi shaxslarga sotilmaydi yoki berilmaydi.</Para>
              <Para title="Xavfsizlik">Barcha ma'lumotlar shifrlangan holда saqlanadi va himoyalangan.</Para>
            </div>
          )}

          {topic === "terms" && (
            <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
              <Para title="Umumiy">Saytdan foydalanish orqali ushbu shartlarga rozilik bildirasiz.</Para>
              <Para title="Buyurtma">Buyurtma berilgach, operatorlarimiz tasdiqlash uchun bog'lanadi.</Para>
              <Para title="Narxlar">Narxlar oldindan ogohlantirishsiz o'zgartirilishi mumkin.</Para>
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
