import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, MailWarning, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/access.functions";
import { useI18n } from "@/lib/i18n";
import { PageHeader, PhaseBadge } from "@/components/go/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — GO" },
      { name: "description", content: "Manage your GO account, language and plan." },
      { property: "og:title", content: "Profile — GO" },
      { property: "og:description", content: "Your GO account." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, setLang } = useI18n();
  const qc = useQueryClient();
  const me = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const user = u.user!;
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return { user, profile };
    },
  });
  const access = useQuery({ queryKey: ["access"], queryFn: () => getMyAccess() });
  const plans = useQuery({
    queryKey: ["plans"],
    queryFn: async () => (await supabase.from("subscription_plans").select("*").order("sort_order")).data ?? [],
  });

  const [name, setName] = useState("");
  const [lang, setPrefLang] = useState<"fa" | "en">("fa");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (me.data?.profile) {
      setName(me.data.profile.display_name ?? "");
      setPrefLang(me.data.profile.preferred_language as "fa" | "en");
    }
  }, [me.data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!me.data) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: me.data.user.id, display_name: name.trim().slice(0, 60) || null, preferred_language: lang, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return toast.error(t({ fa: "ذخیره نشد", en: "Could not save" }));
    setLang(lang);
    qc.invalidateQueries({ queryKey: ["me"] });
    toast.success(t({ fa: "ذخیره شد", en: "Saved" }));
  }

  if (me.isLoading) return <div className="py-20 text-center text-muted-foreground">…</div>;
  const user = me.data?.user;
  const verified = !!user?.email_confirmed_at;

  return (
    <>
      <PageHeader title={t({ fa: "پروفایل", en: "Profile" })} subtitle={user?.email} />
      <div className="grid gap-6 pb-16 lg:grid-cols-2">
        <form onSubmit={save} className="space-y-4 rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">{t({ fa: "حساب", en: "Account" })}</h2>
          <div className="flex items-center gap-2 text-sm">
            {verified ? <MailCheck className="size-4 text-primary" /> : <MailWarning className="size-4 text-warning" />}
            {verified ? t({ fa: "ایمیل تأیید شده", en: "Email verified" }) : t({ fa: "ایمیل تأیید نشده", en: "Email not verified" })}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">{t({ fa: "نام نمایشی", en: "Display name" })}</Label>
            <Input id="name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t({ fa: "زبان ترجیحی", en: "Preferred language" })}</Label>
            <div className="flex gap-2">
              {(["fa", "en"] as const).map((l) => (
                <Button key={l} type="button" variant={lang === l ? "default" : "secondary"} size="sm" onClick={() => setPrefLang(l)}>
                  {l === "fa" ? "فارسی" : "English"}
                </Button>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={saving} className="rounded-full">{t({ fa: "ذخیره", en: "Save" })}</Button>
        </form>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{t({ fa: "اشتراک", en: "Plan" })}</h2>
              <PhaseBadge phase={4} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {t({ fa: "طرح‌ها فعلاً فقط تعریف شده‌اند. پرداخت یا ارتقا وجود ندارد.", en: "Plans are definitions only for now. No payment or upgrade exists yet." })}
            </p>
            <ul className="mt-4 space-y-2">
              {plans.data?.map((p) => (
                <li key={p.code} className="flex items-start justify-between gap-4 rounded-xl border bg-background p-3 text-sm">
                  <div>
                    <div className="font-semibold">{t({ fa: p.name_fa, en: p.name_en })}</div>
                    <div className="text-muted-foreground">{t({ fa: p.description_fa, en: p.description_en })}</div>
                  </div>
                  {p.code === access.data?.plan && (
                    <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">{t({ fa: "فعلی", en: "Current" })}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {access.data?.isAdmin && (
            <Link to="/studio" className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-card p-6 hover:shadow-glow">
              <ShieldCheck className="size-6 text-primary" />
              <div>
                <div className="font-semibold">GO Studio</div>
                <div className="text-sm text-muted-foreground">{t({ fa: "پنل مدیریت", en: "Admin panel" })}</div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
