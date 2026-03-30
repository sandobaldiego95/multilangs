// ─── TTSProvider.ts ────────────────────────────────────────────
export interface TTSProvider {
  speak(text: string, lang: string, voice?: string): Promise<void>;
  stop(): void;
  supports(lang: string): boolean;
}

// ─── WebSpeechProvider.ts ──────────────────────────────────────
function normalizeBcp47(tag: string): string {
  return tag.toLowerCase().replace(/_/g, "-");
}

/** Chrome/Edge cargan voces de forma asíncrona; sin esto a veces se usa la voz por defecto (p. ej. francés). */
function loadSpeechVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve([]);
  }
  const synth = window.speechSynthesis;
  return new Promise((resolve) => {
    const list = synth.getVoices();
    if (list.length > 0) {
      resolve(list);
      return;
    }
    const onVoices = () => {
      const v = synth.getVoices();
      if (v.length > 0) {
        synth.removeEventListener("voiceschanged", onVoices);
        resolve(v);
      }
    };
    synth.addEventListener("voiceschanged", onVoices);
    onVoices();
    window.setTimeout(() => {
      synth.removeEventListener("voiceschanged", onVoices);
      resolve(synth.getVoices());
    }, 800);
  });
}

export class WebSpeechProvider implements TTSProvider {
  private utterance: SpeechSynthesisUtterance | null = null;

  supports(_lang: string): boolean {
    return (
      typeof window !== "undefined" && "speechSynthesis" in window
    );
  }

  speak(text: string, lang: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.supports(lang)) {
        reject(new Error("Web Speech API no disponible en este navegador"));
        return;
      }

      void (async () => {
        try {
          const voices = await loadSpeechVoices();
          window.speechSynthesis.cancel();
          this.utterance = new SpeechSynthesisUtterance(text);
          this.utterance.lang = lang;
          this.utterance.rate = 0.92;
          this.utterance.pitch = 1;

          const want = normalizeBcp47(lang);
          const base = want.split("-")[0];
          const sameLang = voices.filter((v) => {
            const vl = normalizeBcp47(v.lang || "");
            return vl === want || vl.startsWith(`${base}-`) || vl === base;
          });
          const best =
            sameLang.find((v) => normalizeBcp47(v.lang) === want && v.localService) ??
            sameLang.find((v) => normalizeBcp47(v.lang) === want) ??
            sameLang.find((v) => v.localService) ??
            sameLang[0];
          if (best) this.utterance.voice = best;

          this.utterance.onend = () => resolve();
          this.utterance.onerror = (e) => reject(new Error(e.error));
          window.speechSynthesis.speak(this.utterance);
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      })();
    });
  }

  stop(): void {
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
  }
}

// ─── KokoroProvider.ts ─────────────────────────────────────────
// Idiomas con soporte en Kokoro-82M v1.0
// en: estable · it/pt: experimental pero funcional
const KOKORO_LANGS = ["en", "it", "pt"];

export class KokoroProvider implements TTSProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pipeline: any = null;
  private loading = false;
  private loadPromise: Promise<void> | null = null;

  supports(lang: string): boolean {
    return KOKORO_LANGS.includes(lang.split("-")[0]);
  }

  private async load(): Promise<void> {
    if (this.pipeline) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      this.loading = true;
      const { KokoroTTS } = await import("kokoro-js");
      this.pipeline = await KokoroTTS.from_pretrained(
        "onnx-community/Kokoro-82M-v1.0",
        { dtype: "q8" }  // cuantización 8-bit: buen balance calidad/velocidad
      );
      this.loading = false;
    })();

    return this.loadPromise;
  }

  async speak(text: string, _lang: string, voice = "af_heart"): Promise<void> {
    await this.load();
    const audio = await this.pipeline.generate(text, { voice });
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(audio.blob);
      const el = new Audio(url);
      el.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      el.onerror = reject;
      el.play().catch(reject);
    });
  }

  stop(): void {
    // Para una implementación más completa, guardar referencia al Audio element
  }
}

// ─── TTSOrchestrator.ts ────────────────────────────────────────
import { LANGUAGES } from "../languages";

export class TTSOrchestrator {
  private kokoro = new KokoroProvider();
  private webSpeech = new WebSpeechProvider();

  async speak(text: string, langCode: string): Promise<void> {
    const config = LANGUAGES.find((l) => l.code === langCode);

    if (config?.kokoroVoice && this.kokoro.supports(langCode)) {
      try {
        await this.kokoro.speak(text, langCode, config.kokoroVoice);
        return;
      } catch (err) {
        console.warn(`[Kokoro] Falló para ${langCode}, usando Web Speech:`, err);
      }
    }

    await this.webSpeech.speak(text, langCode);
  }

  stop(): void {
    this.webSpeech.stop();
  }
}
