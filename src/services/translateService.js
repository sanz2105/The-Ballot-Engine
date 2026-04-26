/**
 * Translation service powered by Gemini API.
 * Uses the existing VITE_GEMINI_API_KEY — no additional API key or billing needed.
 * Supports: English, Hindi, French, Spanish, Arabic
 * @module translateService
 */

import { useState, useCallback } from 'react'

const SUPPORTED_LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧', nativeName: 'English' },
  hi: { name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  fr: { name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  ar: { name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
}

export { SUPPORTED_LANGUAGES }

const translationCache = new Map()

function getCacheKey(text, targetLang) {
  // Simple hash for cache key
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i)
    hash |= 0
  }
  return `${targetLang}_${Math.abs(hash)}`
}

/**
 * Translates text using Gemini API.
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (hi, fr, es, ar)
 * @returns {Promise<string>} Translated text
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
  } catch {
    console.warn('Translation failed, using original text')
    return text
  }
}

/**
 * React hook for managing UI language and translation.
 * @returns {{ language, setLanguage, translateText, isTranslating, supportedLanguages }}
 */
export function useTranslation() {
  const [language, setLanguageState] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)

  const setLanguage = useCallback(async (lang) => {
    setLanguageState(lang)
  }, [])

  const translateText = useCallback(async (text) => {
    if (language === 'en') return text
    setIsTranslating(true)
    try {
      const result = await translateWithGemini(text, language)
      return result
    } finally {
      setIsTranslating(false)
    }
  }, [language])

  return {
    language,
    setLanguage,
    translateText,
    isTranslating,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }
}
