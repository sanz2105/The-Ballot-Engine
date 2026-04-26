/**
 * Text-to-speech service using the browser's Web Speech API.
 * This is a W3C standard supported by all modern browsers — no API key needed.
 * Fulfills Google Chrome's built-in TTS which uses Google's voices.
 */
import { useState, useCallback } from 'react'

export function speakText(text, options = {}) {
  if (!('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel() // stop any current speech
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = options.rate || 0.95
  utterance.pitch = options.pitch || 1
  utterance.volume = options.volume || 1
  // Prefer a Google voice if available
  const voices = window.speechSynthesis.getVoices()
  const googleVoice = voices.find(v => v.name.includes('Google'))
  if (googleVoice) utterance.voice = googleVoice
  window.speechSynthesis.speak(utterance)
  return true
}

export function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

export function isSpeechSupported() {
  return 'speechSynthesis' in window
}

/**
 * React hook for text-to-speech functionality.
 * @returns {{ speak, stop, isSpeaking, isSupported }}
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const speak = useCallback((text) => {
    if (!isSpeechSupported()) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    const voices = window.speechSynthesis.getVoices()
    const googleVoice = voices.find(v => v.name.includes('Google'))
    if (googleVoice) utterance.voice = googleVoice
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    stopSpeech()
    setIsSpeaking(false)
  }, [])

  return { speak, stop, isSpeaking, isSupported: isSpeechSupported() }
}
