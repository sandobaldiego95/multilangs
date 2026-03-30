/**
 * DeepL Free API — 500.000 caracteres/mes gratis
 * Docs: https://developers.deepl.com/docs
 *
 * Guardá tu API key en .env.local:
 *   DEEPL_API_KEY=tu-api-key-aqui
 *
 * Nota: las keys del plan Free terminan en :fx
 * Ejemplo: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx
 */

// DeepL usa sus propios códigos de idioma (no BCP-47 estándar)
const DEEPL_LANG_MAP: Record<string, string> = {
  it: "IT",
  en: "EN-US",
  pt: "PT-BR",
  de: "DE",
  fr: "FR",
};

export async function translateText(
  text: string,
  targetLang: string
): Promise<string> {
  "use server";
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    throw new Error("Falta DEEPL_API_KEY en .env.local");
  }

  const deeplLang = DEEPL_LANG_MAP[targetLang];
  if (!deeplLang) {
    throw new Error(`Idioma no soportado por DeepL: ${targetLang}`);
  }

  // Free tier usa api-free.deepl.com, Pro usa api.deepl.com
  const baseUrl = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com"
    : "https://api.deepl.com";

  const res = await fetch(`${baseUrl}/v2/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [text],
      source_lang: "ES",
      target_lang: deeplLang,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepL error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const translated = data.translations?.[0]?.text as string;
  if (!translated) throw new Error("DeepL devolvió respuesta vacía");

  return translated;
}
