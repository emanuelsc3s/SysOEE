-- ============================================================================
-- FUNCAO: fn_calcular_oee_timeline
-- Retorna payload pronto para alimentar a timeline do Dashboard de Linha
-- em uma janela movel (padrao: ultimas 24 horas), respeitando os filtros.
--
-- Saida:
-- - janela_inicio / janela_fim
-- - timeline_times (marcas de horario)
-- - segmentos (barra da timeline com cor e largura)
-- - lotes (blocos superiores com lote/produto/produzido)
--
-- Data: 2026-02-22
-- ============================================================================

DROP FUNCTION IF EXISTS fn_calcular_oee_timeline(
  DATE,
  DATE,
  INTEGER,
  INTEGER,
  INTEGER,
  BIGINT,
  TEXT[],
  INTEGER,
  TIMESTAMP WITHOUT TIME ZONE
);

CREATE OR REPLACE FUNCTION fn_calcular_oee_timeline(
  p_data_inicio DATE,
  p_data_fim DATE,
  p_turno_id INTEGER DEFAULT NULL,
  p_produto_id INTEGER DEFAULT NULL,
  p_linhaproducao_id INTEGER DEFAULT NULL,
  p_oeeturno_id BIGINT DEFAULT NULL,
  p_statuses TEXT[] DEFAULT NULL,
  p_janela_horas INTEGER DEFAULT 24,
  p_referencia_fim TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  janela_inicio TIMESTAMP WITHOUT TIME ZONE,
  janela_fim TIMESTAMP WITHOUT TIME ZONE,
  timeline_times JSONB,
  segmentos JSONB,
  lotes JSONB
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
      GREATEST(COALESCE(p_janela_horas, 24), 1)::INTEGER AS janela_horas,
      p_referencia_fim AS referencia_fim,
      COALESCE(
        (
          SELECT ARRAY_AGG(LOWER(TRIM(s)))
          FROM UNNEST(p_statuses) s
          WHERE TRIM(COALESCE(s, '')) <> ''
        ),
        ARRAY[]::TEXT[]
      ) AS statuses_normalizados,
      (NOW() AT TIME ZONE 'America/Recife')::TIMESTAMP WITHOUT TIME ZONE AS agora_local
  ),

  janela_base AS (
    SELECT
      p.*,
      COALESCE(
        p.referencia_fim,
        CASE
          WHEN p.data_fim IS NULL THEN p.agora_local
          WHEN p.data_fim >= p.agora_local::DATE THEN p.agora_local
          ELSE (p.data_fim::TIMESTAMP + INTERVAL '1 day')
        END
      ) AS janela_fim_bruta
    FROM params p
  ),

  janela_ajustada AS (
    SELECT
      jb.data_inicio,
      jb.data_fim,
      jb.turno_id,
      jb.produto_id,
      jb.linhaproducao_id,
      jb.oeeturno_id,
      jb.statuses_normalizados,
      LEAST(
        jb.janela_fim_bruta,
        COALESCE(jb.data_fim::TIMESTAMP + INTERVAL '1 day', jb.janela_fim_bruta)
      ) AS janela_fim_limite_data,
      GREATEST(
        jb.janela_fim_bruta - make_interval(hours => jb.janela_horas),
        COALESCE(
          jb.data_inicio::TIMESTAMP,
          jb.janela_fim_bruta - make_interval(hours => jb.janela_horas)
        )
      ) AS janela_inicio_limite_data
    FROM janela_base jb
  ),

  janela_final AS (
    SELECT
      CASE
        WHEN ja.janela_inicio_limite_data < ja.janela_fim_limite_data
          THEN ja.janela_inicio_limite_data
        ELSE ja.janela_fim_limite_data - INTERVAL '1 minute'
      END AS janela_inicio,
      ja.janela_fim_limite_data AS janela_fim,
      ja.data_inicio,
      ja.data_fim,
      ja.turno_id,
      ja.produto_id,
      ja.linhaproducao_id,
      ja.oeeturno_id,
      ja.statuses_normalizados
    FROM janela_ajustada ja
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
    CROSS JOIN janela_final j
    WHERE t.deletado = 'N'
      AND (
        (j.oeeturno_id IS NOT NULL AND t.oeeturno_id = j.oeeturno_id)
        OR (
          j.oeeturno_id IS NULL
          AND (j.data_inicio IS NULL OR t.data >= j.data_inicio)
          AND (j.data_fim IS NULL OR t.data <= j.data_fim)
        )
      )
      AND (j.turno_id IS NULL OR t.turno_id = j.turno_id)
      AND (j.linhaproducao_id IS NULL OR t.linhaproducao_id = j.linhaproducao_id)
      AND (
        cardinality(j.statuses_normalizados) = 0
        OR LOWER(COALESCE(t.status::TEXT, '')) = ANY (j.statuses_normalizados)
      )
  ),

  turnos_produto_match AS (
    SELECT DISTINCT
      tf.oeeturno_id,
      tf.data,
      tf.turno_id,
      tf.linhaproducao_id,
      tf.produto_id,
      tf.produto,
      tf.status
    FROM turnos_filtrados tf
    CROSS JOIN janela_final j
    WHERE j.produto_id IS NULL

    UNION

    SELECT DISTINCT
      tf.oeeturno_id,
      tf.data,
      tf.turno_id,
      tf.linhaproducao_id,
      tf.produto_id,
      tf.produto,
      tf.status
    FROM turnos_filtrados tf
    CROSS JOIN janela_final j
    WHERE j.produto_id IS NOT NULL
      AND tf.produto_id = j.produto_id

    UNION

    SELECT DISTINCT
      tf.oeeturno_id,
      tf.data,
      tf.turno_id,
      tf.linhaproducao_id,
      tf.produto_id,
      tf.produto,
      tf.status
    FROM tboee_turno_producao prd
    JOIN turnos_filtrados tf ON tf.oeeturno_id = prd.oeeturno_id
    CROSS JOIN janela_final j
    WHERE j.produto_id IS NOT NULL
      AND (prd.deletado IS NULL OR prd.deletado = 'N')
      AND COALESCE(prd.produto_id, tf.produto_id) = j.produto_id

    UNION

    SELECT DISTINCT
      tf.oeeturno_id,
      tf.data,
      tf.turno_id,
      tf.linhaproducao_id,
      tf.produto_id,
      tf.produto,
      tf.status
    FROM tboee_turno_perda per
    JOIN turnos_filtrados tf ON tf.oeeturno_id = per.oeeturno_id
    CROSS JOIN janela_final j
    WHERE j.produto_id IS NOT NULL
      AND per.deletado = 'N'
      AND COALESCE(per.produto_id, tf.produto_id) = j.produto_id

    UNION

    SELECT DISTINCT
      tf.oeeturno_id,
      tf.data,
      tf.turno_id,
      tf.linhaproducao_id,
      tf.produto_id,
      tf.produto,
      tf.status
    FROM tboee_turno_parada par
    JOIN turnos_filtrados tf ON tf.oeeturno_id = par.oeeturno_id
    CROSS JOIN janela_final j
    WHERE j.produto_id IS NOT NULL
      AND par.deletado = 'N'
      AND COALESCE(par.produto_id, tf.produto_id) = j.produto_id
  ),

  turnos_eligiveis AS (
    SELECT DISTINCT
      tpm.oeeturno_id,
      tpm.data,
      tpm.turno_id,
      tpm.linhaproducao_id,
      tpm.produto_id,
      tpm.produto,
      tpm.status
    FROM turnos_produto_match tpm
  ),

  producao_eventos_base AS (
    SELECT
      te.oeeturno_id,
      COALESCE(prd.data, te.data) AS data_base,
      prd.hora_inicio::TIME AS hora_inicio,
      prd.hora_final::TIME AS hora_fim,
      COALESCE(NULLIF(TRIM(prd.produto), ''), NULLIF(TRIM(te.produto), ''), 'Produto nao informado') AS produto,
      'PRODUZINDO'::TEXT AS status_timeline,
      'green-fill'::TEXT AS classe_css,
      2::INTEGER AS prioridade
    FROM tboee_turno_producao prd
    JOIN turnos_eligiveis te ON te.oeeturno_id = prd.oeeturno_id
    CROSS JOIN janela_final j
    WHERE (prd.deletado IS NULL OR prd.deletado = 'N')
      AND (j.produto_id IS NULL OR COALESCE(prd.produto_id, te.produto_id) = j.produto_id)
  ),

  parada_eventos_base AS (
    SELECT
      te.oeeturno_id,
      COALESCE(par.data, te.data) AS data_base,
      par.hora_inicio::TIME AS hora_inicio,
      par.hora_fim::TIME AS hora_fim,
      COALESCE(NULLIF(TRIM(par.produto), ''), NULLIF(TRIM(te.produto), ''), 'Produto nao informado') AS produto,
      CASE
        WHEN TRIM(COALESCE(cad.classe, '')) IN ('Parada Estratégica', 'Parada Estrategica', 'Estratégica', 'Estrategica')
          THEN 'PARADA_ESTRATEGICA'
        WHEN LOWER(COALESCE(cad.natureza, par.natureza, '')) LIKE '%manut%'
          OR LOWER(COALESCE(cad.parada, par.parada, '')) LIKE '%manut%'
          THEN 'MANUTENCAO'
        ELSE 'PARADA'
      END::TEXT AS status_timeline,
      CASE
        WHEN TRIM(COALESCE(cad.classe, '')) IN ('Parada Estratégica', 'Parada Estrategica', 'Estratégica', 'Estrategica')
          THEN 'gray-fill'
        WHEN LOWER(COALESCE(cad.natureza, par.natureza, '')) LIKE '%manut%'
          OR LOWER(COALESCE(cad.parada, par.parada, '')) LIKE '%manut%'
          THEN 'yellow-fill'
        ELSE 'red-fill'
      END::TEXT AS classe_css,
      CASE
        WHEN TRIM(COALESCE(cad.classe, '')) IN ('Parada Estratégica', 'Parada Estrategica', 'Estratégica', 'Estrategica')
          THEN 5
        WHEN LOWER(COALESCE(cad.natureza, par.natureza, '')) LIKE '%manut%'
          OR LOWER(COALESCE(cad.parada, par.parada, '')) LIKE '%manut%'
          THEN 4
        ELSE 3
      END::INTEGER AS prioridade
    FROM tboee_turno_parada par
    JOIN turnos_eligiveis te ON te.oeeturno_id = par.oeeturno_id
    LEFT JOIN tboee_parada cad ON cad.oeeparada_id = par.oeeparada_id
    CROSS JOIN janela_final j
    WHERE par.deletado = 'N'
      AND (j.produto_id IS NULL OR COALESCE(par.produto_id, te.produto_id) = j.produto_id)
  ),

  eventos_base AS (
    SELECT * FROM producao_eventos_base
    UNION ALL
    SELECT * FROM parada_eventos_base
  ),

  eventos_intervalo AS (
    SELECT
      eb.oeeturno_id,
      eb.produto,
      eb.status_timeline,
      eb.classe_css,
      eb.prioridade,
      GREATEST(
        (eb.data_base::TIMESTAMP + eb.hora_inicio),
        j.janela_inicio
      ) AS inicio_evento,
      LEAST(
        CASE
          WHEN eb.hora_inicio IS NULL THEN j.janela_fim
          WHEN eb.hora_fim IS NULL THEN j.janela_fim
          WHEN eb.hora_fim > eb.hora_inicio THEN (eb.data_base::TIMESTAMP + eb.hora_fim)
          WHEN eb.hora_fim = eb.hora_inicio THEN (eb.data_base::TIMESTAMP + eb.hora_fim)
          ELSE (eb.data_base::TIMESTAMP + eb.hora_fim + INTERVAL '1 day')
        END,
        j.janela_fim
      ) AS fim_evento
    FROM eventos_base eb
    CROSS JOIN janela_final j
    WHERE eb.data_base IS NOT NULL
      AND eb.hora_inicio IS NOT NULL
  ),

  eventos_clip AS (
    SELECT
      ei.oeeturno_id,
      ei.produto,
      ei.status_timeline,
      ei.classe_css,
      ei.prioridade,
      ei.inicio_evento,
      ei.fim_evento
    FROM eventos_intervalo ei
    WHERE ei.fim_evento > ei.inicio_evento
  ),

  pontos_timeline AS (
    SELECT j.janela_inicio AS ponto
    FROM janela_final j

    UNION

    SELECT j.janela_fim AS ponto
    FROM janela_final j

    UNION

    SELECT ec.inicio_evento AS ponto
    FROM eventos_clip ec

    UNION

    SELECT ec.fim_evento AS ponto
    FROM eventos_clip ec
  ),

  pontos_ordenados AS (
    SELECT DISTINCT pt.ponto
    FROM pontos_timeline pt
    WHERE pt.ponto IS NOT NULL
  ),

  intervalos_base AS (
    SELECT
      po.ponto AS inicio_evento,
      LEAD(po.ponto) OVER (ORDER BY po.ponto) AS fim_evento
    FROM pontos_ordenados po
  ),

  intervalos_validos AS (
    SELECT
      ib.inicio_evento,
      ib.fim_evento
    FROM intervalos_base ib
    WHERE ib.fim_evento IS NOT NULL
      AND ib.fim_evento > ib.inicio_evento
  ),

  intervalos_classificados AS (
    SELECT
      iv.inicio_evento,
      iv.fim_evento,
      COALESCE(
        (
          SELECT ec.status_timeline
          FROM eventos_clip ec
          WHERE ec.inicio_evento < iv.fim_evento
            AND ec.fim_evento > iv.inicio_evento
          ORDER BY ec.prioridade DESC, ec.inicio_evento ASC
          LIMIT 1
        ),
        'SEM_APONTAMENTO'
      ) AS status_timeline,
      COALESCE(
        (
          SELECT ec.classe_css
          FROM eventos_clip ec
          WHERE ec.inicio_evento < iv.fim_evento
            AND ec.fim_evento > iv.inicio_evento
          ORDER BY ec.prioridade DESC, ec.inicio_evento ASC
          LIMIT 1
        ),
        'white-fill'
      ) AS classe_css,
      (
        SELECT ec.oeeturno_id
        FROM eventos_clip ec
        WHERE ec.inicio_evento < iv.fim_evento
          AND ec.fim_evento > iv.inicio_evento
        ORDER BY ec.prioridade DESC, ec.inicio_evento ASC
        LIMIT 1
      ) AS oeeturno_id,
      (
        SELECT ec.produto
        FROM eventos_clip ec
        WHERE ec.inicio_evento < iv.fim_evento
          AND ec.fim_evento > iv.inicio_evento
        ORDER BY ec.prioridade DESC, ec.inicio_evento ASC
        LIMIT 1
      ) AS produto
    FROM intervalos_validos iv
  ),

  intervalos_marcados AS (
    SELECT
      ic.*,
      CASE
        WHEN LAG(ic.status_timeline) OVER (ORDER BY ic.inicio_evento) = ic.status_timeline
          AND LAG(ic.classe_css) OVER (ORDER BY ic.inicio_evento) = ic.classe_css
          THEN 0
        ELSE 1
      END AS novo_grupo
    FROM intervalos_classificados ic
  ),

  intervalos_agrupados AS (
    SELECT
      im.*,
      SUM(im.novo_grupo) OVER (ORDER BY im.inicio_evento) AS grupo_id
    FROM intervalos_marcados im
  ),

  segmentos_base AS (
    SELECT
      ia.grupo_id,
      MIN(ia.inicio_evento) AS inicio_evento,
      MAX(ia.fim_evento) AS fim_evento,
      MAX(ia.status_timeline) AS status_timeline,
      MAX(ia.classe_css) AS classe_css,
      MAX(ia.oeeturno_id) AS oeeturno_id,
      MAX(ia.produto) AS produto,
      EXTRACT(EPOCH FROM (MAX(ia.fim_evento) - MIN(ia.inicio_evento))) / 60.0 AS duracao_minutos
    FROM intervalos_agrupados ia
    GROUP BY ia.grupo_id
  ),

  segmentos_final AS (
    SELECT
      sb.inicio_evento,
      sb.fim_evento,
      sb.status_timeline,
      sb.classe_css,
      sb.oeeturno_id,
      sb.produto,
      sb.duracao_minutos,
      CASE
        WHEN EXTRACT(EPOCH FROM (j.janela_fim - j.janela_inicio)) > 0
          THEN (sb.duracao_minutos * 60.0 / EXTRACT(EPOCH FROM (j.janela_fim - j.janela_inicio))) * 100.0
        ELSE 0::NUMERIC
      END AS largura_pct
    FROM segmentos_base sb
    CROSS JOIN janela_final j
    ORDER BY sb.inicio_evento
  ),

  lotes_base AS (
    SELECT
      lt.oeeturno_id,
      COALESCE(lt.data, te.data) AS data_base,
      lt.hora_inicio::TIME AS hora_inicio,
      lt.hora_fim::TIME AS hora_fim,
      COALESCE(NULLIF(TRIM(lt.lote), ''), 'LOTE N/I') AS lote,
      COALESCE(NULLIF(TRIM(te.produto), ''), 'Produto nao informado') AS produto,
      COALESCE(
        lt.total_producao::NUMERIC,
        lt.qtd_produzida::NUMERIC,
        GREATEST(COALESCE(lt.qtd_final::NUMERIC, 0) - COALESCE(lt.qtd_inicial::NUMERIC, 0), 0)::NUMERIC,
        0::NUMERIC
      ) AS produzido
    FROM tboee_turno_lote lt
    JOIN turnos_eligiveis te ON te.oeeturno_id = lt.oeeturno_id
    WHERE lt.deletado IS NULL OR lt.deletado = 'N'
  ),

  lotes_intervalo AS (
    SELECT
      lb.oeeturno_id,
      lb.lote,
      lb.produto,
      lb.produzido,
      GREATEST((lb.data_base::TIMESTAMP + COALESCE(lb.hora_inicio, TIME '00:00')), j.janela_inicio) AS inicio_evento,
      LEAST(
        CASE
          WHEN lb.hora_fim IS NULL THEN j.janela_fim
          WHEN lb.hora_inicio IS NULL THEN (lb.data_base::TIMESTAMP + lb.hora_fim)
          WHEN lb.hora_fim > lb.hora_inicio THEN (lb.data_base::TIMESTAMP + lb.hora_fim)
          WHEN lb.hora_fim = lb.hora_inicio THEN (lb.data_base::TIMESTAMP + lb.hora_fim)
          ELSE (lb.data_base::TIMESTAMP + lb.hora_fim + INTERVAL '1 day')
        END,
        j.janela_fim
      ) AS fim_evento
    FROM lotes_base lb
    CROSS JOIN janela_final j
    WHERE lb.data_base IS NOT NULL
  ),

  lotes_clip AS (
    SELECT
      li.oeeturno_id,
      li.lote,
      li.produto,
      li.produzido,
      li.inicio_evento,
      li.fim_evento,
      EXTRACT(EPOCH FROM (li.fim_evento - li.inicio_evento)) / 60.0 AS duracao_minutos
    FROM lotes_intervalo li
    WHERE li.fim_evento > li.inicio_evento
  ),

  lotes_agrupados AS (
    SELECT
      lc.lote,
      lc.produto,
      MIN(lc.inicio_evento) AS inicio_evento,
      MAX(lc.fim_evento) AS fim_evento,
      SUM(lc.duracao_minutos) AS duracao_minutos,
      SUM(lc.produzido) AS produzido
    FROM lotes_clip lc
    GROUP BY lc.lote, lc.produto
  ),

  lotes_final AS (
    SELECT
      la.lote,
      la.produto,
      la.produzido,
      la.inicio_evento,
      la.fim_evento,
      la.duracao_minutos,
      CASE
        WHEN EXTRACT(EPOCH FROM (j.janela_fim - j.janela_inicio)) > 0
          THEN (la.duracao_minutos * 60.0 / EXTRACT(EPOCH FROM (j.janela_fim - j.janela_inicio))) * 100.0
        ELSE 0::NUMERIC
      END AS largura_pct
    FROM lotes_agrupados la
    CROSS JOIN janela_final j
    ORDER BY la.inicio_evento, la.lote
  ),

  lotes_fallback AS (
    SELECT
      'LOTE N/I'::TEXT AS lote,
      COALESCE(sf.produto, 'Produto nao informado') AS produto,
      0::NUMERIC AS produzido,
      sf.inicio_evento,
      sf.fim_evento,
      sf.duracao_minutos,
      sf.largura_pct
    FROM segmentos_final sf
    WHERE sf.status_timeline = 'PRODUZINDO'
  ),

  lotes_saida AS (
    SELECT
      lf.lote,
      lf.produto,
      lf.produzido,
      lf.inicio_evento,
      lf.fim_evento,
      lf.duracao_minutos,
      lf.largura_pct
    FROM lotes_final lf

    UNION ALL

    SELECT
      fb.lote,
      fb.produto,
      fb.produzido,
      fb.inicio_evento,
      fb.fim_evento,
      fb.duracao_minutos,
      fb.largura_pct
    FROM lotes_fallback fb
    WHERE NOT EXISTS (SELECT 1 FROM lotes_final)
  ),

  marcas_hora AS (
    SELECT j.janela_inicio AS ts
    FROM janela_final j

    UNION

    SELECT gs AS ts
    FROM janela_final j
    CROSS JOIN LATERAL generate_series(
      date_trunc('hour', j.janela_inicio) + INTERVAL '1 hour',
      date_trunc('hour', j.janela_fim),
      INTERVAL '1 hour'
    ) gs
    WHERE gs > j.janela_inicio
      AND gs < j.janela_fim

    UNION

    SELECT j.janela_fim AS ts
    FROM janela_final j
  ),

  timeline_times_json AS (
    SELECT
      COALESCE(
        jsonb_agg(to_char(mh.ts, 'HH24:MI') ORDER BY mh.ts),
        '[]'::JSONB
      ) AS timeline_times
    FROM (SELECT DISTINCT ts FROM marcas_hora) mh
  ),

  segmentos_json AS (
    SELECT
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'inicio', to_char(sf.inicio_evento, 'YYYY-MM-DD"T"HH24:MI:SS'),
            'fim', to_char(sf.fim_evento, 'YYYY-MM-DD"T"HH24:MI:SS'),
            'inicio_hora', to_char(sf.inicio_evento, 'HH24:MI'),
            'fim_hora', to_char(sf.fim_evento, 'HH24:MI'),
            'duracao_minutos', ROUND(sf.duracao_minutos, 2),
            'largura_pct', ROUND(sf.largura_pct, 4),
            'status_timeline', sf.status_timeline,
            'classe_css', sf.classe_css,
            'oeeturno_id', sf.oeeturno_id,
            'produto', sf.produto
          )
          ORDER BY sf.inicio_evento
        ),
        '[]'::JSONB
      ) AS segmentos
    FROM segmentos_final sf
  ),

  lotes_json AS (
    SELECT
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'lote', ls.lote,
            'produto', ls.produto,
            'produzido', ROUND(ls.produzido, 3),
            'inicio', to_char(ls.inicio_evento, 'YYYY-MM-DD"T"HH24:MI:SS'),
            'fim', to_char(ls.fim_evento, 'YYYY-MM-DD"T"HH24:MI:SS'),
            'inicio_hora', to_char(ls.inicio_evento, 'HH24:MI'),
            'fim_hora', to_char(ls.fim_evento, 'HH24:MI'),
            'duracao_minutos', ROUND(ls.duracao_minutos, 2),
            'largura_pct', ROUND(ls.largura_pct, 4)
          )
          ORDER BY ls.inicio_evento, ls.lote
        ),
        '[]'::JSONB
      ) AS lotes
    FROM lotes_saida ls
  )

  SELECT
    j.janela_inicio,
    j.janela_fim,
    ttj.timeline_times,
    sj.segmentos,
    lj.lotes
  FROM janela_final j
  CROSS JOIN timeline_times_json ttj
  CROSS JOIN segmentos_json sj
  CROSS JOIN lotes_json lj;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION fn_calcular_oee_timeline(
  DATE,
  DATE,
  INTEGER,
  INTEGER,
  INTEGER,
  BIGINT,
  TEXT[],
  INTEGER,
  TIMESTAMP WITHOUT TIME ZONE
)
IS 'Retorna payload da timeline (24h) para Dashboard de Linha com filtros de periodo, linha, turno, produto, status e lancamento.';

-- ============================================================================
-- TESTE DA FUNCAO
-- ============================================================================
-- SELECT *
-- FROM fn_calcular_oee_timeline(
--   p_data_inicio := '2026-02-21'::DATE,
--   p_data_fim := '2026-02-22'::DATE,
--   p_turno_id := NULL,
--   p_produto_id := NULL,
--   p_linhaproducao_id := 23,
--   p_oeeturno_id := NULL,
--   p_statuses := ARRAY['Aberto', 'Fechado'],
--   p_janela_horas := 24,
--   p_referencia_fim := NULL
-- );
