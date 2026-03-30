"use client";

import { useRef, useEffect } from "react";
import styles from "./PhraseInput.module.css";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (text: string) => void;
  isLoading: boolean;
};

export function PhraseInput({ value, onChange, onSubmit, isLoading }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault();
      onSubmit(value);
    }
  };

  const canSubmit = value.trim().length > 0 && !isLoading;

  return (
    <div className={styles.wrapper} style={{ animationDelay: "0.1s" }}>
      <div className={styles.inputBox}>
        <div className={styles.inputLabel}>
          <span className={styles.langTag}>ES</span>
          Frase en español
        </div>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="El conocimiento es la llave que abre todas las puertas…"
          maxLength={200}
          rows={2}
          disabled={isLoading}
        />
        <div className={styles.inputFooter}>
          <span className={styles.hint}>↵ Enter para traducir</span>
          <span className={`${styles.charCount} ${value.length > 160 ? styles.charWarn : ""}`}>
            {value.length} / 200
          </span>
        </div>
      </div>

      <button
        className={`${styles.btn} ${isLoading ? styles.loading : ""}`}
        onClick={() => onSubmit(value)}
        disabled={!canSubmit}
      >
        {isLoading ? (
          <>
            <Spinner />
            Traduciendo…
          </>
        ) : (
          <>
            <IconTranslate />
            Traducir a 5 idiomas
          </>
        )}
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.spinner}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round"/>
    </svg>
  );
}

function IconTranslate() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h7M5.5 2v2M3 4c.5 3 3 5 5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 10c1-1 3.5-1 4.5 0M9 8v6M7 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
