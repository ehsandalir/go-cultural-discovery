import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fa" | "en";
export type Bi = { fa: string; en: string };

type Ctx = { lang: Lang; dir: "rtl" | "ltr"; setLang: (l: Lang) => void; t: (s: Bi) => string };

const I18nContext = createContext<Ctx | null>(null);
const KEY = "go.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  // Persian-first: SSR and first paint are always fa/RTL; stored choice applies after hydration.
  const [lang, setLangState] = useState<Lang>("fa");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "en" || stored === "fa") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(KEY, l);
  }, []);

  const t = useCallback((s: Bi) => s[lang], [lang]);

  return (
    <I18nContext.Provider value={{ lang, dir: lang === "fa" ? "rtl" : "ltr", setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
