/**
 * Server-only Supabase client.
 * Uses the SERVICE_ROLE key — never import this in client components.
 * The service role key bypasses RLS so it must only be used in API routes.
 */
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Fallback to anon key if service role isn't configured yet.
// With anon key the public INSERT policy on snapshots is still required.
const key = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!key) {
  throw new Error('Missing Supabase key — set SUPABASE_SERVICE_ROLE_KEY in env')
}

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  key,
  { auth: { persistSession: false } }
)

export const usingServiceRole = Boolean(serviceRoleKey)
