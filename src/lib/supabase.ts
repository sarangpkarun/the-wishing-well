import { createClient } from '@supabase/supabase-js'
import { getSessionId } from './session'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isConfigured = Boolean(url && key)

// Anon key only: the schema lets the `anon` role read and insert, so no sign-in is needed.
export const supabase = createClient(url ?? 'http://localhost:54321', key ?? 'missing-key', {
  auth: { persistSession: false, autoRefreshToken: false },
  // Lets the database rate-limit per browser session (see migration 0004).
  global: { headers: { 'x-session-id': getSessionId() } },
})
