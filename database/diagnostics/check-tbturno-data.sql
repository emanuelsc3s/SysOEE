-- Script de diagnóstico para verificar dados na tabela tbturno
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'tbturno'
) AS tabela_existe;

-- 2. Contar total de registros
SELECT COUNT(*) AS total_registros FROM tbturno;

-- 3. Contar registros ativos (não deletados)
SELECT COUNT(*) AS registros_ativos 
FROM tbturno 
WHERE deletado = 'N';

-- 4. Contar registros deletados
SELECT COUNT(*) AS registros_deletados 
FROM tbturno 
WHERE deletado = 'S';

-- 5. Listar todos os turnos ativos
SELECT 
  turno_id,
  codigo,
  turno,
  hora_inicio,
  hora_fim,
  meta_oee,
  deletado,
  created_at
FROM tbturno
WHERE deletado = 'N'
ORDER BY codigo;

-- 6. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'tbturno'
ORDER BY ordinal_position;

-- 7. Se não houver dados, inserir dados de exemplo
-- DESCOMENTE AS LINHAS ABAIXO PARA INSERIR DADOS DE TESTE

/*
INSERT INTO tbturno (codigo, turno, hora_inicio, hora_fim, meta_oee, deletado)
VALUES 
  ('T1', '1º Turno', '06:00:00', '18:00:00', 85.0, 'N'),
  ('T2', '2º Turno', '18:00:00', '06:00:00', 85.0, 'N'),
  ('T3', '3º Turno', '22:00:00', '06:00:00', 80.0, 'N')
ON CONFLICT DO NOTHING;
*/

