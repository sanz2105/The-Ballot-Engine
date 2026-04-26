/**
 * @fileoverview Gemini AI Service for dynamic narration and performance analysis.
 * Uses Gemini 2.0 Flash for low-latency, high-quality civic feedback.
 */

import { useState, useCallback } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createPerfTrace } from '../lib/firebase'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

/**
 * Configured Gemini model with specific system instructions for the narrator persona.
 */
const model = genAI ? genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
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
 * Sanitize input to strip HTML and limit length for safe API calls.
 * @param {string} str - Input string.
 * @returns {string} Sanitized string.
 */
const sanitize = (str) => {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '').slice(0, 500)
}

/**
 * Exponential backoff retry logic for resilient API calls.
 * @param {Function} fn - Async function to retry.
 * @param {number} maxRetries - Maximum retry attempts.
 * @returns {Promise<any>}
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

/**
 * Generates dramatic feedback based on the player's decision.
 * @param {Object} phase - Current game phase.
 * @param {Object} chosenOption - Option selected by the player.
 * @param {Object} correctOption - The optimal option for the phase.
 * @param {number} combo - Current combo streak.
 * @param {string} country - In-game country context.
 * @returns {Promise<string>} Gemini generated feedback.
 */
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
    console.error('Narrator failed:', error)
    perfTrace.stop()
    return "The geopolitical tides are shifting, Commissioner. While your decision is recorded, the echoes of history remind us that even the smallest choice can decide a nation's fate."
  }
}

/**
 * Generates a subtle hint for the current phase.
 * @param {Object} phase - Current game phase.
 * @param {Array} currentOptions - Available options.
 * @returns {Promise<string>} Gemini generated hint.
 */
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
    console.error('Hint failed:', error)
    return "Recall the core principles of electoral integrity as you weigh your path."
  }
}

/**
 * Analyzes the player's overall performance at the end of the game.
 * @param {Array} phaseResults - Results from all 8 phases.
 * @param {number} totalXP - Final XP earned.
 * @returns {Promise<string>} A personalized civic persona analysis.
 */
export const getAIReview = async (phaseResults, totalXP) => {
  const cacheKey = 'be_gemini_final_review'
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) return cached

  while (!(await bucket.consume())) {
    await new Promise(r => setTimeout(r, 500))
  }

  const summary = phaseResults.map((r, i) => `Phase ${i+1}: Score ${r.points}/3`).join(', ')
  const prompt = `Final Game Results: ${summary}
Total XP: ${totalXP}

As the AI Election Commissioner, analyze this player's performance. 
Give them a unique "Civic Title" (e.g., The Vigilant Guardian, The Pragmatic Reformer) and 
write a 3-sentence summary of their leadership style based on their scores. 
Be encouraging but analytical.`

  try {
    const text = await withRetry(async () => {
      const result = await model.generateContent(prompt)
      return result.response.text()
    })
    sessionStorage.setItem(cacheKey, text)
    return text
  } catch (error) {
    console.error('AI Review failed:', error)
    return "Your service to Verdania is noted. You have proven that democracy is not merely a vote, but a series of courageous choices. You are: The Democratic Pioneer."
  }
}

/**
 * Hook to interface with Gemini AI features.
 */
export const useGeminiNarrator = () => {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [review, setReview] = useState('')

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

  const fetchReview = useCallback(async (...args) => {
    setLoading(true)
    const result = await getAIReview(...args)
    setReview(result)
    setLoading(false)
    return result
  }, [])

  return { fetchFeedback, fetchHint, fetchReview, feedback, review, loading }
}

