import { GoogleGenerativeAI } from '@google/generative-ai'
import { createPerfTrace } from './firebase'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Use Gemini 2.5 Flash for fast, cost-efficient responses
const model = genAI ? genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: `You are the dramatic narrator of "The Ballot Engine", a gamified election education game.
Your audience is students and first-time voters learning about democratic processes.
Be cinematic, educational, and urgent. Always ground your feedback in real-world examples.
Never use bullet points. Write in flowing, dramatic prose.`,
}) : null

// Cache responses to avoid duplicate API calls
const responseCache = new Map()

// Rate limiting: max 1 Gemini call per 2 seconds per phase to prevent API abuse
let lastCallTimestamp = 0
const RATE_LIMIT_MS = 2000

/**
 * Sanitize a string input to strip any injected prompt content.
 * Removes characters commonly used in prompt injection attacks.
 */
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return ''
  return str.replace(/[<>{}|\\]/g, '').slice(0, 500)
}

export const getNarratorFeedback = async (phase, chosenOption, correctOption, comboStreak) => {
  const cacheKey = `${phase.id}-${chosenOption.id}`
  if (responseCache.has(cacheKey)) return responseCache.get(cacheKey)

  // Enforce rate limit
  const now = Date.now()
  const elapsed = now - lastCallTimestamp
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS - elapsed))
  }
  lastCallTimestamp = Date.now()

  // Sanitize all user-influenced inputs before interpolating into the prompt
  const safePhaseTitle = sanitizeInput(phase.title)
  const safeScenario = sanitizeInput(phase.scenario)
  const safeChosen = sanitizeInput(chosenOption.text)
  const safeCorrect = sanitizeInput(correctOption.text)
  const safeCombo = Number.isInteger(comboStreak) ? comboStreak : 0

  const prompt = `Phase: "${safePhaseTitle}"
Scenario: "${safeScenario}"
Player chose: "${safeChosen}" (score: ${chosenOption.points}/3 points)
Optimal answer: "${safeCorrect}"
Current combo streak: ${safeCombo}

Write exactly 2 sentences:
1. Validate OR correct the decision — cite a real country or election event as evidence.
2. Tease the next challenge with dramatic urgency.
Maximum 70 words total. No bullet points. No greetings. Cinematic and educational tone.`

  // Measure Gemini API latency with Firebase Performance Monitoring
  const perfTrace = createPerfTrace('gemini_narration_latency')
  perfTrace.start()

  try {
    if (!model) {
      throw new Error('Gemini API key is not configured.')
    }
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    perfTrace.putAttribute('phase_id', phase.id)
    perfTrace.putMetric('response_length', text.length)
    perfTrace.stop()

    responseCache.set(cacheKey, text)
    return text
  } catch (error) {
    perfTrace.stop()
    if (error.name === 'AbortError') return null
    return chosenOption.points === 3
      ? 'A textbook ruling, Commissioner — this mirrors the protocol used by the Election Commission of India and the Carter Center in international monitoring missions. Verdania grows stronger, but the next phase will demand even greater wisdom.'
      : 'A critical misstep, Commissioner — decisions like this have caused electoral crises in emerging democracies from Venezuela to Belarus. Study the correct approach carefully; what comes next leaves absolutely no margin for error.'
  }
}
