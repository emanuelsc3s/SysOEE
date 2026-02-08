-- ============================================================================
-- FUNÇÃO: fn_resumo_oee_turno
-- Gera resumo consolidado de produção, perdas e paradas por data/linha/produto
-- para uso no modal de resumo do OEE Turno.
--
-- ALTERAÇÕES RESUMIDAS (2026-02-08):
-- - Coluna de saída `quantidade_produzida` substituída por `qtd_envase`.
-- - Nova coluna de saída `qtd_embalagem`.
-- - `qtd_envase` soma produção apenas para linhas com tipo = 'Envase'.
-- - `qtd_embalagem` soma produção para tipos 'Embalagem' e 'Envase+Embalagem'.
-- - `unidades_boas` passou a usar (qtd_envase + qtd_embalagem) - perdas.
-- - Nova coluna de saída `paradas_pequenas_minutos` (paradas <= 10 min).
--
-- Baseado nos filtros:
-- - período (data início/fim)
-- - turno
-- - produto
-- - linha de produção
-- - oeeturno_id (opcional)
--
-- Data: 2026-02-06
-- ============================================================================

DROP FUNCTION IF EXISTS fn_resumo_oee_turno(DATE, DATE, INTEGER, INTEGER, INTEGER, BIGINT);

CREATE OR REPLACE FUNCTION fn_resumo_oee_turno(
  p_data_inicio DATE,
  p_data_fim DATE,
  p_turno_id INTEGER DEFAULT NULL,
  p_produto_id INTEGER DEFAULT NULL,
  p_linhaproducao_id INTEGER DEFAULT NULL,
  p_oeeturno_id BIGINT DEFAULT NULL
)
RETURNS TABLE (
  data DATE,
  linhaproducao_id INTEGER,
  linhaproducao TEXT,
  oeeturno_id BIGINT,
  qtde_turnos INTEGER,
  status_linha TEXT,
  status_turno_registrado TEXT,
  produto_id INTEGER,
  produto TEXT,
  qtd_envase NUMERIC,
  qtd_embalagem NUMERIC,
  perdas NUMERIC,
  unidades_boas NUMERIC,
  paradas_minutos BIGINT,
  paradas_grandes_minutos BIGINT,
  paradas_pequenas_minutos BIGINT,
  paradas_totais_minutos BIGINT,
  paradas_estrategicas_minutos BIGINT,
  paradas_hh_mm TEXT,
  paradas_totais_hh_mm TEXT,
  paradas_estrategicas_hh_mm TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH params AS (
    -- Ajuste dos filtros a partir dos parâmetros da função
    SELECT
      p_data_inicio AS p_data_inicio,
      p_data_fim AS p_data_fim,
      p_turno_id AS p_turno_id,
      p_produto_id AS p_produto_id,
      p_linhaproducao_id AS p_linhaproducao_id,
      p_oeeturno_id AS p_oeeturno_id
  ),

  turnos_filtrados AS (
    SELECT
      t.oeeturno_id,
      t.data,
      t.turno_id,
      t.linhaproducao_id,
      t.produto_id,
      t.produto,
      t.status
    FROM tboee_turno t
    CROSS JOIN params p
    WHERE t.deletado = 'N'
      AND (
        (p.p_oeeturno_id IS NULL AND t.data BETWEEN p.p_data_inicio AND p.p_data_fim)
        OR (p.p_oeeturno_id IS NOT NULL AND t.oeeturno_id = p.p_oeeturno_id)
      )
      AND (p.p_turno_id IS NULL OR t.turno_id = p.p_turno_id)
      AND (p.p_linhaproducao_id IS NULL OR t.linhaproducao_id = p.p_linhaproducao_id)
  ),

  datas_referencia AS (
    -- Período completo quando não filtra por oeeturno_id
    SELECT gs::date AS data
    FROM params p
    CROSS JOIN LATERAL generate_series(
      p.p_data_inicio::timestamp,
      p.p_data_fim::timestamp,
      interval '1 day'
    ) gs
    WHERE p.p_oeeturno_id IS NULL

    UNION

    -- Data(s) real(is) do turno quando filtra por oeeturno_id
    SELECT DISTINCT tf.data
    FROM turnos_filtrados tf
    CROSS JOIN params p
    WHERE p.p_oeeturno_id IS NOT NULL
  ),

  linhas_ativas AS (
    SELECT
      lp.linhaproducao_id,
      lp.linhaproducao,
      COALESCE(lp.tipo::text, '') AS tipo_linha
    FROM tblinhaproducao lp
    CROSS JOIN params p
    WHERE lp.deleted_at IS NULL
      AND COALESCE(lp.bloqueado, 'Não') IN ('Não', 'Nao', 'NÃO', 'NAO')
      AND (p.p_linhaproducao_id IS NULL OR lp.linhaproducao_id = p.p_linhaproducao_id)
  ),

  agenda_base AS (
    -- Gera todas as combinações data x linha ativa
    SELECT
      d.data,
      l.linhaproducao_id,
      l.linhaproducao,
      l.tipo_linha
    FROM datas_referencia d
    CROSS JOIN linhas_ativas l
  ),

  produto_filtro AS (
    -- Usado para preencher produto quando não há apontamento, mas p_produto_id foi informado
    SELECT
      p.produto_id,
      p.descricao AS produto
    FROM params prm
    JOIN tbproduto p ON p.produto_id = prm.p_produto_id
  ),

  produtos_detail_raw AS (
    SELECT
      p.oeeturno_id,
      COALESCE(p.produto_id, tf.produto_id) AS produto_id,
      COALESCE(NULLIF(TRIM(p.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado') AS produto,
      CASE
        WHEN COALESCE(p.produto_id, tf.produto_id) IS NOT NULL
          THEN 'id:' || COALESCE(p.produto_id, tf.produto_id)::text
        ELSE
          'txt:' || COALESCE(NULLIF(TRIM(p.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado')
      END AS produto_key
    FROM tboee_turno_producao p
    JOIN turnos_filtrados tf ON tf.oeeturno_id = p.oeeturno_id
    WHERE p.deletado IS NULL OR p.deletado = 'N'

    UNION ALL

    SELECT
      q.oeeturno_id,
      COALESCE(q.produto_id, tf.produto_id) AS produto_id,
      COALESCE(NULLIF(TRIM(q.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado') AS produto,
      CASE
        WHEN COALESCE(q.produto_id, tf.produto_id) IS NOT NULL
          THEN 'id:' || COALESCE(q.produto_id, tf.produto_id)::text
        ELSE
          'txt:' || COALESCE(NULLIF(TRIM(q.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado')
      END AS produto_key
    FROM tboee_turno_perda q
    JOIN turnos_filtrados tf ON tf.oeeturno_id = q.oeeturno_id
    WHERE q.deletado = 'N'

    UNION ALL

    SELECT
      pr.oeeturno_id,
      COALESCE(pr.produto_id, tf.produto_id) AS produto_id,
      COALESCE(NULLIF(TRIM(pr.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado') AS produto,
      CASE
        WHEN COALESCE(pr.produto_id, tf.produto_id) IS NOT NULL
          THEN 'id:' || COALESCE(pr.produto_id, tf.produto_id)::text
        ELSE
          'txt:' || COALESCE(NULLIF(TRIM(pr.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado')
      END AS produto_key
    FROM tboee_turno_parada pr
    JOIN turnos_filtrados tf ON tf.oeeturno_id = pr.oeeturno_id
    WHERE pr.deletado = 'N'
  ),

  produtos_detail AS (
    SELECT
      pdr.oeeturno_id,
      MAX(pdr.produto_id) AS produto_id,
      COALESCE(
        MAX(pdr.produto) FILTER (WHERE pdr.produto <> 'Produto não informado'),
        MAX(pdr.produto)
      ) AS produto,
      pdr.produto_key
    FROM produtos_detail_raw pdr
    GROUP BY pdr.oeeturno_id, pdr.produto_key
  ),

  produtos_turno AS (
    SELECT DISTINCT
      tf.data,
      tf.linhaproducao_id,
      tf.oeeturno_id,
      pd.produto_id,
      pd.produto,
      pd.produto_key
    FROM turnos_filtrados tf
    JOIN produtos_detail pd ON pd.oeeturno_id = tf.oeeturno_id
    CROSS JOIN params p
    WHERE p.p_produto_id IS NULL OR pd.produto_id = p.p_produto_id
  ),

  produtos_turno_fallback AS (
    SELECT
      tf.data,
      tf.linhaproducao_id,
      tf.oeeturno_id,
      tf.produto_id,
      COALESCE(NULLIF(TRIM(tf.produto), ''), 'Produto não informado') AS produto,
      CASE
        WHEN tf.produto_id IS NOT NULL THEN 'id:' || tf.produto_id::text
        ELSE 'txt:' || COALESCE(NULLIF(TRIM(tf.produto), ''), 'Produto não informado')
      END AS produto_key
    FROM turnos_filtrados tf
    CROSS JOIN params p
    WHERE NOT EXISTS (
      SELECT 1
      FROM produtos_detail pd
      WHERE pd.oeeturno_id = tf.oeeturno_id
    )
      AND (p.p_produto_id IS NULL OR tf.produto_id = p.p_produto_id)
  ),

  produtos_turno_base AS (
    SELECT * FROM produtos_turno
    UNION ALL
    SELECT * FROM produtos_turno_fallback
  ),

  agenda_produto AS (
    -- Mantém todas as linhas/datas; quando não houve turno, cria 1 linha com produto nulo
    SELECT
      ab.data,
      ab.linhaproducao_id,
      ab.linhaproducao,
      ab.tipo_linha,
      pt.oeeturno_id AS oeeturno_id,
      CASE WHEN pt.oeeturno_id IS NULL THEN 0 ELSE 1 END AS qtde_turnos,
      COALESCE(pt.produto_id, pf.produto_id) AS produto_id,
      COALESCE(pt.produto, pf.produto, 'Produto não informado') AS produto,
      COALESCE(
        pt.produto_key,
        CASE
          WHEN pf.produto_id IS NOT NULL THEN 'id:' || pf.produto_id::text
          ELSE 'txt:' || COALESCE(pf.produto, 'Produto não informado')
        END
      ) AS produto_key
    FROM agenda_base ab
    LEFT JOIN produtos_turno_base pt
      ON pt.data = ab.data
     AND pt.linhaproducao_id = ab.linhaproducao_id
    LEFT JOIN produto_filtro pf
      ON pt.oeeturno_id IS NULL
  ),

  status_turno AS (
    SELECT
      tf.oeeturno_id,
      tf.data,
      tf.linhaproducao_id,
      CASE
        WHEN BOOL_OR(LOWER(COALESCE(tf.status::text, '')) = 'aberto') THEN 'EM_PRODUCAO'
        WHEN BOOL_OR(LOWER(COALESCE(tf.status::text, '')) = 'fechado') THEN 'FECHADA'
        WHEN BOOL_OR(LOWER(COALESCE(tf.status::text, '')) = 'cancelado') THEN 'CANCELADA'
        ELSE 'SEM_STATUS'
      END::text AS status_linha,
      STRING_AGG(
        DISTINCT COALESCE(NULLIF(tf.status::text, ''), 'SEM_STATUS'),
        ', '
      ) AS status_turnos
    FROM turnos_filtrados tf
    GROUP BY tf.oeeturno_id, tf.data, tf.linhaproducao_id
  ),

  producao AS (
    SELECT
      tf.data,
      tf.linhaproducao_id,
      p.oeeturno_id,
      COALESCE(p.produto_id, tf.produto_id) AS produto_id,
      COALESCE(NULLIF(TRIM(p.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado') AS produto,
      CASE
        WHEN COALESCE(p.produto_id, tf.produto_id) IS NOT NULL
          THEN 'id:' || COALESCE(p.produto_id, tf.produto_id)::text
        ELSE
          'txt:' || COALESCE(NULLIF(TRIM(p.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado')
      END AS produto_key,
      SUM(COALESCE(p.quantidade, 0))::numeric AS unidades_produzidas
    FROM tboee_turno_producao p
    JOIN turnos_filtrados tf ON tf.oeeturno_id = p.oeeturno_id
    WHERE p.deletado IS NULL OR p.deletado = 'N'
    GROUP BY
      tf.data,
      tf.linhaproducao_id,
      p.oeeturno_id,
      COALESCE(p.produto_id, tf.produto_id),
      COALESCE(NULLIF(TRIM(p.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado'),
      CASE
        WHEN COALESCE(p.produto_id, tf.produto_id) IS NOT NULL
          THEN 'id:' || COALESCE(p.produto_id, tf.produto_id)::text
        ELSE
          'txt:' || COALESCE(NULLIF(TRIM(p.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado')
      END
  ),

  perdas AS (
    SELECT
      tf.data,
      tf.linhaproducao_id,
      q.oeeturno_id,
      COALESCE(q.produto_id, tf.produto_id) AS produto_id,
      COALESCE(NULLIF(TRIM(q.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado') AS produto,
      CASE
        WHEN COALESCE(q.produto_id, tf.produto_id) IS NOT NULL
          THEN 'id:' || COALESCE(q.produto_id, tf.produto_id)::text
        ELSE
          'txt:' || COALESCE(NULLIF(TRIM(q.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado')
      END AS produto_key,
      SUM(COALESCE(q.perda, 0))::numeric AS unidades_perdas
    FROM tboee_turno_perda q
    JOIN turnos_filtrados tf ON tf.oeeturno_id = q.oeeturno_id
    WHERE q.deletado = 'N'
    GROUP BY
      tf.data,
      tf.linhaproducao_id,
      q.oeeturno_id,
      COALESCE(q.produto_id, tf.produto_id),
      COALESCE(NULLIF(TRIM(q.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado'),
      CASE
        WHEN COALESCE(q.produto_id, tf.produto_id) IS NOT NULL
          THEN 'id:' || COALESCE(q.produto_id, tf.produto_id)::text
        ELSE
          'txt:' || COALESCE(NULLIF(TRIM(q.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado')
      END
  ),

  paradas_raw AS (
    SELECT
      tf.data,
      tf.linhaproducao_id,
      pr.oeeturno_id,
      pr.oeeparada_id,
      COALESCE(pr.produto_id, tf.produto_id) AS produto_id,
      COALESCE(NULLIF(TRIM(pr.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado') AS produto,
      CASE
        WHEN COALESCE(pr.produto_id, tf.produto_id) IS NOT NULL
          THEN 'id:' || COALESCE(pr.produto_id, tf.produto_id)::text
        ELSE
          'txt:' || COALESCE(NULLIF(TRIM(pr.produto), ''), NULLIF(TRIM(tf.produto), ''), 'Produto não informado')
      END AS produto_key,
      CASE
        WHEN pr.hora_inicio IS NULL OR pr.hora_fim IS NULL THEN 0
        WHEN EXTRACT(EPOCH FROM pr.hora_fim::time) > EXTRACT(EPOCH FROM pr.hora_inicio::time)
          THEN (EXTRACT(EPOCH FROM pr.hora_fim::time) - EXTRACT(EPOCH FROM pr.hora_inicio::time)) / 60.0
        ELSE
          ((86400 - EXTRACT(EPOCH FROM pr.hora_inicio::time)) + EXTRACT(EPOCH FROM pr.hora_fim::time)) / 60.0
      END AS duracao_minutos,
      LOWER(
        COALESCE(pr.oeeparada_id::text, '') || ' ' ||
        COALESCE(pr.parada, '') || ' ' ||
        COALESCE(pr.natureza, '') || ' - ' ||
        COALESCE(pr.classe, '') || ' ' ||
        COALESCE(pr.observacao, '')
      ) AS texto
    FROM tboee_turno_parada pr
    JOIN turnos_filtrados tf ON tf.oeeturno_id = pr.oeeturno_id
    WHERE pr.deletado = 'N'
  ),

  paradas_classificadas AS (
    SELECT
      pr.data,
      pr.linhaproducao_id,
      pr.oeeturno_id,
      pr.oeeparada_id,
      pr.produto_id,
      pr.produto,
      pr.produto_key,
      pr.duracao_minutos,
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

  paradas_gerais AS (
    SELECT
      pc.data,
      pc.linhaproducao_id,
      pc.oeeturno_id,
      pc.produto_id,
      pc.produto,
      pc.produto_key,
      SUM(pc.duracao_minutos)::numeric AS paradas_totais_minutos,
      SUM(CASE WHEN pc.estrategica THEN pc.duracao_minutos ELSE 0 END)::numeric AS paradas_estrategicas_minutos,
      SUM(CASE WHEN NOT pc.estrategica AND pc.duracao_minutos > 10 THEN pc.duracao_minutos ELSE 0 END)::numeric AS paradas_grandes_minutos
    FROM paradas_classificadas pc
    GROUP BY
      pc.data,
      pc.linhaproducao_id,
      pc.oeeturno_id,
      pc.produto_id,
      pc.produto,
      pc.produto_key
  ),

  paradas_pequenas_por_codigo AS (
    SELECT
      pc.data,
      pc.linhaproducao_id,
      pc.oeeturno_id,
      pc.produto_id,
      pc.produto,
      pc.produto_key,
      pc.oeeparada_id,
      SUM(pc.duracao_minutos)::numeric AS paradas_pequenas_minutos_codigo
    FROM paradas_classificadas pc
    WHERE NOT pc.estrategica
      AND pc.duracao_minutos <= 10
    GROUP BY
      pc.data,
      pc.linhaproducao_id,
      pc.oeeturno_id,
      pc.produto_id,
      pc.produto,
      pc.produto_key,
      pc.oeeparada_id
  ),

  paradas_pequenas_totais AS (
    SELECT
      ppc.data,
      ppc.linhaproducao_id,
      ppc.oeeturno_id,
      ppc.produto_id,
      ppc.produto,
      ppc.produto_key,
      SUM(ppc.paradas_pequenas_minutos_codigo)::numeric AS paradas_pequenas_minutos
    FROM paradas_pequenas_por_codigo ppc
    GROUP BY
      ppc.data,
      ppc.linhaproducao_id,
      ppc.oeeturno_id,
      ppc.produto_id,
      ppc.produto,
      ppc.produto_key
  ),

  paradas AS (
    SELECT
      pg.data,
      pg.linhaproducao_id,
      pg.oeeturno_id,
      pg.produto_id,
      pg.produto,
      pg.produto_key,
      pg.paradas_totais_minutos,
      pg.paradas_estrategicas_minutos,
      pg.paradas_grandes_minutos,
      COALESCE(pt.paradas_pequenas_minutos, 0)::numeric AS paradas_pequenas_minutos
    FROM paradas_gerais pg
    LEFT JOIN paradas_pequenas_totais pt
      ON pt.data = pg.data
     AND pt.linhaproducao_id = pg.linhaproducao_id
     AND pt.oeeturno_id = pg.oeeturno_id
     AND pt.produto_key = pg.produto_key
  ),

  base AS (
    SELECT
      ap.data,
      ap.linhaproducao_id,
      ap.linhaproducao,
      ap.oeeturno_id,
      ap.qtde_turnos,
      COALESCE(sl.status_linha, 'Turno Não Iniciado') AS status_linha,
      COALESCE(sl.status_turnos, 'Turno Não Iniciado') AS status_turnos,
      ap.produto_id,
      ap.produto,
      CASE
        WHEN ap.tipo_linha = 'Envase' THEN COALESCE(pr.unidades_produzidas, 0)::numeric
        ELSE 0::numeric
      END AS qtd_envase,
      CASE
        WHEN ap.tipo_linha IN ('Embalagem', 'Envase+Embalagem') THEN COALESCE(pr.unidades_produzidas, 0)::numeric
        ELSE 0::numeric
      END AS qtd_embalagem,
      COALESCE(pe.unidades_perdas, 0)::numeric AS perdas,
      ROUND(COALESCE(pa.paradas_totais_minutos, 0))::bigint AS paradas_totais_minutos,
      ROUND(COALESCE(pa.paradas_estrategicas_minutos, 0))::bigint AS paradas_estrategicas_minutos,
      ROUND(COALESCE(pa.paradas_grandes_minutos, 0))::bigint AS paradas_grandes_minutos,
      ROUND(COALESCE(pa.paradas_pequenas_minutos, 0))::bigint AS paradas_pequenas_minutos
    FROM agenda_produto ap
    LEFT JOIN status_turno sl
      ON sl.oeeturno_id = ap.oeeturno_id
     AND sl.linhaproducao_id = ap.linhaproducao_id
    LEFT JOIN producao pr
      ON pr.oeeturno_id = ap.oeeturno_id
     AND pr.linhaproducao_id = ap.linhaproducao_id
     AND pr.produto_key = ap.produto_key
    LEFT JOIN perdas pe
      ON pe.oeeturno_id = ap.oeeturno_id
     AND pe.linhaproducao_id = ap.linhaproducao_id
     AND pe.produto_key = ap.produto_key
    LEFT JOIN paradas pa
      ON pa.oeeturno_id = ap.oeeturno_id
     AND pa.linhaproducao_id = ap.linhaproducao_id
     AND pa.produto_key = ap.produto_key
  )

  SELECT
    b.data,
    b.linhaproducao_id,
    b.linhaproducao,
    b.oeeturno_id,
    b.qtde_turnos,
    b.status_linha,
    b.status_turnos AS status_turno_registrado,
    b.produto_id,
    b.produto,
    b.qtd_envase,
    b.qtd_embalagem,
    b.perdas,
    GREATEST((b.qtd_envase + b.qtd_embalagem) - b.perdas, 0) AS unidades_boas,
    b.paradas_grandes_minutos AS paradas_minutos,
    b.paradas_grandes_minutos,
    b.paradas_pequenas_minutos,
    b.paradas_totais_minutos,
    b.paradas_estrategicas_minutos,
    LPAD((b.paradas_grandes_minutos / 60)::text, 2, '0') || ':' || LPAD((b.paradas_grandes_minutos % 60)::text, 2, '0') AS paradas_hh_mm,
    LPAD((b.paradas_totais_minutos / 60)::text, 2, '0') || ':' || LPAD((b.paradas_totais_minutos % 60)::text, 2, '0') AS paradas_totais_hh_mm,
    LPAD((b.paradas_estrategicas_minutos / 60)::text, 2, '0') || ':' || LPAD((b.paradas_estrategicas_minutos % 60)::text, 2, '0') AS paradas_estrategicas_hh_mm
  FROM base b
  ORDER BY b.data, b.linhaproducao, b.produto;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION fn_resumo_oee_turno(DATE, DATE, INTEGER, INTEGER, INTEGER, BIGINT)
IS 'Resumo consolidado de produção, perdas e paradas por data/linha/produto, com filtros opcionais.';

-- ============================================================================
-- TESTE DA FUNÇÃO
-- ============================================================================
-- SELECT *
-- FROM fn_resumo_oee_turno(
--   p_data_inicio := '2026-02-03'::date,
--   p_data_fim := '2026-02-03'::date,
--   p_turno_id := NULL,
--   p_produto_id := NULL,
--   p_linhaproducao_id := NULL,
--   p_oeeturno_id := NULL
-- );
