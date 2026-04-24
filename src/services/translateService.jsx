import React, { useState, useCallback, createContext, useContext, useEffect } from 'react'

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY
const BASE_URL = 'https://translation.googleapis.com/language/translate/v2'

const TranslationContext = createContext()

/**
 * Simple djb2 hash function for string hashing
 */
const hashString = (str) => {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i)
  }
  return hash.toString(16)
}

export const translateText = async (text, targetLang) => {
  if (!text || targetLang === 'en') return text

  const hash = hashString(text)
  const cacheKey = `be_translate_${targetLang}_${hash}`
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) return cached

  try {
    const resp = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        target: targetLang,
      }),
    })
    const data = await resp.json()
    const translatedText = data.data.translations[0].translatedText
    sessionStorage.setItem(cacheKey, translatedText)
    return translatedText
  } catch (err) {
    console.error('Translation error:', err)
    return text
  }
}

export const translateBatch = async (textsArray, targetLang) => {
  if (targetLang === 'en') return textsArray

  const results = new Array(textsArray.length)
  const toTranslate = []
  const map = []

  textsArray.forEach((text, i) => {
    const hash = hashString(text)
    const cacheKey = `be_translate_${targetLang}_${hash}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      results[i] = cached
    } else {
      toTranslate.push(text)
      map.push(i)
    }
  })

  if (toTranslate.length === 0) return results

  try {
    const resp = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: toTranslate,
        target: targetLang,
      }),
    })
    const data = await resp.json()
    data.data.translations.forEach((t, i) => {
      const originalIdx = map[i]
      const text = toTranslate[i]
      const hash = hashString(text)
      const cacheKey = `be_translate_${targetLang}_${hash}`
      
      results[originalIdx] = t.translatedText
      sessionStorage.setItem(cacheKey, t.translatedText)
    })
    return results
  } catch (err) {
    console.error('Batch translation error:', err)
    return textsArray
  }
}

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationsMap, setTranslationsMap] = useState({})

  const t = useCallback((text) => {
    if (language === 'en') return text
    const hash = hashString(text)
    return translationsMap[hash] || text
  }, [language, translationsMap])

  // Automatically translate any new strings that appear
  const registerStrings = useCallback(async (strings) => {
    if (language === 'en' || !strings.length) return

    const untranslated = strings.filter(s => !translationsMap[hashString(s)])
    if (!untranslated.length) return

    setIsTranslating(true)
    const translated = await translateBatch(untranslated, language)
    
    setTranslationsMap(prev => {
      const next = { ...prev }
      untranslated.forEach((s, i) => {
        next[hashString(s)] = translated[i]
      })
      return next
    })
    setIsTranslating(false)
  }, [language, translationsMap])

  // Re-translate all known strings when language changes
  useEffect(() => {
    if (language === 'en') return

    const knownStrings = Object.values(translationsMap) // This isn't quite right, we need the original English keys
    // Let's store originals in the map too or just rely on components calling t()
  }, [language])

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage, isTranslating, registerStrings }}>
      {children}
    </TranslationContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (!context) {
    // Fallback if provider is missing
    return { t: (s) => s, language: 'en', setLanguage: () => {}, isTranslating: false, registerStrings: () => {} }
  }
  return context
}
