/**
 * @fileoverview Translation service logic powered by Gemini API.
 * Handles single-string translation and cache management.
 */

/**
 * Supported languages and their metadata.
 */
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
  fr: { name: 'French', nativeName: 'Français' },
  es: { name: 'Spanish', nativeName: 'Español' },
  ar: { name: 'Arabic', nativeName: 'العربية' },
}

/**
 * In-memory cache for translations to avoid redundant API calls.
 * @type {Map<string, string|Promise<string>>}
 */
export const translationCache = new Map()

/**
 * Generates a consistent cache key for a given string and target language.
 * @param {string} text - The original text.
 * @param {string} targetLang - The ISO language code.
 * @returns {string} The formatted cache key.
 */
export function getCacheKey(text, targetLang) {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i)
    hash |= 0
  }
  return `${targetLang}_${Math.abs(hash)}`
}

/**
 * Translates a single string using Gemini 2.0 Flash.
 * @param {string} text - Text to translate.
 * @param {string} targetLang - Target language code.
 * @returns {Promise<string>} The translated text or original on failure.
 */
export async function translateWithGemini(text, targetLang) {
  if (targetLang === 'en') return text
  if (!text || text.trim() === '') return text

  const cacheKey = getCacheKey(text, targetLang)
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)
  }

  const langName = SUPPORTED_LANGUAGES[targetLang]?.name || targetLang
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Translate the following text to ${langName}. Return ONLY the translated text, nothing else, no explanation, no quotes:\n\n${text}`
            }]
          }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.1 }
        })
      }
    )
    const data = await response.json()
    const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text
    translationCache.set(cacheKey, translated)
    return translated
  } catch (error) {
    console.warn('Translation failed, using original text:', error)
    return text
  }
}
