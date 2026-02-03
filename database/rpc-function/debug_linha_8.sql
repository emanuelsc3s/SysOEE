-- ============================================================================
-- DIAGNÓSTICO: Por que a linha 8 tem tempo_disponivel_horas = 0?
-- ============================================================================

-- 1. Verificar os turnos da linha 8 no período
SELECT
  t.oeeturno_id,
  t.data,
  t.turno_id,
  t.turno_hi AS turno_hora_inicio_oee,
  t.turno_hf AS turno_hora_fim_oee,
  tb.hora_inicio AS turno_hora_inicio_padrao,
  tb.hora_fim AS turno_hora_fim_padrao,
  COALESCE(t.turno_hi, tb.hora_inicio) AS hora_inicio_calculada,
  COALESCE(t.turno_hf, tb.hora_fim) AS hora_fim_calculada,
  -- Diagnóstico do cálculo
  CASE
    WHEN COALESCE(t.turno_hf, tb.hora_fim) IS NULL OR COALESCE(t.turno_hi, tb.hora_inicio) IS NULL
      THEN 'AMBOS NULL'
    WHEN COALESCE(t.turno_hf, tb.hora_fim) = COALESCE(t.turno_hi, tb.hora_inicio)
      THEN 'IGUAIS'
    WHEN COALESCE(t.turno_hf, tb.hora_fim) > COALESCE(t.turno_hi, tb.hora_inicio)
      THEN 'DIURNO'
    ELSE 'NOTURNO'
  END AS tipo_turno,
  -- Cálculo do tempo
  CASE
    WHEN COALESCE(t.turno_hi, tb.hora_inicio) IS NULL OR COALESCE(t.turno_hf, tb.hora_fim) IS NULL
      THEN NULL
    WHEN COALESCE(t.turno_hf, tb.hora_fim) > COALESCE(t.turno_hi, tb.hora_inicio)
      THEN EXTRACT(EPOCH FROM (COALESCE(t.turno_hf, tb.hora_fim) - COALESCE(t.turno_hi, tb.hora_inicio))) / 3600.0
    ELSE EXTRACT(EPOCH FROM (COALESCE(t.turno_hf, tb.hora_fim) + INTERVAL '24 hours' - COALESCE(t.turno_hi, tb.hora_inicio))) / 3600.0
  END AS tempo_calculado_horas
FROM tboee_turno t
LEFT JOIN tbturno tb ON tb.turno_id = t.turno_id
WHERE t.deletado = 'N'
  AND t.data = '2026-02-03'
  AND t.oeeturno_id IN (
    SELECT DISTINCT p.oeeturno_id
    FROM tboee_turno_producao p
    WHERE p.linhaproducao_id = 8
      AND (p.deletado IS NULL OR p.deletado = 'N')
  )
ORDER BY t.data, t.oeeturno_id;

-- 2. Verificar produções da linha 8 com dados do turno
SELECT
  p.oeeturnoproducao_id,
  p.oeeturno_id,
  p.linhaproducao_id,
  p.quantidade,
  p.velocidade,
  t.data AS turno_data,
  t.turno_hi,
  t.turno_hf,
  tb.hora_inicio AS turno_padrao_hi,
  tb.hora_fim AS turno_padrao_hf
FROM tboee_turno_producao p
JOIN tboee_turno t ON t.oeeturno_id = p.oeeturno_id
LEFT JOIN tbturno tb ON tb.turno_id = t.turno_id
WHERE p.linhaproducao_id = 8
  AND (p.deletado IS NULL OR p.deletado = 'N')
  AND t.data = '2026-02-03'
ORDER BY p.oeeturno_id;

-- 3. Verificar se o turno associado tem hora_inicio e hora_fim definidos
SELECT DISTINCT
  t.turno_id,
  tb.codigo,
  tb.turno,
  tb.hora_inicio,
  tb.hora_fim,
  t.turno_hi AS turno_oee_hi,
  t.turno_hf AS turno_oee_hf
FROM tboee_turno t
LEFT JOIN tbturno tb ON tb.turno_id = t.turno_id
WHERE t.deletado = 'N'
  AND t.data = '2026-02-03'
  AND t.oeeturno_id IN (
    SELECT DISTINCT p.oeeturno_id
    FROM tboee_turno_producao p
    WHERE p.linhaproducao_id = 8
      AND (p.deletado IS NULL OR p.deletado = 'N')
  );
