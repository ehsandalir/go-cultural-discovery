import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Compass, Minus, Plus, Search, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { MODULES } from "@/lib/modules";
import { getVibe } from "@/lib/vibes";

export const Route = createFileRoute("/explore/")({
  component: GoExplore,
  head: () => ({ meta: [{ title: "GoExplore — GO" }, { name: "description", content: "Discover cultural rooms across ten galaxy blocks." }] }),
});
type Sample = { number: number; block: number; position: number; name: string; vibe: string };
/** Only explicit fictional demonstration rooms. No real identities or privacy-dependent data. */
export const SAMPLES: Sample[] = [
  { number: 101, block: 0, position: 55, name: "Orion", vibe: "quiet-wisdom" },
  { number: 102, block: 0, position: 54, name: "Blue Hour", vibe: "melancholic-beauty" },
  { number: 103, block: 0, position: 45, name: "Analog Soul", vibe: "playful-joy" },
  { number: 104, block: 0, position: 56, name: "The Reader", vibe: "intellectual-maze" },
  { number: 105, block: 1, position: 55, name: "Quiet Orbit", vibe: "quiet-comfort" },
  { number: 106, block: 1, position: 54, name: "Glass City", vibe: "surreal-mind" },
  { number: 107, block: 2, position: 55, name: "Amber Days", vibe: "hope-renewal" },
  { number: 108, block: 3, position: 55, name: "Deep Blue", vibe: "existential-void" },
  { number: 109, block: 4, position: 55, name: "The Loop", vibe: "beautiful-chaos" },
  { number: 110, block: 5, position: 55, name: "Paper Planets", vibe: "romantic-longing" },
];
export const POSITIONS = Array.from({ length: 100 }, (_, i) => i);

function GoExplore() {
  const { t } = useI18n();
  const [block, setBlock] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<Sample | null>(null);
  const [search, setSearch] = useState("");
  const [visiting, setVisiting] = useState(false);
  const drag = useRef<{ x: number; y: number; oldX: number; oldY: number } | null>(null);
  const sampleMap = new Map(SAMPLES.filter(r => r.block === block).map(r => [r.position, r]));
  const choose = (r: Sample) => { setSelected(r); setVisiting(false); };
  const changeBlock = (i: number) => { setBlock(i); setOffset({ x: 0, y: 0 }); setSelected(null); setVisiting(false); };
  const find = (value: string) => {
    setSearch(value);
    if (!value.trim()) { setSelected(null); return; }
    const q = value.trim().toLowerCase();
    const room = SAMPLES.find(r => String(r.number) === q || r.name.toLowerCase().includes(q));
    if (room) { setBlock(room.block); choose(room); setOffset({ x: 0, y: 0 }); }
    else setSelected(null);
  };
  return (
    <main className="py-7 md:py-12">
      <p className="text-xs tracking-[.2em] text-muted-foreground" dir="ltr">GO / EXPLORE</p>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="mt-2 text-4xl font-semibold">GoExplore</h1><p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t({ fa: "ده بلوک صدتایی. هر اتاق یک جهان فرهنگی. این نما فقط نمونه آزمایشی است.", en: "Ten blocks of 100 positions. Every room is a cultural world. This is a demo view only." })}</p></div>
        <Link to="/" className="rounded-full border px-4 py-2 text-sm">{t({ fa: "بازگشت به اتاق", en: "Back to my room" })}</Link>
      </div>
      <section className="relative isolate overflow-hidden rounded-3xl border border-slate-700 bg-[#0b0f1b] p-4 text-white sm:p-7" aria-label="GoExplore galaxy">
        <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(ellipse at 35% 25%,#28335380,transparent 55%), radial-gradient(ellipse at 75% 65%,#23274755,transparent 60%)" }} />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative flex min-w-[180px] max-w-sm flex-1 items-center"><Search className="absolute left-3 size-4 text-slate-400" /><input type="search" value={search} onChange={e => find(e.target.value)} placeholder={t({ fa: "نام یا شماره اتاق نمایشی", en: "Search sample room / number" })} className="h-11 w-full rounded-full border border-slate-600 bg-slate-900/80 px-10 text-sm text-white placeholder:text-slate-400" /></label>
            <button type="button" aria-label="Zoom out" onClick={() => setZoom(v => Math.max(.6, Math.round((v - .1) * 10) / 10))} className="grid size-11 place-items-center rounded-full border border-slate-600"><Minus className="size-4" /></button>
            <span className="w-12 text-center text-xs text-slate-300" dir="ltr">{Math.round(zoom * 100)}%</span>
            <button type="button" aria-label="Zoom in" onClick={() => setZoom(v => Math.min(1.5, Math.round((v + .1) * 10) / 10))} className="grid size-11 place-items-center rounded-full border border-slate-600"><Plus className="size-4" /></button>
            <button type="button" onClick={() => { setOffset({ x: 0, y: 0 }); setZoom(1); }} className="rounded-full border border-slate-600 px-4 py-3 text-xs">{t({ fa: "مرکز", en: "Center" })}</button>
          </div>
          <div className="my-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Galaxy blocks">{Array.from({ length: 10 }, (_, i) => <button key={i} type="button" role="tab" aria-selected={block === i} onClick={() => changeBlock(i)} className={["min-w-12 rounded-xl border px-3 py-2 text-xs", block === i ? "border-slate-400 bg-slate-500/70 text-white" : "border-slate-700 bg-slate-900/70 text-slate-400"].join(" ")}>{String(i + 1).padStart(2, "0")}</button>)}</div>
          <div onPointerDown={e => { if ((e.target as HTMLElement).closest("button")) return; drag.current = { x: e.clientX, y: e.clientY, oldX: offset.x, oldY: offset.y }; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => { if (!drag.current) return; const next = { x: Math.max(-150, Math.min(150, drag.current.oldX + e.clientX - drag.current.x)), y: Math.max(-150, Math.min(150, drag.current.oldY + e.clientY - drag.current.y)) }; setOffset(next); }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} className="relative grid h-[390px] touch-none place-items-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/40 sm:h-[480px]" style={{ cursor: drag.current ? "grabbing" : "grab" }} aria-label="Galaxy map: drag to pan">
            <div style={{ transform: "translate(" + offset.x + "px," + offset.y + "px) scale(" + zoom + ")" }} className="grid size-[320px] grid-cols-10 grid-rows-10 gap-1 rounded-xl border border-slate-600 bg-[#101827] p-1.5 transition-transform duration-75 sm:size-[400px]">
              {POSITIONS.map(pos => { const room = sampleMap.get(pos); return room ? <button key={pos} type="button" aria-label={"Demo Room " + room.number + " " + room.name} onClick={() => choose(room)} title={room.name} className="rounded-[4px] border border-amber-200/50 bg-amber-200 shadow-[0_0_12px_#e6cc80a0] transition-transform hover:scale-125 focus-visible:z-10" /> : <div key={pos} aria-hidden="true" className="rounded-[4px] border border-slate-700/50 bg-slate-700/20" />; })}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-400"><span dir="ltr">BLOCK {String(block + 1).padStart(2, "0")} · 100 POSITIONS</span><span>{t({ fa: "اتاق‌های روشن نمونه هستند؛ اتاق‌های خالی کاربران واقعی نیستند.", en: "Glowing rooms are samples, not real users." })}</span></div>
          {selected && <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-600 bg-slate-900/90 p-4">
            <div className="grid size-16 place-items-center rounded-xl bg-gradient-to-br from-slate-500 to-amber-200 text-2xl">✦</div>
            <div className="flex-1"><p className="text-sm font-semibold">#{selected.number} · {selected.name}</p><p className="mt-1 text-xs text-slate-400">{t(getVibe(selected.vibe)!.name)} · {t({ fa: "اتاق نمونه", en: "Sample room" })}</p></div>
            <button type="button" onClick={() => setVisiting(true)} className="rounded-full bg-white px-5 py-3 text-xs text-slate-900">{t({ fa: "مشاهده اتاق نمونه", en: "Preview demo room" })}</button>
          </div>}
        </div>
      </section>
      {visiting && selected && <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" role="presentation" onClick={() => setVisiting(false)}>
        <div role="dialog" aria-modal="true" aria-label="Demo room preview" onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-background p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">#{selected.number} · {selected.name}</h2><button type="button" aria-label="Close" onClick={() => setVisiting(false)}><X className="size-5" /></button></div>
          <p className="mb-5 text-sm text-muted-foreground">{t({ fa: "این اتاق ساختگی برای بررسی رابط است. ورود به اتاق عمومی کاربر واقعی نیازمند مجوز و تنظیمات حریم خصوصی است.", en: "This fictional room is a UI demo. Entering real user rooms requires authorization and verified privacy controls." })}</p>
          <div className="grid grid-cols-2 gap-3">{MODULES.map(m => <Link key={m.id} to="/explore/$module" params={{ module: m.id }} className="flex items-center gap-2 rounded-xl border p-4 text-sm"><m.icon className="size-4" />{m.brand}</Link>)}</div>
        </div>
      </div>}
      <div className="mt-7 flex flex-wrap gap-3">{MODULES.map(m => <Link key={m.id} to="/explore/$module" params={{ module: m.id }} className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm"><m.icon className="size-4" />{m.brand}</Link>)}<Link to="/discover" className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm"><Compass className="size-4" />GoVibe</Link></div>
      <p className="mt-5 text-xs text-muted-foreground">{t({ fa: "این نسخه فاقد شماره‌گذاری واقعی، دیتابیس اتاق‌ها و کشف کاربر است. هیچ داده خصوصی افشا نمی‌شود.", en: "This release does not claim real public room numbers, room database access or user discovery. No private user data is exposed." })}</p>
    </main>
  );
}
