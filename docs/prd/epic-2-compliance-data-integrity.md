# Epic 2: Compliance & Data Integrity (ALCOA+/CFR 21 Part 11)

[← Voltar ao Índice](./index.md)

---


## Epic 2: Compliance & Data Integrity (ALCOA+/CFR 21 Part 11)

**Objetivo Expandido:** Implementar todos os controles regulatórios necessários para validação GMP: assinatura eletrônica com fluxo híbrido (operador registra → supervisor assina batch), audit trail completo via triggers PostgreSQL (rastreando quem/quando/o quê/antes/depois em todas as tabelas críticas), e Row Level Security (RLS) garantindo controle de acesso granular por role. Sistema deve atender 100% dos requisitos ALCOA+ e ser validável por Consultor Rafael Gusmão conforme CFR 21 Part 11.

### Story 2.1: Criar Triggers de Audit Trail para Tabelas Críticas

**Como** auditor de qualidade,
**Eu quero** rastrear todas as alterações em registros críticos (apontamentos, assinaturas, velocidades nominais),
**Para que** eu possa demonstrar integridade de dados conforme ALCOA+ em auditorias ANVISA/FDA.

#### Acceptance Criteria

1. Migration criada: `20250102000000_audit_trail_triggers.sql`
2. Tabela genérica `audit_log`: id (uuid PK), table_name (text), record_id (uuid), action (enum: INSERT, UPDATE, DELETE), user_id (uuid FK), field_changed (text nullable), old_value (jsonb nullable), new_value (jsonb nullable), timestamp (timestamp NOT NULL), ip_address (inet), device_info (jsonb)
3. Função PL/pgSQL `audit_trigger_func()` capturando OLD e NEW row, user via `auth.uid()`, timestamp via `now()`
4. Triggers instalados em tabelas críticas: `apontamentos`, `assinaturas_eletronicas`, `linhas` (campo velocidade_nominal), `books_paradas`
5. INSERT: salva `new_value` (record completo), `old_value` null
6. UPDATE: salva `field_changed`, `old_value`, `new_value` (apenas campos alterados - loop através de record fields)
7. DELETE: salva `old_value` (record completo), `new_value` null
8. IP Address capturado via `inet_client_addr()` (PostgreSQL function)
9. Device info salvo via custom `set_config('app.device_info', '{...}', true)` antes de mutation
10. Teste: inserir/atualizar/deletar apontamento → verificar registro correspondente em `audit_log` com todos os campos preenchidos

---

### Story 2.2: Implementar Row Level Security (RLS) para Controle de Acesso

**Como** administrador do sistema,
**Eu quero** garantir que operadores só vejam/modifiquem próprios apontamentos e supervisores só acessem seu setor,
**Para que** dados sejam protegidos conforme princípio de least privilege (ALCOA+ - Atribuível).

#### Acceptance Criteria

1. Migration criada: `20250103000000_rls_policies.sql`
2. Tabela `user_roles` criada: user_id (uuid PK FK → auth.users), role (enum: operador, supervisor, gestor, admin), setor_id (uuid FK nullable)
3. RLS habilitado em todas as tabelas: `ALTER TABLE apontamentos ENABLE ROW LEVEL SECURITY;`
4. Policy `apontamentos_select_own` (operador): `SELECT WHERE user_id = auth.uid()`
5. Policy `apontamentos_insert_own` (operador): `INSERT WITH CHECK (user_id = auth.uid())`
6. Policy `apontamentos_update_own` (operador): `UPDATE WHERE user_id = auth.uid() AND status = 'draft'`
7. Policy `apontamentos_select_setor` (supervisor): `SELECT WHERE linha_id IN (SELECT id FROM linhas WHERE setor_id = (SELECT setor_id FROM user_roles WHERE user_id = auth.uid()))`
8. Policy `apontamentos_select_all` (gestor, admin): `SELECT (no restrictions)`
9. Policy `assinaturas_insert_supervisor` (supervisor): `INSERT WITH CHECK (supervisor_id = auth.uid())`
10. Testes: criar usuário operador → tentar ler apontamento de outro operador (deve falhar), criar supervisor → deve ler todo o setor

---

### Story 2.3: Implementar Fluxo de Assinatura Eletrônica (Frontend)

**Como** supervisor,
**Eu quero** visualizar lista de apontamentos pendentes do meu setor e assinar em batch,
**Para que** eu valide registros contemporâneos dos operadores de forma eficiente.

#### Acceptance Criteria

1. Rota `/assinatura-lote` (protegida, role: supervisor)
2. Query Supabase: `SELECT * FROM apontamentos WHERE status = 'draft' AND linha_id IN (linhas do setor do supervisor) ORDER BY timestamp_ocorrencia DESC`
3. Tabela exibindo: Checkbox, Linha, Operador (nome via JOIN), Tipo Evento, Código Parada, Timestamp, Quantidade Afetada
4. Botões: "Selecionar Todos", "Desmarcar Todos"
5. Botão primário: "Assinar Selecionados (X itens)" (disabled se nenhum selecionado)
6. Click em "Assinar Selecionados" → abre Modal de Re-autenticação
7. Modal: Input PIN/Senha, Botão "Confirmar Assinatura", Botão "Cancelar"
8. Após confirmar PIN correto: chamar função `signBatch(apontamentoIds[], supervisorId, pin)`
9. Função gera hash SHA-256 de cada apontamento (concat: apontamento.id + timestamp + supervisor_id)
10. INSERTs em `assinaturas_eletronicas` + UPDATEs `apontamentos.status = 'assinado'`
11. Toast sucesso: "X apontamentos assinados com sucesso"
12. Lista atualizada automaticamente (remover itens assinados da view)

---

### Story 2.4: Adicionar Rejeição de Apontamentos pelo Supervisor

**Como** supervisor,
**Eu quero** desmarcar apontamentos incorretos e informar motivo,
**Para que** operador corrija erros antes de eu assinar o lote.

#### Acceptance Criteria

1. Cada item na lista de apontamentos tem botão secundário: "Rejeitar" (ícone X vermelho)
2. Click em "Rejeitar" → abre Modal: "Motivo da Rejeição" (textarea obrigatório), Botão "Confirmar Rejeição"
3. Função `rejectApontamento(apontamentoId, supervisorId, motivo)`
4. UPDATE `apontamentos SET status = 'rejeitado', motivo_rejeicao = ?, rejeitado_por = ?, rejeitado_em = now() WHERE id = ?`
5. Notificação enviada ao operador (toast quando ele logar): "Apontamento [Linha X - Código Y] foi rejeitado. Motivo: [texto]"
6. Operador pode editar apontamento rejeitado (volta status `draft` após edição)
7. Apontamento rejeitado não aparece mais na lista de assinatura até operador corrigir
8. Audit trail registra rejeição (action: UPDATE, campo status draft → rejeitado, motivo em new_value)

---

### Story 2.5: Validar Conformidade ALCOA+ com Consultor

**Como** Consultor Rafael Gusmão,
**Eu quero** revisar arquitetura de audit trail, assinatura eletrônica e RLS,
**Para que** eu valide que sistema atende CFR 21 Part 11 e pode ser usado em ambiente regulado.

#### Acceptance Criteria

1. Documento técnico criado: `docs/compliance/alcoa-plus-design.md` descrevendo:
   - **A (Atribuível):** RLS força user_id em todos os registros, auth.uid() nunca null
   - **L (Legível):** UI em português, dados não codificados, timestamps em formato brasileiro
   - **C (Contemporâneo):** Offline buffer + timestamp automático garantem registro no momento da ocorrência
   - **O (Original):** Audit trail com triggers imutáveis, DELETE físico bloqueado (apenas soft-delete)
   - **A (Exato):** Validações Zod no frontend + constraints PostgreSQL no backend
   - **+ (Completo):** Campos obrigatórios forçados, sem dados omitidos
   - **+ (Consistente):** Foreign keys + transactions ACID garantem integridade referencial
   - **+ (Durável):** Backups PITR 7 dias Supabase + replicação automática
   - **+ (Disponível):** SLA 99.9% Supabase Pro + offline-first garante acesso contínuo
2. Documento técnico: `docs/compliance/cfr-21-part-11.md` descrevendo:
   - Assinatura eletrônica: hash SHA-256 + re-autenticação + timestamp + IP + device
   - Audit trail: quem/quando/o quê/antes/depois em tabela imutável
   - Controle de acesso: RLS policies por role
3. Reunião de validação agendada (Semana 2) com Consultor Rafael Gusmão
4. Apresentação técnica (45 min): demonstração ao vivo de audit trail, assinatura, RLS
5. Consultor aprova por escrito (email ou documento): "Sistema atende requisitos CFR 21 Part 11 para uso em ambiente regulado"
6. Se reprovado: documentar gaps identificados e criar stories corretivas
7. Aprovação do consultor é bloqueio para prosseguir com desenvolvimento (Epic 3+)

---

**Fim do Epic 2**

Este epic é CRÍTICO - sem aprovação do consultor, sistema não pode ser validado formalmente (QI/OQ/QP). Todas as decisões arquiteturais de compliance devem ser validadas antes de codificar features de negócio.

---

