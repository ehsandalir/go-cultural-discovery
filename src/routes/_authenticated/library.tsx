import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, History, ListMusic } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { PageHeader, PhaseBadge } from "@/components/go/shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "My Library — GO" },
      { name: "description", content: "Your saved films, books and music on GO." },
      { property: "og:title", content: "My Library — GO" },
      { property: "og:description", content: "Your personal GO library." },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { t } = useI18n();
  const shelves = [
    { icon: Bookmark, name: { fa: "ذخیره‌شده‌ها", en: "Saved" } },
    { icon: History, name: { fa: "دیده/خوانده/شنیده", en: "Watched / Read / Heard" } },
    { icon: ListMusic, name: { fa: "مجموعه‌ها", en: "Collections" } },
  ];
  return (
    <>
      <PageHeader title={t({ fa: "کتابخانهٔ من", en: "My Library" })} subtitle={t({ fa: "کتابخانه‌ات خالی است — ذخیرهٔ آثار با کاتالوگ واقعی در فاز ۲ فعال می‌شود.", en: "Your library is empty — saving works becomes available with the real catalog in Phase 2." })} />
      <div className="grid gap-4 pb-8 md:grid-cols-3">
        {shelves.map((s) => (
          <div key={s.name.en} className="rounded-2xl border border-dashed bg-card/50 p-6">
            <s.icon className="size-6 text-muted-foreground" />
            <div className="mt-4 font-semibold">{t(s.name)}</div>
            <div className="mt-1 text-sm text-muted-foreground">{t({ fa: "۰ مورد", en: "0 items" })}</div>
            <div className="mt-3"><PhaseBadge phase={2} /></div>
          </div>
        ))}
      </div>
      <Button asChild className="mb-16 rounded-full">
        <Link to="/discover">{t({ fa: "شروع کشف", en: "Start discovering" })}</Link>
      </Button>
    </>
  );
}
