// Este arquivo é para ser copiado e colado no Dashboard do Supabase (Edge Functions)
// Não é executado localmente - usa runtime Deno, não Node.js

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
}

serve(async (req) => {
  // Tratar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verificar token de autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token de autenticação não fornecido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Cliente admin (para criar usuários)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Verificar se o usuário está autenticado
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !callerUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar permissão (perfil_id = 1 é Administrador)
    const { data: callerData, error: callerError } = await supabaseAdmin
      .from('tbusuario')
      .select('perfil_id, usuario_id')
      .eq('user_id', callerUser.id)
      .eq('deletado', 'N')
      .single()

    if (callerError || !callerData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não encontrado no sistema' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (callerData.perfil_id !== 1) {
      return new Response(
        JSON.stringify({ success: false, error: 'Apenas administradores podem criar usuários' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obter dados da requisição
    const body: CreateUserRequest = await req.json()
    const { email, senha, login, usuario, perfil_id, funcionario_id } = body

    // Validar campos obrigatórios
    if (!email || !senha || !login || !usuario) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campos obrigatórios: email, senha, login, usuario' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Formato de email inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar senha (mínimo 8 chars, maiúscula, minúscula, número)
    if (senha.length < 8 || !/[A-Z]/.test(senha) || !/[a-z]/.test(senha) || !/[0-9]/.test(senha)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Senha deve ter 8+ caracteres, maiúscula, minúscula e número' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar login duplicado
    const { data: existingLogin } = await supabaseAdmin
      .from('tbusuario')
      .select('usuario_id')
      .eq('login', login)
      .eq('deletado', 'N')
      .maybeSingle()

    if (existingLogin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Este login já está em uso' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar email duplicado
    const { data: existingEmail } = await supabaseAdmin
      .from('tbusuario')
      .select('usuario_id')
      .eq('email', email)
      .eq('deletado', 'N')
      .maybeSingle()

    if (existingEmail) {
      return new Response(
        JSON.stringify({ success: false, error: 'Este email já está em uso' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar usuário no auth.users
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { login, usuario }
    })

    if (createAuthError || !authData.user) {
      return new Response(
        JSON.stringify({ success: false, error: createAuthError?.message || 'Erro ao criar usuário' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const newUserId = authData.user.id

    // Criar registro em tbusuario
    const { data: tbusuarioData, error: tbusuarioError } = await supabaseAdmin
      .from('tbusuario')
      .insert({
        user_id: newUserId,
        login,
        email,
        usuario,
        perfil_id: perfil_id || null,
        funcionario_id: funcionario_id || null,
        deletado: 'N',
        created_at: new Date().toISOString(),
        created_by: callerData.usuario_id
      })
      .select('usuario_id')
      .single()

    if (tbusuarioError || !tbusuarioData) {
      // ROLLBACK: deletar do auth.users
      await supabaseAdmin.auth.admin.deleteUser(newUserId)

      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao criar registro. Operação cancelada.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sucesso
    return new Response(
      JSON.stringify({
        success: true,
        usuario_id: tbusuarioData.usuario_id,
        user_id: newUserId,
        message: 'Usuário criado com sucesso'
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na criação de usuário:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
