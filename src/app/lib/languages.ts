export type Language = {
  code: string;
  translateTo: string;
  name: string;
  flag: string;
  provider: "kokoro" | "webspeech";
  kokoroVoice: string | null;
};

export const LANGUAGES: Language[] = [
  {
    code: "it-IT",
    translateTo: "it",
    name: "Italiano",
    flag: "🇮🇹",
    // Kokoro en el navegador suele pronunciar el italiano mal (fonetización EN);
    // Web Speech usa las voces TTS del SO y suena realmente italiano.
    provider: "webspeech",
    kokoroVoice: null,
  },
  {
    code: "en-US",
    translateTo: "en",
    name: "Inglés",
    flag: "🇺🇸",
    provider: "kokoro",
    kokoroVoice: "af_heart",  // la mejor voz inglesa de Kokoro
  },
  {
    code: "pt-BR",
    translateTo: "pt",
    name: "Portugués",
    flag: "🇧🇷",
    provider: "kokoro",
    kokoroVoice: "pf_dora",   // voz portuguesa femenina de Kokoro
  },
  {
    code: "de-DE",
    translateTo: "de",
    name: "Alemán",
    flag: "🇩🇪",
    provider: "webspeech",
    kokoroVoice: null,        // Kokoro sin soporte DE → Web Speech
  },
  {
    code: "fr-FR",
    translateTo: "fr",
    name: "Francés",
    flag: "🇫🇷",
    provider: "webspeech",
    kokoroVoice: null,        // Kokoro sin soporte FR → Web Speech
  },
];
