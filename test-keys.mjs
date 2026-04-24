import fs from 'fs'
import { GoogleGenerativeAI } from '@google/generative-ai'

const env = fs.readFileSync('c:/Users/gupta/OneDrive/Desktop/PromptWars/TheBallotEngine/.env', 'utf-8')
  .split('\n')
  .reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) acc[match[1].trim()] = match[2].trim()
    return acc
  }, {})

async function run() {
  const genAI = new GoogleGenerativeAI(env.VITE_GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  try {
    const result = await model.generateContent('Say "API key is valid!"')
    console.log('Gemini Result:', result.response.text().trim())
    console.log('✅ Gemini API is Working')
  } catch (e) {
    console.error('❌ Gemini Error:', e.message)
  }
}
run()
