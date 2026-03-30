"use client";

import { PhraseInput } from "@/components/PhraseInput";
import { LanguageGrid } from "@/components/LanguageGrid";
import { useMultiLangTTS } from "@/hooks/multilang-tts";
import styles from "./page.module.css";

export default function Home() {
  const { phrase, setPhrase, langs, translateAll, playLang, stopAll } =
    useMultiLangTTS();

  return (
    <main className={styles.main}>
      {/* Ambient background glow */}
      <div className={styles.ambientGlow} aria-hidden />

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <span className={styles.eyebrow}>Polyglot TTS</span>
          <h1 className={styles.title}>
            Escuchá el mundo
            <br />
            <em>en tu idioma</em>
          </h1>
          <p className={styles.subtitle}>
            Escribí cualquier frase en español y reproducila
            <br />
            con voces naturales en 5 idiomas.
          </p>
        </header>

        {/* Input */}
        <PhraseInput
          value={phrase}
          onChange={setPhrase}
          onSubmit={translateAll}
          isLoading={langs.some((l) => l.status === "translating")}
        />

        {/* Language cards */}
        <LanguageGrid langs={langs} onPlay={playLang} onStop={stopAll} />

        {/* Footer */}
        <footer className={styles.footer}>
          <span>Kokoro-82M</span> para EN · JA &nbsp;·&nbsp;
          <span>Web Speech API</span> fallback &nbsp;·&nbsp;
          <span>MyMemory</span> traducción gratuita
        </footer>
      </div>
    </main>
  );
}
