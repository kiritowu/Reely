import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for use in Client Components
 * Automatically handles cookies via document.cookie
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

