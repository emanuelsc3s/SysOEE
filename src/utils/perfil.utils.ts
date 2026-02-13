/**
 * Utilitários para validação de perfil de usuário.
 */

/**
 * Retorna true quando o perfil informado representa um Administrador.
 */
export function isPerfilAdministrador(perfil: string | null | undefined): boolean {
  return (perfil || '').trim().toLowerCase() === 'administrador'
}
