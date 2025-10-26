# Epic 3: Apontamentos Contemporâneos & Integração IoT

[← Voltar ao Índice](./index.md)

---


## Epic 3: Apontamentos Contemporâneos & Integração IoT

**Objetivo Expandido:** Habilitar operadores a registrar apontamentos de paradas, perdas de qualidade e trocas de turno através de formulário simples e rápido (<30s por registro), com validação em tempo real, feedback visual imediato e funcionamento 100% offline. Gateway SICFAR integra sensores KEYENCE lendo arquivos TXT (4 registros/segundo), agregando contadores em memória por Ordem de Produção, e atualizando Supabase a cada 5 segundos. Operador consegue trabalhar turno completo (8h+) mesmo com internet instável.

### Story 3.1: Criar Formulário de Apontamento Contemporâneo (UI)

**Como** operador,
**Eu quero** registrar apontamento de parada em menos de 30 segundos com formulário simples,
**Para que** eu mantenha contemporaneidade (ALCOA+) sem atrasar minha produção.

#### Acceptance Criteria

1. Rota `/apontamento` (protegida, role: operador)
2. Layout vertical single-column (mobile-first, otimizado para telas 1366×768)
3. Campo "Linha" (Shadcn Select): dropdown pré-filtrado por setor do operador (via RLS), obrigatório
4. Campo "Turno" (auto-detectado): radio buttons desabilitados mostrando turno atual baseado em hora do sistema (6h-14h = Manhã, 14h-22h = Tarde, 22h-6h = Noite)
5. Campo "Tipo de Evento" (radio buttons grandes): Parada, Perda de Qualidade, Troca de Turno
6. Campo "Código de Parada" (Shadcn Combobox searchable): dropdown com descrição completa (ex: "P1.1 - Manutenção Planejada"), filtrado por Book da linha selecionada, obrigatório
7. Campo "Quantidade Afetada" (input numérico): opcional para Parada, obrigatório para Perda de Qualidade
8. Campo "Observações" (textarea): opcional, max 500 caracteres
9. Timestamp capturado automaticamente: `new Date().toISOString()` (não editável pelo usuário)
10. Botão primário: "Registrar Apontamento" (verde, full-width, loading state com spinner)
11. Validações Zod em tempo real: campos obrigatórios, quantidade > 0 se Perda, linha pertence ao setor do operador
12. Formulário limpa campos após registro bem-sucedido (ready para próximo apontamento)

---

### Story 3.2: Implementar Lógica de Salvamento Offline-First

**Como** operador,
**Eu quero** que apontamentos sejam salvos localmente se internet cair,
**Para que** eu não perca dados contemporâneos durante meu turno.

#### Acceptance Criteria

1. Service `ApontamentoService.save(apontamento)` implementado
2. Detectar status de conexão: `navigator.onLine` ou ping em Supabase
3. Se ONLINE: tentar INSERT direto em Supabase `apontamentos` table
4. Se INSERT sucesso: retornar `{ status: 'synced', id: uuid }`
5. Se OFFLINE ou INSERT falha: salvar em IndexedDB `pending_apontamentos`
6. Retornar `{ status: 'pending_local', id: uuid_local }`
7. Toast exibido conforme status:
   - Synced: "✓ Apontamento registrado e sincronizado"
   - Pending: "⚠ Salvo localmente - será sincronizado quando conexão retornar"
8. Background sync: `SyncService` tentando enviar pending_apontamentos a cada 10 segundos
9. Se sync bem-sucedido: remover de IndexedDB, atualizar badge de status no header
10. Teste manual: desconectar WiFi → registrar apontamento → deve salvar local → reconectar → deve sincronizar automaticamente

---

### Story 3.3: Adicionar Feedback Visual de Status de Sincronização

**Como** operador,
**Eu quero** ver claramente se sistema está online e quantos apontamentos estão pendentes,
**Para que** eu tenha confiança de que dados não serão perdidos.

#### Acceptance Criteria

1. Badge de status no header (sempre visível, canto superior direito)
2. Estados do badge:
   - **Online (verde):** "🟢 Online" - conexão Supabase OK
   - **Offline (amarelo):** "🟡 Offline - X pendentes" - sem conexão, X = count de pending_apontamentos
   - **Sincronizando (azul):** "🔵 Sincronizando..." - upload em progresso
   - **Erro (vermelho):** "🔴 Erro de conexão" - falha após 3 tentativas
3. Click no badge abre modal com detalhes: lista de apontamentos pendentes, última tentativa de sync, botão "Tentar Sincronizar Agora"
4. Polling a cada 5 segundos: verificar `navigator.onLine` e count de IndexedDB
5. Animação no badge quando sincronizando (pulse ou spinner)
6. Toast de sucesso quando todos pendentes forem sincronizados: "✓ Todos os apontamentos foram sincronizados"
7. Persistir estado do badge no localStorage (sobrevive a refresh da página)

---

### Story 3.4: Implementar Validação de Códigos de Parada por Book da Linha

**Como** operador,
**Eu quero** ver apenas códigos de parada válidos para minha linha,
**Para que** eu não registre códigos incorretos e cause inconsistência de dados.

#### Acceptance Criteria

1. Tabela `books_paradas` no schema: id (uuid PK), linha_id (uuid FK), codigo (text NOT NULL), classe (text), grande_parada (text), apontamento (text), grupo (text nullable), detalhamento (text nullable), is_ativo (boolean DEFAULT true)
2. Seed data: carregar Book de Paradas de SPEP (10 linhas × ~50 códigos cada = ~500 registros)
3. Query ao selecionar linha no formulário: `SELECT codigo, grande_parada, apontamento FROM books_paradas WHERE linha_id = ? AND is_ativo = true ORDER BY codigo`
4. Combobox "Código de Parada" populado com resultados (formato: "P1.1 - Manutenção Planejada")
5. Search funcional: digitar "manut" filtra para códigos contendo "manut" (case-insensitive)
6. Validação backend (constraint): `CHECK (codigo_parada IN (SELECT codigo FROM books_paradas WHERE linha_id = apontamentos.linha_id))`
7. Se operador tentar burlar frontend (via API direta): INSERT falha com erro "Código de parada inválido para esta linha"
8. Teste: selecionar Linha A SPEP → dropdown deve ter ~50 códigos específicos da Linha A

---

### Story 3.5: Desenvolver Gateway SICFAR (Node.js Worker)

**Como** gestor,
**Eu quero** dados de sensores KEYENCE integrados automaticamente ao sistema,
**Para que** cálculos de OEE reflitam produção real sem apontamento manual.

#### Acceptance Criteria

1. Projeto `apps/gateway` com estrutura: `src/index.ts`, `src/services/FileTailService.ts`, `src/services/SupabaseSyncService.ts`
2. FileTailService lê arquivo TXT via tail (biblioteca `tail` do npm): `new Tail('/path/to/keyence_output.txt')`
3. Arquivo TXT tem formato: `timestamp,linha_id,producao_count,rejeicao_count` (1 linha por registro, 4 registros/segundo)
4. Parser extrai campos: timestamp, linha_id, producao_count, rejeicao_count
5. Agregador em memória: `Map<linha_id, { producao_acumulada, rejeicao_acumulada }>`
6. A cada novo registro: `map.get(linha_id).producao_acumulada += producao_count`
7. Timer setInterval (5 segundos): flush agregador → UPDATE Supabase
8. Query Supabase: `UPDATE ordens_producao_ativas SET producao_acumulada = ?, rejeicao_acumulada = ?, updated_at = now() WHERE linha_id = ?`
9. Service Role Key usado para autenticação (não anon key - backend-only)
10. Retry com exponential backoff se UPDATE falhar (3 tentativas: 1s, 2s, 4s)
11. Logs estruturados: Winston logger salvando em `logs/gateway-YYYY-MM-DD.log`
12. Teste: simular arquivo TXT com 100 registros/segundo → verificar UPDATEs a cada 5s no Supabase Dashboard

---

### Story 3.6: Configurar Gateway como Serviço Windows

**Como** administrador de TI,
**Eu quero** gateway rodando como serviço Windows iniciando automaticamente,
**Para que** dados de sensores continuem fluindo mesmo após reboot do servidor.

#### Acceptance Criteria

1. Biblioteca `node-windows` instalada em `apps/gateway`
2. Script `install-service.js` criado configurando serviço Windows: nome "SysOEE Gateway", descrição, executável `node dist/index.js`
3. Service instalado via: `node install-service.js` (executar como Admin)
4. Service configurado para: Auto-start, Restart on failure (3 tentativas), Log output em `logs/service.log`
5. Comandos PowerShell funcionando: `net start "SysOEE Gateway"`, `net stop "SysOEE Gateway"`
6. Teste: reiniciar Windows Server 2019 → gateway inicia automaticamente em 30-60s
7. Monitoramento: dashboard Supabase mostrando UPDATEs em `ordens_producao_ativas` continuando após reboot
8. Documentação em README: como instalar/desinstalar/atualizar serviço

---

### Story 3.7: Adicionar Tratamento de Paradas que Atravessam Meia-Noite

**Como** operador,
**Eu quero** registrar paradas que começam em um dia e terminam no dia seguinte,
**Para que** duração seja calculada corretamente independente de atravessar meia-noite.

#### Acceptance Criteria

1. Formulário de apontamento: adicionar campo "Hora Início" (time picker) e "Hora Término" (time picker)
2. Se tipo evento = "Parada": campos hora início/término são obrigatórios
3. Função utilitária `calculateDuration(dataOcorrencia, horaInicio, horaTermino)`:
   - Se `horaTermino > horaInicio`: duração = horaTermino - horaInicio
   - Se `horaTermino < horaInicio`: parada atravessou meia-noite → duração = (24h - horaInicio) + horaTermino
4. Exemplo: início 23:30, término 00:45 → duração = 0.5h + 0.75h = 1.25h (1h15min)
5. Campo `duracao_minutos` (integer) calculado e salvo em `apontamentos` table
6. Validação: duração máxima = 12h (se > 12h, alertar operador "Duração muito longa - confirme os horários")
7. Exibição na UI: converter minutos para formato legível "Xh Ymin"
8. Teste: criar apontamento 23:30 → 00:45 → deve calcular 75 minutos corretamente

---

**Fim do Epic 3**

Este epic entrega o primeiro vertical slice completo de valor: operador registra dados contemporâneos + gateway captura sensores + sistema funciona offline. É o core operacional do sistema.

---

