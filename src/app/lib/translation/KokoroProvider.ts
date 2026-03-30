import type { TTSProvider } from "./TTSProvider";

// Idiomas que Kokoro soporta bien
const KOKORO_SUPPORTED = ["en", "ja"];

export class KokoroProvider implements TTSProvider {
  // Cargamos el pipeline de forma lazy (solo cuando se necesita)
  private pipeline: any = null;
  private loading = false;

  supports(lang: string): boolean {
    const base = lang.split("-")[0];
    return KOKORO_SUPPORTED.includes(base);
  }

  private async getPipeline() {
    if (this.pipeline) return this.pipeline;
    if (this.loading) {
      // esperar a que cargue
      while (this.loading) await new Promise((r) => setTimeout(r, 100));
      return this.pipeline;
    }

    this.loading = true;
    try {
      // kokoro-js usa dynamic import para no bloquear la app
      const { KokoroTTS } = await import("kokoro-js");
      // dtype: "q8" = buen balance calidad/velocidad en browser
      this.pipeline = await KokoroTTS.from_pretrained(
        "onnx-community/Kokoro-82M-v1.0",
        { dtype: "q8" }
      );
    } finally {
      this.loading = false;
    }
    return this.pipeline;
  }

  async speak(text: string, lang: string, voice = "af_heart"): Promise<void> {
    const tts = await this.getPipeline();
    // generate() devuelve un objeto con blob de audio
    const audio = await tts.generate(text, { voice });
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(audio.blob);
      const el = new Audio(url);
      el.onended = () => { URL.revokeObjectURL(url); resolve(); };
      el.onerror = reject;
      el.play().catch(reject);
    });
  }

  stop(): void {
    // No hay control directo de stop en kokoro-js v1
    // Para producción: mantener referencia al Audio element
  }
}