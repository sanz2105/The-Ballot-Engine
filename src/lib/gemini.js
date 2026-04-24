import { GoogleGenerativeAI } from '@google/generative-ai'

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

export const getNarratorFeedback = async (phase, chosenOption, correctOption, comboStreak) => {
  const cacheKey = `${phase.id}-${chosenOption.id}`
  if (responseCache.has(cacheKey)) return responseCache.get(cacheKey)

  const prompt = `Phase: "${phase.title}"
Scenario: "${phase.scenario}"
Player chose: "${chosenOption.text}" (score: ${chosenOption.points}/3 points)
Optimal answer: "${correctOption.text}"
Current combo streak: ${comboStreak}

Write exactly 2 sentences:
1. Validate OR correct the decision — cite a real country or election event as evidence.
2. Tease the next challenge with dramatic urgency.
Maximum 70 words total. No bullet points. No greetings. Cinematic and educational tone.`

  try {
    if (!model) {
      throw new Error('Gemini API key is not configured.')
    }
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    responseCache.set(cacheKey, text)
    return text
  } catch (error) {
    if (error.name === 'AbortError') return null
    return chosenOption.points === 3
      ? 'A textbook ruling, Commissioner — this mirrors the protocol used by the Election Commission of India and the Carter Center in international monitoring missions. Verdania grows stronger, but the next phase will demand even greater wisdom.'
      : 'A critical misstep, Commissioner — decisions like this have caused electoral crises in emerging democracies from Venezuela to Belarus. Study the correct approach carefully; what comes next leaves absolutely no margin for error.'
  }
}
