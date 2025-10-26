# Epic 4: Cálculo de OEE & View Materializada

[← Voltar ao Índice](./index.md)

---


## Epic 4: Cálculo de OEE & View Materializada

**Objetivo Expandido:** Implementar todas as fórmulas de OEE validadas conforme docs/project/05-Metodologia-Calculo.md, criando view materializada PostgreSQL que agrega Disponibilidade, Performance e Qualidade por linha/turno/dia/semana/mês. View refresh via pg_cron (1h no MVP). Cálculos devem ser validados por Gerente de Processos (Sávio Rafael) com margem de tolerância ±2% comparado a planilhas de referência. Sistema calcula cada componente separadamente (não apenas OEE final) para permitir análise detalhada.

### Story 4.1: Implementar Funções SQL de Cálculo de Disponibilidade

**Como** analista de dados,
**Eu quero** função SQL que calcula Disponibilidade conforme metodologia validada,
**Para que** view materializada use fórmulas corretas e auditáveis.

#### Acceptance Criteria

1. Migration criada: `20250104000000_oee_calculation_functions.sql`
2. Função `calculate_disponibilidade(linha_id, data_inicio, data_fim) RETURNS numeric`:
   - Tempo Calendário = diferença em horas entre data_fim e data_inicio
   - Paradas Estratégicas = SUM(duracao_minutos) WHERE tipo_parada = 'Estratégica' / 60
   - Tempo Disponível = Tempo Calendário - Paradas Estratégicas
   - Paradas de Indisponibilidade = SUM(duracao_minutos) WHERE tipo_parada IN ('Planejada', 'Não Planejada') AND duracao >= 10 / 60 (pequenas paradas < 10min não entram aqui)
   - Tempo de Operação = Tempo Disponível - Paradas de Indisponibilidade
   - Disponibilidade (%) = (Tempo de Operação / Tempo Disponível) × 100
3. Todas as conversões em **horas** (não minutos ou segundos)
4. Retorna NULL se Tempo Disponível = 0 (evitar divisão por zero)
5. Comentários SQL documentando cada step da fórmula (rastreabilidade para auditoria)
6. Unit test SQL: `SELECT calculate_disponibilidade('linha_a_id', '2026-01-01', '2026-01-02')` → deve retornar valor esperado de planilha de validação

---

### Story 4.2: Implementar Funções SQL de Cálculo de Performance

**Como** analista de dados,
**Eu quero** função SQL que calcula Performance considerando velocidade nominal por SKU,
**Para que** cálculos reflitam produtividade real de cada produto.

#### Acceptance Criteria

1. Função `calculate_performance(linha_id, data_inicio, data_fim) RETURNS numeric`:
   - Unidades Produzidas = SUM(producao_acumulada) FROM ordens_producao_ativas WHERE linha_id = ? AND updated_at BETWEEN data_inicio AND data_fim
   - Velocidade Nominal = JOIN com `linhas` → `velocidade_nominal_padrao` (ou por SKU se ordens_producao_ativas tiver sku_id FK)
   - Tempo Operacional Líquido = Unidades Produzidas / Velocidade Nominal (em horas)
   - Tempo de Operação = valor retornado de `calculate_disponibilidade()` (reutiliza função anterior)
   - Performance (%) = (Tempo Operacional Líquido / Tempo de Operação) × 100
2. Pequenas paradas (< 10min) impactam Performance (não Disponibilidade) - fórmula automaticamente captura isso
3. Retorna NULL se Tempo de Operação = 0
4. Documentação SQL: "Performance mede velocidade real vs ideal, incluindo impacto de pequenas paradas"
5. Unit test: validar com planilha de referência (±2% tolerância)

---

### Story 4.3: Implementar Funções SQL de Cálculo de Qualidade

**Como** analista de dados,
**Eu quero** função SQL que calcula Qualidade considerando refugo e retrabalho,
**Para que** OEE reflita perdas de qualidade corretamente.

#### Acceptance Criteria

1. Função `calculate_qualidade(linha_id, data_inicio, data_fim) RETURNS numeric`:
   - Unidades Produzidas = SUM(producao_acumulada) FROM ordens_producao_ativas
   - Unidades Rejeitadas = SUM(rejeicao_acumulada) FROM ordens_producao_ativas
   - Unidades Boas = Unidades Produzidas - Unidades Rejeitadas
   - Qualidade_Unidades (%) = (Unidades Boas / Unidades Produzidas) × 100
   - Tempo de Retrabalho = SUM(duracao_minutos) WHERE tipo_evento = 'Retrabalho' / 60
   - Tempo de Operação = valor de `calculate_disponibilidade()`
   - Qualidade_Retrabalho (%) = ((Tempo de Operação - Tempo de Retrabalho) / Tempo de Operação) × 100
   - Qualidade Total (%) = Qualidade_Unidades × Qualidade_Retrabalho
2. Retorna 100% se não houver rejeições nem retrabalho
3. Retorna NULL se Unidades Produzidas = 0
4. Documentação: "Retrabalho é perda de qualidade, não indisponibilidade"
5. Unit test: validar fórmula dupla (unidades + retrabalho) com planilha

---

### Story 4.4: Criar View Materializada `oee_agregado`

**Como** gestor,
**Eu quero** view materializada com OEE pré-calculado por linha e período,
**Para que** dashboards carreguem rapidamente sem recalcular a cada query.

#### Acceptance Criteria

1. Migration criada: `20250105000000_oee_materialized_view.sql`
2. View materializada `oee_agregado`:
   - Colunas: linha_id, setor_id, periodo_tipo (enum: dia, semana, mes), periodo_inicio (date), periodo_fim (date), disponibilidade (numeric), performance (numeric), qualidade (numeric), oee (numeric), updated_at (timestamp)
3. Query base da view:
   ```sql
   SELECT
     l.id as linha_id,
     l.setor_id,
     'dia'::text as periodo_tipo,
     d.data as periodo_inicio,
     d.data as periodo_fim,
     calculate_disponibilidade(l.id, d.data, d.data + interval '1 day') as disponibilidade,
     calculate_performance(l.id, d.data, d.data + interval '1 day') as performance,
     calculate_qualidade(l.id, d.data, d.data + interval '1 day') as qualidade,
     calculate_disponibilidade(...) * calculate_performance(...) * calculate_qualidade(...) / 10000 as oee,
     now() as updated_at
   FROM linhas l
   CROSS JOIN generate_series('2026-01-01', current_date, '1 day') d(data)
   WHERE l.is_ativo = true
   ```
4. UNION com agregações por semana (generate_series com '1 week')
5. UNION com agregações por mês (generate_series com '1 month')
6. View usa índices em `apontamentos(linha_id, timestamp_ocorrencia)` e `ordens_producao_ativas(linha_id, updated_at)`
7. Comando refresh: `REFRESH MATERIALIZED VIEW CONCURRENTLY oee_agregado;`
8. CONCURRENTLY permite queries continuarem durante refresh (não bloqueia leitura)

---

### Story 4.5: Configurar pg_cron para Refresh Automático da View

**Como** desenvolvedor,
**Eu quero** view materializada atualizada automaticamente a cada 1 hora,
**Para que** dashboards sempre mostrem dados recentes sem intervenção manual.

#### Acceptance Criteria

1. Extensão pg_cron habilitada no Supabase: `CREATE EXTENSION pg_cron;`
2. Job pg_cron criado:
   ```sql
   SELECT cron.schedule(
     'refresh-oee-view',
     '0 * * * *', -- a cada hora, no minuto 0
     $$REFRESH MATERIALIZED VIEW CONCURRENTLY oee_agregado;$$
   );
   ```
3. Job status verificável via: `SELECT * FROM cron.job;`
4. Logs de execução em `cron.job_run_details`: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`
5. Alerta configurado (Supabase Dashboard ou email): se job falhar 3x consecutivas, notificar admin
6. Documentação: como pausar/retomar job (`SELECT cron.unschedule('refresh-oee-view');`)
7. Teste manual: forçar refresh `REFRESH MATERIALIZED VIEW oee_agregado;` → verificar `updated_at` atualizado

---

### Story 4.6: Criar Indicadores Secundários (MTBF, MTTR, Taxa de Utilização)

**Como** gestor de manutenção,
**Eu quero** visualizar MTBF e MTTR das linhas,
**Para que** eu priorize manutenção preditiva e reduza paradas não planejadas.

#### Acceptance Criteria

1. Função `calculate_mtbf(linha_id, data_inicio, data_fim) RETURNS numeric`:
   - Tempo Total de Operação (horas) = SUM(Tempo de Operação) por dia no período
   - Número de Falhas = COUNT(apontamentos) WHERE tipo_parada LIKE 'Quebra%' OR tipo_parada LIKE 'Falha%'
   - MTBF (horas) = Tempo Total de Operação / Número de Falhas
   - Retorna NULL se Número de Falhas = 0
2. Função `calculate_mttr(linha_id, data_inicio, data_fim) RETURNS numeric`:
   - Tempo Total de Reparo (horas) = SUM(duracao_minutos) WHERE tipo_parada LIKE 'Quebra%' OR 'Falha%' / 60
   - Número de Reparos = COUNT(apontamentos) WHERE tipo_parada LIKE 'Quebra%' OR 'Falha%'
   - MTTR (horas) = Tempo Total de Reparo / Número de Reparos
   - Retorna NULL se Número de Reparos = 0
3. Função `calculate_taxa_utilizacao(linha_id, data_inicio, data_fim) RETURNS numeric`:
   - Taxa de Utilização (%) = (Tempo de Operação / Tempo Calendário) × 100
   - Diferença vs OEE: usa Tempo Calendário (não Tempo Disponível) como denominador
4. View materializada `indicadores_secundarios_agregado`:
   - Colunas: linha_id, periodo_tipo, periodo_inicio, periodo_fim, mtbf, mttr, taxa_utilizacao, updated_at
   - Refresh via mesmo job pg_cron (adicionar linha no schedule)
5. Documentação: "MTBF alto = confiável, MTTR baixo = manutenção rápida"
6. Unit tests: validar fórmulas com planilhas de referência

---

### Story 4.7: Validar Cálculos de OEE com Gerente de Processos

**Como** Sávio Rafael (Gerente de Processos),
**Eu quero** comparar OEE calculado pelo sistema com minhas planilhas de validação,
**Para que** eu aprove que cálculos estão corretos antes do sistema ir para produção.

#### Acceptance Criteria

1. Planilhas de validação fornecidas por Sávio Rafael (Excel ou Google Sheets) com:
   - Dados de entrada: linha, período, apontamentos, sensores (producao/rejeicao)
   - Cálculos esperados: Disponibilidade, Performance, Qualidade, OEE
2. Script de teste automatizado `scripts/validate-oee-calculations.ts`:
   - Lê planilha de validação (biblioteca XLSX)
   - Para cada linha de teste: insere dados no Supabase (seed test data)
   - Executa `REFRESH MATERIALIZED VIEW oee_agregado;`
   - Query `SELECT * FROM oee_agregado WHERE linha_id = ? AND periodo = ?`
   - Compara resultados: `abs(sistema_oee - planilha_oee) <= 2%` (tolerância ±2%)
3. Report gerado: `docs/validation/oee-calculation-report.md`:
   - Lista de testes executados
   - Resultado: Pass/Fail para cada linha
   - Desvios > 2%: destacados com explicação
4. Reunião de validação com Sávio Rafael (Semana 3):
   - Demonstração ao vivo: inserir apontamento → refresh view → mostrar OEE calculado
   - Revisar report de validação juntos
   - Sávio aprova por escrito (email): "Cálculos de OEE aprovados, diferença dentro da tolerância"
5. Se reprovado (desvio > 2%): identificar fonte de erro (fórmula SQL errada, dados de teste incorretos, etc.) e corrigir
6. Aprovação de Sávio é requisito para Epic 5 (dashboards) - não adianta visualizar dados incorretos

---

**Fim do Epic 4**

Este epic é o cérebro do sistema - cálculos de OEE corretos são fundação para todas as decisões de negócio. Validação com Sávio Rafael é checkpoint crítico antes de visualizar dados.

---

