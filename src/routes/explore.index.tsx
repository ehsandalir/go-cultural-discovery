import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/explore/")({
  component: ExploreRooms,
  head: () => ({ meta: [{ title: "GoExplore — GO" }] }),
});

function ExploreRooms() {
  const { t } = useI18n();
  return (
    <main className="py-10">
      <p className="text-xs tracking-[0.2em] text-muted-foreground">GO / EXPLORE</p>
      <h1 className="mt-2 text-3xl font-semibold">GoExplore</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {t({ fa: "دروازه کشف دنیاهای فرهنگی. نمایش اتاق‌های واقعی کاربران به سرویس انتشار اتاق و تنظیمات حریم خصوصی نیاز دارد؛ هیچ اتاق ساختگی نمایش داده نمی‌شود.", en: "Discover cultural worlds. Real user rooms require the room publishing service and privacy controls; no fabricated rooms are shown." })}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {MODULES.map(m => (
          <Link key={m.id} to="/explore/$module" params={{ module: m.id }} className="rounded-2xl border bg-card p-6 hover:border-primary">
            <m.icon className="size-8" />
            <h2 className="mt-4 text-xl font-semibold">{m.brand}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t(m.tagline)}</p>
          </Link>
        ))}
      </div>
      <Link to="/" className="mt-8 inline-block rounded-full border px-5 py-3 text-sm">{t({ fa: "بازگشت به اتاق من", en: "Back to my room" })}</Link>
    </main>
  );
}
