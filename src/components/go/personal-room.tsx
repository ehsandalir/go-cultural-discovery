import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Paintbrush, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useI18n } from "@/lib/i18n";
import { VIBES } from "@/lib/vibes";
import { ROOM_PALETTES, type RoomPaletteId } from "@/lib/personal-room";
import { generatePersonalRoom, getPersonalRoom } from "@/lib/personal-room.functions";

type Hotspot = {
  id: string;
  href?: string;
  x: number;
  y: number;
  name: { fa: string; en: string };
};
const HOTSPOTS: Hotspot[] = [
  { id: "desk", href: "/", x: 35, y: 72, name: { fa: "میز من", en: "My desk" } },
  { id: "listen", href: "/explore/listen", x: 13, y: 31, name: { fa: "شنیدن", en: "Listen" } },
  { id: "read", href: "/explore/read", x: 84, y: 33, name: { fa: "خواندن", en: "Read" } },
  { id: "watch", href: "/explore/watch", x: 82, y: 80, name: { fa: "تماشا", en: "Watch" } },
  { id: "style", x: 81, y: 63, name: { fa: "استایل · به‌زودی", en: "Style · soon" } },
  { id: "dna", x: 69, y: 50, name: { fa: "آینهٔ DNA · به‌زودی", en: "DNA mirror · soon" } },
  { id: "discover", href: "/discover", x: 29, y: 33, name: { fa: "کشف", en: "Discover" } },
  { id: "journey", x: 67, y: 27, name: { fa: "سفر من · به‌زودی", en: "My journey · soon" } },
];

export function PersonalRoomHero() {
  const { user, ready } = useSession();
  const { t } = useI18n();
  const client = useQueryClient();
  const room = useQuery({
    queryKey: ["go-personal-room", user?.id],
    queryFn: () => getPersonalRoom(),
    enabled: !!user,
    staleTime: 45 * 60 * 1000,
    retry: false,
  });
  const [paletteId, setPaletteId] = useState<RoomPaletteId | null>(null);
  const [vibeIds, setVibeIds] = useState<string[]>([]);
  const [aiConsent, setAiConsent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const saved = room.data;
    if (!saved) return;
    if (ROOM_PALETTES.some((p) => p.id === saved.paletteId))
      setPaletteId(saved.paletteId as RoomPaletteId);
    setVibeIds(saved.vibeIds.filter((id) => VIBES.some((v) => v.id === id)).slice(0, 3));
  }, [room.data]);

  const chooseVibe = (id: string) =>
    setVibeIds((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : current.length < 3
          ? [...current, id]
          : current,
    );

  async function createRoom() {
    if (!user || !paletteId || !aiConsent || isGenerating) return;
    setErrorMessage("");
    setIsGenerating(true);
    try {
      await generatePersonalRoom({ data: { paletteId, vibeIds, aiConsent: true } });
      await client.invalidateQueries({ queryKey: ["go-personal-room", user.id] });
      toast.success(t({ fa: "اتاق تو ساخته شد", en: "Your room is ready" }));
      setAiConsent(false);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : t({ fa: "ساخت اتاق انجام نشد", en: "Room generation failed" }),
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="py-6 md:py-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs tracking-[0.18em] text-primary" dir="ltr">
            GO / YOUR ROOM
          </p>
          <h1 className="text-3xl font-bold md:text-5xl">
            {t({ fa: "این اتاق، شبیه تو ساخته می‌شه.", en: "A room made to feel like you." })}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t({
              fa: "نقشهٔ اتاق برای همه یکیه؛ قصه، رنگ و چیزهای کوچیکش فقط مال توئه.",
              en: "The room layout is shared. Its story, colors and small details are yours alone.",
            })}
          </p>
        </div>
        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
          {room.data?.imageUrl
            ? t({ fa: "اتاق شخصی من", en: "My personal room" })
            : t({ fa: "اسکچ اولیه", en: "Base sketch" })}
        </span>
      </div>

      <div
        className="relative isolate aspect-video overflow-hidden rounded-2xl border bg-[#e9ece9]"
        dir="ltr"
      >
        <img
          src={room.data?.imageUrl || "/room-layout.svg"}
          alt={t({
            fa: "نمای دوبعدی اتاق GO با پنجرهٔ رو به شهر و بخش‌های فرهنگی",
            en: "2D GO room, city window and cultural corners",
          })}
          className="absolute inset-0 h-full w-full object-contain"
        />
        {HOTSPOTS.map((h) =>
          h.href ? (
            <a
              key={h.id}
              href={h.href}
              className="group absolute z-10 flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/45 bg-white/70 px-2 text-[10px] font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 sm:text-xs"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              aria-label={t(h.name)}
              title={t(h.name)}
            >
              {t(h.name)}
            </a>
          ) : (
            <span
              key={h.id}
              className="absolute z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-500/30 bg-white/60 px-1.5 py-1 text-[9px] text-slate-600 sm:block"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              title={t(h.name)}
            >
              {t(h.name)}
            </span>
          ),
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>{t({ fa: "میز", en: "Desk" })}</span> ·
        <Link
          to="/explore/$module"
          params={{ module: "watch" }}
          className="underline underline-offset-4"
        >
          GoWatch
        </Link>{" "}
        ·
        <Link
          to="/explore/$module"
          params={{ module: "read" }}
          className="underline underline-offset-4"
        >
          GoRead
        </Link>{" "}
        ·
        <Link
          to="/explore/$module"
          params={{ module: "listen" }}
          className="underline underline-offset-4"
        >
          GoListen
        </Link>{" "}
        ·
        <Link to="/discover" className="underline underline-offset-4">
          {t({ fa: "کشف", en: "Discover" })}
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-5 md:p-7">
        <div className="flex items-center gap-2">
          <Paintbrush className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">
            {t({
              fa: "کدوم ترکیب رنگ بیشتر به حال‌وهوات نزدیکه؟",
              en: "Which color mix feels most like you?",
            })}
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {t({
            fa: "یکی از شش ترکیب رو انتخاب کن؛ قرار نیست تم کل GO عوض بشه.",
            en: "Pick one of six combinations. The GO app theme stays as it is.",
          })}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ROOM_PALETTES.map((p) => {
            const selected = paletteId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setPaletteId(p.id)}
                className={`relative overflow-hidden rounded-xl border-2 p-3 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"}`}
              >
                <span className="mb-3 flex h-12 overflow-hidden rounded-lg">
                  {p.colors.map((c) => (
                    <span key={c} className="h-full flex-1" style={{ backgroundColor: c }} />
                  ))}
                </span>
                <span className="block pe-6 text-sm font-medium">{t(p.label)}</span>
                {selected && (
                  <Check className="absolute end-3 top-3 size-4 text-primary" aria-hidden />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-7">
          <h3 className="text-base font-semibold">
            {t({
              fa: "این روزها به چه حسی نزدیک‌تری؟",
              en: "What feelings are close to you lately?",
            })}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t({ fa: "تا سه وایب دلخواه؛ اختیاری", en: "Up to three vibes, optional" })}
          </p>
          <div className="mt-3 flex max-h-44 flex-wrap gap-2 overflow-y-auto">
            {VIBES.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={vibeIds.includes(v.id)}
                onClick={() => chooseVibe(v.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${vibeIds.includes(v.id) ? "border-primary bg-primary/15 text-primary" : "border-border hover:border-primary/40"}`}
              >
                {t(v.name)} {vibeIds.includes(v.id) ? "✓" : ""}
              </button>
            ))}
          </div>
        </div>

        {ready && user ? (
          <>
            <label className="mt-6 flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={aiConsent}
                onChange={(e) => setAiConsent(e.target.checked)}
                className="mt-1 accent-primary"
              />
              <span>
                {t({
                  fa: "موافقم وایب‌ها، ترکیب رنگ و عنوان آثار فرهنگی ذخیره‌شده‌ام برای ساخت این تصویر به مدل تصویری گوگل فرستاده بشن؛ نه اطلاعات هویتی من.",
                  en: "I agree to send my chosen vibes, colors and saved cultural titles to Google's image model for this artwork — not my identity.",
                })}
              </span>
            </label>
            <Button
              type="button"
              disabled={!paletteId || !aiConsent || isGenerating}
              onClick={createRoom}
              className="mt-5 rounded-full"
            >
              <Sparkles className="size-4" />
              {isGenerating
                ? t({ fa: "دارم اتاقت رو می‌سازم…", en: "Creating your room…" })
                : room.data?.imageUrl
                  ? t({ fa: "یه نسخهٔ تازه از اتاقم", en: "Create a fresh version" })
                  : t({ fa: "اتاق من رو بساز", en: "Create my room" })}
            </Button>
          </>
        ) : (
          <Button asChild className="mt-5 rounded-full">
            <Link to="/auth" search={{ next: "/" }}>
              {t({ fa: "برای ساخت اتاقت وارد شو", en: "Sign in to create your room" })}
            </Link>
          </Button>
        )}
        {errorMessage && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
        {room.isError && (
          <p className="mt-4 text-sm text-muted-foreground">
            {t({
              fa: "داده‌های اتاق در دسترس نیست؛ اسکچ اولیه نمایش داده می‌شه.",
              en: "Your room data is unavailable, so the base sketch is shown.",
            })}
          </p>
        )}
      </div>
    </section>
  );
}
