import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getStudioOverview } from "@/lib/access.functions";
import { useI18n } from "@/lib/i18n";
import { PageHeader, PhaseBadge } from "@/components/go/shell";
import { VIBES } from "@/lib/vibes";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({
    meta: [
      { title: "GO Studio — GO" },
      { name: "description", content: "GO Studio administration." },
      { property: "og:title", content: "GO Studio" },
      { property: "og:description", content: "GO Studio administration." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Studio,
});

function Studio() {
  const { t } = useI18n();
  const q = useQuery({ queryKey: ["studio"], queryFn: () => getStudioOverview() });
  if (q.isLoading) return <div className="py-20 text-center text-muted-foreground">…</div>;
  if (!q.data?.allowed)
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-semibold">{t({ fa: "دسترسی ندارید", en: "Access denied" })}</h1>
        <p className="mt-2 text-muted-foreground">{t({ fa: "این بخش فقط برای مدیران است.", en: "This area is for admins only." })}</p>
        <Link to="/" className="mt-6 inline-block text-primary underline">{t({ fa: "بازگشت به خانه", en: "Back home" })}</Link>
      </div>
    );
  return (
    <>
      <PageHeader title="GO Studio" subtitle={t({ fa: "نمای پایه — ابزارهای مدیریت محتوا در فاز ۲.", en: "Foundation view — content management tools arrive in Phase 2." })} />
      <div className="grid gap-4 pb-16 md:grid-cols-3">
        <Stat label={t({ fa: "وایب‌های ثابت", en: "Fixed vibes" })} value={String(VIBES.length)} />
        <Stat label={t({ fa: "تعریف طرح‌ها", en: "Plan definitions" })} value={String(q.data.plans.length)} />
        <div className="rounded-2xl border border-dashed bg-card/50 p-6">
          <div className="font-semibold">{t({ fa: "مدیریت محتوا و وایب", en: "Content & vibe CRUD" })}</div>
          <div className="mt-3"><PhaseBadge phase={2} /></div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
