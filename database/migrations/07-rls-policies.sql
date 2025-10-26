-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 07-rls-policies.sql
-- Descrição: Row Level Security Policies
-- PRÉ-REQUISITO: tbusuario deve estar populada

-- =====================================================
-- HABILITAR RLS NAS TABELAS
-- =====================================================

ALTER TABLE tbdepartamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE tblinha ENABLE ROW LEVEL SECURITY;
ALTER TABLE tblote ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbapontamentoparada ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbapontamentoproducao ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbapontamentoqualidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE tboeecalculado ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbauditlog ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES PARA DEPARTAMENTO
-- =====================================================

-- SELECT: Todos autenticados veem seu departamento
CREATE POLICY departamento_select_policy ON tbdepartamento
  FOR SELECT TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM tbusuario u
      WHERE u.id = get_current_user_id()
        AND (
          u.tipo_usuario IN ('ADMIN', 'GESTOR')
          OR u.departamento_id = tbdepartamento.id
        )
    )
  );

-- =====================================================
-- POLICIES PARA LINHA
-- =====================================================

-- SELECT: Operador vê apenas sua linha, Supervisor vê linhas do departamento
CREATE POLICY linha_select_policy ON tblinha
  FOR SELECT TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM tbusuario u
      WHERE u.id = get_current_user_id()
        AND (
          u.tipo_usuario IN ('ADMIN', 'GESTOR')
          OR (u.tipo_usuario IN ('SUPERVISOR', 'ENCARREGADO') AND u.departamento_id = tblinha.departamento_id)
          OR (u.tipo_usuario = 'OPERADOR' AND u.linha_id = tblinha.id)
        )
    )
  );

-- =====================================================
-- POLICIES PARA LOTE
-- =====================================================

-- SELECT: Mesma lógica de linha
CREATE POLICY lote_select_policy ON tblote
  FOR SELECT TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM tbusuario u
      JOIN tblinha li ON (
        li.id = u.linha_id
        OR li.departamento_id = u.departamento_id
      )
      WHERE u.id = get_current_user_id()
        AND (
          u.tipo_usuario IN ('ADMIN', 'GESTOR')
          OR (u.tipo_usuario IN ('SUPERVISOR', 'ENCARREGADO') AND li.departamento_id = u.departamento_id)
          OR (u.tipo_usuario = 'OPERADOR' AND li.id = u.linha_id)
        )
      AND li.id = tblote.linha_id
    )
  );

-- INSERT: Operador pode criar lote em sua linha
CREATE POLICY lote_insert_policy ON tblote
  FOR INSERT TO PUBLIC
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tbusuario u
      WHERE u.id = get_current_user_id()
        AND (
          u.tipo_usuario IN ('ADMIN', 'GESTOR', 'SUPERVISOR', 'ENCARREGADO')
          OR (u.tipo_usuario = 'OPERADOR' AND u.linha_id = tblote.linha_id)
        )
    )
  );

-- UPDATE: Operador pode atualizar lote em sua linha
CREATE POLICY lote_update_policy ON tblote
  FOR UPDATE TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM tbusuario u
      WHERE u.id = get_current_user_id()
        AND (
          u.tipo_usuario IN ('ADMIN', 'GESTOR', 'SUPERVISOR', 'ENCARREGADO')
          OR (u.tipo_usuario = 'OPERADOR' AND u.linha_id = tblote.linha_id)
        )
    )
  );

-- DELETE: Somente ADMIN
CREATE POLICY lote_delete_policy ON tblote
  FOR DELETE TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM tbusuario u
      WHERE u.id = get_current_user_id()
        AND u.tipo_usuario = 'ADMIN'
    )
  );

-- =====================================================
-- POLICIES PARA APONTAMENTO_PARADA
-- =====================================================

-- SELECT/INSERT/UPDATE/DELETE: Operador acessa apenas sua linha
CREATE POLICY apontamento_parada_all_policy ON tbapontamentoparada
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM tbusuario u
      JOIN tblinha li ON li.id = u.linha_id
      WHERE u.id = get_current_user_id()
        AND (
          u.tipo_usuario IN ('ADMIN', 'GESTOR')
          OR (u.tipo_usuario IN ('SUPERVISOR', 'ENCARREGADO') AND li.departamento_id = u.departamento_id)
          OR (u.tipo_usuario = 'OPERADOR' AND li.id = u.linha_id)
        )
      AND li.id = tbapontamentoparada.linha_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tbusuario u
      JOIN tblinha li ON li.id = u.linha_id
      WHERE u.id = get_current_user_id()
        AND (
          u.tipo_usuario IN ('ADMIN', 'GESTOR', 'SUPERVISOR', 'ENCARREGADO')
          OR (u.tipo_usuario = 'OPERADOR' AND li.id = u.linha_id)
        )
      AND li.id = tbapontamentoparada.linha_id
    )
  );

-- =====================================================
-- POLICIES PARA APONTAMENTO_PRODUCAO
-- =====================================================

CREATE POLICY apontamento_producao_all_policy ON tbapontamentoproducao
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM tbusuario u
      JOIN tblinha li ON li.id = u.linha_id
      WHERE u.id = get_current_user_id()
        AND (
          u.tipo_usuario IN ('ADMIN', 'GESTOR')
          OR (u.tipo_usuario IN ('SUPERVISOR', 'ENCARREGADO') AND li.departamento_id = u.departamento_id)
          OR (u.tipo_usuario = 'OPERADOR' AND li.id = u.linha_id)
        )
      AND li.id = tbapontamentoproducao.linha_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tbusuario u
      JOIN tblinha li ON li.id = u.linha_id
      WHERE u.id = get_current_user_id()
        AND (
          u.tipo_usuario IN ('ADMIN', 'GESTOR', 'SUPERVISOR', 'ENCARREGADO')
          OR (u.tipo_usuario = 'OPERADOR' AND li.id = u.linha_id)
        )
      AND li.id = tbapontamentoproducao.linha_id
    )
  );

-- =====================================================
-- POLICIES PARA APONTAMENTO_QUALIDADE
-- =====================================================

CREATE POLICY apontamento_qualidade_all_policy ON tbapontamentoqualidade
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM tbusuario u
      JOIN tblinha li ON li.id = u.linha_id
      WHERE u.id = get_current_user_id()
        AND (
          u.tipo_usuario IN ('ADMIN', 'GESTOR')
          OR (u.tipo_usuario IN ('SUPERVISOR', 'ENCARREGADO') AND li.departamento_id = u.departamento_id)
          OR (u.tipo_usuario = 'OPERADOR' AND li.id = u.linha_id)
        )
      AND li.id = tbapontamentoqualidade.linha_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tbusuario u
      JOIN tblinha li ON li.id = u.linha_id
      WHERE u.id = get_current_user_id()
        AND (
          u.tipo_usuario IN ('ADMIN', 'GESTOR', 'SUPERVISOR', 'ENCARREGADO')
          OR (u.tipo_usuario = 'OPERADOR' AND li.id = u.linha_id)
        )
      AND li.id = tbapontamentoqualidade.linha_id
    )
  );

-- =====================================================
-- POLICIES PARA OEE_CALCULADO
-- =====================================================

-- SELECT: Todos autenticados veem OEE conforme acesso à linha
CREATE POLICY oee_calculado_select_policy ON tboeecalculado
  FOR SELECT TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM tbusuario u
      JOIN tblinha li ON li.id = u.linha_id
      WHERE u.id = get_current_user_id()
        AND (
          u.tipo_usuario IN ('ADMIN', 'GESTOR')
          OR (u.tipo_usuario IN ('SUPERVISOR', 'ENCARREGADO') AND li.departamento_id = u.departamento_id)
          OR (u.tipo_usuario = 'OPERADOR' AND li.id = u.linha_id)
        )
      AND li.id = tboeecalculado.linha_id
    )
  );

-- INSERT/UPDATE/DELETE: Apenas ADMIN e triggers (SECURITY DEFINER)
CREATE POLICY oee_calculado_modify_policy ON tboeecalculado
  FOR ALL TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM tbusuario u
      WHERE u.id = get_current_user_id()
        AND u.tipo_usuario = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tbusuario u
      WHERE u.id = get_current_user_id()
        AND u.tipo_usuario = 'ADMIN'
    )
  );

-- =====================================================
-- POLICIES PARA AUDIT_LOG
-- =====================================================

-- SELECT: Somente ADMIN e GESTOR
CREATE POLICY audit_log_select_policy ON tbauditlog
  FOR SELECT TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM tbusuario u
      WHERE u.id = get_current_user_id()
        AND u.tipo_usuario IN ('ADMIN', 'GESTOR')
    )
  );

-- INSERT/UPDATE/DELETE: Apenas triggers (já bloqueado por RULE)
-- Não criar policies de modificação - tabela é append-only via trigger

-- =====================================================

-- Políticas públicas de leitura para cadastros (necessário para dropdowns)
CREATE POLICY sku_select_policy ON tbsku
  FOR SELECT TO PUBLIC
  USING (TRUE);

CREATE POLICY insumo_select_policy ON tbinsumo
  FOR SELECT TO PUBLIC
  USING (TRUE);

CREATE POLICY velocidade_select_policy ON tbvelocidadenominal
  FOR SELECT TO PUBLIC
  USING (TRUE);

CREATE POLICY codigo_parada_select_policy ON tbcodigoparada
  FOR SELECT TO PUBLIC
  USING (TRUE);

CREATE POLICY turno_select_policy ON tbturno
  FOR SELECT TO PUBLIC
  USING (TRUE);

-- =====================================================
-- Resumo: RLS habilitado em 8 tabelas
-- - tbdepartamento: 1 policy
-- - tblinha: 1 policy
-- - tblote: 4 policies (SELECT, INSERT, UPDATE, DELETE)
-- - tbapontamentoparada: 1 policy (ALL)
-- - tbapontamentoproducao: 1 policy (ALL)
-- - tbapontamentoqualidade: 1 policy (ALL)
-- - tboeecalculado: 2 policies
-- - tbauditlog: 1 policy (SELECT only)
-- + 5 policies para cadastros (SELECT público)
--
-- TOTAL: ~17 policies
--
-- Hierarquia de Acesso:
-- - ADMIN: Acesso total
-- - GESTOR: Vê tudo, pode modificar não-críticos
-- - SUPERVISOR/ENCARREGADO: Vê e modifica linhas do seu setor
-- - OPERADOR: Vê e modifica apenas sua linha
-- - OPERADOR: Vê e modifica apenas sua linha
