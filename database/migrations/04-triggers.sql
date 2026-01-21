-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 04-triggers.sql
-- Descrição: Triggers automáticos
-- Versão: 1.0
-- Data: 2025-10-25
-- =====================================================

-- PRÉ-REQUISITO: Execute 03-functions.sql antes deste script

-- =====================================================
-- TRIGGERS DE UPDATED_AT
-- Atualiza automaticamente o campo updated_at em UPDATEs
-- =====================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tbdepartamento
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tblinha
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tbproduto
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tbloteinsumo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tbvelocidadenominal
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tbcodigoparada
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tbturno
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tbusuario
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tbmetaoee
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tblote
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tbapontamentoparada
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tbapontamentoproducao
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tbapontamentoqualidade
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tboeecalculado
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGERS DE AUDITORIA (ALCOA+)
-- Registra INSERT/UPDATE/DELETE em tabelas críticas
-- =====================================================

CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON tbvelocidadenominal
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TRIGGER audit_trigger ON tbvelocidadenominal IS 'Auditoria ALCOA+ - mudanças em velocidades nominais são críticas';

CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON tbapontamentoparada
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TRIGGER audit_trigger ON tbapontamentoparada IS 'Auditoria ALCOA+ - paradas devem ser rastreáveis';

CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON tbapontamentoproducao
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TRIGGER audit_trigger ON tbapontamentoproducao IS 'Auditoria ALCOA+ - dados de produção devem ser rastreáveis';

CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON tbapontamentoqualidade
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TRIGGER audit_trigger ON tbapontamentoqualidade IS 'Auditoria ALCOA+ - perdas de qualidade devem ser rastreáveis';

CREATE TRIGGER audit_trigger AFTER UPDATE OR DELETE ON tblote
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TRIGGER audit_trigger ON tblote IS 'Auditoria ALCOA+ - mudanças em lotes (UPDATE/DELETE) devem ser rastreadas';

CREATE TRIGGER audit_trigger AFTER UPDATE OR DELETE ON tbusuario
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

COMMENT ON TRIGGER audit_trigger ON tbusuario IS 'Auditoria - mudanças em usuários devem ser rastreadas (segurança)';

-- =====================================================
-- TRIGGERS DE CAMPOS CALCULADOS
-- Mantém campos calculados do lote atualizados
-- =====================================================

CREATE TRIGGER trg_atualizar_lote_producao
  AFTER INSERT OR UPDATE OR DELETE ON tbapontamentoproducao
  FOR EACH ROW EXECUTE FUNCTION atualizar_totais_lote();

COMMENT ON TRIGGER trg_atualizar_lote_producao ON tbapontamentoproducao
  IS 'Atualiza tblote.unidades_produzidas quando apontamentos de produção mudam';

CREATE TRIGGER trg_atualizar_lote_qualidade
  AFTER INSERT OR UPDATE OR DELETE ON tbapontamentoqualidade
  FOR EACH ROW EXECUTE FUNCTION atualizar_totais_lote();

COMMENT ON TRIGGER trg_atualizar_lote_qualidade ON tbapontamentoqualidade
  IS 'Atualiza tblote.unidades_refugo quando apontamentos de qualidade mudam';

-- =====================================================
-- TRIGGER DE CACHE DE OEE
-- Popula tboeecalculado quando lote é concluído
-- =====================================================

CREATE TRIGGER trg_cache_oee_concluido
  AFTER UPDATE ON tblote
  FOR EACH ROW
  WHEN (NEW.status = 'CONCLUIDO')
  EXECUTE FUNCTION cache_oee_lote_concluido();

COMMENT ON TRIGGER trg_cache_oee_concluido ON tblote
  IS 'CRÍTICO: Calcula e cacheia OEE automaticamente quando lote é concluído';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- Próximo script: 05-views.sql
--
-- Resumo:
-- - 15 triggers de updated_at (incluindo tboeecalculado)
-- - 6 triggers de auditoria (ALCOA+)
-- - 2 triggers de campos calculados
-- - 1 trigger de cache OEE
-- TOTAL: 24 triggers
