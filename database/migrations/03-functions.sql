-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 03-functions.sql
-- Descrição: Functions do sistema
-- Versão: 1.0
-- Data: 2025-10-25
-- =====================================================

-- PRÉ-REQUISITO: Execute 01-enums.sql e 02-tables.sql antes

-- =====================================================
-- FUNCTIONS AUXILIARES
-- =====================================================

-- ----------------------------------------------------
-- Function: get_velocidade_nominal()
-- Busca velocidade nominal vigente para linha+SKU
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION get_velocidade_nominal(
  p_linha_id UUID,
  p_produto_id INTEGER,
  p_data_referencia DATE
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_velocidade DECIMAL(10,2);
BEGIN
  SELECT velocidade_nominal
  INTO v_velocidade
  FROM tbvelocidadenominal
  WHERE linha_id = p_linha_id
    AND produto_id = p_produto_id
    AND data_inicio_vigencia <= p_data_referencia
    AND (data_fim_vigencia IS NULL OR data_fim_vigencia >= p_data_referencia)
  ORDER BY data_inicio_vigencia DESC
  LIMIT 1;

  RETURN COALESCE(v_velocidade, 0);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_velocidade_nominal IS 'Retorna velocidade nominal vigente para linha+produto na data especificada';

-- ----------------------------------------------------
-- Function: get_meta_oee()
-- Busca meta OEE vigente para linha
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION get_meta_oee(
  p_linha_id UUID,
  p_data_referencia DATE
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_meta DECIMAL(5,2);
BEGIN
  SELECT meta_oee
  INTO v_meta
  FROM tbmetaoee
  WHERE linha_id = p_linha_id
    AND data_inicio_vigencia <= p_data_referencia
    AND (data_fim_vigencia IS NULL OR data_fim_vigencia >= p_data_referencia)
    AND ativo = TRUE
  ORDER BY data_inicio_vigencia DESC
  LIMIT 1;

  -- Se não encontrar meta específica, usar padrão da linha
  IF v_meta IS NULL THEN
  SELECT meta_oee_padrao INTO v_meta FROM tblinha WHERE id = p_linha_id;
  END IF;

  RETURN COALESCE(v_meta, 85.00);  -- Default: 85%
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_meta_oee IS 'Retorna meta OEE vigente para linha na data especificada';

-- ----------------------------------------------------
-- Function: update_updated_at_column()
-- Atualiza automaticamente o campo updated_at
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Trigger function para atualizar updated_at automaticamente';

-- ----------------------------------------------------
-- Function: get_current_user_id()
-- Retorna ID do usuário da sessão atual
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS BIGINT AS $$
BEGIN
  -- Tenta obter o user_id da configuração da sessão
  -- A aplicação deve fazer: SET LOCAL app.current_user_id = <user_id>
  RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::BIGINT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_current_user_id IS 'Retorna ID do usuário atual da sessão (app.current_user_id)';

-- ----------------------------------------------------
-- Function: atualizar_totais_lote()
-- Atualiza campos calculados do lote quando apontamentos mudam
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION atualizar_totais_lote()
RETURNS TRIGGER AS $$
DECLARE
  v_lote_id UUID;
BEGIN
  -- Determinar lote_id
  v_lote_id := COALESCE(NEW.lote_id, OLD.lote_id);

  -- Atualizar totais
  UPDATE tblote
  SET
    unidades_produzidas = COALESCE((
      SELECT SUM(unidades_produzidas)
  FROM tbapontamentoproducao
      WHERE lote_id = v_lote_id
    ), 0),
    unidades_refugo = COALESCE((
      SELECT SUM(unidades_refugadas)
  FROM tbapontamentoqualidade
      WHERE lote_id = v_lote_id AND tipo_perda = 'REFUGO'
    ), 0),
    tempo_retrabalho_minutos = COALESCE((
      SELECT SUM(tempo_retrabalho_minutos)
  FROM tbapontamentoqualidade
      WHERE lote_id = v_lote_id AND tipo_perda = 'RETRABALHO'
    ), 0),
    unidades_boas = GREATEST(
      COALESCE((
        SELECT SUM(unidades_produzidas)
  FROM tbapontamentoproducao
        WHERE lote_id = v_lote_id
      ), 0) - COALESCE((
        SELECT SUM(unidades_refugadas)
  FROM tbapontamentoqualidade
        WHERE lote_id = v_lote_id AND tipo_perda = 'REFUGO'
      ), 0),
      0
    )
  WHERE id = v_lote_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION atualizar_totais_lote IS 'Mantém campos calculados do lote sincronizados com apontamentos';

-- ----------------------------------------------------
-- Function: audit_trigger_func()
-- Captura mudanças para auditoria (ALCOA+)
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  v_old_record RECORD;
  v_new_record RECORD;
  v_column_name TEXT;
  v_old_value TEXT;
  v_new_value TEXT;
BEGIN
  -- Determinar OLD e NEW conforme operação
  IF (TG_OP = 'DELETE') THEN
    v_old_record := OLD;
    v_new_record := NULL;
  ELSIF (TG_OP = 'INSERT') THEN
    v_old_record := NULL;
    v_new_record := NEW;
  ELSE  -- UPDATE
    v_old_record := OLD;
    v_new_record := NEW;
  END IF;

  -- Para UPDATE: gravar cada campo alterado
  IF (TG_OP = 'UPDATE') THEN
    -- Iterar sobre colunas da tabela
    FOR v_column_name IN
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = TG_TABLE_NAME
        AND table_schema = TG_TABLE_SCHEMA
        AND column_name NOT IN ('updated_at', 'updated_by', 'sync_data')  -- Ignorar campos de auditoria
    LOOP
      -- Comparar valores
      EXECUTE format('SELECT ($1).%I::text, ($2).%I::text', v_column_name, v_column_name)
        INTO v_old_value, v_new_value
        USING v_old_record, v_new_record;

      -- Se diferente, gravar
      IF (v_old_value IS DISTINCT FROM v_new_value) THEN
  INSERT INTO tbauditlog (
          tabela, registro_id, operacao, campo_alterado,
          valor_anterior, valor_novo, usuario_id
        ) VALUES (
          TG_TABLE_NAME,
          (v_new_record).id,
          TG_OP::operacao_audit_enum,
          v_column_name,
          v_old_value,
          v_new_value,
          COALESCE((v_new_record).updated_by, get_current_user_id())
        );
      END IF;
    END LOOP;
  ELSE
    -- INSERT/DELETE: gravar operação completa
    INSERT INTO tb_audit_log (
      tabela, registro_id, operacao, campo_alterado,
      valor_anterior, valor_novo, usuario_id
    ) VALUES (
      TG_TABLE_NAME,
      COALESCE((v_new_record).id, (v_old_record).id),
      TG_OP::operacao_audit_enum,
      NULL,  -- Operação no registro completo
      CASE WHEN TG_OP = 'DELETE' THEN row_to_json(v_old_record)::text ELSE NULL END,
      CASE WHEN TG_OP = 'INSERT' THEN row_to_json(v_new_record)::text ELSE NULL END,
      COALESCE(
        (v_new_record).created_by,
        (v_old_record).updated_by,
        get_current_user_id()
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION audit_trigger_func IS 'Captura INSERT/UPDATE/DELETE para tbauditlog (ALCOA+ compliance)';

-- ----------------------------------------------------
-- Function: calcular_oee_lote()
-- CRÍTICO: Implementa fórmulas da Atividade 05
-- Retorna todos os componentes do OEE
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION calcular_oee_lote(p_lote_id UUID)
RETURNS TABLE (
  -- Tempos (horas)
  tempo_calendario DECIMAL(6,2),
  tempo_disponivel DECIMAL(6,2),
  tempo_operacao DECIMAL(6,2),
  tempo_operacional_liquido DECIMAL(6,2),
  tempo_valioso DECIMAL(6,2),

  -- Breakdown de paradas (horas)
  tempo_paradas_estrategicas DECIMAL(6,2),
  tempo_paradas_planejadas DECIMAL(6,2),
  tempo_paradas_nao_planejadas DECIMAL(6,2),
  tempo_pequenas_paradas DECIMAL(6,2),
  tempo_retrabalho DECIMAL(6,2),

  -- Unidades
  unidades_produzidas INTEGER,
  unidades_boas INTEGER,
  unidades_refugadas INTEGER,
  velocidade_nominal DECIMAL(10,2),

  -- Componentes OEE (%)
  disponibilidade DECIMAL(5,2),
  performance DECIMAL(5,2),
  qualidade_unidades DECIMAL(5,2),
  qualidade_retrabalho DECIMAL(5,2),
  qualidade DECIMAL(5,2),

  -- OEE Final (%)
  oee DECIMAL(5,2)
) AS $$
DECLARE
  v_lote RECORD;
  v_velocidade DECIMAL(10,2);

  -- Tempos em horas
  v_tempo_calendario DECIMAL(6,2);
  v_tempo_disponivel DECIMAL(6,2);
  v_tempo_operacao DECIMAL(6,2);
  v_tempo_operacional_liquido DECIMAL(6,2);
  v_tempo_valioso DECIMAL(6,2);

  -- Paradas
  v_tempo_estrategicas DECIMAL(6,2) := 0;
  v_tempo_planejadas DECIMAL(6,2) := 0;
  v_tempo_nao_planejadas DECIMAL(6,2) := 0;
  v_tempo_pequenas_paradas DECIMAL(6,2) := 0;
  v_tempo_retrabalho DECIMAL(6,2);

  -- Unidades
  v_unidades_produzidas INTEGER;
  v_unidades_boas INTEGER;
  v_unidades_refugadas INTEGER;

  -- Componentes OEE
  v_disponibilidade DECIMAL(5,2);
  v_performance DECIMAL(5,2);
  v_qualidade_unidades DECIMAL(5,2);
  v_qualidade_retrabalho DECIMAL(5,2);
  v_qualidade DECIMAL(5,2);
  v_oee DECIMAL(5,2);
BEGIN
  -- Buscar dados do lote
  SELECT
    l.data_producao,
    l.hora_inicio,
    l.hora_fim,
    l.linha_id,
    l.produto_id,
    l.turno_id,
    l.unidades_produzidas,
    l.unidades_boas,
    l.unidades_refugo,
    l.tempo_retrabalho_minutos,
    t.hora_inicio AS turno_hora_inicio,
    t.hora_fim AS turno_hora_fim
  INTO v_lote
  FROM tblote l
  JOIN tbturno t ON t.turno_id = l.turno_id
  WHERE l.id = p_lote_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lote não encontrado: %', p_lote_id;
  END IF;

  -- Buscar velocidade nominal vigente
  v_velocidade := get_velocidade_nominal(
    v_lote.linha_id,
    v_lote.produto_id,
    v_lote.data_producao
  );

  IF v_velocidade = 0 THEN
    RAISE EXCEPTION 'Velocidade nominal não configurada para linha/produto na data %', v_lote.data_producao;
  END IF;

  -- 1. TEMPO CALENDÁRIO
  IF v_lote.hora_inicio IS NOT NULL AND v_lote.hora_fim IS NOT NULL THEN
    v_tempo_calendario := EXTRACT(EPOCH FROM (v_lote.hora_fim - v_lote.hora_inicio)) / 3600.0;
  ELSIF v_lote.turno_hora_inicio IS NOT NULL AND v_lote.turno_hora_fim IS NOT NULL THEN
    -- Usar duração do turno (considerando virada de dia se necessário)
    v_tempo_calendario := EXTRACT(EPOCH FROM (
      CASE
        WHEN v_lote.turno_hora_fim < v_lote.turno_hora_inicio
        THEN v_lote.turno_hora_fim + INTERVAL '24 hours' - v_lote.turno_hora_inicio
        ELSE v_lote.turno_hora_fim - v_lote.turno_hora_inicio
      END
    )) / 3600.0;
  ELSE
    v_tempo_calendario := 8.0; -- Padrão: 8 horas
  END IF;

  -- 2. CALCULAR TEMPOS DE PARADAS (por tipo)
  SELECT
    COALESCE(SUM(CASE WHEN cp.tipo_parada = 'ESTRATEGICA' THEN ap.duracao_minutos ELSE 0 END) / 60.0, 0),
    COALESCE(SUM(CASE WHEN cp.tipo_parada = 'PLANEJADA' THEN ap.duracao_minutos ELSE 0 END) / 60.0, 0),
    COALESCE(SUM(CASE WHEN cp.tipo_parada = 'NAO_PLANEJADA' AND cp.impacta_disponibilidade = TRUE THEN ap.duracao_minutos ELSE 0 END) / 60.0, 0),
    COALESCE(SUM(CASE WHEN cp.impacta_disponibilidade = FALSE THEN ap.duracao_minutos ELSE 0 END) / 60.0, 0)
  INTO
    v_tempo_estrategicas,
    v_tempo_planejadas,
    v_tempo_nao_planejadas,
    v_tempo_pequenas_paradas
  FROM tbapontamentoparada ap
  JOIN tbcodigoparada cp ON cp.id = ap.codigo_parada_id
  WHERE ap.lote_id = p_lote_id
    AND ap.hora_fim IS NOT NULL;

  -- 3. TEMPO DISPONÍVEL = Tempo Calendário - Paradas Estratégicas
  v_tempo_disponivel := v_tempo_calendario - v_tempo_estrategicas;

  -- 4. TEMPO DE OPERAÇÃO = Tempo Disponível - Paradas de Indisponibilidade
  v_tempo_operacao := v_tempo_disponivel - v_tempo_planejadas - v_tempo_nao_planejadas;

  -- 5. UNIDADES
  v_unidades_produzidas := COALESCE(v_lote.unidades_produzidas, 0);
  v_unidades_boas := COALESCE(v_lote.unidades_boas, 0);
  v_unidades_refugadas := COALESCE(v_lote.unidades_refugo, 0);
  v_tempo_retrabalho := COALESCE(v_lote.tempo_retrabalho_minutos, 0) / 60.0;

  -- 6. TEMPO OPERACIONAL LÍQUIDO = Unidades Produzidas / Velocidade Nominal
  v_tempo_operacional_liquido := v_unidades_produzidas / v_velocidade;

  -- 7. CÁLCULO DOS COMPONENTES OEE

  -- 7.1 DISPONIBILIDADE = (Tempo de Operação / Tempo Disponível) × 100
  IF v_tempo_disponivel > 0 THEN
    v_disponibilidade := (v_tempo_operacao / v_tempo_disponivel) * 100;
  ELSE
    v_disponibilidade := 0;
  END IF;

  -- 7.2 PERFORMANCE = (Tempo Operacional Líquido / Tempo de Operação) × 100
  IF v_tempo_operacao > 0 THEN
    v_performance := (v_tempo_operacional_liquido / v_tempo_operacao) * 100;
  ELSE
    v_performance := 0;
  END IF;

  -- 7.3 QUALIDADE (duas parcelas)

  -- 7.3.1 Qualidade por Unidades = (Unidades Boas / Unidades Produzidas) × 100
  IF v_unidades_produzidas > 0 THEN
    v_qualidade_unidades := (v_unidades_boas::DECIMAL / v_unidades_produzidas) * 100;
  ELSE
    v_qualidade_unidades := 100;
  END IF;

  -- 7.3.2 Qualidade por Retrabalho = ((Tempo Operação - Tempo Retrabalho) / Tempo Operação) × 100
  IF v_tempo_operacao > 0 THEN
    v_qualidade_retrabalho := ((v_tempo_operacao - v_tempo_retrabalho) / v_tempo_operacao) * 100;
  ELSE
    v_qualidade_retrabalho := 100;
  END IF;

  -- 7.3.3 Qualidade Total = Qualidade Unidades × Qualidade Retrabalho
  v_qualidade := (v_qualidade_unidades / 100) * v_qualidade_retrabalho;

  -- 7.4 Tempo Valioso = (Qualidade × Tempo Operacional Líquido) / 100
  v_tempo_valioso := (v_qualidade / 100) * v_tempo_operacional_liquido;

  -- 8. OEE FINAL = Disponibilidade × Performance × Qualidade
  v_oee := (v_disponibilidade / 100) * (v_performance / 100) * v_qualidade;

  -- Limitar a 100%
  v_disponibilidade := LEAST(v_disponibilidade, 100);
  v_performance := LEAST(v_performance, 100);
  v_qualidade := LEAST(v_qualidade, 100);
  v_oee := LEAST(v_oee, 100);

  -- Retornar resultados
  RETURN QUERY SELECT
    v_tempo_calendario,
    v_tempo_disponivel,
    v_tempo_operacao,
    v_tempo_operacional_liquido,
    v_tempo_valioso,
    v_tempo_estrategicas,
    v_tempo_planejadas,
    v_tempo_nao_planejadas,
    v_tempo_pequenas_paradas,
    v_tempo_retrabalho,
    v_unidades_produzidas,
    v_unidades_boas,
    v_unidades_refugadas,
    v_velocidade,
    v_disponibilidade,
    v_performance,
    v_qualidade_unidades,
    v_qualidade_retrabalho,
    v_qualidade,
    v_oee;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calcular_oee_lote IS 'Calcula OEE completo de um lote. Implementa fórmulas da Atividade 05';

-- ----------------------------------------------------
-- Function: cache_oee_lote_concluido()
-- Popula cache quando lote é concluído
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION cache_oee_lote_concluido()
RETURNS TRIGGER AS $$
DECLARE
  v_oee RECORD;
  v_meta DECIMAL(5,2);
BEGIN
  -- Executar apenas quando lote muda para CONCLUIDO
  IF NEW.status = 'CONCLUIDO' AND (OLD.status IS NULL OR OLD.status != 'CONCLUIDO') THEN

    -- Calcular OEE
    SELECT * INTO v_oee FROM calcular_oee_lote(NEW.id);

    -- Buscar meta vigente
    v_meta := get_meta_oee(NEW.linha_id, NEW.data_producao);

    -- Inserir ou atualizar cache
  INSERT INTO tboeecalculado (
      linha_id, lote_id, produto_id, turno_id, data_referencia,
      tempo_calendario, tempo_disponivel, tempo_operacao,
      tempo_operacional_liquido, tempo_valioso,
      tempo_paradas_estrategicas, tempo_paradas_planejadas,
      tempo_paradas_nao_planejadas, tempo_retrabalho,
      unidades_produzidas, unidades_boas, unidades_refugadas,
      velocidade_nominal,
      disponibilidade, performance, qualidade, oee,
      meta_oee
    ) VALUES (
      NEW.linha_id, NEW.id, NEW.produto_id, NEW.turno_id, NEW.data_producao,
      v_oee.tempo_calendario, v_oee.tempo_disponivel, v_oee.tempo_operacao,
      v_oee.tempo_operacional_liquido, v_oee.tempo_valioso,
      v_oee.tempo_paradas_estrategicas, v_oee.tempo_paradas_planejadas,
      v_oee.tempo_paradas_nao_planejadas, v_oee.tempo_retrabalho,
      v_oee.unidades_produzidas, v_oee.unidades_boas, v_oee.unidades_refugadas,
      v_oee.velocidade_nominal,
      v_oee.disponibilidade, v_oee.performance, v_oee.qualidade, v_oee.oee,
      v_meta
    )
    ON CONFLICT (lote_id) DO UPDATE SET
      tempo_calendario = EXCLUDED.tempo_calendario,
      tempo_disponivel = EXCLUDED.tempo_disponivel,
      tempo_operacao = EXCLUDED.tempo_operacao,
      tempo_operacional_liquido = EXCLUDED.tempo_operacional_liquido,
      tempo_valioso = EXCLUDED.tempo_valioso,
      tempo_paradas_estrategicas = EXCLUDED.tempo_paradas_estrategicas,
      tempo_paradas_planejadas = EXCLUDED.tempo_paradas_planejadas,
      tempo_paradas_nao_planejadas = EXCLUDED.tempo_paradas_nao_planejadas,
      tempo_retrabalho = EXCLUDED.tempo_retrabalho,
      unidades_produzidas = EXCLUDED.unidades_produzidas,
      unidades_boas = EXCLUDED.unidades_boas,
      unidades_refugadas = EXCLUDED.unidades_refugadas,
      velocidade_nominal = EXCLUDED.velocidade_nominal,
      disponibilidade = EXCLUDED.disponibilidade,
      performance = EXCLUDED.performance,
      qualidade = EXCLUDED.qualidade,
      oee = EXCLUDED.oee,
      meta_oee = EXCLUDED.meta_oee,
      calculado_em = NOW(),
      recalcular = FALSE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cache_oee_lote_concluido IS 'Trigger function que popula cache de OEE quando lote é concluído';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- Próximo script: 04-triggers.sql
