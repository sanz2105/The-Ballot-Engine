import { useState, useCallback, createContext, useContext, useEffect, useRef } from 'react'
import { SUPPORTED_LANGUAGES, getCacheKey, translationCache } from '../services/translateService'

const TranslationContext = createContext()

export function TranslationProvider({ children }) {
  const [language, setLanguage] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [activePending, setActivePending] = useState(new Set())
  const [, forceUpdate] = useState(0)
  const queueRef = useRef(new Set())

  // Move strings from queueRef to activePending via interval to avoid state updates during render
  useEffect(() => {
    const interval = setInterval(() => {
      if (queueRef.current.size > 0 && !isTranslating) {
        const nextBatch = new Set(queueRef.current)
        queueRef.current.clear()
        setActivePending(prev => {
          const combined = new Set(prev)
          nextBatch.forEach(s => combined.add(s))
          return combined
        })
      }
    }, 500)
    return () => clearInterval(interval)
  }, [isTranslating])

  // Process activePending translations
  useEffect(() => {
    if (language === 'en' || activePending.size === 0 || isTranslating) return

    const processQueue = async () => {
      setIsTranslating(true)
      const stringsToTranslate = Array.from(activePending)
      setActivePending(new Set()) // Clear active queue

      const batchSize = 5
      for (let i = 0; i < stringsToTranslate.length; i += batchSize) {
        const batch = stringsToTranslate.slice(i, i + batchSize)
        const langName = SUPPORTED_LANGUAGES[language]?.name || language
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY
        
        if (!apiKey) {
          setIsTranslating(false)
          return
        }

        const batchText = batch.join('\n---\n')
        
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `Translate each of the following segments to ${langName}. Keep the segments separated by exactly "---". Return ONLY the translated segments:\n\n${batchText}`
                  }]
                }],
                generationConfig: { maxOutputTokens: 1000, temperature: 0.1 }
              })
            }
          )
          
          if (response.status === 429) {
            console.warn('Gemini Translation Rate Limit Hit (429). Waiting...')
            await new Promise(r => setTimeout(r, 5000))
            batch.forEach(s => queueRef.current.add(s))
            continue
          }

          const data = await response.json()
          const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
          const translatedBatch = fullText.split('---').map(s => s.trim())
          
          batch.forEach((original, idx) => {
            const translated = translatedBatch[idx] || original
            const cacheKey = getCacheKey(original, language)
            translationCache.set(cacheKey, translated)
          })
          
          forceUpdate(n => n + 1)
        } catch (error) {
          console.error('Batch translation failed:', error)
        }
        
        if (i + batchSize < stringsToTranslate.length) {
          await new Promise(r => setTimeout(r, 2000))
        }
      }
      
      setIsTranslating(false)
    }

    processQueue()
  }, [language, activePending, isTranslating])

  const t = useCallback((text) => {
    if (!text) return ''
    if (language === 'en') return text
    const cacheKey = getCacheKey(text, language)
    
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)
    }

    queueRef.current.add(text)
    return text
  }, [language])

  const registerStrings = useCallback((strings) => {
    if (language === 'en' || !strings?.length) return
    strings.forEach(s => {
      if (s && !translationCache.has(getCacheKey(s, language))) {
        queueRef.current.add(s)
      }
    })
  }, [language])

  const value = {
    t,
    language,
    setLanguage,
    isTranslating,
    registerStrings,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    return {
      t: (text) => text,
      language: 'en',
      setLanguage: () => {},
      isTranslating: false,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }
  }
  return context
}
