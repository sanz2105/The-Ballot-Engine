import { useState, useCallback } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createPerfTrace } from '../lib/firebase'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const model = genAI ? genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: `You are the dramatic narrator of "The Ballot Engine", a gamified election education game.
Your audience is students and first-time voters learning about democratic processes.
Be cinematic, educational, and urgent. Always ground your feedback in real-world examples.
Never use bullet points. Write in flowing, dramatic prose.`,
}) : null

// Token bucket for rate limiting
class TokenBucket {
  constructor(capacity, fillRate) {
    this.capacity = capacity
    this.tokens = capacity
    this.fillRate = fillRate // tokens per second
    this.lastRefill = Date.now()
  }

  async consume() {
    this.refill()
    if (this.tokens >= 1) {
      this.tokens -= 1
      return true
    }
    return false
  }

  refill() {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.fillRate)
    this.lastRefill = now
  }
}

const bucket = new TokenBucket(2, 0.4) // 2 requests per 5 seconds

/**
 * Sanitize input to strip HTML and limit length
 */
const sanitize = (str) => {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '').slice(0, 500)
}

/**
 * Exponential backoff retry logic
 */
const withRetry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === maxRetries - 1) throw err
      const isRetryable = err.status === 429 || err.status >= 500
      if (!isRetryable) throw err
      const delay = Math.pow(2, i) * 1000
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

export const getNarratorFeedback = async (phase, chosenOption, correctOption, combo, country = 'Verdania') => {
  const cacheKey = `be_gemini_feedback_${phase.id}_${chosenOption.id}`
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) return cached

  while (!(await bucket.consume())) {
    await new Promise(r => setTimeout(r, 500))
  }

  const prompt = `Phase: "${sanitize(phase.title)}"
Scenario: "${sanitize(phase.scenario)}"
Player chose: "${sanitize(chosenOption.text)}" (score: ${chosenOption.points}/3)
Optimal answer: "${sanitize(correctOption.text)}"
Current combo: ${combo}
Country Context: ${sanitize(country)}

Write exactly 2 sentences:
1. Validate or correct the decision, citing a real-world election event as evidence.
2. Tease the next challenge with cinematic urgency.`

  const perfTrace = createPerfTrace('gemini_narrator_latency')
  perfTrace.start()

  try {
    const text = await withRetry(async () => {
      const result = await model.generateContent(prompt)
      return result.response.text()
    })
    
    sessionStorage.setItem(cacheKey, text)
    perfTrace.putAttribute('phase_id', phase.id)
    perfTrace.stop()
    return text
  } catch (error) {
    console.error(error)
    perfTrace.stop()
    return "The geopolitical tides are shifting, Commissioner. While your decision is recorded, the echoes of history remind us that even the smallest choice can decide a nation's fate."
  }
}

export const getHintText = async (phase, currentOptions) => {
  const cacheKey = `be_gemini_hint_${phase.id}`
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) return cached

  while (!(await bucket.consume())) {
    await new Promise(r => setTimeout(r, 500))
  }

  const prompt = `Phase: "${sanitize(phase.title)}"
Scenario: "${sanitize(phase.scenario)}"
Options: ${currentOptions.map(o => `"${sanitize(o.text)}"`).join(', ')}

Provide a subtle, dramatic hint (max 15 words) that points toward the best electoral practice without explicitly naming the option.`

  try {
    const text = await withRetry(async () => {
      const result = await model.generateContent(prompt)
      return result.response.text()
    })
    sessionStorage.setItem(cacheKey, text)
    return text
  } catch (error) {
    console.error(error)
    return "Recall the core principles of electoral integrity as you weigh your path."
  }
}

export const useGeminiNarrator = () => {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  const fetchFeedback = useCallback(async (...args) => {
    setLoading(true)
    const result = await getNarratorFeedback(...args)
    setFeedback(result)
    setLoading(false)
    return result
  }, [])

  const fetchHint = useCallback(async (...args) => {
    setLoading(true)
    const result = await getHintText(...args)
    setLoading(false)
    return result
  }, [])

  return { fetchFeedback, fetchHint, feedback, loading }
}
