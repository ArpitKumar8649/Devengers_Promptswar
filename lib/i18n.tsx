"use client";

import { createContext, useContext, useEffect, useState } from "react";

/** Supported languages. `name` is what we send to Qwen ("Respond in {name}"). */
export const LANGUAGES = [
  { code: "en", name: "English", label: "English" },
  { code: "hi", name: "Hindi", label: "हिन्दी" },
  { code: "ta", name: "Tamil", label: "தமிழ்" },
  { code: "bn", name: "Bengali", label: "বাংলা" },
  { code: "mr", name: "Marathi", label: "मराठी" },
  { code: "te", name: "Telugu", label: "తెలుగు" },
] as const;

export type Language = (typeof LANGUAGES)[number];

type Ctx = {
  lang: Language;
  setLang: (code: string) => void;
};

const LanguageContext = createContext<Ctx>({
  lang: LANGUAGES[0],
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(LANGUAGES[0]);

  useEffect(() => {
    const saved = localStorage.getItem("sb_lang");
    if (saved) {
      const found = LANGUAGES.find((l) => l.code === saved);
      if (found) setLangState(found);
    }
  }, []);

  function setLang(code: string) {
    const found = LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
    setLangState(found);
    localStorage.setItem("sb_lang", found.code);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
