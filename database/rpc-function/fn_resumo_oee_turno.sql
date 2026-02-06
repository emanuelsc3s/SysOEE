-- ============================================================================
-- FUNÇÃO: fn_resumo_oee_turno
-- Gera resumo consolidado de produção, perdas e paradas por data/linha/produto
-- para uso no modal de resumo do OEE Turno.
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
  quantidade_produzida NUMERIC,
  perdas NUMERIC,
  unidades_boas NUMERIC,
  paradas_minutos BIGINT,
  paradas_grandes_minutos BIGINT,
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
      AND (p.p_produto_id IS NULL OR t.produto_id = p.p_produto_id)
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
      lp.linhaproducao
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
      l.linhaproducao
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

  produtos_linha_data AS (
    -- Produtos que realmente tiveram turno na data/linha
    SELECT
      tf.data,
      tf.linhaproducao_id,
      tf.produto_id,
      CASE
        WHEN COUNT(DISTINCT tf.oeeturno_id) = 1 THEN MIN(tf.oeeturno_id)
        ELSE NULL
      END AS oeeturno_id,
      COUNT(DISTINCT tf.oeeturno_id)::integer AS qtde_turnos,
      COALESCE(NULLIF(TRIM(tf.produto), ''), 'Produto não informado') AS produto
    FROM turnos_filtrados tf
    GROUP BY
      tf.data,
      tf.linhaproducao_id,
      tf.produto_id,
      COALESCE(NULLIF(TRIM(tf.produto), ''), 'Produto não informado')
  ),

  agenda_produto AS (
    -- Mantém todas as linhas/datas; quando não houve turno, cria 1 linha com produto nulo
    SELECT
      ab.data,
      ab.linhaproducao_id,
      ab.linhaproducao,
      pld.oeeturno_id AS oeeturno_id,
      COALESCE(pld.qtde_turnos, 0) AS qtde_turnos,
      COALESCE(pld.produto_id, pf.produto_id) AS produto_id,
      COALESCE(pld.produto, pf.produto, 'Produto não informado') AS produto
    FROM agenda_base ab
    LEFT JOIN produtos_linha_data pld
      ON pld.data = ab.data
     AND pld.linhaproducao_id = ab.linhaproducao_id
    LEFT JOIN produto_filtro pf
      ON pld.produto_id IS NULL
  ),

  status_linha AS (
    SELECT
      tf.data,
      tf.linhaproducao_id,
      tf.produto_id,
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
    GROUP BY tf.data, tf.linhaproducao_id, tf.produto_id
  ),

  producao AS (
    SELECT
      tf.data,
      tf.linhaproducao_id,
      tf.produto_id,
      SUM(COALESCE(p.quantidade, 0))::numeric AS unidades_produzidas
    FROM turnos_filtrados tf
    LEFT JOIN tboee_turno_producao p
      ON p.oeeturno_id = tf.oeeturno_id
     AND (p.deletado IS NULL OR p.deletado = 'N')
    GROUP BY tf.data, tf.linhaproducao_id, tf.produto_id
  ),

  perdas AS (
    SELECT
      tf.data,
      tf.linhaproducao_id,
      tf.produto_id,
      SUM(COALESCE(q.perda, 0))::numeric AS unidades_perdas
    FROM turnos_filtrados tf
    LEFT JOIN tboee_turno_perda q
      ON q.oeeturno_id = tf.oeeturno_id
     AND q.deletado = 'N'
    GROUP BY tf.data, tf.linhaproducao_id, tf.produto_id
  ),

  paradas_raw AS (
    SELECT
      tf.data,
      tf.linhaproducao_id,
      tf.produto_id,
      CASE
        WHEN p.hora_inicio IS NULL OR p.hora_fim IS NULL THEN 0
        WHEN EXTRACT(EPOCH FROM p.hora_fim::time) > EXTRACT(EPOCH FROM p.hora_inicio::time)
          THEN (EXTRACT(EPOCH FROM p.hora_fim::time) - EXTRACT(EPOCH FROM p.hora_inicio::time)) / 60.0
        ELSE
          ((86400 - EXTRACT(EPOCH FROM p.hora_inicio::time)) + EXTRACT(EPOCH FROM p.hora_fim::time)) / 60.0
      END AS duracao_minutos,
      LOWER(
        COALESCE(p.oeeparada_id::text, '') || ' ' ||
        COALESCE(p.parada, '') || ' ' ||
        COALESCE(p.natureza, '') || ' - ' ||
        COALESCE(p.classe, '') || ' ' ||
        COALESCE(p.observacao, '')
      ) AS texto
    FROM tboee_turno_parada p
    JOIN turnos_filtrados tf ON tf.oeeturno_id = p.oeeturno_id
    WHERE p.deletado = 'N'
  ),

  paradas_classificadas AS (
    SELECT
      pr.data,
      pr.linhaproducao_id,
      pr.produto_id,
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

  paradas AS (
    SELECT
      pc.data,
      pc.linhaproducao_id,
      pc.produto_id,
      SUM(pc.duracao_minutos)::numeric AS paradas_totais_minutos,
      SUM(CASE WHEN pc.estrategica THEN pc.duracao_minutos ELSE 0 END)::numeric AS paradas_estrategicas_minutos,
      SUM(CASE WHEN NOT pc.estrategica AND pc.duracao_minutos >= 10 THEN pc.duracao_minutos ELSE 0 END)::numeric AS paradas_grandes_minutos
    FROM paradas_classificadas pc
    GROUP BY pc.data, pc.linhaproducao_id, pc.produto_id
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
      COALESCE(pr.unidades_produzidas, 0)::numeric AS quantidade_produzida,
      COALESCE(pe.unidades_perdas, 0)::numeric AS perdas,
      ROUND(COALESCE(pa.paradas_totais_minutos, 0))::bigint AS paradas_totais_minutos,
      ROUND(COALESCE(pa.paradas_estrategicas_minutos, 0))::bigint AS paradas_estrategicas_minutos,
      ROUND(COALESCE(pa.paradas_grandes_minutos, 0))::bigint AS paradas_grandes_minutos
    FROM agenda_produto ap
    LEFT JOIN status_linha sl
      ON sl.data = ap.data
     AND sl.linhaproducao_id = ap.linhaproducao_id
     AND sl.produto_id IS NOT DISTINCT FROM ap.produto_id
    LEFT JOIN producao pr
      ON pr.data = ap.data
     AND pr.linhaproducao_id = ap.linhaproducao_id
     AND pr.produto_id IS NOT DISTINCT FROM ap.produto_id
    LEFT JOIN perdas pe
      ON pe.data = ap.data
     AND pe.linhaproducao_id = ap.linhaproducao_id
     AND pe.produto_id IS NOT DISTINCT FROM ap.produto_id
    LEFT JOIN paradas pa
      ON pa.data = ap.data
     AND pa.linhaproducao_id = ap.linhaproducao_id
     AND pa.produto_id IS NOT DISTINCT FROM ap.produto_id
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
    b.quantidade_produzida,
    b.perdas,
    GREATEST(b.quantidade_produzida - b.perdas, 0) AS unidades_boas,
    b.paradas_grandes_minutos AS paradas_minutos,
    b.paradas_grandes_minutos,
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
