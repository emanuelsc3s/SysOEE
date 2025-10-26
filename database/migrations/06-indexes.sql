-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 06-indexes.sql
-- Descrição: Indexes para performance
-- Versão: 1.0
-- Data: 2025-10-25
-- =====================================================

-- =====================================================
-- INDEXES EM CADASTROS
-- =====================================================

-- tblinha
CREATE INDEX idx_linha_departamento ON tblinha(departamento_id) WHERE ativo = TRUE;
CREATE INDEX idx_linha_codigo ON tblinha(codigo) WHERE ativo = TRUE;
CREATE INDEX idx_linha_tipo ON tblinha(tipo) WHERE ativo = TRUE;

-- tbsku
CREATE INDEX idx_sku_totvs ON tbsku(codigo_totvs) WHERE ativo = TRUE;
CREATE INDEX idx_sku_categoria ON tbsku(categoria) WHERE ativo = TRUE;

-- tbinsumo
CREATE INDEX idx_insumo_totvs ON tbinsumo(codigo_totvs) WHERE ativo = TRUE;
CREATE INDEX idx_insumo_categoria ON tbinsumo(categoria) WHERE ativo = TRUE;

-- tbloteinsumo
CREATE INDEX idx_lote_insumo_numero ON tbloteinsumo(numero_lote);
CREATE INDEX idx_lote_insumo_insumo ON tbloteinsumo(insumo_id);
CREATE INDEX idx_lote_insumo_status ON tbloteinsumo(status);

-- tbvelocidadenominal (CRÍTICO para cálculos)
CREATE INDEX idx_velocidade_linha_sku ON tbvelocidadenominal(linha_id, sku_id);
CREATE INDEX idx_velocidade_vigencia ON tbvelocidadenominal(data_inicio_vigencia, data_fim_vigencia);
CREATE INDEX idx_velocidade_linha_sku_vigente ON tbvelocidadenominal(linha_id, sku_id, data_inicio_vigencia)
  WHERE data_fim_vigencia IS NULL;

-- tbcodigoparada
CREATE INDEX idx_codigo_parada_linha ON tbcodigoparada(linha_id) WHERE ativo = TRUE;
CREATE INDEX idx_codigo_parada_tipo ON tbcodigoparada(tipo_parada) WHERE ativo = TRUE;
CREATE INDEX idx_codigo_parada_codigo ON tbcodigoparada(codigo) WHERE ativo = TRUE;

-- tbturno
CREATE INDEX idx_turno_codigo ON tbturno(codigo) WHERE ativo = TRUE;

-- tbusuario
CREATE INDEX idx_usuario_matricula ON tbusuario(matricula) WHERE ativo = TRUE;
CREATE INDEX idx_usuario_email ON tbusuario(email) WHERE ativo = TRUE;
CREATE INDEX idx_usuario_linha ON tbusuario(linha_id) WHERE ativo = TRUE;
CREATE INDEX idx_usuario_departamento ON tbusuario(departamento_id) WHERE ativo = TRUE;
CREATE INDEX idx_usuario_tipo ON tbusuario(tipo_usuario) WHERE ativo = TRUE;

-- tbmetaoee
CREATE INDEX idx_meta_oee_linha_vigencia ON tbmetaoee(linha_id, data_inicio_vigencia, data_fim_vigencia);
CREATE INDEX idx_meta_oee_vigente ON tbmetaoee(linha_id, data_inicio_vigencia)
  WHERE data_fim_vigencia IS NULL AND ativo = TRUE;

-- =====================================================
-- INDEXES EM TRANSAÇÕES (CRÍTICO PARA PERFORMANCE!)
-- =====================================================

-- tblote (queries mais frequentes)
CREATE INDEX idx_lote_linha_data ON tblote(linha_id, data_producao DESC);
CREATE INDEX idx_lote_status ON tblote(status, data_producao DESC);
CREATE INDEX idx_lote_status_linha ON tblote(status, linha_id, data_producao DESC);
CREATE INDEX idx_lote_numero ON tblote(numero_lote);
CREATE INDEX idx_lote_sku ON tblote(sku_id, data_producao DESC);
CREATE INDEX idx_lote_turno ON tblote(turno_id, data_producao DESC);
CREATE INDEX idx_lote_totvs_op ON tblote(origem_totvs_op) WHERE origem_totvs_op IS NOT NULL;
CREATE INDEX idx_lote_em_andamento ON tblote(linha_id, status) WHERE status = 'EM_ANDAMENTO';

-- tbapontamentoparada (queries de dashboard e Pareto)
CREATE INDEX idx_apontamento_parada_lote ON tbapontamentoparada(lote_id);
CREATE INDEX idx_apontamento_parada_linha_data ON tbapontamentoparada(linha_id, data_parada DESC);
CREATE INDEX idx_apontamento_parada_codigo ON tbapontamentoparada(codigo_parada_id);
CREATE INDEX idx_apontamento_parada_turno ON tbapontamentoparada(turno_id);
CREATE INDEX idx_apontamento_parada_operador ON tbapontamentoparada(criado_por_operador);
CREATE INDEX idx_apontamento_parada_supervisor ON tbapontamentoparada(conferido_por_supervisor);
CREATE INDEX idx_apontamento_parada_pendente ON tbapontamentoparada(linha_id, data_parada)
  WHERE conferido_em IS NULL;
CREATE INDEX idx_apontamento_parada_finalizada ON tbapontamentoparada(linha_id, data_parada)
  WHERE hora_fim IS NOT NULL;

-- tbapontamentoproducao
CREATE INDEX idx_apontamento_producao_lote ON tbapontamentoproducao(lote_id);
CREATE INDEX idx_apontamento_producao_linha_data ON tbapontamentoproducao(linha_id, data_apontamento DESC);
CREATE INDEX idx_apontamento_producao_turno ON tbapontamentoproducao(turno_id);
CREATE INDEX idx_apontamento_producao_fonte ON tbapontamentoproducao(fonte_dados);
CREATE INDEX idx_apontamento_producao_clp ON tbapontamentoproducao(linha_id, clp_timestamp)
  WHERE fonte_dados = 'CLP_AUTOMATICO';

-- tbapontamentoqualidade
CREATE INDEX idx_apontamento_qualidade_lote ON tbapontamentoqualidade(lote_id);
CREATE INDEX idx_apontamento_qualidade_linha_data ON tbapontamentoqualidade(linha_id, data_apontamento DESC);
CREATE INDEX idx_apontamento_qualidade_turno ON tbapontamentoqualidade(turno_id);
CREATE INDEX idx_apontamento_qualidade_tipo ON tbapontamentoqualidade(tipo_perda);
CREATE INDEX idx_apontamento_qualidade_totvs ON tbapontamentoqualidade(lote_id, totvs_integrado)
  WHERE totvs_integrado = FALSE;

-- =====================================================
-- INDEXES EM CACHE E AUDITORIA
-- =====================================================

-- tboeecalculado (queries de dashboard e relatórios)
CREATE INDEX idx_oee_calc_linha_data ON tboeecalculado(linha_id, data_referencia DESC);
CREATE INDEX idx_oee_calc_sku_data ON tboeecalculado(sku_id, data_referencia DESC);
CREATE INDEX idx_oee_calc_turno ON tboeecalculado(turno_id, data_referencia DESC);
CREATE INDEX idx_oee_calc_meta_nao_atingida ON tboeecalculado(linha_id, data_referencia DESC)
  WHERE atingiu_meta = FALSE;
CREATE INDEX idx_oee_calc_recalcular ON tboeecalculado(linha_id)
  WHERE recalcular = TRUE;

-- tbauditlog (queries de auditoria e investigação)
CREATE INDEX idx_audit_tabela_registro ON tbauditlog(tabela, registro_id, timestamp DESC);
CREATE INDEX idx_audit_usuario ON tbauditlog(usuario_id, timestamp DESC);
CREATE INDEX idx_audit_timestamp ON tbauditlog(timestamp DESC);
CREATE INDEX idx_audit_operacao ON tbauditlog(tabela, operacao, timestamp DESC);
CREATE INDEX idx_audit_tabela ON tbauditlog(tabela, timestamp DESC);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- Próximo script: 07-rls-policies.sql
--
-- Resumo: 40+ indexes criados
-- - Cadastros: ~20 indexes
-- - Transações: ~20 indexes (CRÍTICOS)
-- - Cache/Auditoria: ~10 indexes
--
-- Performance esperada:
-- - Queries de dashboard: < 100ms
-- - Cálculo de OEE: < 500ms
-- - Pareto de paradas: < 200ms
-- - Auditoria: < 100ms
