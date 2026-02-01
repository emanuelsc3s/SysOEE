-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 14-check-user-permission.sql
-- Descrição: Função RPC para verificar permissão de usuário
-- Versão: 1.0
-- Data: 2025-02-01
-- =====================================================

-- PRÉ-REQUISITO: Execute 13-tbrotina-tbperfil-rotina.sql antes deste script

-- =====================================================
-- FUNÇÃO PRINCIPAL: check_user_permission
-- Equivalente à função fPerfilRotina do Delphi/Firebird
-- =====================================================

-- Função para verificar se um usuário tem permissão para acessar uma rotina
-- Parâmetros:
--   p_user_id: UUID do usuário (auth.users.id)
--   p_rotina: Código da rotina (ex: 'EDITAR_USUARIO')
-- Retorno:
--   BOOLEAN: TRUE se tem permissão, FALSE caso contrário

CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_rotina TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- Executa com privilégios do criador (bypassa RLS)
STABLE            -- Função não modifica dados, pode ser otimizada
AS $$
DECLARE
  v_has_access BOOLEAN := FALSE;
  v_perfil_id INTEGER;
BEGIN
  -- Validar parâmetros
  IF p_user_id IS NULL OR p_rotina IS NULL OR p_rotina = '' THEN
    RETURN FALSE;
  END IF;

  -- Buscar permissão diretamente (query otimizada)
  -- CORRIGIDO: JOIN com tbrotina pois tbperfil_rotina não tem coluna 'rotina'
  SELECT
    CASE WHEN pr.acesso = 'S' THEN TRUE ELSE FALSE END
  INTO v_has_access
  FROM tbperfil_rotina pr
  INNER JOIN tbrotina r ON r.rotina_id = pr.rotina_id
  INNER JOIN tbusuario u ON u.perfil_id = pr.perfil_id
    AND u.deletado = 'N'
  WHERE pr.deletado = 'N'
    AND r.deletado = 'N'
    AND u.user_id = p_user_id
    AND r.rotina = p_rotina;

  -- Se não encontrou registro, não tem acesso
  RETURN COALESCE(v_has_access, FALSE);
END;
$$;

COMMENT ON FUNCTION check_user_permission(UUID, TEXT) IS
  'Verifica se um usuário tem permissão para acessar uma rotina específica.
   Equivalente à função fPerfilRotina do sistema Delphi/Firebird.
   Retorna TRUE se tem acesso, FALSE caso contrário.';

-- Permissão para usuários autenticados chamarem a função
GRANT EXECUTE ON FUNCTION check_user_permission(UUID, TEXT) TO authenticated;

-- =====================================================
-- FUNÇÃO AUXILIAR: get_current_user_id
-- Retorna o usuario_id (INTEGER) do usuário logado
-- =====================================================

CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_usuario_id INTEGER;
BEGIN
  SELECT usuario_id INTO v_usuario_id
  FROM tbusuario
  WHERE user_id = auth.uid()
    AND deletado = 'N'
  LIMIT 1;

  RETURN v_usuario_id;
END;
$$;

COMMENT ON FUNCTION get_current_user_id() IS
  'Retorna o usuario_id (INTEGER) do usuário atualmente logado no Supabase Auth';

GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated;

-- =====================================================
-- FUNÇÃO AUXILIAR: get_current_user_perfil_id
-- Retorna o perfil_id do usuário logado
-- =====================================================

CREATE OR REPLACE FUNCTION get_current_user_perfil_id()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_perfil_id INTEGER;
BEGIN
  SELECT perfil_id INTO v_perfil_id
  FROM tbusuario
  WHERE user_id = auth.uid()
    AND deletado = 'N'
  LIMIT 1;

  RETURN v_perfil_id;
END;
$$;

COMMENT ON FUNCTION get_current_user_perfil_id() IS
  'Retorna o perfil_id do usuário atualmente logado';

GRANT EXECUTE ON FUNCTION get_current_user_perfil_id() TO authenticated;

-- =====================================================
-- FUNÇÃO: check_current_user_permission
-- Versão simplificada que usa o usuário logado automaticamente
-- =====================================================

CREATE OR REPLACE FUNCTION check_current_user_permission(p_rotina TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN check_user_permission(auth.uid(), p_rotina);
END;
$$;

COMMENT ON FUNCTION check_current_user_permission(TEXT) IS
  'Verifica se o usuário ATUAL (logado) tem permissão para a rotina.
   Versão simplificada de check_user_permission que não precisa do user_id.';

GRANT EXECUTE ON FUNCTION check_current_user_permission(TEXT) TO authenticated;

-- =====================================================
-- FUNÇÃO: is_admin
-- Verifica se o usuário atual é Administrador
-- =====================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_is_admin BOOLEAN := FALSE;
BEGIN
  SELECT (perfil_id = 1 OR perfil = 'Administrador')
  INTO v_is_admin
  FROM tbusuario
  WHERE user_id = auth.uid()
    AND deletado = 'N'
  LIMIT 1;

  RETURN COALESCE(v_is_admin, FALSE);
END;
$$;

COMMENT ON FUNCTION is_admin() IS
  'Verifica se o usuário atual é Administrador (perfil_id = 1)';

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- =====================================================
-- FUNÇÃO: get_user_permissions
-- Retorna todas as permissões de um usuário
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID DEFAULT NULL)
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
BEGIN
  -- Usar usuário atual se não informado
  v_user_id := COALESCE(p_user_id, auth.uid());

  RETURN QUERY
  SELECT
    r.rotina,
    r.descricao,
    r.modulo,
    (pr.acesso = 'S') AS acesso
  FROM tbrotina r
  LEFT JOIN tbperfil_rotina pr ON pr.rotina_id = r.rotina_id
    AND pr.deletado = 'N'
    AND pr.perfil_id = (
      SELECT u.perfil_id
      FROM tbusuario u
      WHERE u.user_id = v_user_id AND u.deletado = 'N'
      LIMIT 1
    )
  WHERE r.deletado = 'N'
  ORDER BY r.modulo, r.ordem;
END;
$$;

COMMENT ON FUNCTION get_user_permissions(UUID) IS
  'Retorna todas as rotinas do sistema com status de permissão do usuário.
   Se user_id não for informado, usa o usuário logado.';

GRANT EXECUTE ON FUNCTION get_user_permissions(UUID) TO authenticated;

-- =====================================================
-- FUNÇÃO: get_perfil_permissions
-- Retorna todas as permissões de um perfil específico
-- =====================================================

CREATE OR REPLACE FUNCTION get_perfil_permissions(p_perfil_id INTEGER)
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
    AND pr.deletado = 'N'
  WHERE r.deletado = 'N'
  ORDER BY r.modulo, r.ordem;
END;
$$;

COMMENT ON FUNCTION get_perfil_permissions(INTEGER) IS
  'Retorna todas as rotinas do sistema com status de permissão para um perfil específico.';

GRANT EXECUTE ON FUNCTION get_perfil_permissions(INTEGER) TO authenticated;

-- =====================================================
-- FUNÇÃO: set_perfil_permission
-- Define/atualiza permissão de um perfil para uma rotina
-- APENAS ADMINISTRADORES
-- =====================================================

CREATE OR REPLACE FUNCTION set_perfil_permission(
  p_perfil_id INTEGER,
  p_rotina TEXT,
  p_acesso BOOLEAN
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
  -- Verificar se é administrador
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar permissões';
  END IF;

  -- Buscar rotina_id
  SELECT rotina_id INTO v_rotina_id
  FROM tbrotina
  WHERE rotina = p_rotina AND deletado = 'N';

  IF v_rotina_id IS NULL THEN
    RAISE EXCEPTION 'Rotina não encontrada: %', p_rotina;
  END IF;

  -- Converter boolean para char
  v_acesso_char := CASE WHEN p_acesso THEN 'S' ELSE 'N' END;

  -- Buscar usuario_id atual para auditoria
  v_current_user_id := get_current_user_id();

  -- Inserir ou atualizar permissão
  -- CORRIGIDO: Removida coluna 'rotina' que não existe em tbperfil_rotina
  INSERT INTO tbperfil_rotina (perfil_id, rotina_id, acesso, created_by)
  VALUES (p_perfil_id, v_rotina_id, v_acesso_char, auth.uid())
  ON CONFLICT ON CONSTRAINT tbperfil_rotina_pkey
  DO UPDATE SET
    acesso = v_acesso_char,
    updated_at = NOW(),
    updated_by = auth.uid();

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION set_perfil_permission(INTEGER, TEXT, BOOLEAN) IS
  'Define ou atualiza permissão de um perfil para uma rotina.
   APENAS ADMINISTRADORES podem executar esta função.';

GRANT EXECUTE ON FUNCTION set_perfil_permission(INTEGER, TEXT, BOOLEAN) TO authenticated;

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para otimizar a consulta principal de check_user_permission
CREATE INDEX IF NOT EXISTS idx_tbusuario_user_id_perfil
  ON tbusuario(user_id, perfil_id)
  WHERE deletado = 'N';

-- Índice composto para consulta de permissão
-- CORRIGIDO: Removida coluna 'rotina' que não existe em tbperfil_rotina
CREATE INDEX IF NOT EXISTS idx_tbperfil_rotina_lookup
  ON tbperfil_rotina(perfil_id, rotina_id, acesso)
  WHERE deletado = 'N';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- Próximo script: 15-rls-permission-policies.sql
