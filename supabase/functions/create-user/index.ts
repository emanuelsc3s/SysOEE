/**
 * Edge Function para criação de usuários
 *
 * Esta função cria um usuário tanto no auth.users quanto na tabela tbusuario,
 * garantindo consistência entre ambos. Em caso de falha na criação do registro
 * em tbusuario, realiza rollback deletando o usuário do auth.users.
 *
 * Requisitos:
 * - Apenas usuários autenticados com perfil Administrador podem criar novos usuários
 * - Email deve ser único (validado apenas no auth.users)
 * - Login deve ser único
 * - Senha deve atender aos requisitos de segurança
 * 
 * Sobre os erros do VS Code/TypeScript: não são bugs de runtime. São avisos do TypeScript 
 * porque esse arquivo é Deno, não Node. A função vai rodar normalmente no Supabase.
 * Se quiser limpar os erros do editor, precisa habilitar Deno para essa pasta.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Headers CORS para permitir chamadas do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string
  senha: string
  login: string
  usuario: string
  perfil_id?: number
  funcionario_id?: number
  created_at?: string
}

interface CreateUserResponse {
  success: boolean
  usuario_id?: number
  user_id?: string
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
        JSON.stringify({ success: false, error: 'Token de autenticação não fornecido' } as CreateUserResponse),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token de autenticação inválido' } as CreateUserResponse),
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
        JSON.stringify({ success: false, error: 'Usuário não autenticado' } as CreateUserResponse),
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
        JSON.stringify({ success: false, error: 'Usuário chamador não encontrado no sistema' } as CreateUserResponse),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (callerData.perfil_id !== 1) {
      return new Response(
        JSON.stringify({ success: false, error: 'Apenas administradores podem criar novos usuários' } as CreateUserResponse),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obter dados da requisição
    const body: CreateUserRequest = await req.json()
    const { email, senha, login, usuario, perfil_id, funcionario_id, created_at } = body

    // Validar campos obrigatórios
    if (!email || !senha || !login || !usuario) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campos obrigatórios: email, senha, login, usuario' } as CreateUserResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar força da senha
    if (senha.length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: 'Senha deve ter pelo menos 8 caracteres' } as CreateUserResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (!/[A-Z]/.test(senha)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Senha deve conter pelo menos uma letra maiúscula' } as CreateUserResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (!/[a-z]/.test(senha)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Senha deve conter pelo menos uma letra minúscula' } as CreateUserResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (!/[0-9]/.test(senha)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Senha deve conter pelo menos um número' } as CreateUserResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se o login já existe
    const { data: existingLogin, error: existingLoginError } = await supabaseAdmin
      .from('tbusuario')
      .select('usuario_id')
      .eq('login', login)
      .eq('deletado', 'N')
      .maybeSingle()

    if (existingLoginError) {
      console.error('Erro ao verificar login:', existingLoginError)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao verificar login' } as CreateUserResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingLogin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Este login já está em uso' } as CreateUserResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar usuário no auth.users usando Admin API
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // Confirma o email automaticamente
      user_metadata: {
        login,
        usuario,
      },
    })

    if (createAuthError || !authData.user) {
      console.error('Erro ao criar usuário no auth:', createAuthError)
      return new Response(
        JSON.stringify({
          success: false,
          error: createAuthError?.message || 'Erro ao criar usuário no sistema de autenticação'
        } as CreateUserResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const newUserId = authData.user.id

    // Criar registro em tbusuario
    const createdAt = typeof created_at === 'string' && created_at.trim()
      ? created_at
      : new Date().toISOString()

    const { data: tbusuarioData, error: tbusuarioError } = await supabaseAdmin
      .from('tbusuario')
      .insert({
        user_id: newUserId,
        login,
        usuario,
        perfil_id: perfil_id || null,
        funcionario_id: funcionario_id || null,
        deletado: 'N',
        created_at: createdAt,
        created_by: callerUser.id,
      })
      .select('usuario_id')
      .single()

    if (tbusuarioError || !tbusuarioData) {
      console.error('Erro ao criar registro em tbusuario:', tbusuarioError)

      // ROLLBACK: Deletar usuário do auth.users
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(newUserId)
      if (deleteError) {
        console.error('Erro ao fazer rollback do auth.users:', deleteError)
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: tbusuarioError?.message || 'Erro ao criar registro do usuário. Operação cancelada.'
        } as CreateUserResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sucesso!
    const response: CreateUserResponse = {
      success: true,
      usuario_id: tbusuarioData.usuario_id,
      user_id: newUserId,
      message: 'Usuário criado com sucesso'
    }

    return new Response(
      JSON.stringify(response),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na Edge Function create-user:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      } as CreateUserResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
