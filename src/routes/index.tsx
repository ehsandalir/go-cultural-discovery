import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { useI18n } from "@/lib/i18n";
import { MODULES } from "@/lib/modules";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GO — Your films, books and music" },
      { name: "description", content: "Discover films, books and music you enjoy in GO." },
      { property: "og:title", content: "GO — Discover culture by vibe" },
      { property: "og:description", content: "Choose the cultural works you genuinely enjoy. GO begins with your choices." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  return (
    <>
      <section className="relative -mx-5 overflow-hidden">
        <img src={hero} alt="" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="bg-hero-fade absolute inset-0" />
        <div className="relative px-5 pb-16 pt-28 md:pb-24 md:pt-44">
          <p className="mb-4 text-sm tracking-widest text-primary">
            {t({ fa: "فیلم · کتاب · موسیقی", en: "Films · Books · Music" })}
          </p>
          <h1 className="max-w-2xl text-4xl font-bold md:text-6xl">
            {t({ fa: "از چیزهایی شروع کن که واقعاً دوست داری", en: "Start with what you genuinely love" })}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            {t({ fa: "فیلم‌ها، کتاب‌ها و آهنگ‌هایی را انتخاب کن که با آن‌ها ارتباط داری. هیچ پاسخ درست یا غلطی وجود ندارد.", en: "Choose the films, books and songs that matter to you. There are no right or wrong answers." })}
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full shadow-glow">
            <Link to="/discover">
              <Sparkles className="size-4" />
              {t({ fa: "انتخاب‌هایم را شروع کنم", en: "Start choosing" })}
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-12">
        <h2 className="mb-6 text-2xl font-semibold">{t({ fa: "چه چیزی دوست داری؟", en: "What do you enjoy?" })}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {MODULES.map((m) => (
            <Link
              key={m.id}
              to="/explore/$module"
              params={{ module: m.id }}
              className="group rounded-2xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-glow"
            >
              <m.icon className="size-7 text-primary" />
              <div className="mt-6 text-xs text-muted-foreground" dir="ltr">{m.brand}</div>
              <div className="text-xl font-semibold">{t(m.name)}</div>
              <p className="mt-1 text-sm text-muted-foreground">{t(m.tagline)}</p>
              <ArrowLeft className="mt-4 size-4 text-muted-foreground transition-transform group-hover:text-primary ltr:rotate-180" />
            </Link>
          ))}
        </div>
      </section>

      <section className="pb-16">
        <div className="rounded-2xl border bg-card/60 p-6 md:p-8">
          <h2 className="text-xl font-semibold">{t({ fa: "این انتخاب‌ها فقط برای تو هستند", en: "These choices are yours" })}</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t({ fa: "نه لازم است همه‌چیز را بشناسی، نه لازم است چیزی را انتخاب کنی که دیگران تأیید می‌کنند. فقط همان‌هایی را بزن که واقعاً دوستشان داری.", en: "You don’t have to know everything or choose what other people approve of. Just pick the things you actually enjoy." })}
          </p>
        </div>
      </section>
    </>
  );
}
