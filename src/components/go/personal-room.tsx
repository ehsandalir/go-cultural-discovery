import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Check, Clapperboard, Compass, Headphones, Laptop2, Paintbrush, Sparkles, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useI18n } from "@/lib/i18n";
import { VIBES } from "@/lib/vibes";
import { ROOM_PALETTES, type RoomPaletteId } from "@/lib/personal-room";
import { generatePersonalRoom, getPersonalRoom } from "@/lib/personal-room.functions";

type Hotspot = {
  id: string;
  route?: "/" | "/discover";
  module?: "watch" | "read" | "listen";
  x: number;
  y: number;
  icon: LucideIcon;
  name: { fa: string; en: string };
};

/** Percentages target the fixed 9:16 reference A geometry, not the document viewport. */
const HOTSPOTS: Hotspot[] = [
  { id: "watch", module: "watch", x: 19, y: 55, icon: Clapperboard, name: { fa: "تماشا", en: "Watch" } },
  { id: "read", module: "read", x: 28, y: 36, icon: BookOpen, name: { fa: "خواندن", en: "Read" } },
  { id: "listen", module: "listen", x: 85, y: 49, icon: Headphones, name: { fa: "شنیدن", en: "Listen" } },
  { id: "desk", route: "/", x: 57, y: 64, icon: Laptop2, name: { fa: "میز من", en: "My desk" } },
  { id: "discover", route: "/discover", x: 51, y: 40, icon: Compass, name: { fa: "کشف", en: "Discover" } },
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
    if (ROOM_PALETTES.some(p => p.id === saved.paletteId)) setPaletteId(saved.paletteId as RoomPaletteId);
    setVibeIds(saved.vibeIds.filter(id => VIBES.some(v => v.id === id)).slice(0, 3));
  }, [room.data]);

  const chooseVibe = (id: string) => setVibeIds(current =>
    current.includes(id) ? current.filter(x => x !== id) : current.length < 3 ? [...current, id] : current
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
      setErrorMessage(err instanceof Error ? err.message : t({ fa: "ساخت اتاق انجام نشد", en: "Room generation failed" }));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="py-6 md:py-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs tracking-[0.18em] text-primary" dir="ltr">GO / YOUR ROOM</p>
          <h1 className="text-3xl font-bold md:text-5xl">{t({ fa: "این اتاق، شبیه تو ساخته می‌شه.", en: "A room made to feel like you." })}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t({
            fa: "چیدمان اصلی برای همه ثابته؛ نور، رنگ و جزئیات فرهنگی اتاق تو بر اساس سلیقه‌ات متفاوت ساخته می‌شه.",
            en: "A shared portrait room blueprint. Your light, colors and cultural details are one of a kind.",
          })}</p>
        </div>
        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">{room.data?.imageUrl ? t({ fa: "اتاق شخصی من", en: "My personal room" }) : t({ fa: "پیش‌نمایش اتاق", en: "Room style preview" })}</span>
      </div>

      {/* The room is portrait-first, with an independent responsive hotspot layer.
          The reference contains mock UI; generated rooms are requested without any embedded UI. */}
      <div className="mx-auto w-full max-w-[480px]" dir="ltr">
        <div className="relative isolate aspect-[9/16] w-full overflow-hidden rounded-[2rem] border border-border/60 bg-[#c2a898] shadow-[0_24px_65px_-35px_rgba(18,43,42,0.55)]">
          <img
            src={room.data?.imageUrl || "/room-reference-a.webp"}
            alt={t({
              fa: "اتاق شخصی عمودی GO: تخت و پوسترها در چپ، پنجره و میز روبه‌شهر، کتاب‌ها و موسیقی در راست",
              en: "Portrait GO room: bed and posters on the left, city window and desk ahead, books and records on the right",
            })}
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
          />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[13%] bg-gradient-to-b from-slate-950/35 to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-t from-slate-950/65 to-transparent" />
          {HOTSPOTS.map(h => {
            const Icon = h.icon;
            const content = (
              <span className="group relative flex size-11 items-center justify-center rounded-full border border-white/80 bg-slate-900/35 text-white shadow-lg ring-1 ring-black/10 backdrop-blur-[5px] transition-all hover:scale-110 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-white">
                <Icon className="size-5" aria-hidden />
                <span className="pointer-events-none absolute start-1/2 top-full z-20 mt-1 w-max max-w-28 -translate-x-1/2 rounded-full bg-slate-950/75 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {t(h.name)}
                </span>
              </span>
            );
            const position = { left: `${h.x}%`, top: `${h.y}%` };
            const className = "absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2";
            return h.module ? (
              <Link key={h.id} to="/explore/$module" params={{ module: h.module }} className={className} style={position} aria-label={t(h.name)} title={t(h.name)}>{content}</Link>
            ) : h.route === "/discover" ? (
              <Link key={h.id} to="/discover" className={className} style={position} aria-label={t(h.name)} title={t(h.name)}>{content}</Link>
            ) : (
              <Link key={h.id} to="/" className={className} style={position} aria-label={t(h.name)} title={t(h.name)}>{content}</Link>
            );
          })}
          <div className="pointer-events-none absolute inset-x-5 bottom-6 z-10 text-start text-white drop-shadow-sm">
            <div className="text-xs uppercase tracking-[0.18em]" dir="ltr">GO / YOUR SPACE</div>
            <div className="mt-1 text-sm font-medium">
              {room.data?.imageUrl
                ? t({ fa: "این اتاق، قصهٔ تو رو داره.", en: "This space tells your story." })
                : t({ fa: "پیش‌نمایش سبک اتاق؛ اتاق تو منحصر‌به‌فرد ساخته می‌شه.", en: "Room style preview. Your own room will be unique." })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>{t({ fa: "میز", en: "Desk" })}</span> ·
        <Link to="/explore/$module" params={{ module: "watch" }} className="underline underline-offset-4">GoWatch</Link> ·
        <Link to="/explore/$module" params={{ module: "read" }} className="underline underline-offset-4">GoRead</Link> ·
        <Link to="/explore/$module" params={{ module: "listen" }} className="underline underline-offset-4">GoListen</Link> ·
        <Link to="/discover" className="underline underline-offset-4">{t({ fa: "کشف", en: "Discover" })}</Link>
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-5 md:p-7">
        <div className="flex items-center gap-2">
          <Paintbrush className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">{t({ fa: "کدوم ترکیب رنگ بیشتر به حال‌وهوات نزدیکه؟", en: "Which color mix feels most like you?" })}</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{t({ fa: "یکی از شش ترکیب رو انتخاب کن؛ قرار نیست تم کل GO عوض بشه.", en: "Pick one of six combinations. The GO app theme stays as it is." })}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ROOM_PALETTES.map(p => {
            const selected = paletteId === p.id;
            return (
              <button key={p.id} type="button" aria-pressed={selected} onClick={() => setPaletteId(p.id)}
                className={`relative overflow-hidden rounded-xl border-2 p-3 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/40"}`}>
                <span className="mb-3 flex h-12 overflow-hidden rounded-lg">
                  {p.colors.map(c => <span key={c} className="h-full flex-1" style={{ backgroundColor: c }} />)}
                </span>
                <span className="block pe-6 text-sm font-medium">{t(p.label)}</span>
                {selected && <Check className="absolute end-3 top-3 size-4 text-primary" aria-hidden />}
              </button>
            );
          })}
        </div>

        <div className="mt-7">
          <h3 className="text-base font-semibold">{t({ fa: "این روزها به چه حسی نزدیک‌تری؟", en: "What feelings are close to you lately?" })}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{t({ fa: "تا سه وایب دلخواه؛ اختیاری", en: "Up to three vibes, optional" })}</p>
          <div className="mt-3 flex max-h-44 flex-wrap gap-2 overflow-y-auto">
            {VIBES.map(v => (
              <button key={v.id} type="button" aria-pressed={vibeIds.includes(v.id)} onClick={() => chooseVibe(v.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${vibeIds.includes(v.id) ? "border-primary bg-primary/15 text-primary" : "border-border hover:border-primary/40"}`}>
                {t(v.name)} {vibeIds.includes(v.id) ? "✓" : ""}
              </button>
            ))}
          </div>
        </div>

        {ready && user ? (
          <>
            <label className="mt-6 flex cursor-pointer items-start gap-2 text-sm">
              <input type="checkbox" checked={aiConsent} onChange={e => setAiConsent(e.target.checked)} className="mt-1 accent-primary" />
              <span>{t({
                fa: "موافقم وایب‌ها، ترکیب رنگ و عنوان آثار فرهنگی ذخیره‌شده‌ام برای ساخت این تصویر به مدل تصویری گوگل فرستاده بشن؛ نه اطلاعات هویتی من.",
                en: "I agree to send my chosen vibes, colors and saved cultural titles to Google's image model for this artwork — not my identity.",
              })}</span>
            </label>
            <Button type="button" disabled={!paletteId || !aiConsent || isGenerating} onClick={createRoom} className="mt-5 rounded-full">
              <Sparkles className="size-4" />
              {isGenerating ? t({ fa: "دارم اتاقت رو می‌سازم…", en: "Creating your room…" }) : room.data?.imageUrl ? t({ fa: "یه نسخهٔ تازه از اتاقم", en: "Create a fresh version" }) : t({ fa: "اتاق من رو بساز", en: "Create my room" })}
            </Button>
          </>
        ) : (
          <Button asChild className="mt-5 rounded-full"><Link to="/auth" search={{ next: "/" }}>{t({ fa: "برای ساخت اتاقت وارد شو", en: "Sign in to create your room" })}</Link></Button>
        )}
        {errorMessage && <p className="mt-4 text-sm text-destructive" role="alert">{errorMessage}</p>}
        {room.isError && <p className="mt-4 text-sm text-muted-foreground">{t({ fa: "داده‌های اتاق در دسترس نیست؛ نمونهٔ طراحی نمایش داده می‌شه.", en: "Your room data is unavailable, so the style preview is shown." })}</p>}
      </div>
    </section>
  );
}
