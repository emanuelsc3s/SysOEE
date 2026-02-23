-- ============================================================================
-- FUNCAO: fn_calcular_oee_diario
-- Calcula OEE diario por linha de producao, com filtros alinhados ao
-- fn_resumo_oee_turno e limitador de ultimos dias.
--
-- Alinhamentos principais:
-- - Filtros de periodo, turno, produto, linha e oeeturno_id
-- - Filtro de produto por COALESCE(det.produto_id, turno.produto_id)
-- - Classificacao de parada estrategica por tboee_parada.classe
-- - Parada grande: duracao > 10 minutos
--
-- Data: 2026-02-23
-- ============================================================================

DROP FUNCTION IF EXISTS fn_calcular_oee_diario(DATE, DATE, INTEGER, INTEGER, INTEGER, BIGINT, NUMERIC, INTEGER);

CREATE OR REPLACE FUNCTION fn_calcular_oee_diario(
  p_data_inicio DATE,
  p_data_fim DATE,
  p_turno_id INTEGER DEFAULT NULL,
  p_produto_id INTEGER DEFAULT NULL,
  p_linhaproducao_id INTEGER DEFAULT NULL,
  p_oeeturno_id BIGINT DEFAULT NULL,
  p_tempo_disponivel_padrao NUMERIC DEFAULT 12,
  p_limite_dias INTEGER DEFAULT 30
)
RETURNS TABLE (
  data DATE,
  linhaproducao_id INTEGER,
  linhaproducao TEXT,
  qtde_turnos INTEGER,
  unidades_produzidas NUMERIC,
  unidades_perdas NUMERIC,
  unidades_boas NUMERIC,
  tempo_operacional_liquido NUMERIC,
  tempo_valioso NUMERIC,
  tempo_disponivel_horas NUMERIC,
  tempo_estrategico_horas NUMERIC,
  tempo_paradas_grandes_horas NUMERIC,
  tempo_operacao_horas NUMERIC,
  disponibilidade NUMERIC,
  performance NUMERIC,
  qualidade NUMERIC,
  oee NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH params AS (
    SELECT
      p_data_inicio AS data_inicio,
      p_data_fim AS data_fim,
      p_turno_id AS turno_id,
      p_produto_id AS produto_id,
      p_linhaproducao_id AS linhaproducao_id,
      p_oeeturno_id AS oeeturno_id,
      p_tempo_disponivel_padrao AS tempo_disponivel_padrao,
      p_limite_dias AS limite_dias
  ),

  turnos_filtrados AS (
    SELECT
      t.oeeturno_id,
      t.data,
      t.turno_id,
      t.linhaproducao_id,
      t.produto_id
    FROM tboee_turno t
    CROSS JOIN params p
    WHERE t.deletado = 'N'
      AND (
        (p.oeeturno_id IS NULL AND t.data BETWEEN p.data_inicio AND p.data_fim)
        OR (p.oeeturno_id IS NOT NULL AND t.oeeturno_id = p.oeeturno_id)
      )
      AND (p.turno_id IS NULL OR t.turno_id = p.turno_id)
      AND (p.linhaproducao_id IS NULL OR t.linhaproducao_id = p.linhaproducao_id)
  ),

  datas_referencia AS (
    -- Mantem dias sem apontamento quando a consulta e por periodo.
    SELECT gs::date AS data
    FROM params p
    CROSS JOIN LATERAL generate_series(
      p.data_inicio::timestamp,
      p.data_fim::timestamp,
      interval '1 day'
    ) gs
    WHERE p.oeeturno_id IS NULL

    UNION

    SELECT DISTINCT tf.data
    FROM turnos_filtrados tf
    CROSS JOIN params p
    WHERE p.oeeturno_id IS NOT NULL
  ),

  linhas_ativas AS (
    SELECT
      lp.linhaproducao_id,
      lp.linhaproducao
    FROM tblinhaproducao lp
    CROSS JOIN params p
    WHERE lp.deleted_at IS NULL
      AND COALESCE(lp.bloqueado, 'Nao') IN ('Nao', 'NÃO', 'NAO', 'Não')
      AND (p.linhaproducao_id IS NULL OR lp.linhaproducao_id = p.linhaproducao_id)
  ),

  agenda_base AS (
    SELECT
      d.data,
      l.linhaproducao_id,
      l.linhaproducao
    FROM datas_referencia d
    CROSS JOIN linhas_ativas l
  ),

  turnos_produto_match AS (
    -- Quando nao ha filtro de produto, todos os turnos filtrados entram.
    SELECT DISTINCT
      tf.oeeturno_id,
      tf.data,
      tf.turno_id,
      tf.linhaproducao_id,
      tf.produto_id
    FROM turnos_filtrados tf
    CROSS JOIN params p
    WHERE p.produto_id IS NULL

    UNION

    -- Fallback por produto do cabecalho do turno.
    SELECT DISTINCT
      tf.oeeturno_id,
      tf.data,
      tf.turno_id,
      tf.linhaproducao_id,
      tf.produto_id
    FROM turnos_filtrados tf
    CROSS JOIN params p
    WHERE p.produto_id IS NOT NULL
      AND tf.produto_id = p.produto_id

    UNION

    -- Produto vindo de apontamentos de producao.
    SELECT DISTINCT
      tf.oeeturno_id,
      tf.data,
      tf.turno_id,
      tf.linhaproducao_id,
      tf.produto_id
    FROM tboee_turno_producao prd
    JOIN turnos_filtrados tf ON tf.oeeturno_id = prd.oeeturno_id
    CROSS JOIN params p
    WHERE p.produto_id IS NOT NULL
      AND (prd.deletado IS NULL OR prd.deletado = 'N')
      AND COALESCE(prd.produto_id, tf.produto_id) = p.produto_id

    UNION

    -- Produto vindo de apontamentos de perda.
    SELECT DISTINCT
      tf.oeeturno_id,
      tf.data,
      tf.turno_id,
      tf.linhaproducao_id,
      tf.produto_id
    FROM tboee_turno_perda per
    JOIN turnos_filtrados tf ON tf.oeeturno_id = per.oeeturno_id
    CROSS JOIN params p
    WHERE p.produto_id IS NOT NULL
      AND per.deletado = 'N'
      AND COALESCE(per.produto_id, tf.produto_id) = p.produto_id

    UNION

    -- Produto vindo de apontamentos de parada.
    SELECT DISTINCT
      tf.oeeturno_id,
      tf.data,
      tf.turno_id,
      tf.linhaproducao_id,
      tf.produto_id
    FROM tboee_turno_parada par
    JOIN turnos_filtrados tf ON tf.oeeturno_id = par.oeeturno_id
    CROSS JOIN params p
    WHERE p.produto_id IS NOT NULL
      AND par.deletado = 'N'
      AND COALESCE(par.produto_id, tf.produto_id) = p.produto_id
  ),

  turnos_eligiveis AS (
    SELECT DISTINCT
      tpm.oeeturno_id,
      tpm.data,
      tpm.turno_id,
      tpm.linhaproducao_id,
      tpm.produto_id
    FROM turnos_produto_match tpm
  ),

  turnos_por_dia AS (
    SELECT
      te.data,
      te.linhaproducao_id,
      COUNT(DISTINCT te.oeeturno_id)::INTEGER AS qtde_turnos
    FROM turnos_eligiveis te
    GROUP BY te.data, te.linhaproducao_id
  ),

  tempo_disponivel_dia AS (
    SELECT
      tpd.data,
      tpd.linhaproducao_id,
      (tpd.qtde_turnos * p_tempo_disponivel_padrao)::NUMERIC AS tempo_disponivel_horas
    FROM turnos_por_dia tpd
  ),

  producao_turno AS (
    SELECT
      te.data,
      te.linhaproducao_id,
      te.oeeturno_id,
      SUM(COALESCE(prd.quantidade, 0))::NUMERIC AS unidades_produzidas,
      (
        SELECT prd2.velocidade::NUMERIC
        FROM tboee_turno_producao prd2
        CROSS JOIN params p
        WHERE prd2.oeeturno_id = te.oeeturno_id
          AND (prd2.deletado IS NULL OR prd2.deletado = 'N')
          AND prd2.velocidade IS NOT NULL
          AND prd2.velocidade > 0
          AND (p.produto_id IS NULL OR COALESCE(prd2.produto_id, te.produto_id) = p.produto_id)
        ORDER BY prd2.hora_inicio ASC NULLS LAST, prd2.oeeturnoproducao_id ASC
        LIMIT 1
      )::NUMERIC AS velocidade_nominal
    FROM tboee_turno_producao prd
    JOIN turnos_eligiveis te ON te.oeeturno_id = prd.oeeturno_id
    CROSS JOIN params p
    WHERE (prd.deletado IS NULL OR prd.deletado = 'N')
      AND (p.produto_id IS NULL OR COALESCE(prd.produto_id, te.produto_id) = p.produto_id)
    GROUP BY te.data, te.linhaproducao_id, te.oeeturno_id, te.produto_id
  ),

  producao_dia AS (
    SELECT
      pt.data,
      pt.linhaproducao_id,
      SUM(pt.unidades_produzidas)::NUMERIC AS unidades_produzidas,
      SUM(
        CASE
          WHEN pt.velocidade_nominal IS NOT NULL AND pt.velocidade_nominal > 0
            THEN pt.unidades_produzidas / pt.velocidade_nominal
          ELSE 0::NUMERIC
        END
      )::NUMERIC AS tempo_operacional_liquido
    FROM producao_turno pt
    GROUP BY pt.data, pt.linhaproducao_id
  ),

  perdas_dia AS (
    SELECT
      te.data,
      te.linhaproducao_id,
      SUM(COALESCE(per.perda, 0))::NUMERIC AS unidades_perdas
    FROM tboee_turno_perda per
    JOIN turnos_eligiveis te ON te.oeeturno_id = per.oeeturno_id
    CROSS JOIN params p
    WHERE per.deletado = 'N'
      AND (p.produto_id IS NULL OR COALESCE(per.produto_id, te.produto_id) = p.produto_id)
    GROUP BY te.data, te.linhaproducao_id
  ),

  paradas_raw AS (
    SELECT
      te.data,
      te.linhaproducao_id,
      CASE
        WHEN par.hora_inicio IS NULL OR par.hora_fim IS NULL THEN 0::NUMERIC
        WHEN EXTRACT(EPOCH FROM par.hora_fim::time) > EXTRACT(EPOCH FROM par.hora_inicio::time)
          THEN ((EXTRACT(EPOCH FROM par.hora_fim::time) - EXTRACT(EPOCH FROM par.hora_inicio::time)) / 60.0)::NUMERIC
        WHEN EXTRACT(EPOCH FROM par.hora_fim::time) = EXTRACT(EPOCH FROM par.hora_inicio::time)
          THEN 0::NUMERIC
        ELSE
          (((86400 - EXTRACT(EPOCH FROM par.hora_inicio::time)) + EXTRACT(EPOCH FROM par.hora_fim::time)) / 60.0)::NUMERIC
      END AS duracao_minutos,
      (TRIM(COALESCE(tp.classe, '')) = 'Parada Estratégica') AS estrategica
    FROM tboee_turno_parada par
    JOIN turnos_eligiveis te ON te.oeeturno_id = par.oeeturno_id
    LEFT JOIN tboee_parada tp ON tp.oeeparada_id = par.oeeparada_id
    CROSS JOIN params p
    WHERE par.deletado = 'N'
      AND (p.produto_id IS NULL OR COALESCE(par.produto_id, te.produto_id) = p.produto_id)
  ),

  paradas_dia AS (
    SELECT
      pr.data,
      pr.linhaproducao_id,
      SUM(CASE WHEN pr.estrategica THEN pr.duracao_minutos ELSE 0 END) / 60.0 AS tempo_estrategico_horas,
      SUM(CASE WHEN NOT pr.estrategica AND pr.duracao_minutos > 10 THEN pr.duracao_minutos ELSE 0 END) / 60.0 AS tempo_paradas_grandes_horas
    FROM paradas_raw pr
    GROUP BY pr.data, pr.linhaproducao_id
  ),

  base AS (
    SELECT
      ab.data,
      ab.linhaproducao_id,
      ab.linhaproducao,
      COALESCE(tpd.qtde_turnos, 0)::INTEGER AS qtde_turnos,
      COALESCE(pd.unidades_produzidas, 0)::NUMERIC AS unidades_produzidas,
      COALESCE(pe.unidades_perdas, 0)::NUMERIC AS unidades_perdas,
      GREATEST(COALESCE(pd.unidades_produzidas, 0) - COALESCE(pe.unidades_perdas, 0), 0)::NUMERIC AS unidades_boas,
      COALESCE(pd.tempo_operacional_liquido, 0)::NUMERIC AS tempo_operacional_liquido,
      COALESCE(td.tempo_disponivel_horas, 0)::NUMERIC AS tempo_disponivel_horas,
      COALESCE(pa.tempo_estrategico_horas, 0)::NUMERIC AS tempo_estrategico_horas,
      COALESCE(pa.tempo_paradas_grandes_horas, 0)::NUMERIC AS tempo_paradas_grandes_horas
    FROM agenda_base ab
    LEFT JOIN turnos_por_dia tpd
      ON tpd.data = ab.data
     AND tpd.linhaproducao_id = ab.linhaproducao_id
    LEFT JOIN tempo_disponivel_dia td
      ON td.data = ab.data
     AND td.linhaproducao_id = ab.linhaproducao_id
    LEFT JOIN producao_dia pd
      ON pd.data = ab.data
     AND pd.linhaproducao_id = ab.linhaproducao_id
    LEFT JOIN perdas_dia pe
      ON pe.data = ab.data
     AND pe.linhaproducao_id = ab.linhaproducao_id
    LEFT JOIN paradas_dia pa
      ON pa.data = ab.data
     AND pa.linhaproducao_id = ab.linhaproducao_id
  ),

  calculado AS (
    SELECT
      b.data,
      b.linhaproducao_id::INTEGER AS linhaproducao_id,
      b.linhaproducao::TEXT AS linhaproducao,
      b.qtde_turnos,
      b.unidades_produzidas,
      b.unidades_perdas,
      b.unidades_boas,
      ROUND(b.tempo_operacional_liquido, 2) AS tempo_operacional_liquido,
      ROUND(
        (CASE
          WHEN b.unidades_produzidas > 0 THEN (b.unidades_boas / b.unidades_produzidas)
          ELSE 1
        END) * b.tempo_operacional_liquido,
        2
      ) AS tempo_valioso,
      ROUND(b.tempo_disponivel_horas, 2) AS tempo_disponivel_horas,
      ROUND(b.tempo_estrategico_horas, 2) AS tempo_estrategico_horas,
      ROUND(b.tempo_paradas_grandes_horas, 2) AS tempo_paradas_grandes_horas,
      ROUND(
        GREATEST(
          GREATEST(b.tempo_disponivel_horas - b.tempo_estrategico_horas, 0) - b.tempo_paradas_grandes_horas,
          0
        ),
        2
      ) AS tempo_operacao_horas,
      ROUND(
        CASE
          WHEN (b.tempo_disponivel_horas - b.tempo_estrategico_horas) > 0
            THEN GREATEST(
              (b.tempo_disponivel_horas - b.tempo_estrategico_horas) - b.tempo_paradas_grandes_horas,
              0
            ) / (b.tempo_disponivel_horas - b.tempo_estrategico_horas) * 100
          ELSE 0
        END,
        2
      ) AS disponibilidade,
      ROUND(
        CASE
          WHEN GREATEST(
            (b.tempo_disponivel_horas - b.tempo_estrategico_horas) - b.tempo_paradas_grandes_horas,
            0
          ) > 0
            THEN LEAST(
              (
                b.tempo_operacional_liquido
                / GREATEST(
                    (b.tempo_disponivel_horas - b.tempo_estrategico_horas) - b.tempo_paradas_grandes_horas,
                    0
                  )
              ) * 100,
              100
            )
          ELSE 0
        END,
        2
      ) AS performance,
      ROUND(
        CASE
          WHEN b.unidades_produzidas > 0 THEN (b.unidades_boas / b.unidades_produzidas) * 100
          ELSE 100
        END,
        2
      ) AS qualidade,
      ROUND(
        (
          (CASE
            WHEN (b.tempo_disponivel_horas - b.tempo_estrategico_horas) > 0
              THEN GREATEST(
                (b.tempo_disponivel_horas - b.tempo_estrategico_horas) - b.tempo_paradas_grandes_horas,
                0
              ) / (b.tempo_disponivel_horas - b.tempo_estrategico_horas)
            ELSE 0
          END)
          *
          (CASE
            WHEN GREATEST(
              (b.tempo_disponivel_horas - b.tempo_estrategico_horas) - b.tempo_paradas_grandes_horas,
              0
            ) > 0
              THEN LEAST(
                (
                  b.tempo_operacional_liquido
                  / GREATEST(
                      (b.tempo_disponivel_horas - b.tempo_estrategico_horas) - b.tempo_paradas_grandes_horas,
                      0
                    )
                ),
                1
              )
            ELSE 0
          END)
          *
          (CASE
            WHEN b.unidades_produzidas > 0 THEN (b.unidades_boas / b.unidades_produzidas)
            ELSE 1
          END)
        ) * 100,
        2
      ) AS oee
    FROM base b
  ),

  limitado AS (
    SELECT
      c.*,
      ROW_NUMBER() OVER (
        PARTITION BY c.linhaproducao_id
        ORDER BY c.data DESC
      ) AS ordem_dia_desc
    FROM calculado c
  )

  SELECT
    l.data,
    l.linhaproducao_id,
    l.linhaproducao,
    l.qtde_turnos,
    l.unidades_produzidas,
    l.unidades_perdas,
    l.unidades_boas,
    l.tempo_operacional_liquido,
    l.tempo_valioso,
    l.tempo_disponivel_horas,
    l.tempo_estrategico_horas,
    l.tempo_paradas_grandes_horas,
    l.tempo_operacao_horas,
    l.disponibilidade,
    l.performance,
    l.qualidade,
    l.oee
  FROM limitado l
  WHERE p_limite_dias IS NULL OR p_limite_dias <= 0 OR l.ordem_dia_desc <= p_limite_dias
  ORDER BY l.linhaproducao, l.data;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION fn_calcular_oee_diario(DATE, DATE, INTEGER, INTEGER, INTEGER, BIGINT, NUMERIC, INTEGER)
IS 'Calcula OEE diario por linha, alinhado aos filtros do fn_resumo_oee_turno, com p_limite_dias.';

-- ============================================================================
-- TESTE DA FUNCAO
-- ============================================================================
-- SELECT *
-- FROM fn_calcular_oee_diario(
--   p_data_inicio := '2026-02-01'::date,
--   p_data_fim := '2026-02-23'::date,
--   p_turno_id := NULL,
--   p_produto_id := NULL,
--   p_linhaproducao_id := 23,
--   p_oeeturno_id := NULL,
--   p_tempo_disponivel_padrao := 12,
--   p_limite_dias := 30
-- );
