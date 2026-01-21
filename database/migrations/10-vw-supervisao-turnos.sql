-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 10-vw-supervisao-turnos.sql
-- Descrição: View para página de supervisão de turnos
-- Versão: 1.0
-- Data: 2025-11-16
-- =====================================================

-- =====================================================
-- VW_SUPERVISAO_TURNOS
-- Consolida dados de apontamentos por turno
-- =====================================================

CREATE OR REPLACE VIEW vw_supervisao_turnos AS
SELECT
  -- Identificação do turno
  l.lote_id,
  l.numero_lote,
  lp.linhaproducao_id,
  lp.linhaproducao AS linha_nome,
  d.departamento_id,
  d.departamento AS departamento_nome,
  p.produto_id,
  p.descricao AS produto_nome,
  t.turno_id,
  t.turno AS turno_nome,
  t.codigo AS turno_codigo,

  -- Datas e horários
  l.data_producao,
  l.hora_inicio,
  l.hora_fim,

  -- Status
  l.status AS lote_status,
  CASE
    WHEN l.status = 'CONCLUIDO' THEN 'FECHADO'
    WHEN l.status = 'EM_ANDAMENTO' THEN 'ABERTO'
    ELSE l.status
  END AS turno_status,

  -- Já tem OEE calculado?
  EXISTS (
    SELECT 1 FROM tboee o
    WHERE o.lote_id = l.lote_id
      AND o.status = 'ATIVO'
  ) AS tem_oee_calculado,

  -- ========================================
  -- RESUMO DE PARADAS
  -- ========================================
  (
    SELECT COUNT(*)
    FROM tbapontamentoparada ap
    WHERE ap.lote_id = l.lote_id
  ) AS total_paradas,

  (
    SELECT COALESCE(SUM(
      EXTRACT(EPOCH FROM (
        COALESCE(ap.hora_fim, CURRENT_TIME) - ap.hora_inicio
      )) / 60
    ), 0)
    FROM tbapontamentoparada ap
    WHERE ap.lote_id = l.lote_id
  ) AS total_minutos_paradas,

  (
    SELECT COUNT(*)
    FROM tbapontamentoparada ap
    WHERE ap.lote_id = l.lote_id
      AND ap.hora_fim IS NULL
  ) AS paradas_em_andamento,

  -- ========================================
  -- RESUMO DE PRODUÇÃO
  -- ========================================
  (
    SELECT COALESCE(SUM(unidades_produzidas), 0)
    FROM tbapontamentoproducao ap
    WHERE ap.lote_id = l.lote_id
  ) AS total_unidades_produzidas,

  (
    SELECT COUNT(*)
    FROM tbapontamentoproducao ap
    WHERE ap.lote_id = l.lote_id
  ) AS total_apontamentos_producao,

  (
    SELECT COUNT(*)
    FROM tbapontamentoproducao ap
    WHERE ap.lote_id = l.lote_id
      AND ap.fonte_dados = 'CLP_AUTOMATICO'
  ) AS apontamentos_clp,

  (
    SELECT COUNT(*)
    FROM tbapontamentoproducao ap
    WHERE ap.lote_id = l.lote_id
      AND ap.fonte_dados = 'MANUAL'
  ) AS apontamentos_manuais,

  -- ========================================
  -- RESUMO DE QUALIDADE
  -- ========================================
  (
    SELECT COALESCE(SUM(unidades_refugadas), 0)
    FROM tbapontamentoqualidade aq
    WHERE aq.lote_id = l.lote_id
      AND aq.tipo_perda = 'REFUGO'
  ) AS total_refugo,

  (
    SELECT COUNT(*)
    FROM tbapontamentoqualidade aq
    WHERE aq.lote_id = l.lote_id
  ) AS total_apontamentos_qualidade,

  -- ========================================
  -- VELOCIDADE E META (para preview de OEE)
  -- ========================================
  (
    SELECT velocidade
    FROM tbvelocidadenominal v
    WHERE v.linhaproducao_id = lp.linhaproducao_id
      AND v.produto_id = p.produto_id
      AND v.deletado = 'N'
    LIMIT 1
  ) AS velocidade_nominal,

  (
    SELECT meta_oee
    FROM tbmetaoee m
    WHERE m.linha_id = lp.linhaproducao_id
      AND l.data_producao BETWEEN m.data_inicio_vigencia
          AND COALESCE(m.data_fim_vigencia, '9999-12-31'::DATE)
      AND m.deletado = 'N'
    ORDER BY m.data_inicio_vigencia DESC
    LIMIT 1
  ) AS meta_oee_vigente,

  -- ========================================
  -- AUDITORIA
  -- ========================================
  l.conferido_por_supervisor,
  l.conferido_em,
  (
    SELECT u.nome
    FROM tbusuario u
    JOIN tbfuncionario f ON u.funcionario_id = f.funcionario_id
    WHERE u.usuario_id = l.conferido_por_supervisor
  ) AS supervisor_nome,

  l.created_at AS lote_criado_em,
  l.updated_at AS lote_atualizado_em

FROM tblote l
JOIN tblinhaproducao lp ON l.linha_id = lp.linhaproducao_id
JOIN tbdepartamento d ON lp.departamento_id = d.departamento_id
JOIN tbproduto p ON l.produto_id = p.produto_id
LEFT JOIN tbturno t ON l.turno_id = t.turno_id

WHERE l.deletado = 'N';

-- ========================================
-- COMENTÁRIOS
-- ========================================

COMMENT ON VIEW vw_supervisao_turnos IS 'View consolidada para página de supervisão de turnos. Agrega apontamentos de paradas, produção e qualidade.';

-- ========================================
-- FIM DO SCRIPT
-- =====================================================
