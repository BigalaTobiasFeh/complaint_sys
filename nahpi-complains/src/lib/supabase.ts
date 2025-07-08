import { createBrowserClient, createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// For server-side operations that require elevated permissions
export const supabaseAdmin = createBrowserClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Server-side client factory
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
