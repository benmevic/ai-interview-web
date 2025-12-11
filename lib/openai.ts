import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('Missing OpenAI API key')
}

/**
 * OpenAI client instance
 * Used for CV analysis, question generation, and answer evaluation
 */
export const openai = new OpenAI({
  apiKey: apiKey,
})
