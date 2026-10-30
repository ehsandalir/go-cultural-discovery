import { QUADRANTS, VIBES, getVibe, type Vibe } from "@/lib/vibes";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function VibeChip({ vibe, active, onClick }: { vibe: Vibe; active?: boolean; onClick?: () => void }) {
  const { t } = useI18n();
  const q = QUADRANTS.find((x) => x.id === vibe.quadrant)!;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-all hover:border-primary/60",
        active ? "border-primary bg-primary/15 text-foreground shadow-glow" : "bg-card text-muted-foreground",
      )}
    >
      <span className={cn("size-2 rounded-full", q.bgClass)} />
      {t(vibe.name)}
    </button>
  );
}

export function VibeTag({ id, primary }: { id: string; primary?: boolean }) {
  const { t } = useI18n();
  const v = getVibe(id);
  if (!v) return null;
  const q = QUADRANTS.find((x) => x.id === v.quadrant)!;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px]", primary ? "bg-accent text-foreground" : "text-muted-foreground")}>
      <span className={cn("size-1.5 rounded-full", q.bgClass)} />
      {t(v.name)}
    </span>
  );
}

/** Spectrum map. Always rendered LTR so Dark→Bright reads consistently on the X axis. */
export function SpectrumMap({ selected, onSelect }: { selected?: string; onSelect: (id: string) => void }) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div dir="ltr" className="relative aspect-square w-full overflow-hidden rounded-xl bg-background">
        <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
        {VIBES.map((v) => {
          const q = QUADRANTS.find((x) => x.id === v.quadrant)!;
          return (
            <button
              key={v.id}
              type="button"
              title={t(v.name)}
              aria-label={t(v.name)}
              onClick={() => onSelect(v.id)}
              style={{ left: `${v.x}%`, bottom: `${100 - v.y}%` }}
              className={cn(
                "absolute size-3.5 -translate-x-1/2 translate-y-1/2 rounded-full transition-transform hover:scale-150",
                q.bgClass,
                selected === v.id && "scale-150 ring-2 ring-foreground",
              )}
            />
          );
        })}
        <span className="absolute bottom-1 left-2 text-[10px] text-muted-foreground">{t({ fa: "تاریک", en: "Dark" })}</span>
        <span className="absolute bottom-1 right-2 text-[10px] text-muted-foreground">{t({ fa: "روشن", en: "Bright" })}</span>
        <span className="absolute left-1/2 top-1 -translate-x-1/2 text-[10px] text-muted-foreground">{t({ fa: "عمیق", en: "Deep" })}</span>
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">{t({ fa: "سبک", en: "Light" })}</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {t({
          fa: "محور X: تاریک ← روشن، محور Y: عمیق ← سبک (۰ تا ۱۰۰). موقعیت‌ها فعلاً نمایشی‌اند.",
          en: "X: Dark → Bright, Y: Deep → Light (0–100). Positions are illustrative for now.",
        })}
      </p>
    </div>
  );
}
