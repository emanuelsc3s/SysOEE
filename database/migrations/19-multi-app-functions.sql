-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 19-multi-app-functions.sql
-- Descrição: Funções RPC para sistema Multi-Aplicação
-- Versão: 1.0
-- Data: 2025-02-01
-- =====================================================

-- PRÉ-REQUISITO: Execute 18-multi-app-structure.sql antes deste script

-- =====================================================
-- FUNÇÃO: get_user_apps
-- Retorna todas as aplicações que o usuário tem acesso
-- =====================================================

-- CORRIGIDO: Removidas colunas que não existem em tbusuario_app (ativo, data_acesso_inicial, data_ultimo_acesso)
CREATE OR REPLACE FUNCTION get_user_apps(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  app_id INTEGER,
  app_nome TEXT,
  perfil_id INTEGER,
  perfil TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Usar usuário atual se não informado
  v_user_id := COALESCE(p_user_id, auth.uid());

  RETURN QUERY
  SELECT
    a.app_id,
    a.app_nome,
    p.perfil_id,
    p.perfil
  FROM tbusuario_app ua
  INNER JOIN tbusuario u ON u.usuario_id = ua.usuario_id
  INNER JOIN tbapp a ON a.app_id = ua.app_id
  INNER JOIN tbperfil p ON p.perfil_id = ua.perfil_id
  WHERE u.user_id = v_user_id
    AND u.deletado = 'N'
    AND ua.deletado = 'N'
    AND a.deletado = 'N'
    AND p.deletado = 'N'
  ORDER BY a.app_nome;
END;
$$;

COMMENT ON FUNCTION get_user_apps(UUID) IS
  'Retorna todas as aplicações que o usuário tem acesso, com seus respectivos perfis.';

GRANT EXECUTE ON FUNCTION get_user_apps(UUID) TO authenticated;

-- =====================================================
-- FUNÇÃO: get_user_perfil_in_app
-- Retorna o perfil do usuário em uma aplicação específica
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_perfil_in_app(
  p_app_id INTEGER,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  perfil_id INTEGER,
  perfil TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  RETURN QUERY
  SELECT
    p.perfil_id,
    p.perfil
  FROM tbusuario_app ua
  INNER JOIN tbusuario u ON u.usuario_id = ua.usuario_id
  INNER JOIN tbperfil p ON p.perfil_id = ua.perfil_id
  WHERE u.user_id = v_user_id
    AND ua.app_id = p_app_id
    AND u.deletado = 'N'
    AND ua.deletado = 'N'
    AND p.deletado = 'N'
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION get_user_perfil_in_app(INTEGER, UUID) IS
  'Retorna o perfil do usuário em uma aplicação específica.';

GRANT EXECUTE ON FUNCTION get_user_perfil_in_app(INTEGER, UUID) TO authenticated;

-- =====================================================
-- FUNÇÃO: check_user_permission (ATUALIZADA para Multi-App)
-- Verifica se usuário tem permissão para rotina EM UMA APP
-- =====================================================

DROP FUNCTION IF EXISTS check_user_permission(UUID, TEXT);

CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_rotina TEXT,
  p_app_id INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_has_access BOOLEAN := FALSE;
  v_perfil_id INTEGER;
BEGIN
  -- Validar parâmetros
  IF p_user_id IS NULL OR p_rotina IS NULL OR p_rotina = '' OR p_app_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Buscar perfil_id do usuário NESTA aplicação
  SELECT ua.perfil_id INTO v_perfil_id
  FROM tbusuario_app ua
  INNER JOIN tbusuario u ON u.usuario_id = ua.usuario_id
  WHERE u.user_id = p_user_id
    AND ua.app_id = p_app_id
    AND u.deletado = 'N'
    AND ua.deletado = 'N'
  LIMIT 1;

  -- Se não tem acesso à app, não tem permissão
  IF v_perfil_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Buscar permissão na matriz perfil x rotina
  -- CORRIGIDO: JOIN com tbrotina pois tbperfil_rotina não tem coluna 'rotina'
  SELECT (pr.acesso = 'S')
  INTO v_has_access
  FROM tbperfil_rotina pr
  INNER JOIN tbrotina r ON r.rotina_id = pr.rotina_id
  WHERE pr.perfil_id = v_perfil_id
    AND pr.app_id = p_app_id
    AND r.rotina = p_rotina
    AND r.app_id = p_app_id
    AND pr.deletado = 'N'
    AND r.deletado = 'N';

  RETURN COALESCE(v_has_access, FALSE);
END;
$$;

COMMENT ON FUNCTION check_user_permission(UUID, TEXT, INTEGER) IS
  'Verifica se um usuário tem permissão para acessar uma rotina em uma aplicação específica.
   Parâmetros: p_user_id (UUID do auth.users), p_rotina (código da rotina), p_app_id (ID da aplicação).
   Retorna TRUE se tem acesso, FALSE caso contrário.';

GRANT EXECUTE ON FUNCTION check_user_permission(UUID, TEXT, INTEGER) TO authenticated;

-- =====================================================
-- FUNÇÃO: check_current_user_permission (ATUALIZADA)
-- Versão simplificada usando usuário atual
-- =====================================================

DROP FUNCTION IF EXISTS check_current_user_permission(TEXT);

CREATE OR REPLACE FUNCTION check_current_user_permission(
  p_rotina TEXT,
  p_app_id INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN check_user_permission(auth.uid(), p_rotina, p_app_id);
END;
$$;

COMMENT ON FUNCTION check_current_user_permission(TEXT, INTEGER) IS
  'Verifica se o usuário ATUAL (logado) tem permissão para a rotina na aplicação.
   Versão simplificada de check_user_permission.';

GRANT EXECUTE ON FUNCTION check_current_user_permission(TEXT, INTEGER) TO authenticated;

-- =====================================================
-- FUNÇÃO: is_admin_in_app
-- Verifica se o usuário é Administrador em uma app
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin_in_app(p_app_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_is_admin BOOLEAN := FALSE;
BEGIN
  SELECT (p.perfil = 'Administrador' OR p.perfil_id = 1)
  INTO v_is_admin
  FROM tbusuario_app ua
  INNER JOIN tbusuario u ON u.usuario_id = ua.usuario_id
  INNER JOIN tbperfil p ON p.perfil_id = ua.perfil_id
  WHERE u.user_id = auth.uid()
    AND ua.app_id = p_app_id
    AND u.deletado = 'N'
    AND ua.deletado = 'N'
    AND p.deletado = 'N'
  LIMIT 1;

  RETURN COALESCE(v_is_admin, FALSE);
END;
$$;

COMMENT ON FUNCTION is_admin_in_app(INTEGER) IS
  'Verifica se o usuário atual é Administrador em uma aplicação específica.';

GRANT EXECUTE ON FUNCTION is_admin_in_app(INTEGER) TO authenticated;

-- =====================================================
-- FUNÇÃO: is_admin (ATUALIZADA - Admin Global)
-- Admin global = Administrador em QUALQUER app
-- =====================================================

DROP FUNCTION IF EXISTS is_admin();

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_is_admin BOOLEAN := FALSE;
BEGIN
  -- Verifica se é admin em QUALQUER aplicação
  SELECT TRUE
  INTO v_is_admin
  FROM tbusuario_app ua
  INNER JOIN tbusuario u ON u.usuario_id = ua.usuario_id
  INNER JOIN tbperfil p ON p.perfil_id = ua.perfil_id
  WHERE u.user_id = auth.uid()
    AND u.deletado = 'N'
    AND ua.deletado = 'N'
    AND p.deletado = 'N'
    AND (p.perfil = 'Administrador' OR p.perfil_id = 1)
  LIMIT 1;

  RETURN COALESCE(v_is_admin, FALSE);
END;
$$;

COMMENT ON FUNCTION is_admin() IS
  'Verifica se o usuário atual é Administrador em QUALQUER aplicação (admin global).';

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- =====================================================
-- FUNÇÃO: has_app_access
-- Verifica se usuário tem acesso a uma aplicação
-- =====================================================

CREATE OR REPLACE FUNCTION has_app_access(p_app_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_has_access BOOLEAN := FALSE;
BEGIN
  SELECT TRUE
  INTO v_has_access
  FROM tbusuario_app ua
  INNER JOIN tbusuario u ON u.usuario_id = ua.usuario_id
  WHERE u.user_id = auth.uid()
    AND ua.app_id = p_app_id
    AND u.deletado = 'N'
    AND ua.deletado = 'N'
  LIMIT 1;

  RETURN COALESCE(v_has_access, FALSE);
END;
$$;

COMMENT ON FUNCTION has_app_access(INTEGER) IS
  'Verifica se o usuário atual tem acesso a uma aplicação específica.';

GRANT EXECUTE ON FUNCTION has_app_access(INTEGER) TO authenticated;

-- =====================================================
-- FUNÇÃO: get_user_permissions (ATUALIZADA para Multi-App)
-- Retorna todas as permissões do usuário em uma app
-- =====================================================

DROP FUNCTION IF EXISTS get_user_permissions(UUID);

CREATE OR REPLACE FUNCTION get_user_permissions(
  p_app_id INTEGER,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  rotina VARCHAR(100),
  descricao TEXT,
  modulo VARCHAR(50),
  acesso BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_user_id UUID;
  v_perfil_id INTEGER;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  -- Buscar perfil_id do usuário nesta app
  SELECT ua.perfil_id INTO v_perfil_id
  FROM tbusuario_app ua
  INNER JOIN tbusuario u ON u.usuario_id = ua.usuario_id
  WHERE u.user_id = v_user_id
    AND ua.app_id = p_app_id
    AND u.deletado = 'N'
    AND ua.deletado = 'N'
  LIMIT 1;

  RETURN QUERY
  SELECT
    r.rotina,
    r.descricao,
    r.modulo,
    COALESCE((pr.acesso = 'S'), FALSE) AS acesso
  FROM tbrotina r
  LEFT JOIN tbperfil_rotina pr ON pr.rotina_id = r.rotina_id
    AND pr.perfil_id = v_perfil_id
    AND pr.deletado = 'N'
  WHERE r.app_id = p_app_id
    AND r.deletado = 'N'
  ORDER BY r.modulo, r.ordem;
END;
$$;

COMMENT ON FUNCTION get_user_permissions(INTEGER, UUID) IS
  'Retorna todas as rotinas de uma aplicação com status de permissão do usuário.';

GRANT EXECUTE ON FUNCTION get_user_permissions(INTEGER, UUID) TO authenticated;

-- =====================================================
-- FUNÇÃO: get_perfil_permissions (ATUALIZADA para Multi-App)
-- Retorna todas as permissões de um perfil em uma app
-- =====================================================

DROP FUNCTION IF EXISTS get_perfil_permissions(INTEGER);

CREATE OR REPLACE FUNCTION get_perfil_permissions(
  p_perfil_id INTEGER,
  p_app_id INTEGER
)
RETURNS TABLE (
  rotina_id INTEGER,
  rotina VARCHAR(100),
  descricao TEXT,
  modulo VARCHAR(50),
  acesso BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.rotina_id,
    r.rotina,
    r.descricao,
    r.modulo,
    COALESCE((pr.acesso = 'S'), FALSE) AS acesso
  FROM tbrotina r
  LEFT JOIN tbperfil_rotina pr ON pr.rotina_id = r.rotina_id
    AND pr.perfil_id = p_perfil_id
    AND pr.app_id = p_app_id
    AND pr.deletado = 'N'
  WHERE r.app_id = p_app_id
    AND r.deletado = 'N'
  ORDER BY r.modulo, r.ordem;
END;
$$;

COMMENT ON FUNCTION get_perfil_permissions(INTEGER, INTEGER) IS
  'Retorna todas as rotinas de uma aplicação com status de permissão para um perfil específico.';

GRANT EXECUTE ON FUNCTION get_perfil_permissions(INTEGER, INTEGER) TO authenticated;

-- =====================================================
-- FUNÇÃO: set_perfil_permission (ATUALIZADA para Multi-App)
-- Define permissão de um perfil para uma rotina
-- =====================================================

DROP FUNCTION IF EXISTS set_perfil_permission(INTEGER, TEXT, BOOLEAN);

CREATE OR REPLACE FUNCTION set_perfil_permission(
  p_perfil_id INTEGER,
  p_rotina TEXT,
  p_acesso BOOLEAN,
  p_app_id INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rotina_id INTEGER;
  v_acesso_char VARCHAR(1);
  v_current_user_id INTEGER;
BEGIN
  -- Verificar se é administrador na app
  IF NOT is_admin_in_app(p_app_id) THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar permissões';
  END IF;

  -- Buscar rotina_id
  SELECT rotina_id INTO v_rotina_id
  FROM tbrotina
  WHERE rotina = p_rotina
    AND app_id = p_app_id
    AND deletado = 'N';

  IF v_rotina_id IS NULL THEN
    RAISE EXCEPTION 'Rotina não encontrada: %', p_rotina;
  END IF;

  -- Converter boolean para char
  v_acesso_char := CASE WHEN p_acesso THEN 'S' ELSE 'N' END;

  -- Buscar usuario_id atual para auditoria
  v_current_user_id := get_current_user_id();

  -- Inserir ou atualizar permissão
  INSERT INTO tbperfil_rotina (perfil_id, rotina_id, rotina, acesso, app_id, created_by)
  VALUES (p_perfil_id, v_rotina_id, p_rotina, v_acesso_char, p_app_id, auth.uid())
  ON CONFLICT (perfil_id, rotina_id)
  DO UPDATE SET
    acesso = v_acesso_char,
    updated_at = NOW(),
    updated_by = auth.uid();

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION set_perfil_permission(INTEGER, TEXT, BOOLEAN, INTEGER) IS
  'Define ou atualiza permissão de um perfil para uma rotina em uma aplicação.
   APENAS ADMINISTRADORES da aplicação podem executar esta função.';

GRANT EXECUTE ON FUNCTION set_perfil_permission(INTEGER, TEXT, BOOLEAN, INTEGER) TO authenticated;

-- =====================================================
-- FUNÇÃO: grant_app_access
-- Concede acesso de um usuário a uma aplicação
-- =====================================================

CREATE OR REPLACE FUNCTION grant_app_access(
  p_usuario_id INTEGER,
  p_app_id INTEGER,
  p_perfil_id INTEGER
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usuario_app_id BIGINT;
BEGIN
  -- Verificar se é admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem conceder acesso a aplicações';
  END IF;

  -- Verificar se usuário existe
  IF NOT EXISTS (SELECT 1 FROM tbusuario WHERE usuario_id = p_usuario_id AND deletado = 'N') THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  -- Verificar se app existe
  IF NOT EXISTS (SELECT 1 FROM tbapp WHERE app_id = p_app_id AND deletado = 'N') THEN
    RAISE EXCEPTION 'Aplicação não encontrada';
  END IF;

  -- Verificar se perfil existe e pertence à app
  IF NOT EXISTS (
    SELECT 1 FROM tbperfil
    WHERE perfil_id = p_perfil_id
    AND app_id = p_app_id
    AND deletado = 'N'
  ) THEN
    RAISE EXCEPTION 'Perfil não encontrado ou não pertence à aplicação';
  END IF;

  -- Inserir ou reativar acesso
  -- CORRIGIDO: Removidas colunas que não existem (data_acesso_inicial, ativo)
  INSERT INTO tbusuario_app (usuario_id, app_id, perfil_id, created_by)
  VALUES (p_usuario_id, p_app_id, p_perfil_id, auth.uid())
  ON CONFLICT ON CONSTRAINT tbusuario_app_pkey
  DO UPDATE SET
    perfil_id = p_perfil_id,
    deletado = 'N',
    deleted_at = NULL,
    updated_at = NOW(),
    updated_by = auth.uid()
  RETURNING usuarioapp_id INTO v_usuario_app_id;

  RETURN v_usuario_app_id;
END;
$$;

COMMENT ON FUNCTION grant_app_access(INTEGER, INTEGER, INTEGER) IS
  'Concede acesso de um usuário a uma aplicação com um perfil específico.
   Se já existir acesso, atualiza o perfil e reativa.';

GRANT EXECUTE ON FUNCTION grant_app_access(INTEGER, INTEGER, INTEGER) TO authenticated;

-- =====================================================
-- FUNÇÃO: revoke_app_access
-- Remove acesso de um usuário a uma aplicação
-- =====================================================

CREATE OR REPLACE FUNCTION revoke_app_access(
  p_usuario_id INTEGER,
  p_app_id INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem revogar acesso a aplicações';
  END IF;

  -- Soft delete do acesso
  -- CORRIGIDO: Removida coluna 'ativo' que não existe
  UPDATE tbusuario_app
  SET
    deletado = 'S',
    deleted_at = NOW(),
    updated_at = NOW(),
    updated_by = auth.uid()
  WHERE usuario_id = p_usuario_id
    AND app_id = p_app_id
    AND deletado = 'N';

  RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION revoke_app_access(INTEGER, INTEGER) IS
  'Remove (soft delete) o acesso de um usuário a uma aplicação.';

GRANT EXECUTE ON FUNCTION revoke_app_access(INTEGER, INTEGER) TO authenticated;

-- =====================================================
-- FUNÇÃO: update_last_access
-- REMOVIDA: Coluna data_ultimo_acesso não existe em tbusuario_app
-- =====================================================
-- Se desejar usar esta funcionalidade, adicione a coluna:
-- ALTER TABLE tbusuario_app ADD COLUMN data_ultimo_acesso TIMESTAMP WITHOUT TIME ZONE NULL;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
--
-- RESUMO DAS FUNÇÕES:
--
-- | Função                        | Descrição                                    |
-- |-------------------------------|----------------------------------------------|
-- | get_user_apps()               | Lista apps que usuário tem acesso            |
-- | get_user_perfil_in_app()      | Retorna perfil do usuário em uma app         |
-- | check_user_permission()       | Verifica permissão (user, rotina, app)       |
-- | check_current_user_permission | Verifica permissão do usuário atual          |
-- | is_admin()                    | Verifica se é admin em QUALQUER app          |
-- | is_admin_in_app()             | Verifica se é admin em uma app específica    |
-- | has_app_access()              | Verifica se tem acesso a uma app             |
-- | get_user_permissions()        | Lista todas permissões do usuário na app     |
-- | get_perfil_permissions()      | Lista permissões de um perfil na app         |
-- | set_perfil_permission()       | Define permissão (perfil, rotina, app)       |
-- | grant_app_access()            | Concede acesso a uma app                     |
-- | revoke_app_access()           | Remove acesso de uma app                     |
-- | (REMOVIDA) update_last_access | Coluna data_ultimo_acesso não existe         |
--
-- =====================================================
