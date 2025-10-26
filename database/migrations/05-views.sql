-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 05-views.sql
-- Descrição: Views para dashboards e relatórios
-- Versão: 1.0
-- Data: 2025-10-25
-- =====================================================

-- PRÉ-REQUISITO: Execute 01-04 antes deste script

-- =====================================================
-- VIEWS PARA RELATÓRIOS E DASHBOARDS
-- =====================================================

-- ----------------------------------------------------
-- VIEW: vw_diario_bordo
-- Diário de Bordo completo para relatórios/impressão
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_diario_bordo AS
SELECT
  -- Cabeçalho
  l.data_producao,
  t.codigo AS turno_codigo,
  t.nome AS turno_nome,
  li.codigo AS linha_codigo,
  li.nome AS linha_nome,
  d.codigo AS departamento_codigo,
  d.nome AS departamento_nome,

  -- Lote
  l.id AS lote_id,
  l.numero_lote,
  sku.codigo_totvs AS produto_codigo,
  sku.nome AS produto_nome,
  l.producao_inicial,
  l.producao_atual,
  l.unidades_produzidas,
  l.hora_inicio,
  l.hora_fim,
  l.status AS lote_status,

  -- Totais
  l.unidades_boas,
  l.unidades_refugo,
  l.tempo_retrabalho_minutos,

  -- Assinaturas
  u_op.nome_completo AS operador,
  u_op.matricula AS operador_matricula,
  u_sup.nome_completo AS supervisor,
  u_sup.matricula AS supervisor_matricula,
  l.conferido_em,

  -- Metadados
  l.created_at AS criado_em,
  l.updated_at AS atualizado_em
FROM tblote l
JOIN tblinha li ON li.id = l.linha_id
JOIN tbdepartamento d ON d.id = li.departamento_id
JOIN tbsku sku ON sku.id = l.sku_id
JOIN tbturno t ON t.id = l.turno_id
LEFT JOIN tbusuario u_op ON u_op.id = l.created_by
LEFT JOIN tbusuario u_sup ON u_sup.id = l.conferido_por_supervisor
WHERE l.deletado = 'N'
  AND li.deletado = 'N'
  AND d.deletado = 'N';

COMMENT ON VIEW vw_diario_bordo IS 'Diário de Bordo completo para relatórios e impressão (PDF)';

-- ----------------------------------------------------
-- VIEW: vw_diario_bordo_paradas
-- Lista de paradas do Diário de Bordo
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_diario_bordo_paradas AS
SELECT
  ap.lote_id,
  l.numero_lote,
  l.data_producao,
  cp.codigo AS parada_codigo,
  cp.descricao AS parada_descricao,
  cp.tipo_parada,
  cp.nivel_1_classe,
  cp.nivel_2_grande_parada,
  cp.nivel_3_apontamento,
  ap.hora_inicio,
  ap.hora_fim,
  ap.duracao_minutos,
  ap.observacao,
  u_op.nome_completo AS operador,
  u_sup.nome_completo AS supervisor_conferente,
  ap.conferido_em
FROM tbapontamentoparada ap
JOIN tblote l ON l.id = ap.lote_id
JOIN tbcodigoparada cp ON cp.id = ap.codigo_parada_id
LEFT JOIN tbusuario u_op ON u_op.id = ap.criado_por_operador
LEFT JOIN tbusuario u_sup ON u_sup.id = ap.conferido_por_supervisor
ORDER BY ap.data_parada, ap.hora_inicio;

COMMENT ON VIEW vw_diario_bordo_paradas IS 'Lista de paradas do Diário de Bordo com hierarquia completa';

-- ----------------------------------------------------
-- VIEW: vw_dashboard_oee_linha
-- Dashboard OEE por linha em tempo real
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_dashboard_oee_linha AS
SELECT
  li.id AS linha_id,
  li.codigo AS linha_codigo,
  li.nome AS linha_nome,
  d.codigo AS departamento_codigo,
  d.nome AS departamento_nome,

  -- OEE do último lote concluído
  oee.data_referencia,
  oee.disponibilidade,
  oee.performance,
  oee.qualidade,
  oee.oee,
  oee.meta_oee,
  oee.atingiu_meta,

  -- Totais
  oee.unidades_produzidas,
  oee.unidades_boas,
  oee.unidades_refugadas,

  -- Tempos
  oee.tempo_calendario,
  oee.tempo_disponivel,
  oee.tempo_operacao,
  oee.tempo_paradas_estrategicas,
  oee.tempo_paradas_planejadas,
  oee.tempo_paradas_nao_planejadas,

  -- Metadados
  oee.calculado_em,

  -- Status da linha
  CASE
    WHEN EXISTS (
      SELECT 1 FROM tblote
      WHERE linha_id = li.id
        AND status = 'EM_ANDAMENTO'
    ) THEN 'EM_PRODUCAO'
    ELSE 'PARADA'
  END AS status_linha
FROM tblinha li
JOIN tbdepartamento d ON d.id = li.departamento_id
LEFT JOIN LATERAL (
  SELECT *
  FROM tboeecalculado
  WHERE linha_id = li.id
    AND deletado = 'N'
  ORDER BY data_referencia DESC
  LIMIT 1
) oee ON TRUE
WHERE li.ativo = TRUE
  AND li.deletado = 'N'
  AND d.deletado = 'N';

COMMENT ON VIEW vw_dashboard_oee_linha IS 'Dashboard OEE em tempo real por linha (último lote concluído)';

-- ----------------------------------------------------
-- VIEW: vw_pareto_paradas
-- Gráfico de Pareto de paradas (PRINCIPAL ferramenta de gestão!)
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_pareto_paradas AS
SELECT
  li.id AS linha_id,
  li.nome AS linha_nome,
  cp.nivel_1_classe,
  cp.nivel_2_grande_parada,
  cp.nivel_3_apontamento,
  cp.nivel_4_grupo,
  cp.nivel_5_detalhamento,
  cp.tipo_parada,
  COUNT(ap.id) AS quantidade_ocorrencias,
  SUM(ap.duracao_minutos) AS tempo_total_minutos,
  ROUND(SUM(ap.duracao_minutos) / 60.0, 2) AS tempo_total_horas,
  ROUND(
    100.0 * SUM(ap.duracao_minutos) / NULLIF(SUM(SUM(ap.duracao_minutos)) OVER (PARTITION BY li.id), 0),
    2
  ) AS percentual_linha,
  ROUND(
    SUM(SUM(ap.duracao_minutos)) OVER (
      PARTITION BY li.id
      ORDER BY SUM(ap.duracao_minutos) DESC
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) / NULLIF(SUM(SUM(ap.duracao_minutos)) OVER (PARTITION BY li.id), 0) * 100,
    2
  ) AS percentual_acumulado
FROM tbapontamentoparada ap
JOIN tblinha li ON li.id = ap.linha_id
JOIN tbcodigoparada cp ON cp.id = ap.codigo_parada_id
WHERE ap.hora_fim IS NOT NULL  -- Apenas paradas finalizadas
GROUP BY
  li.id, li.nome,
  cp.nivel_1_classe, cp.nivel_2_grande_parada, cp.nivel_3_apontamento,
  cp.nivel_4_grupo, cp.nivel_5_detalhamento, cp.tipo_parada
ORDER BY li.id, tempo_total_minutos DESC;

COMMENT ON VIEW vw_pareto_paradas IS 'Gráfico de Pareto de paradas (principal ferramenta de gestão OEE) - permite drill-down em 5 níveis';

-- ----------------------------------------------------
-- VIEW: vw_mtbf_mttr
-- Indicadores secundários: MTBF e MTTR
-- ----------------------------------------------------
CREATE OR REPLACE VIEW vw_mtbf_mttr AS
SELECT
  li.id AS linha_id,
  li.nome AS linha_nome,
  DATE_TRUNC('week', ap.data_parada) AS semana,

  -- MTBF: Tempo médio entre falhas (horas)
  ROUND(
    AVG(
      EXTRACT(EPOCH FROM (
        LEAD(ap.hora_inicio) OVER (PARTITION BY ap.linha_id ORDER BY ap.data_parada, ap.hora_inicio)
        - ap.hora_fim
      )) / 3600.0
    ) FILTER (WHERE cp.tipo_parada = 'NAO_PLANEJADA'),
    2
  ) AS mtbf_horas,

  -- MTTR: Tempo médio de reparo (horas)
  ROUND(
    AVG(ap.duracao_minutos / 60.0) FILTER (WHERE cp.tipo_parada = 'NAO_PLANEJADA'),
    2
  ) AS mttr_horas,

  -- Quantidade de falhas
  COUNT(*) FILTER (WHERE cp.tipo_parada = 'NAO_PLANEJADA') AS total_falhas
FROM tbapontamentoparada ap
JOIN tblinha li ON li.id = ap.linha_id
JOIN tbcodigoparada cp ON cp.id = ap.codigo_parada_id
WHERE ap.hora_fim IS NOT NULL
GROUP BY li.id, li.nome, DATE_TRUNC('week', ap.data_parada);

COMMENT ON VIEW vw_mtbf_mttr IS 'Indicadores MTBF (Mean Time Between Failures) e MTTR (Mean Time To Repair) por semana';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- Próximo script: 06-indexes.sql
--
-- Resumo: 5 views criadas
-- - vw_diario_bordo: Relatório completo
-- - vw_diario_bordo_paradas: Lista de paradas
-- - vw_dashboard_oee_linha: Dashboard tempo real
-- - vw_pareto_paradas: Pareto (gestão)
-- - vw_mtbf_mttr: Indicadores secundários
