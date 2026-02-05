-- ============================================================================
-- FUNÇÃO: fn_calcular_pareto_paradas
-- Calcula o Pareto de paradas grandes para o Dashboard
--
-- Baseada nos filtros da fn_calcular_oee_dashboard:
-- - período (data início/fim)
-- - turno
-- - produto
-- - linha de produção
-- - oeeturno_id (opcional)
--
-- Data: 2026-02-05
-- ============================================================================

DROP FUNCTION IF EXISTS fn_calcular_pareto_paradas(DATE, DATE, INTEGER, INTEGER, INTEGER, NUMERIC, BIGINT);

CREATE OR REPLACE FUNCTION fn_calcular_pareto_paradas(
  p_data_inicio DATE,
  p_data_fim DATE,
  p_turno_id INTEGER DEFAULT NULL,
  p_produto_id INTEGER DEFAULT NULL,
  p_linhaproducao_id INTEGER DEFAULT NULL,
  p_tempo_disponivel_padrao NUMERIC DEFAULT 12,
  p_oeeturno_id BIGINT DEFAULT NULL
)
RETURNS TABLE (
  parada TEXT,
  quantidade INTEGER,
  tempo_parada_horas NUMERIC,
  percentual NUMERIC,
  percentual_acumulado NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH turnos_filtrados AS (
    -- Busca turnos filtrados por data, turno, produto e linha
    SELECT
      t.oeeturno_id,
      t.produto_id,
      t.turno_id,
      t.linhaproducao_id,
      t.data
    FROM tboee_turno t
    WHERE t.deletado = 'N'
      AND (
        (p_oeeturno_id IS NULL AND t.data BETWEEN p_data_inicio AND p_data_fim)
        OR (p_oeeturno_id IS NOT NULL AND t.oeeturno_id = p_oeeturno_id)
      )
      AND (p_turno_id IS NULL OR t.turno_id = p_turno_id)
      AND (p_produto_id IS NULL OR t.produto_id = p_produto_id)
      AND (p_linhaproducao_id IS NULL OR t.linhaproducao_id = p_linhaproducao_id)
  ),

  paradas_raw AS (
    -- Extrai paradas com duração e texto para classificação
    SELECT
      tf.linhaproducao_id,
      CASE
        WHEN p.hora_inicio IS NULL OR p.hora_fim IS NULL THEN 0
        -- Parada diurna
        WHEN EXTRACT(EPOCH FROM p.hora_fim::time) > EXTRACT(EPOCH FROM p.hora_inicio::time)
          THEN (EXTRACT(EPOCH FROM p.hora_fim::time) - EXTRACT(EPOCH FROM p.hora_inicio::time)) / 60.0
        -- Parada noturna (cruza meia-noite)
        ELSE
          ((86400 - EXTRACT(EPOCH FROM p.hora_inicio::time)) + EXTRACT(EPOCH FROM p.hora_fim::time)) / 60.0
      END AS duracao_minutos,
      LOWER(
        COALESCE(p.oeeparada_id::text, '') || ' ' ||
        COALESCE(p.parada, '') || ' ' ||
        COALESCE(p.natureza, '') || ' - ' ||
        COALESCE(p.classe, '') || ' ' ||
        COALESCE(p.observacao, '')
      ) AS texto,
      NULLIF(TRIM(p.parada), '') AS parada
    FROM tboee_turno_parada p
    JOIN turnos_filtrados tf ON tf.oeeturno_id = p.oeeturno_id
    WHERE p.deletado = 'N'
  ),

  paradas_classificadas AS (
    -- Classifica paradas como estratégicas ou não
    SELECT
      pr.linhaproducao_id,
      pr.duracao_minutos,
      pr.parada,
      (
        pr.texto LIKE '%feriado%' OR
        pr.texto LIKE '%inventário%' OR
        pr.texto LIKE '%inventario%' OR
        pr.texto LIKE '%atividade programada%' OR
        pr.texto LIKE '%parada estratégica%' OR
        pr.texto LIKE '%parada estrategica%' OR
        pr.texto LIKE '%sem programação%' OR
        pr.texto LIKE '%sem programacao%' OR
        pr.texto LIKE '%sem demanda%' OR
        pr.texto LIKE '%ociosidade planejada%'
      ) AS estrategica
    FROM paradas_raw pr
  ),

  paradas_grandes AS (
    -- Mantém somente paradas grandes (>= 10 min) e não estratégicas
    SELECT
      COALESCE(pc.parada, 'Parada não informada') AS parada,
      COUNT(*)::INTEGER AS quantidade,
      SUM(pc.duracao_minutos)::NUMERIC / 60.0 AS tempo_parada_horas
    FROM paradas_classificadas pc
    WHERE NOT pc.estrategica
      AND pc.duracao_minutos >= 10
    GROUP BY COALESCE(pc.parada, 'Parada não informada')
  ),

  totais AS (
    SELECT
      SUM(pg.tempo_parada_horas)::NUMERIC AS total_horas
    FROM paradas_grandes pg
  ),

  ordenadas AS (
    SELECT
      pg.parada,
      pg.quantidade,
      pg.tempo_parada_horas,
      CASE
        WHEN t.total_horas > 0 THEN (pg.tempo_parada_horas / t.total_horas) * 100
        ELSE 0
      END AS percentual
    FROM paradas_grandes pg
    CROSS JOIN totais t
  ),

  acumulado AS (
    SELECT
      o.parada,
      o.quantidade,
      o.tempo_parada_horas,
      o.percentual,
      SUM(o.percentual) OVER (ORDER BY o.tempo_parada_horas DESC, o.quantidade DESC, o.parada) AS percentual_acumulado
    FROM ordenadas o
  )

  SELECT
    a.parada,
    a.quantidade,
    ROUND(a.tempo_parada_horas, 2) AS tempo_parada_horas,
    ROUND(a.percentual, 2) AS percentual,
    ROUND(a.percentual_acumulado, 2) AS percentual_acumulado
  FROM acumulado a
  ORDER BY a.tempo_parada_horas DESC, a.quantidade DESC, a.parada;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION fn_calcular_pareto_paradas(DATE, DATE, INTEGER, INTEGER, INTEGER, NUMERIC, BIGINT)
IS 'Calcula o Pareto de paradas grandes para o Dashboard, respeitando filtros de período/turno/produto/linha e oeeturno_id.';

-- ============================================================================
-- TESTE DA FUNÇÃO
-- ============================================================================
-- SELECT *
-- FROM fn_calcular_pareto_paradas(
--   p_data_inicio := '2026-02-03'::date,
--   p_data_fim := '2026-02-03'::date,
--   p_turno_id := NULL,
--   p_produto_id := NULL,
--   p_linhaproducao_id := 23,
--   p_tempo_disponivel_padrao := 12,
--   p_oeeturno_id := NULL
-- );
