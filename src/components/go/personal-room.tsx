import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Clapperboard, Compass, Headphones, ChevronLeft, ChevronRight, UserRound, Palette } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useI18n } from "@/lib/i18n";
import { ROOM_PALETTES } from "@/lib/personal-room";
import { VIBES } from "@/lib/vibes";

type WallId = "window" | "watch" | "listen" | "read";
const WALLS: { id: WallId; name: { fa: string; en: string } }[] = [
  { id: "window", name: { fa: "پنجره", en: "Window" } },
  { id: "watch", name: { fa: "سینما", en: "Cinema" } },
  { id: "listen", name: { fa: "موسیقی", en: "Music" } },
  { id: "read", name: { fa: "کتاب", en: "Books" } },
];
const SAMPLE_POSTERS = ["GO", "CINEMA", "FRAMES", "STORY", "LIGHT", "SCENE", "FILM", "MEMORY", "NIGHT", "OTHER", "SOUND", "WORLD"];
const SAMPLE_BOOKS = Array.from({ length: 4 }, (_, row) => Array.from({ length: 23 }, (_, col) => ({ color: ["#9f978c", "#c3b4a3", "#84958b", "#a4a4a1", "#8a94a0"][((row * 7) + col) % 5], height: 45 + ((row * 13 + col * 9) % 45) })));
function WallContents({ wall, accent, onIdentity }: { wall: WallId; accent: string; onIdentity: () => void }) {
  if (wall === "window") return (
    <>
      <div className="absolute left-[8%] top-[12%] h-[62%] w-[49%] overflow-hidden border-[9px] border-[#f1f1ed] bg-gradient-to-b from-[#c0d2d9] to-[#e8e8df] shadow-xl">
        <div className="absolute inset-x-0 bottom-0 h-[48%] opacity-60" style={{ background: "repeating-linear-gradient(90deg, #8194a1 0 12px, transparent 12px 25px, #9ba8b1 25px 39px, transparent 39px 57px)" }} />
        <div className="absolute inset-y-0 left-1/2 w-[7px] bg-[#f4f4ef]" /><div className="absolute inset-x-0 top-1/2 h-[7px] bg-[#f4f4ef]" />
      </div>
      <button type="button" onClick={onIdentity} aria-label="Room identity and cover" className="absolute right-[11%] top-[13%] h-[61%] w-[23%] rounded-t-[48%] rounded-b-md border-[9px] border-[#c9b8a5] bg-gradient-to-br from-[#dbe3df] via-[#aac2ce] to-[#dfdfd8] shadow-xl transition-transform hover:-translate-y-1">
        <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[10px] text-slate-800">ID / Cover</span>
      </button>
      <div className="absolute bottom-[7%] left-[25%] h-8 w-[18%] rounded bg-[#b5a18c] shadow-lg" />
    </>
  );
  if (wall === "watch") return (
    <>
      <div className="absolute inset-x-[14%] top-[9%] grid h-[65%] grid-cols-6 grid-rows-2 gap-1 sm:gap-2">
        {SAMPLE_POSTERS.map((item, i) => <div key={item} className="flex items-end justify-center overflow-hidden border-2 border-[#f4f3ef] pb-2 text-center text-[7px] font-bold tracking-wide text-white shadow-md sm:text-xs" style={{ background: ["linear-gradient(125deg,#20171e,#8e5f49,#1f252d)", "radial-gradient(circle at 60% 35%,#e6a45d 0 24%,transparent 25%),linear-gradient(115deg,#514257,#a55d4a)", "linear-gradient(135deg,#293b43,#99a5ae)", "linear-gradient(135deg,#a9a18c,#1e293b)"][i % 4] }}>{item}</div>)}
      </div>
      <Link to="/explore/$module" params={{ module: "watch" }} className="absolute bottom-[5%] left-[33%] flex h-[11%] w-[34%] items-center justify-center rounded bg-[#a18d7b] text-xs font-bold text-white shadow-lg hover:brightness-110">GoWatch</Link>
    </>
  );
  if (wall === "listen") return (
    <>
      <div className="absolute inset-x-[15%] top-[10%] grid h-[61%] grid-cols-4 grid-rows-2 gap-2 sm:gap-3">
        {Array.from({ length: 8 }, (_, i) => <div key={i} className="relative grid place-items-center border-4 border-[#f3f0e9] shadow-lg" style={{ background: ["#988d78", "#5f7e90", "#ac817f", "#65736f"][i % 4] }}><div className="grid h-[50%] aspect-square place-items-center rounded-full border-[9px] border-[#262631] bg-[#e5d3af] text-[7px] text-black">GO</div></div>)}
      </div>
      <Link to="/explore/$module" params={{ module: "listen" }} className="absolute bottom-[5%] left-[34%] flex h-[12%] w-[32%] items-center justify-center rounded bg-[#9e8b72] text-xs font-bold text-white shadow-lg hover:brightness-110"><Headphones className="mr-2 size-4" />GoListen</Link>
    </>
  );
  return (
    <>
      <div className="absolute inset-x-[17%] top-[8%] bottom-[2%] grid grid-rows-4 gap-[2px] border-[10px] border-[#acaca3] bg-[#b1b1a8] shadow-2xl">
        {SAMPLE_BOOKS.map((row, i) => <div key={i} className="flex items-end justify-evenly overflow-hidden border-b-[8px] border-[#bab8ac] bg-[#e6e3d9] px-2 pt-2">
          {row.map((book, j) => <span key={j} style={{ height: String(book.height) + "%", backgroundColor: book.color }} className="mx-px w-[3.5%] min-w-[2px] rounded-t-sm shadow-sm" />)}
        </div>)}
      </div>
      <Link to="/explore/$module" params={{ module: "read" }} className="absolute bottom-[5%] left-1/2 z-10 -translate-x-1/2 rounded-full bg-slate-900/85 px-5 py-2 text-xs font-semibold text-white shadow-lg">GoRead</Link>
    </>
  );
}
export function PersonalRoomHero() {
  const { t } = useI18n();
  const { user } = useSession();
  const [wall, setWall] = useState(0);
  const [palette, setPalette] = useState(0);
  const [vibe, setVibe] = useState(VIBES[0]!.id);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [cover, setCover] = useState("");
  const [message, setMessage] = useState("");
  const touch = useRef(0);
  const storageKey = "go.room.review." + (user?.id ?? "guest");
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}") as { palette?: number; vibe?: string; cover?: string };
      if (Number.isInteger(saved.palette) && saved.palette! >= 0 && saved.palette! < ROOM_PALETTES.length) setPalette(saved.palette!);
      if (VIBES.some(v => v.id === saved.vibe)) setVibe(saved.vibe!);
      if (typeof saved.cover === "string" && saved.cover.startsWith("data:image/")) setCover(saved.cover);
    } catch { /* No existing local preview */ }
  }, [storageKey]);
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify({ palette, vibe, cover })); } catch { /* Storage not available */ }
  }, [storageKey, palette, vibe, cover]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test((event.target as HTMLElement | null)?.tagName ?? "")) return;
      if (event.key === "ArrowRight") setWall(value => (value + 1) % 4);
      if (event.key === "ArrowLeft") setWall(value => (value + 3) % 4);
      if (event.key === "Escape") setIdentityOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const colors = ROOM_PALETTES[palette]?.colors ?? ROOM_PALETTES[0]!.colors;
  const currentVibe = VIBES.find(v => v.id === vibe) ?? VIBES[0]!;
  const contrast = Math.min(2, Math.max(.5, .5 + currentVibe.y / 100 * 1.5));
  const saturation = .65 + currentVibe.x / 100 * 1.1;
  const brightness = .88 + currentVibe.x / 100 * .25;
  const move = (step: number) => setWall(value => (value + step + 4) % 4);
  const uploadCover = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2_000_000) {
      setMessage(t({ fa: "فقط PNG، JPG یا WebP تا ۲ مگابایت", en: "Use PNG, JPG or WebP under 2 MB" })); return;
    }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") { setCover(reader.result); setMessage(t({ fa: "کاور فقط در این دستگاه ذخیره شد", en: "Cover saved on this device only" })); } };
    reader.readAsDataURL(file);
  };
  return (
    <section className="py-5 md:py-10" aria-label={t({ fa: "اتاق چهار دیواری GO", en: "GO four-wall room" })}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="mb-2 text-xs tracking-[.2em] text-muted-foreground" dir="ltr">GO / MY ROOM</p>
          <h1 className="text-3xl font-semibold md:text-5xl">{t({ fa: "اتاقی که شبیه توست.", en: "A room that feels like you." })}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{t({ fa: "چهار دیوار. یک جهان فرهنگی.", en: "Four walls. One cultural universe." })}</p>
        </div>
        <span className="rounded-full border px-4 py-2 text-xs text-muted-foreground">{t({ fa: "نسخه قابل بازبینی · ذخیره محلی", en: "Review preview · local save" })}</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-[22px] border bg-card shadow-xl shadow-black/5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
              <strong className="text-sm font-medium">{t(WALLS[wall]!.name)}</strong>
              <div role="tablist" aria-label="Room walls" className="flex flex-wrap gap-1.5">{WALLS.map((item, i) =>
                <button key={item.id} type="button" role="tab" aria-selected={wall === i} onClick={() => setWall(i)} className={["rounded-full border px-3 py-2 text-xs", wall === i ? "border-slate-900 bg-slate-900 text-white" : "bg-background hover:border-primary"].join(" ")}>{t(item.name)}</button>)}
              </div>
            </div>
            <div className="p-2.5 sm:p-5" dir="ltr">
              <div onTouchStart={e => { touch.current = e.touches[0]?.clientX ?? 0; }} onTouchEnd={e => { const diff = (e.changedTouches[0]?.clientX ?? 0) - touch.current; if (Math.abs(diff) > 55) move(diff < 0 ? 1 : -1); }} className="relative h-[350px] overflow-hidden rounded-xl bg-[#eeefeb] sm:h-[510px]" style={{ background: "linear-gradient(" + colors[0] + " 0%, #f9f9f6 75%, " + colors[2] + " 75%, #c7bdae 100%)" }}>
                <div className="absolute inset-0" style={{ filter: "brightness(" + brightness + ") contrast(" + contrast + ") saturate(" + saturation + ")" }}>
                  <div className="absolute inset-x-[4%] top-[8%] bottom-[23%] border-x-[3px] border-t-[3px] border-[#bfc0b9] bg-gradient-to-r from-white/30 via-transparent to-slate-500/5 shadow-inner" style={{ backgroundColor: colors[0] }} />
                  <div className="absolute inset-x-[-7%] bottom-[-17%] h-[43%] origin-bottom border-t-4 border-[#c3bcaf] bg-[#cabca9]" style={{ transform: "perspective(600px) rotateX(55deg)" }} />
                  <div className="absolute inset-x-[5%] top-[11%] bottom-[23%]">
                    <WallContents wall={WALLS[wall]!.id} accent={colors[2]} onIdentity={() => setIdentityOpen(true)} />
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </div>
            <div className="flex items-center justify-between px-5 pb-5">
              <button type="button" aria-label={t({ fa: "دیوار قبلی", en: "Previous wall" })} onClick={() => move(-1)} className="grid size-11 place-items-center rounded-full border hover:bg-accent"><ChevronLeft className="size-5" /></button>
              <span className="text-xs tracking-widest text-muted-foreground" dir="ltr">{String(wall + 1).padStart(2, "0")} / 04</span>
              <button type="button" aria-label={t({ fa: "دیوار بعدی", en: "Next wall" })} onClick={() => move(1)} className="grid size-11 place-items-center rounded-full border hover:bg-accent"><ChevronRight className="size-5" /></button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[{ id: "watch" as const, icon: Clapperboard, label: "GoWatch" }, { id: "listen" as const, icon: Headphones, label: "GoListen" }, { id: "read" as const, icon: BookOpen, label: "GoRead" }].map(item =>
              <Link key={item.id} to="/explore/$module" params={{ module: item.id }} className="flex items-center gap-3 rounded-2xl border bg-card px-5 py-4 transition hover:border-primary/50"><item.icon className="size-5" /><span className="text-sm">{item.label}</span></Link>)}
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-4 text-sm font-medium">{t({ fa: "هویت اتاق", en: "Room identity" })}</h2>
            {cover ? <img src={cover} alt="Local room cover" className="mb-3 h-28 w-full rounded-xl object-cover" /> : <div className="mb-3 grid h-28 place-items-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-400 text-2xl text-slate-700">GO</div>}
            <div className="text-xs text-muted-foreground">{t({ fa: "شماره عمومی اتاق: تخصیص نیافته", en: "Public room number: not assigned" })}</div>
            <div className="mt-2 truncate text-xs text-muted-foreground" dir="ltr">{user ? "Account ID: " + user.id.slice(0, 8) + "…" : "Guest preview"}</div>
            <button type="button" onClick={() => setIdentityOpen(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs"><UserRound className="size-4" />{t({ fa: "کاور اتاق", en: "Room cover" })}</button>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-medium"><Palette className="size-4" />{t({ fa: "شش پالت اتاق", en: "Six room palettes" })}</h2>
            <div className="grid grid-cols-3 gap-2">{ROOM_PALETTES.map((p, i) => <button key={p.id} type="button" aria-label={t(p.label)} aria-pressed={palette === i} onClick={() => setPalette(i)} className={["overflow-hidden rounded-xl border-2 p-1", palette === i ? "border-primary" : "border-transparent"].join(" ")}>
              <span className="flex h-8 overflow-hidden rounded-md">{p.colors.map(c => <span key={c} className="flex-1" style={{ backgroundColor: c }} />)}</span><span className="mt-1 block truncate text-[9px]">{t(p.label)}</span>
            </button>)}</div>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-medium">GoVibe</h2>
            <p className="my-3 text-xs text-muted-foreground">{t(currentVibe.name)}</p>
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-background">
              <span className="absolute inset-y-0 left-1/2 border-l" /><span className="absolute inset-x-0 top-1/2 border-t" />
              {VIBES.map(v => <button type="button" key={v.id} aria-label={t(v.name)} aria-pressed={v.id === vibe} title={t(v.name)} onClick={() => setVibe(v.id)} className={["absolute size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border border-background", vibe === v.id ? "z-10 scale-150 bg-primary ring-4 ring-primary/20" : "bg-muted-foreground"].join(" ")} style={{ left: v.x + "%", bottom: v.y + "%" }} />)}
            </div>
            <Link to="/discover" search={{ vibe }} className="mt-4 block rounded-full border px-4 py-2 text-center text-xs hover:border-primary">GoVibe / GoDiscover</Link>
          </div>
          <a href="/explore/" className="flex items-center justify-center gap-2 rounded-full border bg-card p-3 text-sm hover:border-primary"><Compass className="size-4" />GoExplore</a>
        </aside>
      </div>
      <p className="mt-5 text-xs text-muted-foreground">{t({ fa: "این یک نمای تعاملی است. پالت، وایب و کاور فقط در مرورگر ذخیره می‌شوند؛ داده عمومی کاربران و تخصیص شماره اتاق نیازمند بک‌اند است.", en: "Interactive preview: palette, Vibe and cover stay in this browser only. Public user rooms and persistent room numbers require the verified backend." })}</p>
      {identityOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="presentation" onClick={() => setIdentityOpen(false)}>
        <div role="dialog" aria-modal="true" aria-label="Room identity and cover" className="w-full max-w-md rounded-2xl bg-background p-6" onClick={e => e.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{t({ fa: "هویت و کاور اتاق", en: "Room identity and cover" })}</h2><button type="button" onClick={() => setIdentityOpen(false)} aria-label="Close" className="rounded-full border px-3 py-1">×</button></div>
          <p className="mb-4 text-sm text-muted-foreground">{t({ fa: "شماره عمومی اتاق پس از فعال‌سازی سرویس اتاق‌ها اختصاص می‌یابد.", en: "A permanent public room number is assigned only when the room service is enabled." })}</p>
          <label className="block text-sm">{t({ fa: "کاور محلی", en: "Local cover" })}<input className="mt-2 block w-full text-xs" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => uploadCover(e.target.files?.[0])} /></label>
          {message && <p className="mt-4 text-xs text-muted-foreground" role="status">{message}</p>}
        </div>
      </div>}
    </section>
  );
}
