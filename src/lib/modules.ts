import { Clapperboard, BookOpen, Headphones } from "lucide-react";
import type { Bi } from "./i18n";

export type ModuleId = "watch" | "read" | "listen";

export const MODULES: { id: ModuleId; brand: string; name: Bi; tagline: Bi; icon: typeof BookOpen }[] = [
  { id: "watch", brand: "GoWatch", name: { fa: "تماشا", en: "Watch" }, tagline: { fa: "فیلم‌ها، با حسی که می‌خواهی", en: "Films, by the feeling you seek" }, icon: Clapperboard },
  { id: "read", brand: "GoRead", name: { fa: "خواندن", en: "Read" }, tagline: { fa: "کتاب‌ها و جستارها", en: "Books and essays" }, icon: BookOpen },
  { id: "listen", brand: "GoListen", name: { fa: "شنیدن", en: "Listen" }, tagline: { fa: "موسیقی برای هر حال", en: "Music for every mood" }, icon: Headphones },
];

export const isModuleId = (v: string): v is ModuleId => v === "watch" || v === "read" || v === "listen";

/** DEMO placeholder works — fictional titles, no real metrics. Replaced by shared content in Phase 2. */
export type DemoWork = { id: string; module: ModuleId; title: Bi; primaryVibe: string; secondaryVibes: string[] };

export const DEMO_WORKS: DemoWork[] = [
  { id: "d1", module: "watch", title: { fa: "شب‌های بی‌ستاره", en: "Starless Nights" }, primaryVibe: "existential-void", secondaryVibes: ["melancholic-beauty"] },
  { id: "d2", module: "watch", title: { fa: "تابستان آخر", en: "The Last Summer" }, primaryVibe: "bittersweet-nostalgia", secondaryVibes: ["human-connection", "romantic-longing"] },
  { id: "d3", module: "watch", title: { fa: "دیوانگی شیرین", en: "Sweet Madness" }, primaryVibe: "twisted-humor", secondaryVibes: ["beautiful-chaos"] },
  { id: "d4", module: "read", title: { fa: "هزارتوی آینه‌ها", en: "Maze of Mirrors" }, primaryVibe: "intellectual-maze", secondaryVibes: ["surreal-mind"] },
  { id: "d5", module: "read", title: { fa: "باغ آرام", en: "The Quiet Garden" }, primaryVibe: "quiet-wisdom", secondaryVibes: ["quiet-comfort", "spiritual-wonder"] },
  { id: "d6", module: "read", title: { fa: "نامه‌های باران", en: "Letters of Rain" }, primaryVibe: "romantic-longing", secondaryVibes: ["melancholic-beauty"] },
  { id: "d7", module: "listen", title: { fa: "طلوع", en: "Sunrise" }, primaryVibe: "sunny-optimism", secondaryVibes: ["hope-renewal", "playful-joy"] },
  { id: "d8", module: "listen", title: { fa: "ضربان", en: "Pulse" }, primaryVibe: "adrenaline-rush", secondaryVibes: ["rebellion"] },
  { id: "d9", module: "listen", title: { fa: "ابرهای صورتی", en: "Pink Clouds" }, primaryVibe: "dreamy-romance", secondaryVibes: ["feel-good-escape"] },
];
