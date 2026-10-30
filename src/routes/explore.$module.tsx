import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { DEMO_WORKS, MODULES, isModuleId } from "@/lib/modules";
import { VibeTag } from "@/components/go/vibe";
import { DemoBadge, PageHeader, PhaseBadge } from "@/components/go/shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/explore/$module")({
  loader: ({ params }) => {
    if (!isModuleId(params.module)) throw notFound();
    return { module: params.module };
  },
  head: ({ loaderData }) => {
    const m = MODULES.find((x) => x.id === loaderData?.module);
    const name = m?.brand ?? "GO";
    return {
      meta: [
        { title: `${name} — GO` },
        { name: "description", content: `${name}: explore works by emotional vibe on GO.` },
        { property: "og:title", content: `${name} — GO` },
        { property: "og:description", content: `${name}: explore works by emotional vibe.` },
      ],
    };
  },
  component: ModulePage,
});

function ModulePage() {
  const { t } = useI18n();
  const { module } = Route.useLoaderData();
  const m = MODULES.find((x) => x.id === module)!;
  const works = DEMO_WORKS.filter((w) => w.module === module);
  return (
    <>
      <PageHeader title={`${m.brand} · ${t(m.name)}`} subtitle={t(m.tagline)} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <DemoBadge />
        <PhaseBadge phase={2} />
        <span className="text-sm text-muted-foreground">
          {t({ fa: "کاتالوگ واقعی و صفحهٔ اثر در فاز ۲.", en: "Real catalog and work pages arrive in Phase 2." })}
        </span>
      </div>
      <ul className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((w) => (
          <li key={w.id} className="rounded-2xl border bg-card p-5">
            <div className="aspect-[4/3] rounded-xl bg-accent/60" aria-hidden />
            <div className="mt-4 font-semibold">{t(w.title)}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              <VibeTag id={w.primaryVibe} primary />
              {w.secondaryVibes.map((s) => <VibeTag key={s} id={s} />)}
            </div>
          </li>
        ))}
      </ul>
      <Button asChild variant="secondary" className="mb-16 rounded-full">
        <Link to="/discover">{t({ fa: "کشف با وایب", en: "Discover by vibe" })}</Link>
      </Button>
    </>
  );
}
