import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PersonalRoomHero } from "@/components/go/personal-room";
import { useI18n } from "@/lib/i18n";
import { MODULES } from "@/lib/modules";
import { QUADRANTS, VIBES } from "@/lib/vibes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GO — Discover culture by vibe" },
      {
        name: "description",
        content:
          "GO is a Persian-first super app to discover films, books and music by emotional vibe.",
      },
      { property: "og:title", content: "GO — Discover culture by vibe" },
      {
        property: "og:description",
        content: "Discover → Feel → Understand → Create. Films, books and music by vibe.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  return (
    <>
      <PersonalRoomHero />

      <section className="py-12">
        <h2 className="mb-6 text-2xl font-semibold">{t({ fa: "دنیاهای GO", en: "GO worlds" })}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {MODULES.map((m) => (
            <Link
              key={m.id}
              to="/explore/$module"
              params={{ module: m.id }}
              className="group rounded-2xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-glow"
            >
              <m.icon className="size-7 text-primary" />
              <div className="mt-6 text-xs text-muted-foreground" dir="ltr">
                {m.brand}
              </div>
              <div className="text-xl font-semibold">{t(m.name)}</div>
              <p className="mt-1 text-sm text-muted-foreground">{t(m.tagline)}</p>
              <ArrowLeft className="mt-4 size-4 text-muted-foreground transition-transform group-hover:text-primary ltr:rotate-180" />
            </Link>
          ))}
        </div>
      </section>

      <section className="pb-16">
        <h2 className="text-2xl font-semibold">
          {t({ fa: "۲۴ وایب، چهار قلمرو", en: "24 vibes, four realms" })}
        </h2>
        <p className="mb-6 mt-1 text-muted-foreground">
          {t({
            fa: "یک زبان احساسی مشترک برای فیلم، کتاب و موسیقی.",
            en: "One shared emotional language for film, books and music.",
          })}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUADRANTS.map((q) => (
            <Link
              key={q.id}
              to="/discover"
              search={{ vibe: VIBES.find((v) => v.quadrant === q.id)!.id }}
              className="rounded-2xl border bg-card p-5 hover:border-primary/50"
            >
              <div className={`mb-3 h-1 w-10 rounded-full ${q.bgClass}`} />
              <div className={`font-semibold ${q.colorClass}`}>{t(q.name)}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                {VIBES.filter((v) => v.quadrant === q.id)
                  .slice(0, 3)
                  .map((v) => t(v.name))
                  .join(" · ")}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
