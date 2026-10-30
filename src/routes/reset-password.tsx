import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — GO" },
      { name: "description", content: "Choose a new password for your GO account." },
      { property: "og:title", content: "Set a new password — GO" },
      { property: "og:description", content: "Recover your GO account." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setReady(true);
    const { data } = supabase.auth.onAuthStateChange((e) => e === "PASSWORD_RECOVERY" && setReady(true));
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t({ fa: "رمز تغییر کرد", en: "Password updated" }));
    navigate({ to: "/profile" });
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="text-3xl font-bold">{t({ fa: "رمز جدید", en: "New password" })}</h1>
      {ready ? (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pw">{t({ fa: "رمز عبور جدید", en: "New password" })}</Label>
            <Input id="pw" type="password" dir="ltr" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </div>
          <Button type="submit" disabled={busy} className="w-full rounded-full">{t({ fa: "ذخیره", en: "Save" })}</Button>
        </form>
      ) : (
        <p className="mt-4 text-muted-foreground">{t({ fa: "این صفحه را از لینک ایمیل بازیابی باز کن.", en: "Open this page from your recovery email link." })}</p>
      )}
    </div>
  );
}
