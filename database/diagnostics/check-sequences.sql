-- ============================================================================
-- DIAGNÓSTICO DE SEQUÊNCIAS
-- ============================================================================
-- Este script verifica se as sequências IDENTITY estão sincronizadas com os
-- dados das tabelas. Use para detectar problemas antes que causem erros.
--
-- COMO USAR:
-- Execute este script periodicamente ou sempre que suspeitar de problemas
-- com inserções automáticas de IDs.
--
-- INTERPRETAÇÃO DOS RESULTADOS:
-- - ✅ OK: Sequência está sincronizada, próxima inserção funcionará
-- - ⚠️ PROBLEMA: Sequência está dessincronizada, execute 99-fix-sequences.sql
-- ============================================================================

-- Função auxiliar para verificar uma sequência
CREATE OR REPLACE FUNCTION check_sequence(
  p_table_name TEXT,
  p_id_column TEXT,
  p_sequence_name TEXT
) RETURNS TABLE(
  tabela TEXT,
  max_id_tabela BIGINT,
  proximo_valor_sequencia BIGINT,
  status TEXT,
  acao_recomendada TEXT
) AS $$
DECLARE
  v_max_id BIGINT;
  v_next_seq BIGINT;
  v_is_called BOOLEAN;
BEGIN
  -- Buscar o maior ID da tabela
  EXECUTE format('SELECT COALESCE(MAX(%I), 0) FROM %I', p_id_column, p_table_name)
  INTO v_max_id;
  
  -- Buscar próximo valor da sequência
  EXECUTE format('SELECT last_value, is_called FROM %I', p_sequence_name)
  INTO v_next_seq, v_is_called;
  
  -- Se is_called = true, próximo valor será last_value + 1
  -- Se is_called = false, próximo valor será last_value
  IF v_is_called THEN
    v_next_seq := v_next_seq + 1;
  END IF;
  
  -- Retornar resultado
  RETURN QUERY SELECT
    p_table_name,
    v_max_id,
    v_next_seq,
    CASE
      WHEN v_next_seq > v_max_id THEN '✅ OK'
      ELSE '⚠️ PROBLEMA'
    END,
    CASE
      WHEN v_next_seq > v_max_id THEN 'Nenhuma ação necessária'
      ELSE 'Execute: SELECT setval(''' || p_sequence_name || ''', ' || (v_max_id + 1)::TEXT || ', false);'
    END;
END;
$$ LANGUAGE plpgsql;

-- Executar verificação em todas as tabelas com IDENTITY
SELECT * FROM check_sequence('tbdepartamento', 'departamento_id', 'tbdepartamento_departamento_id_seq')
UNION ALL
SELECT * FROM check_sequence('tblinhaproducao', 'linhaproducao_id', 'tblinha_producao_linhaproducao_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbvelocidadenominal', 'velocidade_id', 'tbvelocidadenominal_velocidade_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbturno', 'turno_id', 'tbturno_turno_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbusuario', 'usuario_id', 'tbusuario_usuario_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbproduto', 'produto_id', 'tbproduto_produto_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbfuncionario', 'funcionario_id', 'tbfuncionario_funcionario_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbcargo', 'cargo_id', 'tbcargo_cargo_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbfuncao', 'funcao_id', 'tbfuncao_funcao_id_seq')
UNION ALL
SELECT * FROM check_sequence('tblotacao', 'lotacao_id', 'tblotacao_lotacao_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbempresa', 'empresa_id', 'tbempresa_empresa_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbuf', 'uf_id', 'tbuf_uf_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbcidade', 'cidade_id', 'tbcidade_cidade_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbescolaridade', 'escolaridade_id', 'tbescolaridade_escolaridade_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbestadocivil', 'estadocivil_id', 'tbestadocivil_estadocivil_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbtipoadmissao', 'tipoadmissao_id', 'tbtipoadmissao_tipoadmissao_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbtipoadmissaoesocial', 'tipoadmissaoesocial_id', 'tbtipoadmissaoesocial_tipoadmissaoesocial_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbtipovinculo', 'tipovinculo_id', 'tbtipovinculo_tipovinculo_id_seq')
UNION ALL
SELECT * FROM check_sequence('tbcorrida', 'corrida_id', 'tbcorrida_corrida_id_seq')
UNION ALL
SELECT * FROM check_sequence('tboee_turno', 'oeeturno_id', 'tboee_turno_oeeturno_id_seq')
ORDER BY 
  CASE WHEN status = '⚠️ PROBLEMA' THEN 0 ELSE 1 END,
  tabela;

-- Comentário sobre a função
COMMENT ON FUNCTION check_sequence(TEXT, TEXT, TEXT) IS 
'Verifica se uma sequência está sincronizada com os dados da tabela.
Retorna status e ação recomendada caso haja problema.
Parâmetros: nome_tabela, nome_coluna_id, nome_sequencia';

