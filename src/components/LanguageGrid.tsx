"use client";

import type { LangState } from "@/hooks/useMultiLangTTS";
import styles from "./LanguageGrid.module.css";

type GridProps = {
  langs: LangState[];
  onPlay: (code: string) => void;
  onStop: () => void;
};

export function LanguageGrid({ langs, onPlay, onStop }: GridProps) {
  return (
    <div className={styles.grid}>
      {langs.map((lang, i) => (
        <LanguageCard
          key={lang.lang.code}
          state={lang}
          index={i}
          onPlay={() =>
            lang.status === "playing" ? onStop() : onPlay(lang.lang.code)
          }
        />
      ))}
    </div>
  );
}

type CardProps = {
  state: LangState;
  index: number;
  onPlay: () => void;
};

function LanguageCard({ state, index, onPlay }: CardProps) {
  const { lang, translation, status, error } = state;

  const isPlaying     = status === "playing";
  const isReady       = status === "ready";
  const isTranslating = status === "translating";
  const isError       = status === "error";

  const canPlay = isReady || isPlaying;

  return (
    <div
      className={[
        styles.card,
        isPlaying     ? styles.cardPlaying     : "",
        isReady       ? styles.cardReady       : "",
        isError       ? styles.cardError       : "",
        isTranslating ? styles.cardTranslating : "",
      ].join(" ")}
      style={{ animationDelay: `${0.2 + index * 0.07}s` }}
    >
      {/* Top row */}
      <div className={styles.topRow}>
        <div className={styles.langInfo}>
          <span className={styles.flag}>{lang.flag}</span>
          <div>
            <div className={styles.langName}>{lang.name}</div>
            <div className={styles.langCode}>{lang.code}</div>
          </div>
        </div>
        <ProviderBadge provider={lang.provider} />
      </div>

      {/* Translation */}
      <div className={styles.translationArea}>
        {isTranslating && (
          <div className={styles.skeletonWrap}>
            <div className={styles.skeleton} style={{ width: "85%" }} />
            <div className={styles.skeleton} style={{ width: "55%" }} />
          </div>
        )}
        {!isTranslating && translation && (
          <p className={styles.translation}>{translation}</p>
        )}
        {!isTranslating && !translation && !isError && (
          <p className={styles.empty}>—</p>
        )}
        {isError && (
          <p className={styles.errorText}>{error ?? "Error al traducir"}</p>
        )}
      </div>

      {/* Play button */}
      <button
        className={[styles.playBtn, isPlaying ? styles.playBtnActive : ""].join(" ")}
        onClick={onPlay}
        disabled={!canPlay}
        aria-label={isPlaying ? "Detener" : `Reproducir en ${lang.name}`}
      >
        <span className={styles.playIcon}>
          {isPlaying ? <IconPause /> : <IconPlay />}
        </span>
        <span className={styles.playLabel}>
          {isPlaying ? "Detener" : "Reproducir"}
        </span>
        {isPlaying && <WaveAnimation />}
      </button>
    </div>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  const isKokoro = provider === "kokoro";
  return (
    <span
      className={[styles.badge, isKokoro ? styles.badgeKokoro : styles.badgeWeb].join(" ")}
    >
      {isKokoro ? "Kokoro" : "Web Speech"}
    </span>
  );
}

function IconPlay() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 2.5l8 4.5-8 4.5V2.5z" fill="currentColor"/>
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2.5" y="2" width="3" height="10" rx="1" fill="currentColor"/>
      <rect x="8.5" y="2" width="3" height="10" rx="1" fill="currentColor"/>
    </svg>
  );
}

function WaveAnimation() {
  return (
    <span className={styles.wave} aria-hidden>
      {[1,2,3,4].map((i) => (
        <span key={i} className={styles.waveBar} style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </span>
  );
}
