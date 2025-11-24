/**
 * Tipos de dados para o módulo de Turnos
 * Define as estruturas de dados para gerenciamento de turnos de trabalho
 */

/**
 * Interface para dados do formulário de Turno
 * Representa os dados como aparecem no formulário (UI)
 */
export interface TurnoFormData {
  /** ID do turno (string para compatibilidade com formulário) */
  id?: string

  /** Código do turno (obrigatório) */
  codigo: string

  /** Nome/descrição do turno */
  turno: string

  /** Hora de início do turno (formato HH:MM) */
  horaInicio: string

  /** Hora de fim do turno (formato HH:MM) */
  horaFim: string

  /** Meta de OEE para o turno (percentual) */
  metaOee: number

  /** Flag de exclusão lógica */
  deletado?: 'N' | 'S'

  // Campos de auditoria (somente leitura no formulário)
  createdAt?: string
  createdBy?: number
  updatedAt?: string
  updatedBy?: number
  deletedAt?: string
  deletedBy?: number
}

/**
 * Interface para dados do banco de dados (tbturno)
 * Representa a estrutura exata da tabela no Supabase
 * NOTA: meta_oee pode vir como string devido ao tipo numeric(10,2) do PostgreSQL
 */
export interface TurnoDB {
  turno_id: number
  codigo: string
  turno: string | null
  hora_inicio: string | null  // time without time zone
  hora_fim: string | null     // time without time zone
  deletado: string | null
  created_at: string | null
  created_by: number | null
  updated_at: string | null
  updated_by: number | null
  deleted_at: string | null
  deleted_by: number | null
  meta_oee: number | string | null  // Pode vir como string do Supabase
}

/**
 * Mapeamento de campos entre formulário e banco de dados
 * 
 * Formulário → Banco de Dados:
 * - id → turno_id
 * - codigo → codigo
 * - turno → turno
 * - horaInicio → hora_inicio
 * - horaFim → hora_fim
 * - metaOee → meta_oee
 * - deletado → deletado
 * - createdAt → created_at
 * - createdBy → created_by
 * - updatedAt → updated_at
 * - updatedBy → updated_by
 * - deletedAt → deleted_at
 * - deletedBy → deleted_by
 */

/**
 * Valores iniciais para novo turno
 */
export const TURNO_INITIAL_VALUES: TurnoFormData = {
  codigo: '',
  turno: '',
  horaInicio: '',
  horaFim: '',
  metaOee: 85.0,
  deletado: 'N'
}

/** Tipos de seleção da meta de OEE */
export type MetaOeeTipo = 'PADRAO' | 'SEM_META' | 'PERSONALIZADA'

/**
 * Opções de meta OEE padrão
 */
export const META_OEE_OPTIONS: { value: MetaOeeTipo; label: string; metaValue?: number }[] = [
  { value: 'PADRAO', label: '85% - Meta Padrão', metaValue: 85 },
  { value: 'SEM_META', label: 'Sem Meta', metaValue: 0 },
  { value: 'PERSONALIZADA', label: 'Meta Personalizada' }
]

/**
 * Validação de horário (formato HH:MM)
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

/**
 * Converte string de horário para minutos desde meia-noite
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Valida se hora fim é posterior à hora início
 * Permite turnos que cruzam meia-noite (ex: 22:00 - 06:00)
 */
export function isValidTimeRange(horaInicio: string, horaFim: string): boolean {
  if (!isValidTimeFormat(horaInicio) || !isValidTimeFormat(horaFim)) {
    return false
  }

  // Sempre retorna true pois permitimos turnos que cruzam meia-noite
  return true
}

/**
 * Calcula duração do turno em horas
 */
export function calcularDuracaoTurno(horaInicio: string, horaFim: string): number {
  if (!isValidTimeFormat(horaInicio) || !isValidTimeFormat(horaFim)) {
    return 0
  }
  
  const inicioMinutos = timeToMinutes(horaInicio)
  let fimMinutos = timeToMinutes(horaFim)
  
  // Se fim < início, turno cruza meia-noite
  if (fimMinutos < inicioMinutos) {
    fimMinutos += 24 * 60
  }
  
  const duracaoMinutos = fimMinutos - inicioMinutos
  return duracaoMinutos / 60
}
