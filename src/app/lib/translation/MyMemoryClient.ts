export async function translateText(
    text: string,
    targetLang: string
  ): Promise<string> {
    // MyMemory: 1000 requests/día gratis sin registro
    // Para más volumen: registrarse gratis y pasar email como param
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", text);
    url.searchParams.set("langpair", `es|${targetLang}`);
    // url.searchParams.set("de", "tu@email.com"); // opcional para más cuota
  
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`MyMemory error: ${res.status}`);
  
    const data = await res.json();
    
    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails ?? "Error de traducción");
    }
  
    return data.responseData.translatedText as string;
  }