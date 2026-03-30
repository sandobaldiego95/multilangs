export interface TTSProvider {
    /** Habla el texto en el idioma dado. Devuelve una promesa que resuelve cuando termina. */
    speak(text: string, lang: string): Promise<void>;
    /** Detiene la reproducción actual si la hay. */
    stop(): void;
    /** Indica si este proveedor puede manejar el idioma dado. */
    supports(lang: string): boolean;
  }