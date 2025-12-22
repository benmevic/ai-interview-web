import { createClient } from '@supabase/supabase-js'

let supabaseInstance: ReturnType<typeof createClient> | null = null

/**
 * Supabase client instance (lazy-loaded)
 * Used for authentication and database operations
 */
export const getSupabase = () => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

// Named export (for imports like:  import { supabase } from '@/lib/supabase')
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    return (getSupabase() as any)[prop]
  },
})

// Default export (for imports like: import supabase from '@/lib/supabase')
export default supabase
