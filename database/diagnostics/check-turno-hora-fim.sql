-- =====================================================
-- Diagnóstico: Verificar campo hora_fim na tbturno
-- =====================================================

-- 1. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tbturno'
  AND column_name IN ('hora_inicio', 'hora_fim')
ORDER BY ordinal_position;

-- 2. Verificar dados existentes
SELECT 
  turno_id,
  codigo,
  turno,
  hora_inicio,
  hora_fim,
  meta_oee,
  deletado
FROM tbturno
WHERE deletado = 'N'
ORDER BY codigo;

-- 3. Contar registros com hora_fim NULL
SELECT 
  COUNT(*) as total_turnos,
  COUNT(hora_fim) as com_hora_fim,
  COUNT(*) - COUNT(hora_fim) as sem_hora_fim
FROM tbturno
WHERE deletado = 'N';

-- 4. Listar turnos sem hora_fim
SELECT 
  turno_id,
  codigo,
  turno,
  hora_inicio,
  hora_fim
FROM tbturno
WHERE deletado = 'N'
  AND hora_fim IS NULL;

-- =====================================================
-- CORREÇÃO: Atualizar turnos sem hora_fim
-- =====================================================
-- ATENÇÃO: Execute apenas se identificar registros sem hora_fim

-- Exemplo de correção para turnos padrão:
-- UPDATE tbturno SET hora_fim = '14:00' WHERE codigo = 'D1' AND hora_fim IS NULL;
-- UPDATE tbturno SET hora_fim = '22:00' WHERE codigo = 'D2' AND hora_fim IS NULL;
-- UPDATE tbturno SET hora_fim = '06:00' WHERE codigo = 'N1' AND hora_fim IS NULL;

