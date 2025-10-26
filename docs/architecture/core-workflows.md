# Core Workflows

[← Voltar para Índice](./index.md)

## 4. Core Workflows

### Visão Geral

Workflows críticos do sistema com diagramas de sequência detalhados:

1. **Apontamento de Parada** (CRÍTICO - ALCOA+ Contemporâneo)
2. **Apontamento de Produção** (CLP + Manual)
3. **Apontamento de Qualidade** (Refugo/Retrabalho)
4. **Abertura de Lote via TOTVS**
5. **Conclusão de Lote e Cálculo de OEE**
6. **Conferência e Assinatura do Diário de Bordo**
7. **Sincronização TOTVS** (Produtos, Insumos, Lotes)
8. **Visualização de Dashboard OEE** (Tempo Real)

### 4.1. Workflow: Apontamento de Parada

**Importância:** Workflow **MAIS CRÍTICO**. Paradas devem ser registradas **CONTEMPORANEAMENTE** (ALCOA+).

**Atores:** Operador, Supervisor, Sistema

**Fluxo Principal:**

1. **Início de Parada:**
   - Operador clica "Registrar Parada"
   - Sistema captura timestamp atual (contemporaneidade)
   - Operador seleciona código de parada (do book da linha)
   - Sistema valida: hora_inicio <= NOW() + 5 min
   - INSERT em `tbapontamentoparada` (hora_fim = NULL)
   - Trigger de auditoria registra em `tbauditlog`
   - Frontend exibe timer visual da parada

2. **Fim de Parada:**
   - Operador clica "Finalizar Parada"
   - Sistema captura hora_fim = NOW()
   - UPDATE `tbapontamentoparada` (calcula duracao_minutos)
   - Trigger de auditoria registra UPDATE
   - Frontend para timer e exibe duração final

3. **Conferência (Opcional/Assíncrono):**
   - Supervisor acessa "Paradas Pendentes"
   - Revisa paradas não conferidas
   - Confirma parada (UPDATE conferido_por_supervisor, conferido_em)

**Regras de Negócio:**
- ✅ Contemporaneidade obrigatória (tolerância 5 min)
- ✅ Atribuibilidade: `criado_por_operador` sempre preenchido
- ✅ Completude: TODAS paradas registradas (mesmo < 10 min)
- ✅ Auditoria automática via trigger
- ⚠️ Pequenas paradas (< 10 min): impacta_disponibilidade = FALSE → afeta Performance

**Tratamento de Erros:**
- Parada não contemporânea: Erro 422 "Parada deve ser contemporânea"
- Operador sem permissão: RLS Policy bloqueia (403 Forbidden)

### 4.2. Workflow: Apontamento de Produção

**Fontes:** CLP Automático (envase) ou Manual (embalagem)
   - INSERT em `tbapontamentoparada` (hora_fim = NULL)
   - Trigger de auditoria registra em `tbauditlog`

   - UPDATE `tbapontamentoparada` (calcula duracao_minutos)
**Fluxo CLP Automático:**

1. CLP lê contador de produção (a cada 5 min)
2. POST para Supabase Edge Function `/webhook/producao`
   - INSERT em `tbapontamentoproducao` (fonte: CLP_AUTOMATICO, preserva clp_timestamp)
   - Trigger `atualizar_totais_lote()` atualiza `tblote.unidades_produzidas`
3. Edge Function valida token e busca linha + lote
    - POST para `tbapontamentoproducao` (fonte: MANUAL)
4. INSERT em `tbapontamentoproducao` (fonte: CLP_AUTOMATICO, preserva clp_timestamp)
5. Trigger `atualizar_totais_lote()` atualiza `tblote.unidades_produzidas`
6. Sistema retorna 200 OK ao CLP

   - POST para `tbapontamentoqualidade` (tipo: REFUGO)
   - Trigger atualiza `tblote` (unidades_refugo, unidades_boas)
**Fluxo Manual (Embalagem):**

   - POST para `tbapontamentoqualidade` (tipo: RETRABALHO)
   - Trigger atualiza `tblote.tempo_retrabalho_minutos`
1. Operador acessa "Apontar Produção"
2. Sistema exibe lote(s) em andamento
3. Operador informa contagem física (ex: 32.400 unidades)
   - INSERT em `tblote` (status: EM_ANDAMENTO, origem_totvs_op)
4. Frontend calcula delta e valida integridade
5. POST para `tbapontamentoproducao` (fonte: MANUAL)
6. Trigger atualiza totais do lote
   - PATCH `/tblote/{id}` (status: CONCLUIDO, hora_fim)
7. Frontend exibe confirmação
   - INSERT em `tboeecalculado` (todos componentes + meta + flag atingiu_meta)

**Integração TOTVS (Validação):**
- Operador pode sincronizar produção com TOTVS
- Edge Function envia dados para API local TOTVS
- TOTVS valida e registra produção
- Em caso de divergência, alerta operador

**Regras:**
- ✅ CLP Timestamp original preservado (ALCOA+ Original)
- ✅ Integridade TOTVS: quantidade deve ser idêntica
- ✅ Trigger mantém campos calculados atualizados

### 4.3. Workflow: Apontamento de Qualidade

**Tipos:** Refugo (unidades descartadas) ou Retrabalho (tempo gasto)

**Fluxo Refugo:**

1. Operador clica "Registrar Refugo"
2. Informa quantidade e motivo (ex: 5.000 unidades, "Contaminação")
3. POST para `tbapontamentoqualidade` (tipo: REFUGO)
4. Trigger atualiza `tblote` (unidades_refugo, unidades_boas)
5. **CRÍTICO:** Operador DEVE sincronizar com TOTVS
6. Edge Function envia para TOTVS API
7. TOTVS registra perda e atualiza estoque
8. UPDATE `totvs_integrado = TRUE`

**Fluxo Retrabalho:**

1. Operador clica "Registrar Retrabalho"
2. Informa tempo (ex: 45 minutos, "Reinspeção")
3. POST para `tbapontamentoqualidade` (tipo: RETRABALHO)
4. Trigger atualiza `tblote.tempo_retrabalho_minutos`
5. **Importante:** Retrabalho afeta Qualidade, NÃO Disponibilidade!

**Validação:**
- Sistema bloqueia conclusão de lote se há refugo não integrado com TOTVS

### 4.4. Workflow: Abertura de Lote via TOTVS

**Trigger:** Quando OP (Ordem de Produção) é aberta no TOTVS

**Fluxo:**

1. **TOTVS Local:** Usuário abre OP (produto, linha, quantidade, data)
2. **App Sync Local:** Monitora tabela de OPs (CDC/Trigger)
3. Detecta nova OP e enfileira para sync (RabbitMQ/Redis)
4. POST para Supabase Edge Function `/criar-lote-totvs`
5. **Validações:**
   - Linha existe e ativa?
   - SKU existe e ativo?
   - Velocidade nominal configurada?
   - OP não duplicada?
6. INSERT em `tblote` (status: EM_ANDAMENTO, origem_totvs_op)
7. Supabase retorna lote_id
8. App Sync atualiza OP no TOTVS (registra lote_id SicFar)
9. **Realtime:** Supabase Realtime notifica frontend
10. Frontend exibe toast "Novo lote iniciado!"

**Retry Strategy:**
- Fila local com retry exponencial (1min, 5min, 15min)
- Máximo 10 tentativas
- Dead Letter Queue + alerta TI se falhar

**Erros Tratados:**
- SKU não cadastrado: Erro + alerta para cadastrar antes de abrir OP
- Velocidade não configurada: Alerta para configurar antes de produzir

### 4.5. Workflow: Conclusão de Lote e Cálculo de OEE

**Trigger:** Operador conclui lote

**Fluxo:**

1. Operador clica "Concluir Lote"
2. Frontend valida pré-requisitos:
   - Hora fim preenchida
   - Produção > 0
   - Sem paradas em aberto
   - Refugo sincronizado TOTVS
3. Se pendências: Frontend lista para operador corrigir
4. Operador confirma conclusão
5. PATCH `/tblote/{id}` (status: CONCLUIDO, hora_fim)
6. **Trigger: cache_oee_lote_concluido()** dispara automaticamente
7. **CALL calcular_oee_lote():**
   - Busca dados do lote (linha, SKU, turno, unidades)
   - Busca velocidade nominal vigente na data
   - Agrega paradas por tipo (estratégicas, planejadas, não planejadas)
   - **Calcula tempos:**
     - Tempo Calendário (duração do turno)
     - Tempo Disponível = Calendário - Estratégicas
     - Tempo Operação = Disponível - Paradas
   - **Calcula DISPONIBILIDADE:** (Tempo Operação / Tempo Disponível) × 100
   - **Calcula PERFORMANCE:** (Tempo Op. Líquido / Tempo Operação) × 100
     - Tempo Op. Líquido = Unidades Produzidas / Velocidade Nominal
   - **Calcula QUALIDADE:**
     - Qualidade Unidades = (Unidades Boas / Unidades Produzidas) × 100
     - Qualidade Retrabalho = ((Tempo Op - Tempo Retrabalho) / Tempo Op) × 100
     - Qualidade Total = Qualidade Unidades × Qualidade Retrabalho
   - **Calcula OEE FINAL:** Disponibilidade × Performance × Qualidade
8. Busca meta OEE vigente
9. INSERT em `tboeecalculado` (todos componentes + meta + flag atingiu_meta)
10. Frontend exibe resultado detalhado:
    - Velocímetro de OEE
    - Breakdown dos componentes
    - Principais perdas
11. **Realtime:** Dashboard é atualizado automaticamente

**Fórmulas Implementadas (Atividade 05):**
```
Tempo Disponível = Tempo Calendário - Paradas Estratégicas
Disponibilidade (%) = (Tempo Operação / Tempo Disponível) × 100
Performance (%) = (Tempo Op. Líquido / Tempo Operação) × 100
  onde: Tempo Op. Líquido = Unidades Produzidas / Velocidade Nominal (Und/h)
Qualidade (%) = Qualidade_Unidades × Qualidade_Retrabalho
OEE (%) = Disponibilidade × Performance × Qualidade
```

### 4.6. Workflow: Conferência e Assinatura do Diário de Bordo

**Objetivo:** Assinatura eletrônica (ALCOA+) + geração de PDF para backup físico (BPF)

**Fluxo:**

1. **Consulta:** Supervisor acessa "Diários Pendentes"
2. Sistema lista lotes não conferidos (WHERE conferido_em IS NULL)
3. Supervisor seleciona lote
4. Sistema renderiza Diário de Bordo completo:
   - Cabeçalho (Data, Turno, Linha)
   - Produção por lote (Inicial, Atual, Horas)
   - Paradas (Código, Início, Fim, Duração)
   - Totalizadores (Produção total, Refugo total)
   - Operador responsável
5. **Ajustes (se necessário):**
   - Supervisor pode ajustar observações de paradas
   - Alterações auditadas (campo alterado + motivo)
6. **Assinatura Eletrônica:**
   - Supervisor clica "Assinar Diário"
   - Sistema valida (autenticado, setor correto, paradas finalizadas)
   - Modal de confirmação (pode pedir senha)
   - UPDATE `conferido_por_supervisor` + `conferido_em` = NOW()
   - Audit Log registra ato de assinatura (timestamp, IP)
7. **Geração de PDF:**
   - Supervisor clica "Gerar PDF para Impressão"
   - Edge Function busca dados completos (view diario_bordo)
   - Renderiza PDF (puppeteer/jsPDF):
     - Logo Farmace
     - Layout estruturado (cabeçalho, tabelas, totais)
     - Área de assinaturas com timestamps
     - Marca d'água "DOCUMENTO CONTROLADO"
   - Upload para Supabase Storage (bucket: diarios-bordo)
   - UPDATE `pdf_url` + `pdf_gerado_em` no lote
   - Retorna URL assinada (24h)
8. Frontend abre PDF em nova aba
9. Supervisor pode visualizar/imprimir/baixar

**Assinatura Eletrônica (ALCOA+):**
- `conferido_por_supervisor` + `conferido_em` = assinatura digital válida
- PDF inclui: "Assinado eletronicamente por [Nome] em [Data/Hora]"
- Conforme princípios: Atribuível + Contemporâneo + Durável

**Backup Físico:**
- PDF permanece no Storage para auditorias
- Retenção conforme BPF (mínimo 5 anos)
- PDF impresso guardado fisicamente (não gerenciado pelo sistema)

### 4.7. Workflow: Sincronização TOTVS

**Arquitetura:** App Sync local no servidor TOTVS monitora mudanças e envia para Supabase Cloud

**4.7.1. Sincronização de Produtos (SKUs)**

**Fluxo:**
1. TOTVS: Usuário cadastra novo produto
2. TOTVS: INSERT na tabela de produtos
3. App Sync: Detecta via CDC/Trigger/Polling (30s)
4. App Sync: Enfileira para sync (RabbitMQ/Redis)
5. POST para Supabase Edge Function `/sync-sku`
6. Supabase: UPSERT em `tbsku` (ON CONFLICT codigo_totvs DO UPDATE)
7. Supabase: Atualiza `totvs_sincronizado_em`
8. Retorna 200 OK
9. App Sync: ACK mensagem (sucesso)

**Retry com Backoff:**
- Falha de rede: NACK + retry (1min, 5min, 15min)
- Máximo 10 tentativas
- Dead Letter Queue + alerta TI se exceder

**4.7.2. Sincronização de Insumos e Lotes de Insumos**

Similar ao fluxo de SKUs:
- Compras registra novo lote de insumo no TOTVS
- App Sync detecta e envia para Supabase
- Supabase cria/atualiza `tbinsumo` + INSERT `tbloteinsumo`

**4.7.3. Sincronização Bidirecional (Refugo)**

**Fluxo:**
1. **SicFar → TOTVS:** Operador registra refugo no SicFar
2. Frontend: POST `/tbapontamentoqualidade` (totvs_integrado = FALSE)
3. Frontend: POST `/functions/v1/sync-totvs-qualidade`
4. Edge Function: Monta payload e envia para **Webhook Reverso**
5. **Supabase → Servidor Local:** POST para App Sync local
6. App Sync: Valida assinatura webhook
7. App Sync: Registra perda na OP do TOTVS (movimentação estoque)
8. TOTVS: Atualiza estoque
9. Retorna 200 OK + timestamp
10. Supabase: UPDATE `totvs_integrado = TRUE`, `totvs_timestamp`

**Webhook Reverso:**
- Supabase chama servidor local via IP público/VPN
- Autenticação via token
- SSL/TLS obrigatório

**4.7.4. Monitoramento (Heartbeat)**

**Fluxo:**
1. App Sync: Health check a cada 5 minutos
2. POST `/functions/v1/health` com timestamp
3. Supabase: UPDATE `tb_sync_status` (tabela de controle)
4. Registra `last_heartbeat`, `last_sync_produtos`, etc.

**Alertas:**
- Se heartbeat ausente > 10 min:
  - Realtime envia evento para frontend
  - Frontend exibe banner vermelho "SINCRONIZAÇÃO OFFLINE"
  - Email automático para TI

**Infraestrutura Necessária:**
```
Servidor Local TOTVS:
├── App Sync (Node.js/C#/.NET)
├── Fila Local (Redis/RabbitMQ)
├── Webhook Listener (Express/ASP.NET)
└── Logs (Winston/Serilog)

Conectividade:
- IP Fixo ou VPN site-to-site
- Webhook público com autenticação
- SSL/TLS
```

### 4.8. Workflow: Dashboard OEE (Tempo Real)

**Objetivo:** Exibir indicadores em tempo real com atualização automática (Supabase Realtime)

**Fluxo:**

1. **Acesso ao Dashboard:**
   - Gestor acessa Dashboard OEE
   - Frontend autentica (Supabase Auth)
   - Estabelece conexão Realtime (channel: 'dashboard')
   - Subscribe a mudanças em `tboeecalculado`

2. **Carga Inicial:**
   - GET `/rpc/vw_dashboard_oee_linha`
   - RLS permite gestor ver todas 37 linhas
   - Retorna OEE atual de cada linha

3. **Renderização:**
   - **Velocímetros de OEE:** Gauge charts por linha
     - Verde: ≥ 85%, Amarelo: 70-84%, Vermelho: < 70%
   - **Componentes OEE:** Barras comparativas (Disponibilidade, Performance, Qualidade)
   - **Pareto de Paradas:** Top 10 causas (principal ferramenta de gestão!)
     - Linha 80/20 destacada
     - Drill-down para 5 níveis de hierarquia
   - **Tendência Semanal:** Line chart (últimas 10 semanas)
     - OEE Real vs Meta
   - **MTBF / MTTR:** Cards com indicadores secundários
   - **Tabelas Consolidadas:** OEE por linha/turno/período
   - **Gráfico de Rosca:** Paradas Planejadas vs Não Planejadas
   - **Barras Empilhadas:** Resumo de Horas (Calendário → Valioso)

4. **Atualização em Tempo Real:**
   - Operador conclui lote (Workflow 5)
   - Trigger: INSERT em `tboeecalculado`
   - PostgreSQL → Supabase Realtime: Change Event
   - Realtime broadcast para subscribers do canal 'dashboard'
   - Frontend: handleUpdate(payload)
   - Re-renderiza componentes sem reload
   - Exibe notificação: "SPEP-ENV-A: Novo OEE 78.2% (↑ 2.7%)"

5. **Filtros e Drill-Down:**
   - Gestor seleciona filtros (Setor, Período, Tipo parada)
   - Frontend atualiza queries e re-renderiza
   - Clique em barra do Pareto → Drill-down detalhado

6. **Export e Relatórios:**
   - Gestor clica "Exportar Relatório"
   - POST `/functions/v1/gerar-relatorio-oee`
   - Edge Function gera PDF com gráficos e tabelas
   - Upload para Storage
   - Download automático

7. **Alertas Automáticos:**
   - **OEE abaixo da meta:** Trigger detecta oee < meta × 0.9
     - Realtime: Alert event
     - Frontend: Banner vermelho + notificação sonora
   - **Parada prolongada (> 2h):** Trigger detecta parada em aberto
     - Frontend: Alerta crítico

**Componentes do Dashboard:**

1. Visão Geral: Cards por setor + Ranking + Alertas
2. Velocímetros: Gauge por linha (cores por faixa)
3. Componentes OEE: Barras lado a lado
4. **Pareto de Paradas:** Top 10 + drill-down (PRINCIPAL!)
5. Tendência: Line chart histórico
6. MTBF/MTTR: Evolução ao longo do tempo
7. Tabelas: Consolidação com filtros
8. Rosca: Planejadas vs Não Planejadas
9. Barras Empilhadas: Fluxo de horas

**Performance:**
-- Cache em `tboeecalculado` garante queries rápidas
- Views materializadas para agregações
- Indexes otimizados

---

