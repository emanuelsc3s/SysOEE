/**
 * Tipos de dados para o módulo de Usuários
 * Define as estruturas de dados para gerenciamento de usuários do sistema
 */

/**
 * Interface para dados do formulário de Usuário
 * Representa os dados como aparecem no formulário (UI)
 */
export interface UsuarioFormData {
  /** ID do usuário na tabela tbusuario (string para compatibilidade com formulário) */
  id?: string

  /** ID do usuário no auth.users (UUID) */
  userId?: string

  /** Login único do usuário (obrigatório) */
  login: string

  /** Email do usuário (vinculado ao auth.users) */
  email: string

  /** Nome completo do usuário */
  usuario: string

  /** ID do perfil (FK para tbperfil) */
  perfilId?: number

  /** Nome do perfil (para exibição) */
  perfil?: string

  /** ID da aplicação (FK para tbapp) */
  appId?: number

  /** ID do funcionário (FK para tbfuncionario) */
  funcionarioId?: number

  /** Matrícula do funcionário (para exibição) */
  matricula?: string

  /** Flag de exclusão lógica */
  deletado?: 'N' | 'S'

  // Campos de auditoria (somente leitura no formulário)
  createdAt?: string
  createdBy?: number
  createdNome?: string
  updatedAt?: string
  updatedBy?: number
  updatedNome?: string
  deletedAt?: string
  deletedBy?: number
}

/**
 * Interface para dados do banco de dados (tbusuario)
 * Representa a estrutura exata da tabela no Supabase
 */
export interface UsuarioDB {
  usuario_id: number
  user_id: string | null          // UUID do auth.users
  login: string
  email: string | null
  usuario: string | null
  perfil_id: number | null
  perfil: string | null           // JOIN com tbperfil
  funcionario_id: number | null
  matricula: string | null        // JOIN com tbfuncionario
  deletado: string | null
  created_at: string | null
  created_by: number | null
  created_nome: string | null     // JOIN com criador
  updated_at: string | null
  updated_by: number | null
  updated_nome: string | null     // JOIN com atualizador
  deleted_at: string | null
  deleted_by: number | null
}

/**
 * Interface para criação de usuário (inclui senha)
 */
export interface UsuarioCreateData extends UsuarioFormData {
  /** Senha para criação no auth.users */
  senha: string
  /** Confirmação de senha */
  confirmarSenha: string
}

/**
 * Interface para resposta da Edge Function de criação
 */
export interface CreateUserResponse {
  success: boolean
  usuario_id?: number
  user_id?: string
  error?: string
  message?: string
}

/**
 * Mapeamento de campos entre formulário e banco de dados
 *
 * Formulário → Banco de Dados:
 * - id → usuario_id
 * - userId → user_id
 * - login → login
 * - email → email
 * - usuario → usuario
 * - perfilId → perfil_id
 * - perfil → perfil (JOIN)
 * - funcionarioId → funcionario_id
 * - matricula → matricula (JOIN)
 * - deletado → deletado
 * - createdAt → created_at
 * - createdBy → created_by
 * - createdNome → created_nome (JOIN)
 * - updatedAt → updated_at
 * - updatedBy → updated_by
 * - updatedNome → updated_nome (JOIN)
 * - deletedAt → deleted_at
 * - deletedBy → deleted_by
 */

/**
 * Valores iniciais para novo usuário
 */
export const USUARIO_INITIAL_VALUES: UsuarioFormData = {
  login: '',
  email: '',
  usuario: '',
  perfilId: undefined,
  perfil: '',
  appId: undefined,
  funcionarioId: undefined,
  matricula: '',
  deletado: 'N'
}

/**
 * Valores iniciais para criação (com senha)
 */
export const USUARIO_CREATE_INITIAL_VALUES: UsuarioCreateData = {
  ...USUARIO_INITIAL_VALUES,
  senha: '',
  confirmarSenha: ''
}

/**
 * Opções de perfil disponíveis
 */
export interface PerfilOption {
  value: number
  label: string
  descricao: string
}

export const PERFIL_OPTIONS: PerfilOption[] = [
  { value: 1, label: 'Administrador', descricao: 'Acesso total ao sistema' },
  { value: 2, label: 'Supervisor', descricao: 'Gestão de equipe e relatórios' },
  { value: 3, label: 'Operador', descricao: 'Apontamentos e consultas básicas' },
  { value: 4, label: 'Visualizador', descricao: 'Apenas visualização de dados' }
]

/**
 * Obtém o label do perfil pelo ID
 */
export function getPerfilLabel(perfilId?: number): string {
  if (!perfilId) return '-'
  const perfil = PERFIL_OPTIONS.find(p => p.value === perfilId)
  return perfil?.label || '-'
}

/**
 * Obtém a variant do badge pelo perfil
 */
export function getPerfilBadgeVariant(perfilId?: number): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' {
  switch (perfilId) {
    case 1: return 'destructive' // Administrador - vermelho (destaque)
    case 2: return 'warning'     // Supervisor - amarelo
    case 3: return 'info'        // Operador - azul
    case 4: return 'secondary'   // Visualizador - cinza
    default: return 'outline'
  }
}

/**
 * Validação de formato de email
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false
  // RFC 5322 simplificado
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email)
}

/**
 * Validação de senha forte
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um número
 */
export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!password) {
    return { valid: false, errors: ['Senha é obrigatória'] }
  }

  if (password.length < 8) {
    errors.push('Mínimo de 8 caracteres')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Pelo menos uma letra maiúscula')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Pelo menos uma letra minúscula')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Pelo menos um número')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validação de confirmação de senha
 */
export function passwordsMatch(senha: string, confirmarSenha: string): boolean {
  return senha === confirmarSenha
}
