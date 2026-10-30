import type { Bi } from "./i18n";

/**
 * Canonical GO product constants (Phase 1 preview only).
 * Vibe CRUD and content tagging arrive in Phase 2; the DNA algorithm in Phase 3.
 */

export type QuadrantId = "dark-deep" | "dark-light" | "bright-deep" | "bright-light";

export const QUADRANTS: { id: QuadrantId; name: Bi; colorClass: string; bgClass: string }[] = [
  { id: "dark-deep", name: { fa: "تاریک و عمیق", en: "Dark & Deep" }, colorClass: "text-q-dark-deep", bgClass: "bg-q-dark-deep" },
  { id: "dark-light", name: { fa: "تاریک و سبک", en: "Dark & Light" }, colorClass: "text-q-dark-light", bgClass: "bg-q-dark-light" },
  { id: "bright-deep", name: { fa: "روشن و عمیق", en: "Bright & Deep" }, colorClass: "text-q-bright-deep", bgClass: "bg-q-bright-deep" },
  { id: "bright-light", name: { fa: "روشن و سبک", en: "Bright & Light" }, colorClass: "text-q-bright-light", bgClass: "bg-q-bright-light" },
];

export type Vibe = {
  id: string;
  name: Bi;
  quadrant: QuadrantId;
  /** Illustrative preview position. X: Dark(0) → Bright(100). Y: Deep(0) → Light(100). */
  x: number;
  y: number;
};

const RAW: Record<QuadrantId, [string, string, string][]> = {
  "dark-deep": [
    ["existential-void", "Existential Void", "خلأ وجودی"],
    ["beautiful-suffering", "Beautiful Suffering", "رنج زیبا"],
    ["melancholic-beauty", "Melancholic Beauty", "زیبایی مالیخولیایی"],
    ["psychological-abyss", "Psychological Abyss", "مغاک روانی"],
    ["surreal-mind", "Surreal Mind", "ذهن سورئال"],
    ["intellectual-maze", "Intellectual Maze", "هزارتوی فکری"],
  ],
  "dark-light": [
    ["dark-curiosity", "Dark Curiosity", "کنجکاوی تاریک"],
    ["beautiful-chaos", "Beautiful Chaos", "آشوب زیبا"],
    ["rebellion", "Rebellion", "عصیان"],
    ["twisted-humor", "Twisted Humor", "طنز تلخ"],
    ["dangerous-desire", "Dangerous Desire", "میل خطرناک"],
    ["adrenaline-rush", "Adrenaline Rush", "هیجان آدرنالین"],
  ],
  "bright-deep": [
    ["hope-renewal", "Hope & Renewal", "امید و نوزایی"],
    ["human-connection", "Human Connection", "پیوند انسانی"],
    ["romantic-longing", "Romantic Longing", "دلتنگی عاشقانه"],
    ["spiritual-wonder", "Spiritual Wonder", "شگفتی معنوی"],
    ["quiet-wisdom", "Quiet Wisdom", "خرد آرام"],
    ["bittersweet-nostalgia", "Bittersweet Nostalgia", "نوستالژی تلخ‌وشیرین"],
  ],
  "bright-light": [
    ["quiet-comfort", "Quiet Comfort", "آرامش دلنشین"],
    ["playful-joy", "Playful Joy", "شادی بازیگوش"],
    ["feel-good-escape", "Feel-Good Escape", "گریز دلپذیر"],
    ["dreamy-romance", "Dreamy Romance", "عاشقانهٔ رؤیایی"],
    ["sunny-optimism", "Sunny Optimism", "خوش‌بینی آفتابی"],
    ["pure-fun", "Pure Fun", "سرگرمی ناب"],
  ],
};

const ORIGIN: Record<QuadrantId, { x: number; y: number }> = {
  "dark-deep": { x: 0, y: 0 },
  "dark-light": { x: 0, y: 50 },
  "bright-deep": { x: 50, y: 0 },
  "bright-light": { x: 50, y: 50 },
};

export const VIBES: Vibe[] = (Object.keys(RAW) as QuadrantId[]).flatMap((q) =>
  RAW[q].map(([id, en, fa], i) => ({
    id,
    name: { en, fa },
    quadrant: q,
    x: ORIGIN[q].x + 10 + (i % 3) * 15,
    y: ORIGIN[q].y + 15 + Math.floor(i / 3) * 20,
  })),
);

export const getVibe = (id: string) => VIBES.find((v) => v.id === id);

/** Content rule (enforced from Phase 2): one primary vibe, up to four secondary vibes. */
export const MAX_SECONDARY_VIBES = 4;

export const DNA_DIMENSIONS: { id: string; name: Bi }[] = [
  { id: "emotional-depth", name: { fa: "عمق احساسی", en: "Emotional Depth" } },
  { id: "complexity-seeking", name: { fa: "پیچیدگی‌طلبی", en: "Complexity Seeking" } },
  { id: "novelty-seeking", name: { fa: "تازگی‌طلبی", en: "Novelty Seeking" } },
  { id: "intensity-preference", name: { fa: "ترجیح شدت", en: "Intensity Preference" } },
  { id: "reflective-preference", name: { fa: "ترجیح تأمل", en: "Reflective Preference" } },
  { id: "comfort-seeking", name: { fa: "آسایش‌طلبی", en: "Comfort Seeking" } },
];
