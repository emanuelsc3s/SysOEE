-- ============================================================================
-- FUNCAO: fn_calcular_pareto_paradas_linha
-- Calcula o Pareto de paradas grandes para o Dashboard de Linha
--
-- Alinhamentos com fn_resumo_oee_turno:
-- - Classificacao estrategica por tboee_parada.classe
-- - Parada grande: duracao > 10 minutos
-- - Filtro de produto por COALESCE(parada.produto_id, turno.produto_id)
-- - Filtros de periodo/turno/linha/produto/oeeturno_id
--
-- Data: 2026-02-22
-- ============================================================================

DROP FUNCTION IF EXISTS fn_calcular_pareto_paradas_linha(DATE, DATE, INTEGER, INTEGER, INTEGER, NUMERIC, BIGINT, INTEGER);

CREATE OR REPLACE FUNCTION fn_calcular_pareto_paradas_linha(
  p_data_inicio DATE,
  p_data_fim DATE,
  p_turno_id INTEGER DEFAULT NULL,
  p_produto_id INTEGER DEFAULT NULL,
  p_linhaproducao_id INTEGER DEFAULT NULL,
  p_tempo_disponivel_padrao NUMERIC DEFAULT 12,
  p_oeeturno_id BIGINT DEFAULT NULL,
  p_limite INTEGER DEFAULT NULL
)
RETURNS TABLE (
  parada TEXT,
  quantidade INTEGER,
  tempo_parada_horas TEXT,
  percentual NUMERIC,
  percentual_acumulado NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH turnos_filtrados AS (
    SELECT
      t.oeeturno_id,
      t.turno_id,
      t.linhaproducao_id,
      t.produto_id,
      t.data
    FROM tboee_turno t
    WHERE t.deletado = 'N'
      AND (
        (p_oeeturno_id IS NULL AND t.data BETWEEN p_data_inicio AND p_data_fim)
        OR (p_oeeturno_id IS NOT NULL AND t.oeeturno_id = p_oeeturno_id)
      )
      AND (p_turno_id IS NULL OR t.turno_id = p_turno_id)
      AND (p_linhaproducao_id IS NULL OR t.linhaproducao_id = p_linhaproducao_id)
  ),

  paradas_raw AS (
    SELECT
      COALESCE(NULLIF(TRIM(pr.parada), ''), 'Parada nao informada') AS parada,
      CASE
        WHEN pr.hora_inicio IS NULL OR pr.hora_fim IS NULL THEN 0::NUMERIC
        WHEN EXTRACT(EPOCH FROM pr.hora_fim::time) > EXTRACT(EPOCH FROM pr.hora_inicio::time)
          THEN ((EXTRACT(EPOCH FROM pr.hora_fim::time) - EXTRACT(EPOCH FROM pr.hora_inicio::time)) / 60.0)::NUMERIC
        WHEN EXTRACT(EPOCH FROM pr.hora_fim::time) = EXTRACT(EPOCH FROM pr.hora_inicio::time)
          THEN 0::NUMERIC
        ELSE
          (((86400 - EXTRACT(EPOCH FROM pr.hora_inicio::time)) + EXTRACT(EPOCH FROM pr.hora_fim::time)) / 60.0)::NUMERIC
      END AS duracao_minutos,
      (TRIM(COALESCE(tp.classe, '')) = 'Parada Estratégica') AS estrategica
    FROM tboee_turno_parada pr
    JOIN turnos_filtrados tf ON tf.oeeturno_id = pr.oeeturno_id
    LEFT JOIN tboee_parada tp ON tp.oeeparada_id = pr.oeeparada_id
    WHERE pr.deletado = 'N'
      AND (p_produto_id IS NULL OR COALESCE(pr.produto_id, tf.produto_id) = p_produto_id)
  ),

  paradas_grandes AS (
    SELECT
      pr.parada,
      COUNT(*)::INTEGER AS quantidade,
      SUM(pr.duracao_minutos)::NUMERIC AS tempo_parada_minutos
    FROM paradas_raw pr
    WHERE NOT pr.estrategica
      AND pr.duracao_minutos > 10
    GROUP BY pr.parada
  ),

  totais AS (
    SELECT
      COALESCE(SUM(pg.tempo_parada_minutos), 0)::NUMERIC AS total_minutos
    FROM paradas_grandes pg
  ),

  ordenadas AS (
    SELECT
      pg.parada,
      pg.quantidade,
      pg.tempo_parada_minutos,
      CASE
        WHEN t.total_minutos > 0 THEN (pg.tempo_parada_minutos / t.total_minutos) * 100
        ELSE 0::NUMERIC
      END AS percentual
    FROM paradas_grandes pg
    CROSS JOIN totais t
  ),

  classificadas AS (
    SELECT
      o.parada,
      o.quantidade,
      o.tempo_parada_minutos,
      o.percentual,
      SUM(o.percentual) OVER (
        ORDER BY o.tempo_parada_minutos DESC, o.quantidade DESC, o.parada
      ) AS percentual_acumulado,
      ROW_NUMBER() OVER (
        ORDER BY o.tempo_parada_minutos DESC, o.quantidade DESC, o.parada
      ) AS ordem
    FROM ordenadas o
  )

  SELECT
    c.parada,
    c.quantidade,
    (
      REGEXP_REPLACE(
        TO_CHAR(
          ((GREATEST(ROUND(c.tempo_parada_minutos)::BIGINT, 0) / 60)::NUMERIC),
          'FM999G999G999G999G999'
        ),
        '[^0-9]',
        '.',
        'g'
      )
      || ':'
      || LPAD((GREATEST(ROUND(c.tempo_parada_minutos)::BIGINT, 0) % 60)::TEXT, 2, '0')
    ) AS tempo_parada_horas,
    ROUND(c.percentual, 2) AS percentual,
    ROUND(c.percentual_acumulado, 2) AS percentual_acumulado
  FROM classificadas c
  WHERE p_limite IS NULL OR p_limite <= 0 OR c.ordem <= p_limite
  ORDER BY c.tempo_parada_minutos DESC, c.quantidade DESC, c.parada;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION fn_calcular_pareto_paradas_linha(DATE, DATE, INTEGER, INTEGER, INTEGER, NUMERIC, BIGINT, INTEGER)
IS 'Calcula o Pareto de paradas grandes para Dashboard de Linha, alinhado ao fn_resumo_oee_turno.';

-- ============================================================================
-- TESTE DA FUNCAO
-- ============================================================================
-- SELECT *
-- FROM fn_calcular_pareto_paradas_linha(
--   p_data_inicio := '2026-02-03'::date,
--   p_data_fim := '2026-02-03'::date,
--   p_turno_id := NULL,
--   p_produto_id := NULL,
--   p_linhaproducao_id := 23,
--   p_tempo_disponivel_padrao := 12,
--   p_oeeturno_id := NULL,
--   p_limite := 7
-- );
