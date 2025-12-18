-- =====================================================
-- SCRIPT DE VERIFICAÇÃO DE INSTALAÇÃO
-- Verifica se as tabelas OEE foram criadas corretamente
-- Projeto: Sistema OEE para SicFar
-- Data: 2025-12-17
-- =====================================================

\echo '=========================================='
\echo 'VERIFICAÇÃO DE INSTALAÇÃO - TABELAS OEE'
\echo '=========================================='
\echo ''

-- =====================================================
-- 1. VERIFICAR SE TABELAS EXISTEM
-- =====================================================

\echo '1. Verificando existência das tabelas...'
\echo ''

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tboee_turno') THEN '✅'
    ELSE '❌'
  END AS status,
  'tboee_turno' AS tabela,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tboee_turno') THEN 'Cabeçalho do turno (pré-requisito)'
    ELSE 'ERRO: Tabela não existe!'
  END AS descricao
UNION ALL
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tboee_producao') THEN '✅'
    ELSE '❌'
  END,
  'tboee_producao',
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tboee_producao') THEN 'Apontamentos de produção'
    ELSE 'ERRO: Tabela não existe!'
  END
UNION ALL
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tboee_paradas') THEN '✅'
    ELSE '❌'
  END,
  'tboee_paradas',
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tboee_paradas') THEN 'Apontamentos de paradas'
    ELSE 'ERRO: Tabela não existe!'
  END
UNION ALL
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tboee_perdas') THEN '✅'
    ELSE '❌'
  END,
  'tboee_perdas',
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tboee_perdas') THEN 'Apontamentos de perdas de qualidade'
    ELSE 'ERRO: Tabela não existe!'
  END
ORDER BY tabela;

\echo ''

-- =====================================================
-- 2. VERIFICAR CONSTRAINTS
-- =====================================================

\echo '2. Verificando constraints (PRIMARY KEY, FOREIGN KEY, CHECK)...'
\echo ''

SELECT
  tc.table_name AS tabela,
  COUNT(*) FILTER (WHERE tc.constraint_type = 'PRIMARY KEY') AS pk_count,
  COUNT(*) FILTER (WHERE tc.constraint_type = 'FOREIGN KEY') AS fk_count,
  COUNT(*) FILTER (WHERE tc.constraint_type = 'CHECK') AS check_count,
  COUNT(*) AS total_constraints
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('tboee_producao', 'tboee_paradas', 'tboee_perdas')
GROUP BY tc.table_name
ORDER BY tc.table_name;

\echo ''
\echo 'Esperado por tabela:'
\echo '  - tboee_producao: 1 PK, 7 FKs, 4 CHECKs'
\echo '  - tboee_paradas: 1 PK, 9 FKs, 3 CHECKs'
\echo '  - tboee_perdas: 1 PK, 7 FKs, 2 CHECKs'
\echo ''

-- =====================================================
-- 3. VERIFICAR ÍNDICES
-- =====================================================

\echo '3. Verificando índices...'
\echo ''

SELECT
  tablename AS tabela,
  COUNT(*) AS total_indices
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('tboee_producao', 'tboee_paradas', 'tboee_perdas')
GROUP BY tablename
ORDER BY tablename;

\echo ''
\echo 'Esperado por tabela:'
\echo '  - tboee_producao: 5 índices (1 PK + 4 performance)'
\echo '  - tboee_paradas: 7 índices (1 PK + 6 performance)'
\echo '  - tboee_perdas: 6 índices (1 PK + 5 performance)'
\echo ''

-- =====================================================
-- 4. VERIFICAR COLUNAS OBRIGATÓRIAS
-- =====================================================

\echo '4. Verificando colunas obrigatórias (campos ALCOA+)...'
\echo ''

SELECT
  table_name AS tabela,
  COUNT(*) FILTER (WHERE column_name = 'created_at') AS tem_created_at,
  COUNT(*) FILTER (WHERE column_name = 'created_by') AS tem_created_by,
  COUNT(*) FILTER (WHERE column_name = 'updated_at') AS tem_updated_at,
  COUNT(*) FILTER (WHERE column_name = 'updated_by') AS tem_updated_by,
  COUNT(*) FILTER (WHERE column_name = 'deleted_at') AS tem_deleted_at,
  COUNT(*) FILTER (WHERE column_name = 'deleted_by') AS tem_deleted_by,
  COUNT(*) FILTER (WHERE column_name = 'deletado') AS tem_deletado
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('tboee_producao', 'tboee_paradas', 'tboee_perdas')
  AND column_name IN ('created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by', 'deletado')
GROUP BY table_name
ORDER BY table_name;

\echo ''
\echo 'Esperado: Todos os campos ALCOA+ devem ter valor 1'
\echo ''

-- =====================================================
-- 5. VERIFICAR FOREIGN KEYS
-- =====================================================

\echo '5. Verificando foreign keys críticas...'
\echo ''

SELECT
  tc.table_name AS tabela_origem,
  kcu.column_name AS coluna_origem,
  ccu.table_name AS tabela_destino,
  ccu.column_name AS coluna_destino
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('tboee_producao', 'tboee_paradas', 'tboee_perdas')
ORDER BY tc.table_name, kcu.column_name;

\echo ''

-- =====================================================
-- 6. VERIFICAR VALORES DEFAULT
-- =====================================================

\echo '6. Verificando valores DEFAULT...'
\echo ''

SELECT
  table_name AS tabela,
  column_name AS coluna,
  column_default AS valor_padrao
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('tboee_producao', 'tboee_paradas', 'tboee_perdas')
  AND column_default IS NOT NULL
  AND column_name IN ('created_at', 'deletado', 'impacta_disponibilidade')
ORDER BY table_name, column_name;

\echo ''
\echo 'Esperado:'
\echo '  - created_at: NOW() AT TIME ZONE America/Fortaleza'
\echo '  - deletado: N'
\echo '  - impacta_disponibilidade: TRUE (apenas tboee_paradas)'
\echo ''

-- =====================================================
-- 7. RESUMO FINAL
-- =====================================================

\echo ''
\echo '=========================================='
\echo 'RESUMO DA VERIFICAÇÃO'
\echo '=========================================='
\echo ''

DO $$
DECLARE
  v_tboee_producao_exists BOOLEAN;
  v_tboee_paradas_exists BOOLEAN;
  v_tboee_perdas_exists BOOLEAN;
  v_total_ok INTEGER := 0;
  v_total_erros INTEGER := 0;
BEGIN
  -- Verificar existência das tabelas
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tboee_producao') INTO v_tboee_producao_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tboee_paradas') INTO v_tboee_paradas_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tboee_perdas') INTO v_tboee_perdas_exists;

  -- Contar sucessos e erros
  IF v_tboee_producao_exists THEN
    v_total_ok := v_total_ok + 1;
  ELSE
    v_total_erros := v_total_erros + 1;
  END IF;

  IF v_tboee_paradas_exists THEN
    v_total_ok := v_total_ok + 1;
  ELSE
    v_total_erros := v_total_erros + 1;
  END IF;

  IF v_tboee_perdas_exists THEN
    v_total_ok := v_total_ok + 1;
  ELSE
    v_total_erros := v_total_erros + 1;
  END IF;

  -- Exibir resultado
  RAISE NOTICE '';
  RAISE NOTICE 'Total de tabelas criadas com sucesso: %', v_total_ok;
  RAISE NOTICE 'Total de erros: %', v_total_erros;
  RAISE NOTICE '';

  IF v_total_erros = 0 THEN
    RAISE NOTICE '✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '  1. Criar serviços Supabase (producao, paradas, perdas)';
    RAISE NOTICE '  2. Implementar migração do localStorage';
    RAISE NOTICE '  3. Atualizar ApontamentoOEE.tsx';
    RAISE NOTICE '  4. Executar testes de integração';
    RAISE NOTICE '  5. Validar com stakeholders (Rafael Gusmão e Sávio Rafael)';
  ELSE
    RAISE NOTICE '❌ INSTALAÇÃO INCOMPLETA';
    RAISE NOTICE '';
    RAISE NOTICE 'Execute os scripts na ordem correta:';
    RAISE NOTICE '  1. 001-create-tboee_producao.sql';
    RAISE NOTICE '  2. 002-create-tboee_paradas.sql';
    RAISE NOTICE '  3. 003-create-tboee_perdas.sql';
  END IF;

  RAISE NOTICE '';
END $$;

\echo '=========================================='
\echo 'FIM DA VERIFICAÇÃO'
\echo '=========================================='
