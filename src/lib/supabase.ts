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
// IMPORTANTE: VITE_SUPABASE_SERVICE_KEY é exposta no bundle apenas para uso em ambiente de desenvolvimento/MVP.
// Em produção, nunca deve ser utilizada no frontend.
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'placeholder-service-key'

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

/**
 * Cliente Supabase padrão (com anon key)
 * Usa RLS policies para controle de acesso
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

/**
 * Cliente Supabase Admin (com service key)
 * Bypass RLS - usar apenas para operações administrativas
 * IMPORTANTE: Nunca expor este cliente no frontend em produção
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export { isSupabaseConfigured }

/**
 * Função auxiliar para tratamento de erros do Supabase
 */
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Erro desconhecido ao acessar o banco de dados'
}

/**
 * Função auxiliar para obter ID do usuário atual
 * TODO: Implementar quando houver autenticação real
 */
export async function getUserIdFromTbusuario(): Promise<number | null> {
  // Por enquanto retorna um ID fixo para desenvolvimento
  // Em produção, deve buscar do contexto de autenticação
  return 1
}

