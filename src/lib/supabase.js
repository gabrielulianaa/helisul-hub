import { createClient } from '@supabase/supabase-js'

// Placeholders evitam erro durante o build quando env vars não estão definidas.
// Em runtime (browser ou servidor com env vars), os valores reais são usados.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL    ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
)
