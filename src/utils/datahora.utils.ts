/**
 * Utilitarios para data e hora em formato local.
 */

/**
 * Gera timestamp local no formato ISO sem timezone (yyyy-MM-ddTHH:mm:ss).
 * Ideal para salvar em colunas timestamp sem time zone.
 */
export function gerarTimestampLocal(): string {
  const agora = new Date()
  const pad = (valor: number) => String(valor).padStart(2, '0')

  return `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}T${pad(agora.getHours())}:${pad(agora.getMinutes())}:${pad(agora.getSeconds())}`
}
