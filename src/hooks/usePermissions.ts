/**
 * Hook para verificação de permissões de usuário (Multi-App)
 *
 * Equivalente à função fPerfilRotina do sistema Delphi/Firebird
 * Consulta o banco de dados via RPC para verificar se o usuário
 * tem permissão para acessar uma rotina específica em uma aplicação.
 *
 * IMPORTANTE: Este hook é para UX (ocultar/desabilitar botões).
 * A segurança real é garantida pelo RLS no banco de dados.
 */

import { useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

// ID da aplicação SysOEE (configurar conforme ambiente)
export const SYSOEE_APP_ID = 1;

// Tipos de rotinas disponíveis no sistema
export type Rotina =
  // Usuários
  | 'VISUALIZAR_USUARIO'
  | 'CRIAR_USUARIO'
  | 'EDITAR_USUARIO'
  | 'EXCLUIR_USUARIO'
  | 'ALTERAR_PERFIL_USUARIO'
  // Funcionários
  | 'VISUALIZAR_FUNCIONARIO'
  | 'CRIAR_FUNCIONARIO'
  | 'EDITAR_FUNCIONARIO'
  | 'EXCLUIR_FUNCIONARIO'
  // Produção
  | 'VISUALIZAR_LINHA'
  | 'CRIAR_LINHA'
  | 'EDITAR_LINHA'
  | 'EXCLUIR_LINHA'
  | 'VISUALIZAR_LOTE'
  | 'CRIAR_LOTE'
  | 'EDITAR_LOTE'
  | 'EXCLUIR_LOTE'
  | 'CONCLUIR_LOTE'
  // Apontamentos
  | 'VISUALIZAR_APONTAMENTO'
  | 'CRIAR_APONTAMENTO'
  | 'EDITAR_APONTAMENTO'
  | 'EXCLUIR_APONTAMENTO'
  | 'ASSINAR_APONTAMENTO'
  // Paradas
  | 'VISUALIZAR_MOTIVO_PARADA'
  | 'CRIAR_MOTIVO_PARADA'
  | 'EDITAR_MOTIVO_PARADA'
  | 'EXCLUIR_MOTIVO_PARADA'
  // Configurações
  | 'VISUALIZAR_SETOR'
  | 'CRIAR_SETOR'
  | 'EDITAR_SETOR'
  | 'EXCLUIR_SETOR'
  | 'VISUALIZAR_TURNO'
  | 'CRIAR_TURNO'
  | 'EDITAR_TURNO'
  | 'EXCLUIR_TURNO'
  | 'VISUALIZAR_PRODUTO'
  | 'CRIAR_PRODUTO'
  | 'EDITAR_PRODUTO'
  | 'EXCLUIR_PRODUTO'
  | 'GERENCIAR_PERFIL'
  | 'GERENCIAR_PERMISSOES'
  // Relatórios
  | 'VISUALIZAR_DASHBOARD'
  | 'EXPORTAR_RELATORIO'
  | 'VISUALIZAR_HISTORICO';

interface PermissionResult {
  rotina: string;
  descricao: string | null;
  modulo: string | null;
  acesso: boolean;
}

// CORRIGIDO: Removidas colunas que não existem em tbusuario_app (ativo, data_acesso_inicial, data_ultimo_acesso)
interface UserApp {
  app_id: number;
  app_nome: string;
  perfil_id: number;
  perfil: string;
}

interface UsePermissionsOptions {
  appId?: number;
}

interface UsePermissionsReturn {
  // Verificação individual de permissão
  checkPermission: (rotina: Rotina) => Promise<boolean>;

  // Verificação síncrona (usa cache)
  hasPermission: (rotina: Rotina) => boolean;

  // Todas as permissões do usuário na app atual
  permissions: Record<string, boolean>;

  // Estados
  isLoading: boolean;
  isAdmin: boolean;
  isAdminInApp: boolean;

  // Informações da app atual
  currentAppId: number;
  currentPerfil: string | null;
  currentPerfilId: number | null;

  // Apps que o usuário tem acesso
  userApps: UserApp[];

  // Helpers para casos comuns
  canView: (modulo: string) => boolean;
  canCreate: (modulo: string) => boolean;
  canEdit: (modulo: string) => boolean;
  canDelete: (modulo: string) => boolean;

  // Verificar acesso à app
  hasAppAccess: (appId: number) => boolean;

  // Recarregar permissões
  refetch: () => void;
}

/**
 * Hook principal para verificação de permissões (Multi-App)
 *
 * @param options.appId - ID da aplicação (default: SYSOEE_APP_ID)
 */
export function usePermissions(options?: UsePermissionsOptions): UsePermissionsReturn {
  const { user } = useAuth();
  const appId = options?.appId ?? SYSOEE_APP_ID;

  // Buscar apps que o usuário tem acesso
  const { data: userAppsData } = useQuery({
    queryKey: ['user-apps', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc('get_user_apps', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Erro ao buscar apps do usuário:', error);
        return [];
      }

      return (data as UserApp[]) || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const userApps = userAppsData || [];

  // Buscar perfil do usuário na app atual
  const currentAppInfo = useMemo(() => {
    return userApps.find((app) => app.app_id === appId) || null;
  }, [userApps, appId]);

  // Buscar todas as permissões do usuário na app atual
  const { data: permissionsData, isLoading, refetch } = useQuery({
    queryKey: ['user-permissions', user?.id, appId],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase.rpc('get_user_permissions', {
        p_app_id: appId,
        p_user_id: user.id,
      });

      if (error) {
        console.error('Erro ao buscar permissões:', error);
        return [];
      }

      return (data as PermissionResult[]) || [];
    },
    enabled: !!user?.id && !!currentAppInfo,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Converter array para objeto de fácil acesso
  const permissions = useMemo(() => {
    const perms: Record<string, boolean> = {};
    permissionsData?.forEach((p) => {
      perms[p.rotina] = p.acesso;
    });
    return perms;
  }, [permissionsData]);

  // Verificar se é admin na app atual
  const isAdminInApp = useMemo(() => {
    return (
      currentAppInfo?.perfil === 'Administrador' ||
      currentAppInfo?.perfil_id === 1 ||
      permissions['GERENCIAR_PERMISSOES'] === true
    );
  }, [currentAppInfo, permissions]);

  // Verificar se é admin global (admin em qualquer app)
  const isAdmin = useMemo(() => {
    return userApps.some(
      (app) => app.perfil === 'Administrador' || app.perfil_id === 1
    );
  }, [userApps]);

  // Verificação síncrona usando cache
  const hasPermission = useCallback(
    (rotina: Rotina): boolean => {
      // Admin na app tem acesso a tudo na app
      if (isAdminInApp) return true;
      return permissions[rotina] === true;
    },
    [permissions, isAdminInApp]
  );

  // Verificação assíncrona (consulta direta ao banco)
  const checkPermission = useCallback(
    async (rotina: Rotina): Promise<boolean> => {
      if (!user?.id) return false;

      // Admin na app tem acesso a tudo
      if (isAdminInApp) return true;

      // Verificar no cache primeiro
      if (permissions[rotina] !== undefined) {
        return permissions[rotina];
      }

      // Consultar banco se não estiver no cache
      const { data, error } = await supabase.rpc('check_user_permission', {
        p_user_id: user.id,
        p_rotina: rotina,
        p_app_id: appId,
      });

      if (error) {
        console.error('Erro ao verificar permissão:', error);
        return false;
      }

      return data === true;
    },
    [user?.id, permissions, isAdminInApp, appId]
  );

  // Verificar acesso a uma app
  const hasAppAccess = useCallback(
    (checkAppId: number): boolean => {
      return userApps.some((app) => app.app_id === checkAppId);
    },
    [userApps]
  );

  // Helpers para módulos
  const canView = useCallback(
    (modulo: string): boolean => {
      return hasPermission(`VISUALIZAR_${modulo.toUpperCase()}` as Rotina);
    },
    [hasPermission]
  );

  const canCreate = useCallback(
    (modulo: string): boolean => {
      return hasPermission(`CRIAR_${modulo.toUpperCase()}` as Rotina);
    },
    [hasPermission]
  );

  const canEdit = useCallback(
    (modulo: string): boolean => {
      return hasPermission(`EDITAR_${modulo.toUpperCase()}` as Rotina);
    },
    [hasPermission]
  );

  const canDelete = useCallback(
    (modulo: string): boolean => {
      return hasPermission(`EXCLUIR_${modulo.toUpperCase()}` as Rotina);
    },
    [hasPermission]
  );

  return {
    checkPermission,
    hasPermission,
    permissions,
    isLoading,
    isAdmin,
    isAdminInApp,
    currentAppId: appId,
    currentPerfil: currentAppInfo?.perfil || null,
    currentPerfilId: currentAppInfo?.perfil_id || null,
    userApps,
    canView,
    canCreate,
    canEdit,
    canDelete,
    hasAppAccess,
    refetch,
  };
}

/**
 * Hook simplificado para verificar uma única permissão
 *
 * @example
 * const canEdit = useHasPermission('EDITAR_USUARIO');
 * if (canEdit) { ... }
 */
export function useHasPermission(rotina: Rotina, appId?: number): boolean {
  const { hasPermission, isLoading } = usePermissions({ appId });

  if (isLoading) return false;

  return hasPermission(rotina);
}

/**
 * Hook para verificar múltiplas permissões de uma vez
 *
 * @example
 * const perms = useMultiplePermissions(['EDITAR_USUARIO', 'EXCLUIR_USUARIO']);
 * if (perms.EDITAR_USUARIO) { ... }
 */
export function useMultiplePermissions(
  rotinas: Rotina[],
  appId?: number
): Record<string, boolean> {
  const { hasPermission, isLoading } = usePermissions({ appId });

  return useMemo(() => {
    const result: Record<string, boolean> = {};
    rotinas.forEach((rotina) => {
      result[rotina] = isLoading ? false : hasPermission(rotina);
    });
    return result;
  }, [rotinas, hasPermission, isLoading]);
}

/**
 * Hook para obter lista de apps do usuário
 *
 * @example
 * const { apps, isLoading } = useUserApps();
 */
export function useUserApps() {
  const { userApps, isLoading } = usePermissions();
  return { apps: userApps, isLoading };
}

export default usePermissions;
