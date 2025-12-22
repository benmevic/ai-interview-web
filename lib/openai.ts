import OpenAI from 'openai'

let openaiInstance: OpenAI | null = null

/**
 * OpenAI client instance (lazy-loaded)
 * Used for CV analysis, question generation, and answer evaluation
 */
export const getOpenAI = () => {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error('Missing OpenAI API key')
    }

    openaiInstance = new OpenAI({
      apiKey:  apiKey,
    })
  }

  return openaiInstance
}

// For backwards compatibility
export const openai = new Proxy({} as OpenAI, {
  get(target, prop) {
    return (getOpenAI() as any)[prop]
  },
})
