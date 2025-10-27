/**
 * Cliente Supabase
 * Configuração do cliente para acesso ao backend
 *
 * NOTA: Se as variáveis de ambiente não estiverem configuradas,
 * o sistema funcionará em modo mock (USE_MOCK_DATA = true em parada.api.ts)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Verifica se as variáveis de ambiente estão configuradas
const isSupabaseConfigured =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Variáveis de ambiente do Supabase não configuradas.\n' +
    'O sistema funcionará em modo MOCK.\n' +
    'Para usar Supabase real, configure as variáveis no arquivo .env:\n' +
    '  VITE_SUPABASE_URL=sua_url_aqui\n' +
    '  VITE_SUPABASE_ANON_KEY=sua_chave_aqui'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export { isSupabaseConfigured }

