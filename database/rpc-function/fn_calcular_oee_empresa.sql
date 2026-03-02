-- ============================================================================
-- FUNÇÃO: fn_calcular_oee_empresa
-- Consolida o OEE da empresa considerando todas as linhas/turnos com
-- apontamento no período.
--
-- Estratégia:
-- - Usa fn_resumo_oee_turno para identificar turnos realmente apontados
--   (produção, perdas ou paradas).
-- - Usa fn_calcular_oee_dashboard por oeeturno_id para manter as fórmulas
--   oficiais de Disponibilidade/Performance/Qualidade/OEE.
-- - Retorna um único registro consolidado para o período consultado.
--
-- Data: 2026-03-02
-- ============================================================================

DROP FUNCTION IF EXISTS fn_calcular_oee_empresa(DATE, DATE, INTEGER, INTEGER, INTEGER, NUMERIC, BIGINT);

CREATE OR REPLACE FUNCTION fn_calcular_oee_empresa(
  p_data_inicio DATE,
  p_data_fim DATE,
  p_turno_id INTEGER DEFAULT NULL,
  p_produto_id INTEGER DEFAULT NULL,
  p_linhaproducao_id INTEGER DEFAULT NULL,
  p_tempo_disponivel_padrao NUMERIC DEFAULT 12,
  p_oeeturno_id BIGINT DEFAULT NULL
)
RETURNS TABLE (
  data_inicio DATE,
  data_fim DATE,
  turnos_apontados INTEGER,
  linhas_com_apontamento INTEGER,
  sku_produzidos BIGINT,
  qtd_envase NUMERIC,
  envasado NUMERIC,
  qtd_embalagem NUMERIC,
  embalado NUMERIC,
  perdas_envase NUMERIC,
  perdas_embalagem NUMERIC,
  perdas_total NUMERIC,
  unidades_produzidas NUMERIC,
  unidades_perdas NUMERIC,
  unidades_boas NUMERIC,
  tempo_operacional_liquido NUMERIC,
  tempo_valioso NUMERIC,
  tempo_disponivel_horas NUMERIC,
  tempo_estrategico_horas NUMERIC,
  tempo_paradas_grandes_horas NUMERIC,
  tempo_operacao_horas NUMERIC,
  paradas_pequenas_horas NUMERIC,
  paradas_totais_horas NUMERIC,
  disponibilidade NUMERIC,
  performance NUMERIC,
  qualidade NUMERIC,
  oee NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH resumo_base AS (
    SELECT *
    FROM fn_resumo_oee_turno(
      p_data_inicio := p_data_inicio,
      p_data_fim := p_data_fim,
      p_turno_id := p_turno_id,
      p_produto_id := p_produto_id,
      p_linhaproducao_id := p_linhaproducao_id,
      p_oeeturno_id := p_oeeturno_id
    )
  ),

  resumo_filtrado AS (
    SELECT rb.*
    FROM resumo_base rb
    WHERE rb.oeeturno_id IS NOT NULL
      AND (
        COALESCE(rb.qtd_envase, 0) <> 0
        OR COALESCE(rb.qtd_embalagem, 0) <> 0
        OR COALESCE(rb.perdas_envase, 0) <> 0
        OR COALESCE(rb.perdas_embalagem, 0) <> 0
        OR COALESCE(rb.paradas_totais_minutos, 0) <> 0
      )
  ),

  turnos_relevantes AS (
    SELECT DISTINCT rf.oeeturno_id
    FROM resumo_filtrado rf
  ),

  componentes AS (
    SELECT
      c.unidades_produzidas,
      c.unidades_perdas,
      c.unidades_boas,
      c.tempo_operacional_liquido,
      c.tempo_valioso,
      c.tempo_disponivel_horas,
      c.tempo_estrategico_horas,
      c.tempo_paradas_grandes_horas,
      c.tempo_operacao_horas
    FROM turnos_relevantes tr
    CROSS JOIN LATERAL fn_calcular_oee_dashboard(
      p_data_inicio := p_data_inicio,
      p_data_fim := p_data_fim,
      p_turno_id := NULL,
      p_produto_id := NULL,
      p_linhaproducao_id := NULL,
      p_tempo_disponivel_padrao := p_tempo_disponivel_padrao,
      p_oeeturno_id := tr.oeeturno_id
    ) c
  ),

  componentes_agregados AS (
    SELECT
      COALESCE(SUM(c.unidades_produzidas), 0)::NUMERIC AS unidades_produzidas,
      COALESCE(SUM(c.unidades_perdas), 0)::NUMERIC AS unidades_perdas,
      COALESCE(SUM(c.unidades_boas), 0)::NUMERIC AS unidades_boas,
      COALESCE(SUM(c.tempo_operacional_liquido), 0)::NUMERIC AS tempo_operacional_liquido,
      COALESCE(SUM(c.tempo_valioso), 0)::NUMERIC AS tempo_valioso,
      COALESCE(SUM(c.tempo_disponivel_horas), 0)::NUMERIC AS tempo_disponivel_horas,
      COALESCE(SUM(c.tempo_estrategico_horas), 0)::NUMERIC AS tempo_estrategico_horas,
      COALESCE(SUM(c.tempo_paradas_grandes_horas), 0)::NUMERIC AS tempo_paradas_grandes_horas,
      COALESCE(SUM(c.tempo_operacao_horas), 0)::NUMERIC AS tempo_operacao_horas
    FROM componentes c
  ),

  resumo_agregado AS (
    SELECT
      COUNT(DISTINCT rf.oeeturno_id)::INTEGER AS turnos_apontados,
      COUNT(DISTINCT rf.linhaproducao_id)::INTEGER AS linhas_com_apontamento,
      COUNT(
        DISTINCT CASE
          WHEN COALESCE(rf.qtd_envase, 0) > 0 OR COALESCE(rf.embalado, 0) > 0 THEN rf.produto_id
          ELSE NULL
        END
      )::BIGINT AS sku_produzidos,
      COALESCE(SUM(rf.qtd_envase), 0)::NUMERIC AS qtd_envase,
      COALESCE(SUM(rf.envasado), 0)::NUMERIC AS envasado,
      COALESCE(SUM(rf.qtd_embalagem), 0)::NUMERIC AS qtd_embalagem,
      COALESCE(SUM(rf.embalado), 0)::NUMERIC AS embalado,
      COALESCE(SUM(rf.perdas_envase), 0)::NUMERIC AS perdas_envase,
      COALESCE(SUM(rf.perdas_embalagem), 0)::NUMERIC AS perdas_embalagem,
      (
        COALESCE(SUM(rf.perdas_envase), 0)
        + COALESCE(SUM(rf.perdas_embalagem), 0)
      )::NUMERIC AS perdas_total,
      (COALESCE(SUM(rf.paradas_pequenas_minutos), 0)::NUMERIC / 60.0) AS paradas_pequenas_horas,
      (COALESCE(SUM(rf.paradas_totais_minutos), 0)::NUMERIC / 60.0) AS paradas_totais_horas
    FROM resumo_filtrado rf
  ),

  base AS (
    SELECT
      p_data_inicio AS data_inicio,
      p_data_fim AS data_fim,
      COALESCE(ra.turnos_apontados, 0) AS turnos_apontados,
      COALESCE(ra.linhas_com_apontamento, 0) AS linhas_com_apontamento,
      COALESCE(ra.sku_produzidos, 0) AS sku_produzidos,
      COALESCE(ra.qtd_envase, 0)::NUMERIC AS qtd_envase,
      COALESCE(ra.envasado, 0)::NUMERIC AS envasado,
      COALESCE(ra.qtd_embalagem, 0)::NUMERIC AS qtd_embalagem,
      COALESCE(ra.embalado, 0)::NUMERIC AS embalado,
      COALESCE(ra.perdas_envase, 0)::NUMERIC AS perdas_envase,
      COALESCE(ra.perdas_embalagem, 0)::NUMERIC AS perdas_embalagem,
      COALESCE(ra.perdas_total, 0)::NUMERIC AS perdas_total,
      COALESCE(ca.unidades_produzidas, 0)::NUMERIC AS unidades_produzidas,
      COALESCE(ca.unidades_perdas, 0)::NUMERIC AS unidades_perdas,
      COALESCE(ca.unidades_boas, 0)::NUMERIC AS unidades_boas,
      COALESCE(ca.tempo_operacional_liquido, 0)::NUMERIC AS tempo_operacional_liquido,
      COALESCE(ca.tempo_valioso, 0)::NUMERIC AS tempo_valioso,
      COALESCE(ca.tempo_disponivel_horas, 0)::NUMERIC AS tempo_disponivel_horas,
      COALESCE(ca.tempo_estrategico_horas, 0)::NUMERIC AS tempo_estrategico_horas,
      COALESCE(ca.tempo_paradas_grandes_horas, 0)::NUMERIC AS tempo_paradas_grandes_horas,
      COALESCE(ca.tempo_operacao_horas, 0)::NUMERIC AS tempo_operacao_horas,
      COALESCE(ra.paradas_pequenas_horas, 0)::NUMERIC AS paradas_pequenas_horas,
      COALESCE(ra.paradas_totais_horas, 0)::NUMERIC AS paradas_totais_horas
    FROM componentes_agregados ca
    CROSS JOIN resumo_agregado ra
  ),

  calculado AS (
    SELECT
      b.data_inicio,
      b.data_fim,
      b.turnos_apontados,
      b.linhas_com_apontamento,
      b.sku_produzidos,
      b.qtd_envase,
      b.envasado,
      b.qtd_embalagem,
      b.embalado,
      b.perdas_envase,
      b.perdas_embalagem,
      b.perdas_total,
      b.unidades_produzidas,
      b.unidades_perdas,
      b.unidades_boas,
      b.tempo_operacional_liquido,
      b.tempo_valioso,
      b.tempo_disponivel_horas,
      b.tempo_estrategico_horas,
      b.tempo_paradas_grandes_horas,
      GREATEST(
        (b.tempo_disponivel_horas - b.tempo_estrategico_horas) - b.tempo_paradas_grandes_horas,
        0
      )::NUMERIC AS tempo_operacao_horas,
      b.paradas_pequenas_horas,
      b.paradas_totais_horas
    FROM base b
  )

  SELECT
    c.data_inicio,
    c.data_fim,
    c.turnos_apontados,
    c.linhas_com_apontamento,
    c.sku_produzidos,
    c.qtd_envase,
    c.envasado,
    c.qtd_embalagem,
    c.embalado,
    c.perdas_envase,
    c.perdas_embalagem,
    c.perdas_total,
    c.unidades_produzidas,
    c.unidades_perdas,
    c.unidades_boas,
    ROUND(c.tempo_operacional_liquido, 4) AS tempo_operacional_liquido,
    ROUND(c.tempo_valioso, 4) AS tempo_valioso,
    ROUND(c.tempo_disponivel_horas, 4) AS tempo_disponivel_horas,
    ROUND(c.tempo_estrategico_horas, 4) AS tempo_estrategico_horas,
    ROUND(c.tempo_paradas_grandes_horas, 4) AS tempo_paradas_grandes_horas,
    ROUND(c.tempo_operacao_horas, 4) AS tempo_operacao_horas,
    ROUND(c.paradas_pequenas_horas, 4) AS paradas_pequenas_horas,
    ROUND(c.paradas_totais_horas, 4) AS paradas_totais_horas,
    ROUND(
      CASE
        WHEN (c.tempo_disponivel_horas - c.tempo_estrategico_horas) > 0
          THEN (
            c.tempo_operacao_horas / (c.tempo_disponivel_horas - c.tempo_estrategico_horas)
          ) * 100
        ELSE 0
      END,
      2
    ) AS disponibilidade,
    ROUND(
      CASE
        WHEN c.tempo_operacao_horas > 0
          THEN LEAST((c.tempo_operacional_liquido / c.tempo_operacao_horas) * 100, 100)
        ELSE 0
      END,
      2
    ) AS performance,
    ROUND(
      CASE
        WHEN c.unidades_produzidas > 0
          THEN (c.unidades_boas / c.unidades_produzidas) * 100
        ELSE 100
      END,
      2
    ) AS qualidade,
    ROUND(
      (
        (CASE
          WHEN (c.tempo_disponivel_horas - c.tempo_estrategico_horas) > 0
            THEN c.tempo_operacao_horas / (c.tempo_disponivel_horas - c.tempo_estrategico_horas)
          ELSE 0
        END)
        *
        (CASE
          WHEN c.tempo_operacao_horas > 0
            THEN LEAST((c.tempo_operacional_liquido / c.tempo_operacao_horas), 1)
          ELSE 0
        END)
        *
        (CASE
          WHEN c.unidades_produzidas > 0
            THEN (c.unidades_boas / c.unidades_produzidas)
          ELSE 1
        END)
      ) * 100,
      2
    ) AS oee
  FROM calculado c;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION fn_calcular_oee_empresa(DATE, DATE, INTEGER, INTEGER, INTEGER, NUMERIC, BIGINT)
IS 'Consolida o OEE por empresa considerando somente linhas/turnos com apontamento no período.';

-- ============================================================================
-- TESTE DA FUNÇÃO
-- ============================================================================
-- SELECT *
-- FROM fn_calcular_oee_empresa(
--   p_data_inicio := '2026-02-01'::date,
--   p_data_fim := '2026-02-29'::date,
--   p_turno_id := NULL,
--   p_produto_id := NULL,
--   p_linhaproducao_id := NULL,
--   p_tempo_disponivel_padrao := 12,
--   p_oeeturno_id := NULL
-- );
