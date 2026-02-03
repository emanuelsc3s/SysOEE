-- ============================================================================
-- FUNÇÃO: fn_calcular_oee_dashboard
-- Calcula OEE agregado por linha de produção para o Dashboard
--
-- HISTÓRICO DE CORREÇÕES:
-- v1: Versão inicial
-- v2: Corrige cálculo de turnos noturnos usando EXTRACT(EPOCH)
-- v3: Velocidade em un/min e ajustes de filtro por linha
-- v4 (atual):
--   1. Tempo disponível fixo por turno (12h por padrão), alinhado ao ApontamentoOEE
--   2. Tempo operacional líquido = quantidade total / velocidade nominal do turno
--   3. Filtro opcional por oeeturno_id
--   4. Classificação de paradas e filtros de exclusão alinhados ao ApontamentoOEE
--
-- ESTRUTURA DE DADOS:
-- - tboee_turno: Turno pertence a UMA linha (linhaproducao_id)
-- - tboee_turno_producao: Produção vinculada ao turno
-- - tboee_turno_perda: Perdas vinculadas ao turno (sem linhaproducao_id próprio)
-- - tboee_turno_parada: Paradas vinculadas ao turno (sem linhaproducao_id próprio)
--
-- Data: 2026-02-03
-- ============================================================================

DROP FUNCTION IF EXISTS fn_calcular_oee_dashboard(DATE, DATE, INTEGER, INTEGER, INTEGER, NUMERIC);
DROP FUNCTION IF EXISTS fn_calcular_oee_dashboard(DATE, DATE, INTEGER, INTEGER, INTEGER, NUMERIC, BIGINT);

CREATE OR REPLACE FUNCTION fn_calcular_oee_dashboard(
  p_data_inicio DATE,
  p_data_fim DATE,
  p_turno_id INTEGER DEFAULT NULL,
  p_produto_id INTEGER DEFAULT NULL,
  p_linhaproducao_id INTEGER DEFAULT NULL,
  p_tempo_disponivel_padrao NUMERIC DEFAULT 12,
  p_oeeturno_id BIGINT DEFAULT NULL
)
RETURNS TABLE (
  linhaproducao_id INTEGER,
  linhaproducao TEXT,
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
  WITH turnos_filtrados AS (
    -- Busca turnos filtrados por data, turno, produto e linha
    -- IMPORTANTE: linhaproducao_id vem diretamente de tboee_turno
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

  tempo_disponivel AS (
    -- Soma tempo disponível por linha (tempo fixo por turno)
    SELECT
      tf.linhaproducao_id,
      COUNT(*) * p_tempo_disponivel_padrao AS tempo_disponivel_horas
    FROM turnos_filtrados tf
    GROUP BY tf.linhaproducao_id
  ),

  producao_turno AS (
    -- Calcula produção e velocidade nominal por turno
    SELECT
      tf.oeeturno_id,
      tf.linhaproducao_id,
      SUM(COALESCE(p.quantidade, 0))::NUMERIC AS unidades_produzidas,
      (
        SELECT p2.velocidade
        FROM tboee_turno_producao p2
        WHERE p2.oeeturno_id = tf.oeeturno_id
          AND (p2.deletado IS NULL OR p2.deletado = 'N')
          AND p2.velocidade IS NOT NULL
          AND p2.velocidade > 0
        ORDER BY p2.hora_inicio ASC NULLS LAST, p2.oeeturnoproducao_id ASC
        LIMIT 1
      )::NUMERIC AS velocidade_nominal
    FROM tboee_turno_producao p
    JOIN turnos_filtrados tf ON tf.oeeturno_id = p.oeeturno_id
    WHERE (p.deletado IS NULL OR p.deletado = 'N')
    GROUP BY tf.oeeturno_id, tf.linhaproducao_id
  ),

  producao AS (
    -- Consolida produção e tempo operacional líquido por linha
    SELECT
      pt.linhaproducao_id,
      SUM(pt.unidades_produzidas)::NUMERIC AS unidades_produzidas,
      SUM(
        CASE
          WHEN pt.velocidade_nominal IS NOT NULL AND pt.velocidade_nominal > 0
            THEN pt.unidades_produzidas / pt.velocidade_nominal
          ELSE 0
        END
      )::NUMERIC AS tempo_operacional_liquido
    FROM producao_turno pt
    GROUP BY pt.linhaproducao_id
  ),

  perdas AS (
    -- Soma perdas por linha (usa linhaproducao_id do turno)
    SELECT
      tf.linhaproducao_id,
      SUM(COALESCE(q.perda, 0))::NUMERIC AS unidades_perdas
    FROM tboee_turno_perda q
    JOIN turnos_filtrados tf ON tf.oeeturno_id = q.oeeturno_id
    WHERE q.deletado = 'N'
    GROUP BY tf.linhaproducao_id
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
      ) AS texto
    FROM tboee_turno_parada p
    JOIN turnos_filtrados tf ON tf.oeeturno_id = p.oeeturno_id
    WHERE p.deletado = 'N'
  ),

  paradas_classificadas AS (
    -- Classifica paradas como estratégicas ou não
    SELECT
      pr.linhaproducao_id,
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
    -- Soma paradas por tipo:
    -- - Estratégicas: Excluídas do tempo disponível
    -- - Grandes (>= 10 min): Afetam Disponibilidade
    -- - Pequenas (< 10 min): Afetam Performance (não contabilizadas aqui)
    SELECT
      pc.linhaproducao_id,
      SUM(CASE WHEN pc.estrategica THEN pc.duracao_minutos ELSE 0 END) / 60.0 AS tempo_estrategico_horas,
      SUM(CASE WHEN NOT pc.estrategica AND pc.duracao_minutos >= 10 THEN pc.duracao_minutos ELSE 0 END) / 60.0 AS tempo_paradas_grandes_horas
    FROM paradas_classificadas pc
    GROUP BY pc.linhaproducao_id
  ),

  linhas AS (
    -- Lista única de linhas nos turnos filtrados
    SELECT DISTINCT tf.linhaproducao_id
    FROM turnos_filtrados tf
  ),

  base AS (
    -- Consolida todos os dados por linha
    SELECT
      l.linhaproducao_id,
      lp.linhaproducao,
      COALESCE(prod.unidades_produzidas, 0) AS unidades_produzidas,
      COALESCE(perd.unidades_perdas, 0) AS unidades_perdas,
      GREATEST(COALESCE(prod.unidades_produzidas, 0) - COALESCE(perd.unidades_perdas, 0), 0) AS unidades_boas,
      COALESCE(prod.tempo_operacional_liquido, 0) AS tempo_operacional_liquido,
      COALESCE(td.tempo_disponivel_horas, 0) AS tempo_disponivel_horas,
      COALESCE(par.tempo_estrategico_horas, 0) AS tempo_estrategico_horas,
      COALESCE(par.tempo_paradas_grandes_horas, 0) AS tempo_paradas_grandes_horas
    FROM linhas l
    JOIN tblinhaproducao lp ON lp.linhaproducao_id = l.linhaproducao_id
    LEFT JOIN tempo_disponivel td ON td.linhaproducao_id = l.linhaproducao_id
    LEFT JOIN paradas par ON par.linhaproducao_id = l.linhaproducao_id
    LEFT JOIN producao prod ON prod.linhaproducao_id = l.linhaproducao_id
    LEFT JOIN perdas perd ON perd.linhaproducao_id = l.linhaproducao_id
  )

  -- Resultado final com cálculos de OEE
  SELECT
    b.linhaproducao_id::INTEGER,
    b.linhaproducao::TEXT,
    b.unidades_produzidas,
    b.unidades_perdas,
    b.unidades_boas,
    ROUND(b.tempo_operacional_liquido, 2) AS tempo_operacional_liquido,
    -- Tempo Valioso = TOL * Qualidade
    ROUND((CASE
      WHEN b.unidades_produzidas > 0 THEN (b.unidades_boas / b.unidades_produzidas)
      ELSE 1
    END) * b.tempo_operacional_liquido, 2) AS tempo_valioso,
    ROUND(b.tempo_disponivel_horas, 2) AS tempo_disponivel_horas,
    ROUND(b.tempo_estrategico_horas, 2) AS tempo_estrategico_horas,
    ROUND(b.tempo_paradas_grandes_horas, 2) AS tempo_paradas_grandes_horas,
    -- Tempo de Operação = Tempo Disponível - Estratégico - Paradas Grandes
    ROUND(
      GREATEST(
        GREATEST(b.tempo_disponivel_horas - b.tempo_estrategico_horas, 0) - b.tempo_paradas_grandes_horas,
        0
      ),
      2
    ) AS tempo_operacao_horas,
    -- Disponibilidade = Tempo de Operação / (Tempo Disponível - Estratégico)
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
    -- Performance = TOL / Tempo de Operação (limitado a 100%)
    ROUND(
      CASE
        WHEN GREATEST((b.tempo_disponivel_horas - b.tempo_estrategico_horas) - b.tempo_paradas_grandes_horas, 0) > 0
          THEN LEAST(
            (b.tempo_operacional_liquido / GREATEST((b.tempo_disponivel_horas - b.tempo_estrategico_horas) - b.tempo_paradas_grandes_horas, 0)) * 100,
            100
          )
        ELSE 0
      END,
      2
    ) AS performance,
    -- Qualidade = Unidades Boas / Unidades Produzidas
    ROUND(
      CASE
        WHEN b.unidades_produzidas > 0 THEN (b.unidades_boas / b.unidades_produzidas) * 100
        ELSE 100
      END,
      2
    ) AS qualidade,
    -- OEE = Disponibilidade × Performance × Qualidade
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
          WHEN GREATEST((b.tempo_disponivel_horas - b.tempo_estrategico_horas) - b.tempo_paradas_grandes_horas, 0) > 0
            THEN LEAST(
              (b.tempo_operacional_liquido / GREATEST((b.tempo_disponivel_horas - b.tempo_estrategico_horas) - b.tempo_paradas_grandes_horas, 0)),
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
  ORDER BY b.linhaproducao;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION fn_calcular_oee_dashboard(DATE, DATE, INTEGER, INTEGER, INTEGER, NUMERIC, BIGINT) IS 'Calcula OEE agregado por linha de produção para o Dashboard. v4: Alinha tempo disponível fixo, velocidade nominal por turno, filtro opcional por oeeturno_id e paradas/perdas ao ApontamentoOEE.';

-- ============================================================================
-- TESTE DA FUNÇÃO
-- ============================================================================
-- SELECT *
-- FROM fn_calcular_oee_dashboard(
--   p_data_inicio := '2026-02-03'::date,
--   p_data_fim := '2026-02-03'::date,
--   p_turno_id := NULL,
--   p_produto_id := NULL,
--   p_linhaproducao_id := 23,
--   p_tempo_disponivel_padrao := 12,
--   p_oeeturno_id := NULL
-- );

-- ============================================================================
-- TESTE DO CÁLCULO DE TURNO NOTURNO
-- ============================================================================
-- SELECT
--   '18:00:00'::time AS hora_inicio,
--   '06:00:00'::time AS hora_fim,
--   EXTRACT(EPOCH FROM '18:00:00'::time) AS inicio_segundos,  -- 64800
--   EXTRACT(EPOCH FROM '06:00:00'::time) AS fim_segundos,      -- 21600
--   ((86400 - EXTRACT(EPOCH FROM '18:00:00'::time)) + EXTRACT(EPOCH FROM '06:00:00'::time)) / 3600.0 AS horas_calculadas;
