"use client";

import { useState, useCallback, useRef } from "react";
import { translateText } from "@/app/lib/translation/MyMemoryClient";
import { TTSOrchestrator } from "@/app/lib/tts/TTSOrchestrator";
import { LANGUAGES, type Language } from "@/app/lib/languages";

export type LangState = {
  lang: Language;
  translation: string | null;
  status: "idle" | "translating" | "ready" | "playing" | "error";
  error: string | null;
};

export function useMultiLangTTS() {
  const orchestrator = useRef(new TTSOrchestrator());
  const [phrase, setPhrase] = useState("");
  const [langs, setLangs] = useState<LangState[]>(
    LANGUAGES.map((lang) => ({
      lang,
      translation: null,
      status: "idle",
      error: null,
    }))
  );

  const updateLang = (code: string, patch: Partial<LangState>) =>
    setLangs((prev) =>
      prev.map((l) => (l.lang.code === code ? { ...l, ...patch } : l))
    );

  const translateAll = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setLangs((prev) =>
      prev.map((l) => ({ ...l, status: "translating", error: null }))
    );

    await Promise.allSettled(
      LANGUAGES.map(async (lang) => {
        try {
          const translation = await translateText(text, lang.translateTo);
          updateLang(lang.code, { translation, status: "ready" });
        } catch (err: any) {
          updateLang(lang.code, {
            status: "error",
            error: err.message ?? "Error desconocido",
          });
        }
      })
    );
  }, []);

  const playLang = useCallback(async (langCode: string) => {
    const target = langs.find((l) => l.lang.code === langCode);
    if (!target?.translation) return;

    updateLang(langCode, { status: "playing" });
    try {
      await orchestrator.current.speak(target.translation, langCode);
      updateLang(langCode, { status: "ready" });
    } catch (err: any) {
      updateLang(langCode, { status: "error", error: err.message });
    }
  }, [langs]);

  const stopAll = useCallback(() => {
    orchestrator.current.stop();
    setLangs((prev) =>
      prev.map((l) => (l.status === "playing" ? { ...l, status: "ready" } : l))
    );
  }, []);

  return { phrase, setPhrase, langs, translateAll, playLang, stopAll };
}