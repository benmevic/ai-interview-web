/**
 * Validate required environment variables
 */
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}`
    )
  }
}

/**
 * Check if OpenAI is configured
 */
export function hasOpenAI(): boolean {
  return !!process.env.OPENAI_API_KEY
}

/**
 * Check if server-side Supabase is configured
 */
export function hasServerSupabase(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY
}
