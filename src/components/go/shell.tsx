import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Compass, Library, User, Languages, LogIn, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n, type Bi } from "@/lib/i18n";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const NAV: { to: "/" | "/discover" | "/library" | "/profile"; label: Bi; icon: typeof Home }[] = [
  { to: "/", label: { fa: "خانه", en: "Home" }, icon: Home },
  { to: "/discover", label: { fa: "کشف", en: "Discover" }, icon: Compass },
  { to: "/library", label: { fa: "کتابخانهٔ من", en: "My Library" }, icon: Library },
  { to: "/profile", label: { fa: "پروفایل", en: "Profile" }, icon: User },
];

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === "fa" ? "en" : "fa")}
      aria-label={lang === "fa" ? "Switch to English" : "تغییر به فارسی"}
    >
      <Languages className="size-4" />
      <span className="text-xs font-semibold">{lang === "fa" ? "EN" : "فا"}</span>
    </Button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { user } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="glass sticky top-0 z-40 border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight">
            <span className="text-gradient">GO</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label={t({ fa: "ناوبری اصلی", en: "Main navigation" })}>
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground"
              >
                {t(n.label)}
              </Link>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-1">
            <LangToggle />
            {user ? (
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="size-4 rtl:-scale-x-100" />
                <span className="hidden sm:inline">{t({ fa: "خروج", en: "Sign out" })}</span>
              </Button>
            ) : (
              <Button asChild size="sm" className="rounded-full">
                <Link to="/auth">
                  <LogIn className="size-4 rtl:-scale-x-100" />
                  {t({ fa: "ورود", en: "Sign in" })}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">{children}</main>

      <nav
        className="glass fixed inset-x-0 bottom-0 z-40 border-t md:hidden"
        aria-label={t({ fa: "ناوبری اصلی", en: "Main navigation" })}
      >
        <div className="grid grid-cols-4">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="flex flex-col items-center gap-1 py-3 text-[11px] text-muted-foreground data-[status=active]:text-primary"
            >
              <n.icon className="size-5" />
              {t(n.label)}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function DemoBadge() {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-warning">
      {t({ fa: "نمونهٔ آزمایشی", en: "DEMO" })}
    </span>
  );
}

export function PhaseBadge({ phase }: { phase: 2 | 3 | 4 }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
      {t({ fa: `فاز ${["", "", "۲", "۳", "۴"][phase]} — به‌زودی`, en: `Coming in Phase ${phase}` })}
    </span>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="pb-6 pt-10">
      <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
