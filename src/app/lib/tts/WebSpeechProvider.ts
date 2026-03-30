import type { TTSProvider } from "../translation/TTSProvider";

export class WebSpeechProvider implements TTSProvider {
  private utterance: SpeechSynthesisUtterance | null = null;

  supports(_lang: string): boolean {
    // disponible en cualquier idioma que tenga el sistema operativo
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  speak(text: string, lang: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.supports(lang)) {
        reject(new Error("Web Speech API no disponible"));
        return;
      }
      window.speechSynthesis.cancel();

      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.lang = lang;

      // Intentar encontrar una voz nativa del idioma (más natural)
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(
        (v) => v.lang.startsWith(lang.split("-")[0]) && v.localService
      ) ?? voices.find(
        (v) => v.lang.startsWith(lang.split("-")[0])
      );
      if (match) this.utterance.voice = match;

      this.utterance.rate = 0.95;
      this.utterance.pitch = 1;
      this.utterance.onend = () => resolve();
      this.utterance.onerror = (e) => reject(e);

      window.speechSynthesis.speak(this.utterance);
    });
  }

  stop(): void {
    window.speechSynthesis?.cancel();
  }
}