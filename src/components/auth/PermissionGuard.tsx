/**
 * Componentes para renderização condicional baseada em permissões (Multi-App)
 *
 * Permite ocultar ou desabilitar elementos com base nas permissões do usuário.
 * IMPORTANTE: Estes componentes são para UX. A segurança real é garantida pelo RLS.
 */

import React from 'react';
import { usePermissions, useHasPermission, Rotina, SYSOEE_APP_ID } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';

interface PermissionGuardProps {
  /** Rotina que o usuário precisa ter acesso */
  rotina: Rotina;
  /** ID da aplicação (default: SYSOEE_APP_ID) */
  appId?: number;
  /** Conteúdo a ser renderizado se tiver permissão */
  children: React.ReactNode;
  /** Conteúdo alternativo se não tiver permissão (opcional) */
  fallback?: React.ReactNode;
  /** Se true, mostra loader enquanto verifica permissão */
  showLoader?: boolean;
}

/**
 * Renderiza children apenas se o usuário tiver permissão para a rotina
 *
 * @example
 * <PermissionGuard rotina="EDITAR_USUARIO">
 *   <Button onClick={handleEdit}>Editar</Button>
 * </PermissionGuard>
 *
 * // Em outra app:
 * <PermissionGuard rotina="EDITAR_USUARIO" appId={2}>
 *   <Button onClick={handleEdit}>Editar</Button>
 * </PermissionGuard>
 */
export function PermissionGuard({
  rotina,
  appId,
  children,
  fallback = null,
  showLoader = false,
}: PermissionGuardProps) {
  const { hasPermission, isLoading } = usePermissions({ appId });

  if (isLoading && showLoader) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (isLoading) {
    return null;
  }

  if (!hasPermission(rotina)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdminOnlyProps {
  /** Conteúdo a ser renderizado se for admin */
  children: React.ReactNode;
  /** Conteúdo alternativo se não for admin (opcional) */
  fallback?: React.ReactNode;
  /** Se true, verifica admin global. Se false ou omitido, verifica admin na app atual */
  global?: boolean;
  /** ID da aplicação (usado quando global=false) */
  appId?: number;
}

/**
 * Renderiza children apenas se o usuário for Administrador
 *
 * @example
 * // Admin na app atual (SysOEE)
 * <AdminOnly>
 *   <Button variant="destructive">Excluir Todos</Button>
 * </AdminOnly>
 *
 * // Admin global (qualquer app)
 * <AdminOnly global>
 *   <SuperAdminPanel />
 * </AdminOnly>
 *
 * // Admin em app específica
 * <AdminOnly appId={2}>
 *   <Button>Ação Admin App 2</Button>
 * </AdminOnly>
 */
export function AdminOnly({
  children,
  fallback = null,
  global = false,
  appId,
}: AdminOnlyProps) {
  const { isAdmin, isAdminInApp, isLoading } = usePermissions({ appId });

  if (isLoading) {
    return null;
  }

  const hasAccess = global ? isAdmin : isAdminInApp;

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface DisabledWithoutPermissionProps {
  /** Rotina que o usuário precisa ter acesso */
  rotina: Rotina;
  /** ID da aplicação (default: SYSOEE_APP_ID) */
  appId?: number;
  /** Elemento filho (deve aceitar prop 'disabled') */
  children: React.ReactElement<{ disabled?: boolean; title?: string }>;
  /** Mensagem de tooltip quando desabilitado */
  disabledMessage?: string;
}

/**
 * Desabilita o elemento filho se o usuário não tiver permissão
 *
 * @example
 * <DisabledWithoutPermission rotina="EDITAR_USUARIO">
 *   <Button onClick={handleEdit}>Editar</Button>
 * </DisabledWithoutPermission>
 */
export function DisabledWithoutPermission({
  rotina,
  appId,
  children,
  disabledMessage = 'Você não tem permissão para esta ação',
}: DisabledWithoutPermissionProps) {
  const { hasPermission, isLoading } = usePermissions({ appId });

  const isDisabled = isLoading || !hasPermission(rotina);

  return React.cloneElement(children, {
    disabled: isDisabled || children.props.disabled,
    title: isDisabled ? disabledMessage : children.props.title,
  });
}

interface MultiplePermissionsGuardProps {
  /** Lista de rotinas - usuário precisa ter acesso a TODAS */
  rotinas: Rotina[];
  /** Se true, usuário precisa de apenas UMA das rotinas */
  requireAny?: boolean;
  /** ID da aplicação (default: SYSOEE_APP_ID) */
  appId?: number;
  /** Conteúdo a ser renderizado se tiver permissão */
  children: React.ReactNode;
  /** Conteúdo alternativo se não tiver permissão */
  fallback?: React.ReactNode;
}

/**
 * Renderiza children se o usuário tiver permissão para múltiplas rotinas
 *
 * @example
 * // Precisa de TODAS as permissões
 * <MultiplePermissionsGuard rotinas={['EDITAR_USUARIO', 'ALTERAR_PERFIL_USUARIO']}>
 *   <Button>Promover Usuário</Button>
 * </MultiplePermissionsGuard>
 *
 * // Precisa de QUALQUER UMA das permissões
 * <MultiplePermissionsGuard rotinas={['EDITAR_USUARIO', 'EXCLUIR_USUARIO']} requireAny>
 *   <ActionsMenu />
 * </MultiplePermissionsGuard>
 */
export function MultiplePermissionsGuard({
  rotinas,
  requireAny = false,
  appId,
  children,
  fallback = null,
}: MultiplePermissionsGuardProps) {
  const { hasPermission, isLoading } = usePermissions({ appId });

  if (isLoading) {
    return null;
  }

  const hasAccess = requireAny
    ? rotinas.some((r) => hasPermission(r))
    : rotinas.every((r) => hasPermission(r));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AppAccessGuardProps {
  /** ID da aplicação que o usuário precisa ter acesso */
  appId: number;
  /** Conteúdo a ser renderizado se tiver acesso */
  children: React.ReactNode;
  /** Conteúdo alternativo se não tiver acesso */
  fallback?: React.ReactNode;
  /** Se true, mostra loader enquanto verifica */
  showLoader?: boolean;
}

/**
 * Renderiza children apenas se o usuário tiver acesso à aplicação
 *
 * @example
 * <AppAccessGuard appId={2}>
 *   <SysRHPanel />
 * </AppAccessGuard>
 */
export function AppAccessGuard({
  appId,
  children,
  fallback = null,
  showLoader = false,
}: AppAccessGuardProps) {
  const { hasAppAccess, isLoading } = usePermissions();

  if (isLoading && showLoader) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (isLoading) {
    return null;
  }

  if (!hasAppAccess(appId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default PermissionGuard;
