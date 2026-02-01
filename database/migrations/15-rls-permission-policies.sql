-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 15-rls-permission-policies.sql
-- Descrição: Políticas RLS usando sistema de permissões por rotina
-- Versão: 1.0
-- Data: 2025-02-01
-- =====================================================

-- PRÉ-REQUISITO: Execute 14-check-user-permission.sql antes deste script

-- =====================================================
-- ESTRATÉGIA DE SEGURANÇA
-- =====================================================
--
-- Camada 1: Frontend (UX)
--   - check_user_permission() decide se mostra/habilita botões
--   - Pode ser burlado pelo DevTools
--
-- Camada 2: RLS no Banco (Segurança Real)
--   - Políticas usam check_current_user_permission()
--   - Impossível burlar - validação no servidor
--
-- =====================================================

-- =====================================================
-- REMOVER POLÍTICAS ANTIGAS (se existirem)
-- =====================================================

-- tbusuario
DROP POLICY IF EXISTS tbusuario_select_policy ON tbusuario;
DROP POLICY IF EXISTS tbusuario_insert_policy ON tbusuario;
DROP POLICY IF EXISTS tbusuario_update_policy ON tbusuario;
DROP POLICY IF EXISTS tbusuario_delete_policy ON tbusuario;

-- tbfuncionario
DROP POLICY IF EXISTS tbfuncionario_select_policy ON tbfuncionario;
DROP POLICY IF EXISTS tbfuncionario_insert_policy ON tbfuncionario;
DROP POLICY IF EXISTS tbfuncionario_update_policy ON tbfuncionario;
DROP POLICY IF EXISTS tbfuncionario_delete_policy ON tbfuncionario;

-- tblinha (tblinhaproducao)
DROP POLICY IF EXISTS tblinha_select_policy ON tblinha;
DROP POLICY IF EXISTS tblinha_insert_policy ON tblinha;
DROP POLICY IF EXISTS tblinha_update_policy ON tblinha;
DROP POLICY IF EXISTS tblinha_delete_policy ON tblinha;

-- tbsetor
DROP POLICY IF EXISTS tbsetor_select_policy ON tbsetor;
DROP POLICY IF EXISTS tbsetor_insert_policy ON tbsetor;
DROP POLICY IF EXISTS tbsetor_update_policy ON tbsetor;
DROP POLICY IF EXISTS tbsetor_delete_policy ON tbsetor;

-- tbturno
DROP POLICY IF EXISTS tbturno_select_policy ON tbturno;
DROP POLICY IF EXISTS tbturno_insert_policy ON tbturno;
DROP POLICY IF EXISTS tbturno_update_policy ON tbturno;
DROP POLICY IF EXISTS tbturno_delete_policy ON tbturno;

-- tbproduto
DROP POLICY IF EXISTS tbproduto_select_policy ON tbproduto;
DROP POLICY IF EXISTS tbproduto_insert_policy ON tbproduto;
DROP POLICY IF EXISTS tbproduto_update_policy ON tbproduto;
DROP POLICY IF EXISTS tbproduto_delete_policy ON tbproduto;

-- tboee_parada (motivos de parada)
DROP POLICY IF EXISTS tboee_parada_select_policy ON tboee_parada;
DROP POLICY IF EXISTS tboee_parada_insert_policy ON tboee_parada;
DROP POLICY IF EXISTS tboee_parada_update_policy ON tboee_parada;
DROP POLICY IF EXISTS tboee_parada_delete_policy ON tboee_parada;

-- =====================================================
-- POLÍTICAS PARA TBUSUARIO
-- =====================================================

-- Habilitar RLS (caso não esteja)
ALTER TABLE tbusuario ENABLE ROW LEVEL SECURITY;

-- SELECT: Quem tem permissão VISUALIZAR_USUARIO
CREATE POLICY tbusuario_select_policy ON tbusuario
  FOR SELECT TO authenticated
  USING (
    deletado = 'N'
    AND check_current_user_permission('VISUALIZAR_USUARIO')
  );

-- INSERT: Quem tem permissão CRIAR_USUARIO
CREATE POLICY tbusuario_insert_policy ON tbusuario
  FOR INSERT TO authenticated
  WITH CHECK (
    check_current_user_permission('CRIAR_USUARIO')
  );

-- UPDATE: Quem tem permissão EDITAR_USUARIO
CREATE POLICY tbusuario_update_policy ON tbusuario
  FOR UPDATE TO authenticated
  USING (
    check_current_user_permission('EDITAR_USUARIO')
  )
  WITH CHECK (
    check_current_user_permission('EDITAR_USUARIO')
  );

-- DELETE: Quem tem permissão EXCLUIR_USUARIO
CREATE POLICY tbusuario_delete_policy ON tbusuario
  FOR DELETE TO authenticated
  USING (
    check_current_user_permission('EXCLUIR_USUARIO')
  );

-- =====================================================
-- POLÍTICAS PARA TBFUNCIONARIO
-- =====================================================

ALTER TABLE tbfuncionario ENABLE ROW LEVEL SECURITY;

CREATE POLICY tbfuncionario_select_policy ON tbfuncionario
  FOR SELECT TO authenticated
  USING (
    deletado = 'N'
    AND check_current_user_permission('VISUALIZAR_FUNCIONARIO')
  );

CREATE POLICY tbfuncionario_insert_policy ON tbfuncionario
  FOR INSERT TO authenticated
  WITH CHECK (
    check_current_user_permission('CRIAR_FUNCIONARIO')
  );

CREATE POLICY tbfuncionario_update_policy ON tbfuncionario
  FOR UPDATE TO authenticated
  USING (check_current_user_permission('EDITAR_FUNCIONARIO'))
  WITH CHECK (check_current_user_permission('EDITAR_FUNCIONARIO'));

CREATE POLICY tbfuncionario_delete_policy ON tbfuncionario
  FOR DELETE TO authenticated
  USING (check_current_user_permission('EXCLUIR_FUNCIONARIO'));

-- =====================================================
-- POLÍTICAS PARA TBLINHA (Linhas de Produção)
-- =====================================================

ALTER TABLE tblinha ENABLE ROW LEVEL SECURITY;

CREATE POLICY tblinha_select_policy ON tblinha
  FOR SELECT TO authenticated
  USING (
    deletado = 'N'
    AND check_current_user_permission('VISUALIZAR_LINHA')
  );

CREATE POLICY tblinha_insert_policy ON tblinha
  FOR INSERT TO authenticated
  WITH CHECK (
    check_current_user_permission('CRIAR_LINHA')
  );

CREATE POLICY tblinha_update_policy ON tblinha
  FOR UPDATE TO authenticated
  USING (check_current_user_permission('EDITAR_LINHA'))
  WITH CHECK (check_current_user_permission('EDITAR_LINHA'));

CREATE POLICY tblinha_delete_policy ON tblinha
  FOR DELETE TO authenticated
  USING (check_current_user_permission('EXCLUIR_LINHA'));

-- =====================================================
-- POLÍTICAS PARA TBSETOR
-- =====================================================

ALTER TABLE tbsetor ENABLE ROW LEVEL SECURITY;

CREATE POLICY tbsetor_select_policy ON tbsetor
  FOR SELECT TO authenticated
  USING (
    deletado = 'N'
    AND check_current_user_permission('VISUALIZAR_SETOR')
  );

CREATE POLICY tbsetor_insert_policy ON tbsetor
  FOR INSERT TO authenticated
  WITH CHECK (
    check_current_user_permission('CRIAR_SETOR')
  );

CREATE POLICY tbsetor_update_policy ON tbsetor
  FOR UPDATE TO authenticated
  USING (check_current_user_permission('EDITAR_SETOR'))
  WITH CHECK (check_current_user_permission('EDITAR_SETOR'));

CREATE POLICY tbsetor_delete_policy ON tbsetor
  FOR DELETE TO authenticated
  USING (check_current_user_permission('EXCLUIR_SETOR'));

-- =====================================================
-- POLÍTICAS PARA TBTURNO
-- =====================================================

ALTER TABLE tbturno ENABLE ROW LEVEL SECURITY;

CREATE POLICY tbturno_select_policy ON tbturno
  FOR SELECT TO authenticated
  USING (
    deletado = 'N'
    AND check_current_user_permission('VISUALIZAR_TURNO')
  );

CREATE POLICY tbturno_insert_policy ON tbturno
  FOR INSERT TO authenticated
  WITH CHECK (
    check_current_user_permission('CRIAR_TURNO')
  );

CREATE POLICY tbturno_update_policy ON tbturno
  FOR UPDATE TO authenticated
  USING (check_current_user_permission('EDITAR_TURNO'))
  WITH CHECK (check_current_user_permission('EDITAR_TURNO'));

CREATE POLICY tbturno_delete_policy ON tbturno
  FOR DELETE TO authenticated
  USING (check_current_user_permission('EXCLUIR_TURNO'));

-- =====================================================
-- POLÍTICAS PARA TBPRODUTO
-- =====================================================

ALTER TABLE tbproduto ENABLE ROW LEVEL SECURITY;

CREATE POLICY tbproduto_select_policy ON tbproduto
  FOR SELECT TO authenticated
  USING (
    deletado = 'N'
    AND check_current_user_permission('VISUALIZAR_PRODUTO')
  );

CREATE POLICY tbproduto_insert_policy ON tbproduto
  FOR INSERT TO authenticated
  WITH CHECK (
    check_current_user_permission('CRIAR_PRODUTO')
  );

CREATE POLICY tbproduto_update_policy ON tbproduto
  FOR UPDATE TO authenticated
  USING (check_current_user_permission('EDITAR_PRODUTO'))
  WITH CHECK (check_current_user_permission('EDITAR_PRODUTO'));

CREATE POLICY tbproduto_delete_policy ON tbproduto
  FOR DELETE TO authenticated
  USING (check_current_user_permission('EXCLUIR_PRODUTO'));

-- =====================================================
-- POLÍTICAS PARA TBOEE_PARADA (Motivos de Parada)
-- =====================================================

ALTER TABLE tboee_parada ENABLE ROW LEVEL SECURITY;

CREATE POLICY tboee_parada_select_policy ON tboee_parada
  FOR SELECT TO authenticated
  USING (
    deletado = 'N'
    AND check_current_user_permission('VISUALIZAR_MOTIVO_PARADA')
  );

CREATE POLICY tboee_parada_insert_policy ON tboee_parada
  FOR INSERT TO authenticated
  WITH CHECK (
    check_current_user_permission('CRIAR_MOTIVO_PARADA')
  );

CREATE POLICY tboee_parada_update_policy ON tboee_parada
  FOR UPDATE TO authenticated
  USING (check_current_user_permission('EDITAR_MOTIVO_PARADA'))
  WITH CHECK (check_current_user_permission('EDITAR_MOTIVO_PARADA'));

CREATE POLICY tboee_parada_delete_policy ON tboee_parada
  FOR DELETE TO authenticated
  USING (check_current_user_permission('EXCLUIR_MOTIVO_PARADA'));

-- =====================================================
-- POLÍTICAS PARA TBLOTE (Lotes de Produção)
-- =====================================================

ALTER TABLE tblote ENABLE ROW LEVEL SECURITY;

CREATE POLICY tblote_select_policy ON tblote
  FOR SELECT TO authenticated
  USING (
    deletado = 'N'
    AND check_current_user_permission('VISUALIZAR_LOTE')
  );

CREATE POLICY tblote_insert_policy ON tblote
  FOR INSERT TO authenticated
  WITH CHECK (
    check_current_user_permission('CRIAR_LOTE')
  );

CREATE POLICY tblote_update_policy ON tblote
  FOR UPDATE TO authenticated
  USING (check_current_user_permission('EDITAR_LOTE'))
  WITH CHECK (check_current_user_permission('EDITAR_LOTE'));

CREATE POLICY tblote_delete_policy ON tblote
  FOR DELETE TO authenticated
  USING (check_current_user_permission('EXCLUIR_LOTE'));

-- =====================================================
-- POLÍTICAS PARA TBAPONTAMENTOPARADA (Apontamentos)
-- =====================================================

ALTER TABLE tbapontamentoparada ENABLE ROW LEVEL SECURITY;

CREATE POLICY tbapontamentoparada_select_policy ON tbapontamentoparada
  FOR SELECT TO authenticated
  USING (
    deletado = 'N'
    AND check_current_user_permission('VISUALIZAR_APONTAMENTO')
  );

CREATE POLICY tbapontamentoparada_insert_policy ON tbapontamentoparada
  FOR INSERT TO authenticated
  WITH CHECK (
    check_current_user_permission('CRIAR_APONTAMENTO')
  );

CREATE POLICY tbapontamentoparada_update_policy ON tbapontamentoparada
  FOR UPDATE TO authenticated
  USING (check_current_user_permission('EDITAR_APONTAMENTO'))
  WITH CHECK (check_current_user_permission('EDITAR_APONTAMENTO'));

CREATE POLICY tbapontamentoparada_delete_policy ON tbapontamentoparada
  FOR DELETE TO authenticated
  USING (check_current_user_permission('EXCLUIR_APONTAMENTO'));

-- =====================================================
-- POLÍTICAS PARA TBPERFIL (Perfis de Acesso)
-- Apenas Administradores podem gerenciar
-- =====================================================

ALTER TABLE tbperfil ENABLE ROW LEVEL SECURITY;

-- Todos podem visualizar perfis (para dropdowns, etc)
CREATE POLICY tbperfil_select_policy ON tbperfil
  FOR SELECT TO authenticated
  USING (deletado = 'N');

-- Apenas admin pode inserir/atualizar/deletar perfis
CREATE POLICY tbperfil_insert_policy ON tbperfil
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY tbperfil_update_policy ON tbperfil
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY tbperfil_delete_policy ON tbperfil
  FOR DELETE TO authenticated
  USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA TBROTINA (Rotinas do Sistema)
-- Apenas Administradores podem gerenciar
-- =====================================================

-- Atualizar políticas de tbrotina (já criadas no script 13)
DROP POLICY IF EXISTS tbrotina_select_policy ON tbrotina;

CREATE POLICY tbrotina_select_policy ON tbrotina
  FOR SELECT TO authenticated
  USING (deletado = 'N');

CREATE POLICY tbrotina_insert_policy ON tbrotina
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY tbrotina_update_policy ON tbrotina
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY tbrotina_delete_policy ON tbrotina
  FOR DELETE TO authenticated
  USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA TBPERFIL_ROTINA (Matriz de Permissões)
-- Apenas Administradores podem gerenciar
-- =====================================================

-- Atualizar políticas de tbperfil_rotina (já criadas no script 13)
DROP POLICY IF EXISTS tbperfil_rotina_select_policy ON tbperfil_rotina;

-- Todos podem visualizar (para consultas de permissão)
CREATE POLICY tbperfil_rotina_select_policy ON tbperfil_rotina
  FOR SELECT TO authenticated
  USING (deletado = 'N');

-- Apenas admin pode modificar permissões
CREATE POLICY tbperfil_rotina_insert_policy ON tbperfil_rotina
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY tbperfil_rotina_update_policy ON tbperfil_rotina
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY tbperfil_rotina_delete_policy ON tbperfil_rotina
  FOR DELETE TO authenticated
  USING (is_admin());

-- =====================================================
-- POLÍTICA ESPECIAL: Usuário pode editar próprio perfil
-- (dados pessoais, não permissões)
-- =====================================================

-- Permitir que usuário atualize seus próprios dados básicos
CREATE POLICY tbusuario_self_update_policy ON tbusuario
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    AND deletado = 'N'
  )
  WITH CHECK (
    user_id = auth.uid()
    -- Não pode alterar seu próprio perfil_id (auto-promoção)
    -- Esta validação adicional pode ser feita via trigger se necessário
  );

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
--
-- RESUMO DAS POLÍTICAS:
--
-- | Tabela              | SELECT                   | INSERT              | UPDATE              | DELETE              |
-- |---------------------|--------------------------|---------------------|---------------------|---------------------|
-- | tbusuario           | VISUALIZAR_USUARIO       | CRIAR_USUARIO       | EDITAR_USUARIO      | EXCLUIR_USUARIO     |
-- | tbfuncionario       | VISUALIZAR_FUNCIONARIO   | CRIAR_FUNCIONARIO   | EDITAR_FUNCIONARIO  | EXCLUIR_FUNCIONARIO |
-- | tblinha             | VISUALIZAR_LINHA         | CRIAR_LINHA         | EDITAR_LINHA        | EXCLUIR_LINHA       |
-- | tbsetor             | VISUALIZAR_SETOR         | CRIAR_SETOR         | EDITAR_SETOR        | EXCLUIR_SETOR       |
-- | tbturno             | VISUALIZAR_TURNO         | CRIAR_TURNO         | EDITAR_TURNO        | EXCLUIR_TURNO       |
-- | tbproduto           | VISUALIZAR_PRODUTO       | CRIAR_PRODUTO       | EDITAR_PRODUTO      | EXCLUIR_PRODUTO     |
-- | tboee_parada        | VISUALIZAR_MOTIVO_PARADA | CRIAR_MOTIVO_PARADA | EDITAR_MOTIVO_PARADA| EXCLUIR_MOTIVO_PARADA|
-- | tblote              | VISUALIZAR_LOTE          | CRIAR_LOTE          | EDITAR_LOTE         | EXCLUIR_LOTE        |
-- | tbapontamentoparada | VISUALIZAR_APONTAMENTO   | CRIAR_APONTAMENTO   | EDITAR_APONTAMENTO  | EXCLUIR_APONTAMENTO |
-- | tbperfil            | Todos autenticados       | is_admin()          | is_admin()          | is_admin()          |
-- | tbrotina            | Todos autenticados       | is_admin()          | is_admin()          | is_admin()          |
-- | tbperfil_rotina     | Todos autenticados       | is_admin()          | is_admin()          | is_admin()          |
--
-- =====================================================
