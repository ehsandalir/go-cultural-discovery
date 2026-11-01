import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authReturnPath } from "@/lib/auth-return-path";

type Search = { next?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const value = s["next"] ?? s["redirect"];
    return typeof value === "string" ? { next: authReturnPath(value) } : {};
  },
  head: () => ({
    meta: [
      { title: "Sign in — GO" },
      { name: "description", content: "Sign in or create your GO account." },
      { property: "og:title", content: "Sign in — GO" },
      { property: "og:description", content: "Join GO to discover culture by vibe." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const { t } = useI18n();
  const { next } = Route.useSearch();
  const returnPath = next ?? "/profile";
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let navigating = false;
    const go = () => {
      if (!active || navigating) return;
      navigating = true;
      window.location.replace(returnPath);
    };

    // OAuth may return an error in the callback URL rather than throwing from the button.
    const callback = new URLSearchParams(window.location.search);
    if (callback.has("error")) {
      setNotice(
        t({
          fa: "ورود با گوگل لغو شد یا انجام نشد. دوباره تلاش کن.",
          en: "Google sign-in was cancelled or failed. Please try again.",
        }),
      );
    }

    void supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (active && !error && data.user) go();
      })
      .catch(() => {
        /* Leave the login form available if session retrieval fails. */
      });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) go();
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [returnPath, t]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: new URL(
              `/auth?next=${encodeURIComponent(returnPath)}`,
              window.location.origin,
            ).href,
          },
        });
        if (error) throw error;
        setNotice(
          t({
            fa: "ایمیل تأیید فرستاده شد. برای فعال‌سازی حساب، لینک را باز کن.",
            en: "Confirmation email sent. Open the link to activate your account.",
          }),
        );
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setNotice(
          t({
            fa: "اگر حسابی با این ایمیل باشد، لینک بازیابی ارسال شد.",
            en: "If an account exists, a recovery link has been sent.",
          }),
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const callback = new URL("/auth", window.location.origin);
      callback.searchParams.set("next", returnPath);
      // Lovable Cloud brokers OAuth tokens into the Supabase session; keep that
      // integration instead of mixing a second independent OAuth flow.
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: callback.href });
      if (result.error) throw result.error;
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t({ fa: "ورود با گوگل انجام نشد", en: "Google sign-in failed" }),
      );
    } finally {
      setBusy(false);
    }
  }

  const title = {
    signin: { fa: "ورود به GO", en: "Sign in to GO" },
    signup: { fa: "ساخت حساب", en: "Create account" },
    forgot: { fa: "بازیابی رمز", en: "Reset password" },
  }[mode];

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="text-3xl font-bold">{t(title)}</h1>
      {!isSupabaseConfigured && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          {t({
            fa: "اتصال به پایگاه داده Supabase هنوز تنظیم نشده است. متغیرهای VITE_SUPABASE_URL و VITE_SUPABASE_PUBLISHABLE_KEY را برای فعال‌سازی احراز هویت تنظیم کنید.",
            en: "Supabase connection is not configured yet. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment to enable real authentication.",
          })}
        </div>
      )}
      {mode !== "forgot" && (
        <>
          <Button
            type="button"
            variant="secondary"
            className="mt-8 w-full rounded-full"
            onClick={google}
            disabled={busy}
          >
            {t({ fa: "ادامه با گوگل", en: "Continue with Google" })}
          </Button>
          <div className="my-6 text-center text-xs text-muted-foreground">
            {t({ fa: "یا با ایمیل", en: "or with email" })}
          </div>
        </>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t({ fa: "ایمیل", en: "Email" })}</Label>
          <Input
            id="email"
            type="email"
            dir="ltr"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        {mode !== "forgot" && (
          <div className="space-y-2">
            <Label htmlFor="password">{t({ fa: "رمز عبور", en: "Password" })}</Label>
            <Input
              id="password"
              type="password"
              dir="ltr"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>
        )}
        {notice && (
          <p className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm">{notice}</p>
        )}
        <Button type="submit" disabled={busy} className="w-full rounded-full">
          {t(
            mode === "signin"
              ? { fa: "ورود", en: "Sign in" }
              : mode === "signup"
                ? { fa: "ثبت‌نام", en: "Sign up" }
                : { fa: "ارسال لینک", en: "Send link" },
          )}
        </Button>
      </form>
      <div className="mt-6 flex flex-col gap-2 text-sm">
        {mode !== "signin" && (
          <button className="text-primary" onClick={() => setMode("signin")}>
            {t({ fa: "حساب داری؟ وارد شو", en: "Have an account? Sign in" })}
          </button>
        )}
        {mode !== "signup" && (
          <button className="text-primary" onClick={() => setMode("signup")}>
            {t({ fa: "حساب نداری؟ ثبت‌نام کن", en: "New here? Create account" })}
          </button>
        )}
        {mode === "signin" && (
          <button className="text-muted-foreground" onClick={() => setMode("forgot")}>
            {t({ fa: "رمز را فراموش کرده‌ای؟", en: "Forgot password?" })}
          </button>
        )}
      </div>
    </div>
  );
}
