import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Clapperboard, Compass, Headphones, ChevronLeft, ChevronRight, UserRound, Palette, DoorOpen } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useI18n } from "@/lib/i18n";
import { ROOM_PALETTES } from "@/lib/personal-room";

const WALLS = [
  { id: "watch", title: { fa: "دیوار سینما", en: "Cinema wall" }, subtitle: { fa: "فیلم‌ها و تجربه‌های تماشا", en: "Films and viewing experiences" } },
  { id: "read", title: { fa: "دیوار کتاب", en: "Reading wall" }, subtitle: { fa: "کتاب‌ها و داستان‌ها", en: "Books and stories" } },
  { id: "listen", title: { fa: "دیوار موسیقی", en: "Listening wall" }, subtitle: { fa: "موسیقی و صدا", en: "Music and sound" } },
  { id: "identity", title: { fa: "دیوار من", en: "My wall" }, subtitle: { fa: "هویت، کاور و وایب", en: "Identity, cover and Vibe" } },
] as const;

export function PersonalRoomHero() {
  const { t } = useI18n();
  const { user } = useSession();
  const [wall, setWall] = useState(0);
  const [palette, setPalette] = useState(0);
  const colors = ROOM_PALETTES[palette]?.colors ?? ["#DDECF1", "#85B4C8", "#415B76"];
  const current = WALLS[wall];
  const move = (delta: number) => setWall(value => (value + delta + WALLS.length) % WALLS.length);
  return (
    <section className="py-6 md:py-10" aria-label={t({ fa: "اتاق چهار دیواری من", en: "My four-wall room" })}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.2em] text-muted-foreground" dir="ltr">GO / ROOM</p>
          <h1 className="text-3xl font-semibold">{t({ fa: "اتاق من", en: "My Room" })}</h1>
        </div>
        <div className="rounded-full border px-4 py-2 text-xs" dir="ltr">
          {user ? `ID: ${user.id.slice(0, 8)}` : t({ fa: "اتاق مهمان", en: "Guest room" })}
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/15 bg-[#101218] text-white shadow-2xl" dir="ltr">
        <div className="relative min-h-[460px] overflow-hidden p-5 sm:min-h-[540px] sm:p-8" style={{ background: `radial-gradient(ellipse at 50% 25%, ${colors[1]}44, transparent 65%), #11151c` }}>
          <div className="pointer-events-none absolute inset-x-[8%] top-[12%] bottom-[17%] border-x-2 border-t-2 border-white/15" style={{ boxShadow: `inset 0 0 100px ${colors[2]}44` }} />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[22%] origin-bottom [transform:perspective(420px)_rotateX(55deg)] border-t border-white/25" style={{ background: `linear-gradient(0deg,#090b0f,${colors[2]}77)` }} />
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="text-[11px] tracking-[0.18em] text-white/65">WALL {wall + 1} / 4</span>
            <span className="rounded-full border border-white/25 px-3 py-1 text-[11px]">GO ROOM</span>
          </div>
          <div className="relative z-10 mx-auto mt-14 flex max-w-md flex-col items-center gap-5 text-center sm:mt-20">
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-white/25 bg-white/5 shadow-[0_0_50px_rgba(255,255,255,0.07)]">
              {wall === 0 ? <Clapperboard size={52} strokeWidth={1} /> : wall === 1 ? <BookOpen size={52} strokeWidth={1} /> : wall === 2 ? <Headphones size={52} strokeWidth={1} /> : <UserRound size={52} strokeWidth={1} />}
            </div>
            <h2 className="text-2xl font-medium">{t(current.title)}</h2>
            <p className="text-sm text-white/65">{t(current.subtitle)}</p>
            {wall < 3 ? (
              <Link to="/explore/$module" params={{ module: current.id as "watch" | "read" | "listen" }} className="rounded-full border border-white/50 bg-white px-6 py-3 text-sm font-medium text-black hover:bg-white/85">
                {t({ fa: "ورود به ماژول", en: "Open module" })}
              </Link>
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/profile" className="rounded-full border border-white/50 px-5 py-3 text-sm hover:bg-white/10">{t({ fa: "شناسه و پروفایل", en: "ID & profile" })}</Link>
                <Link to="/discover" className="rounded-full border border-white/50 px-5 py-3 text-sm hover:bg-white/10">GoVibe / Discover</Link>
              </div>
            )}
          </div>
          <div className="absolute bottom-7 left-5 right-5 z-10 flex items-center justify-between">
            <button type="button" onClick={() => move(-1)} aria-label={t({ fa: "دیوار قبلی", en: "Previous wall" })} className="flex size-12 items-center justify-center rounded-full border border-white/30 bg-black/50 hover:bg-white/15"><ChevronLeft /></button>
            <div className="flex gap-2" aria-label={t({ fa: "انتخاب دیوار", en: "Select wall" })}>
              {WALLS.map((item, index) => <button key={item.id} type="button" aria-label={t(item.title)} aria-pressed={wall === index} onClick={() => setWall(index)} className={`h-2.5 rounded-full transition-all ${wall === index ? "w-7 bg-white" : "w-2.5 bg-white/35"}`} />)}
            </div>
            <button type="button" onClick={() => move(1)} aria-label={t({ fa: "دیوار بعدی", en: "Next wall" })} className="flex size-12 items-center justify-center rounded-full border border-white/30 bg-black/50 hover:bg-white/15"><ChevronRight /></button>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Palette size={17} aria-hidden />
        <span className="text-sm">{t({ fa: "پالت اتاق", en: "Room palette" })}</span>
        {ROOM_PALETTES.map((item, index) => <button key={item.id} type="button" aria-label={t(item.label)} title={t(item.label)} aria-pressed={palette === index} onClick={() => setPalette(index)} className={`flex h-9 w-12 overflow-hidden rounded-lg border-2 ${palette === index ? "border-primary" : "border-transparent"}`}>{item.colors.map(c => <span key={c} className="h-full flex-1" style={{ backgroundColor: c }} />)}</button>)}
        <span className="text-xs text-muted-foreground">{t({ fa: "پیش‌نمایش؛ ذخیره پالت هنوز متصل نیست", en: "Preview only; palette persistence not connected" })}</span>
      </div>
      <nav className="mt-6 flex flex-wrap gap-3 text-sm" aria-label={t({ fa: "مسیرهای GO", en: "GO navigation" })}>
        <Link to="/discover" className="inline-flex items-center gap-2 rounded-full border px-4 py-2"><Compass size={16} />GoDiscover</Link>
        <Link to="/explore/$module" params={{ module: "watch" }} className="inline-flex items-center gap-2 rounded-full border px-4 py-2"><DoorOpen size={16} />GoExplore / Watch</Link>
        <Link to="/profile" className="inline-flex items-center gap-2 rounded-full border px-4 py-2"><UserRound size={16} />ID / Cover</Link>
      </nav>
    </section>
  );
}
