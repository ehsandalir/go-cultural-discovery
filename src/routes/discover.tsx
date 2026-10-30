import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Dna, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { QUADRANTS, VIBES, getVibe, DNA_DIMENSIONS } from "@/lib/vibes";
import { DEMO_WORKS, MODULES } from "@/lib/modules";
import { VibeChip, VibeTag, SpectrumMap } from "@/components/go/vibe";
import { DemoBadge, PageHeader, PhaseBadge } from "@/components/go/shell";

type Search = { vibe?: string };

export const Route = createFileRoute("/discover")({
  validateSearch: (s: Record<string, unknown>): Search =>
    typeof s['vibe'] === "string" && getVibe(s['vibe']) ? { vibe: s['vibe'] } : {},
  head: () => ({
    meta: [
      { title: "Discover by Vibe — GO" },
      { name: "description", content: "Choose one of 24 emotional vibes across four realms to explore films, books and music." },
      { property: "og:title", content: "Discover by Vibe — GO" },
      { property: "og:description", content: "24 vibes, four realms, one shared emotional language." },
    ],
  }),
  component: Discover,
});

function Discover() {
  const { t } = useI18n();
  const { vibe } = Route.useSearch();
  const navigate = useNavigate({ from: "/discover" });
  const select = (id: string) => navigate({ search: id === vibe ? {} : { vibe: id }, replace: true, resetScroll: false });
  const selected = vibe ? getVibe(vibe) : undefined;
  const matches = selected ? DEMO_WORKS.filter((w) => w.primaryVibe === selected.id || w.secondaryVibes.includes(selected.id)) : [];

  return (
    <>
      <PageHeader title={t({ fa: "کشف", en: "Discover" })} subtitle={t({ fa: "از حس شروع کن، نه از ژانر.", en: "Start from a feeling, not a genre." })} />

      <section className="pb-12">
        <h2 className="mb-6 text-2xl font-semibold">{t({ fa: "وایبت را انتخاب کن", en: "Choose Your Vibe" })}</h2>
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {QUADRANTS.map((q) => (
              <div key={q.id}>
                <h3 className={`mb-3 text-sm font-semibold ${q.colorClass}`}>{t(q.name)}</h3>
                <div className="flex flex-wrap gap-2">
                  {VIBES.filter((v) => v.quadrant === q.id).map((v) => (
                    <VibeChip key={v.id} vibe={v} active={v.id === vibe} onClick={() => select(v.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <SpectrumMap {...(vibe ? { selected: vibe } : {})} onSelect={select} />
        </div>

        <div className="mt-8 rounded-2xl border bg-card p-6" aria-live="polite">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold">{t(selected.name)}</h3>
                <DemoBadge />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t({ fa: "آثار نمونه با این وایب (اصلی یا فرعی). کاتالوگ واقعی در فاز ۲ اضافه می‌شود.", en: "Sample works with this vibe (primary or secondary). The real catalog arrives in Phase 2." })}
              </p>
              {matches.length ? (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {matches.map((w) => {
                    const m = MODULES.find((x) => x.id === w.module)!;
                    return (
                      <li key={w.id} className="rounded-xl border bg-background p-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <m.icon className="size-3.5" /> {t(m.name)}
                        </div>
                        <div className="mt-1 font-semibold">{t(w.title)}</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <VibeTag id={w.primaryVibe} primary />
                          {w.secondaryVibes.map((s) => <VibeTag key={s} id={s} />)}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">{t({ fa: "هنوز اثر نمونه‌ای برای این وایب نداریم.", en: "No sample works for this vibe yet." })}</p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">{t({ fa: "یک وایب انتخاب کن تا آثار نمونه را ببینی.", en: "Pick a vibe to see sample works." })}</p>
          )}
        </div>
      </section>

      <section className="pb-16">
        <div className="rounded-2xl border border-dashed bg-card/50 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Dna className="size-6 text-primary" />
            <h2 className="text-2xl font-semibold">{t({ fa: "شخصی‌سازی‌شده برای DNA تو", en: "Personalized for Your DNA" })}</h2>
            <PhaseBadge phase={3} />
          </div>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {t({
              fa: "GO DNA سلیقهٔ فرهنگی‌ات را در شش بُعد غیرِبالینی توصیف می‌کند. الگوریتم و پیشنهادهای شخصی در فاز ۳ ساخته می‌شوند؛ تا آن زمان هیچ پیشنهاد ساختگی نمایش نمی‌دهیم.",
              en: "GO DNA describes your cultural taste across six non-clinical dimensions. The algorithm and personal picks are built in Phase 3; until then we show no fabricated recommendations.",
            })}
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DNA_DIMENSIONS.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded-xl border bg-background px-4 py-3 text-sm">
                {t(d.name)}
                <Lock className="size-3.5 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
