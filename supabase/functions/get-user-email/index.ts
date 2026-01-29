/**
 * Edge Function para buscar email de usuário no auth.users
 *
 * Esta função retorna apenas o email do usuário, evitando expor dados sensíveis.
 * Requisitos:
 * - Usuário chamador autenticado
 * - Usuário chamador deve ser Administrador (perfil_id = 1)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Headers CORS para permitir chamadas do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GetUserEmailRequest {
  user_id?: string
  login?: string
}

interface GetUserEmailResponse {
  success: boolean
  email?: string | null
  error?: string
  message?: string
}

serve(async (req) => {
  // Tratar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obter variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Variáveis de ambiente do Supabase não configuradas')
    }

    // Verificar token de autenticação do chamador
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token de autenticação não fornecido' } as GetUserEmailResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token de autenticação inválido' } as GetUserEmailResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar cliente Supabase com service role (para operações admin)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verificar se o usuário está autenticado
    const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !callerUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não autenticado' } as GetUserEmailResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar permissão do chamador (deve ser Administrador - perfil_id = 1)
    const { data: callerData, error: callerError } = await supabaseAdmin
      .from('tbusuario')
      .select('perfil_id')
      .eq('user_id', callerUser.id)
      .eq('deletado', 'N')
      .maybeSingle()

    if (callerError || !callerData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário chamador não encontrado no sistema' } as GetUserEmailResponse),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (callerData.perfil_id !== 1) {
      return new Response(
        JSON.stringify({ success: false, error: 'Apenas administradores podem consultar emails' } as GetUserEmailResponse),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: GetUserEmailRequest = await req.json()
    let targetUserId = body.user_id?.trim()

    // Se não veio user_id, tentar buscar pelo login
    if (!targetUserId && body.login?.trim()) {
      const { data: usuarioData, error: usuarioError } = await supabaseAdmin
        .from('tbusuario')
        .select('user_id')
        .eq('login', body.login.trim())
        .eq('deletado', 'N')
        .maybeSingle()

      if (usuarioError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao buscar usuário' } as GetUserEmailResponse),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      targetUserId = usuarioData?.user_id || undefined
    }

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ success: false, error: 'user_id ou login é obrigatório' } as GetUserEmailResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: authData, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(targetUserId)
    if (authUserError || !authData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não encontrado no auth' } as GetUserEmailResponse),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response: GetUserEmailResponse = {
      success: true,
      email: authData.user.email || null,
      message: 'Email obtido com sucesso'
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro na Edge Function get-user-email:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      } as GetUserEmailResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
