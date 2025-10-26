# Epic 7: Configurações & Gerenciamento de Dados Mestres

[← Voltar ao Índice](./index.md)

---


## Epic 7: Configurações & Gerenciamento de Dados Mestres

**Objetivo Expandido:** Criar interface de administração permitindo cadastro e edição de dados mestres críticos: Velocidades Nominais por SKU (base para cálculo de Performance), Metas de OEE por linha (visualização em gráficos), Books de Paradas (seed data no MVP, CRUD completo pós-MVP aguardando Atividade 06), e gerenciamento de usuários com roles/permissões. Engenharia e Admin têm autonomia para parametrizar sistema sem depender de desenvolvedores.

### Story 7.1: Criar Tela de Gerenciamento de Velocidades Nominais

**Como** engenheiro de processos,
**Eu quero** cadastrar e atualizar velocidades nominais por SKU em cada linha,
**Para que** cálculos de Performance reflitam capacidade real de cada produto.

#### Acceptance Criteria

1. Rota `/admin/velocidades-nominais` (protegida, role: admin, engenharia)
2. Tabela listando: Linha, SKU (código + descrição), Velocidade Nominal (Und/h), Última Atualização, Ações (Editar, Desativar)
3. Botão "Nova Velocidade Nominal" → abre modal:
   - Select "Linha" (obrigatório)
   - Input "SKU Código" (obrigatório, ex: "SKU-001")
   - Input "SKU Descrição" (obrigatório, ex: "Soro Fisiológico 500ml")
   - Input "Velocidade Nominal" (numérico obrigatório, Und/h, ex: 10000)
   - Botão "Salvar"
4. INSERT em tabela `velocidades_nominais`: linha_id, sku_codigo, sku_descricao, velocidade_nominal_undh, created_by, created_at
5. Editar velocidade: abre modal similar, campos pré-preenchidos, UPDATE em vez de INSERT
6. Audit trail: trigger registra alterações (campo velocidade_nominal old → new)
7. Assinatura eletrônica: **SIM** - mudanças em velocidades nominais requerem assinatura de gestor (impactam cálculos retroativos)
8. Validação: velocidade nominal > 0, SKU único por linha
9. Filtros: buscar por linha ou SKU (debounced input)
10. Histórico: botão "Ver Histórico" → modal listando alterações anteriores via `audit_log`

---

### Story 7.2: Criar Tela de Gerenciamento de Metas de OEE

**Como** gestor,
**Eu quero** definir metas de OEE específicas por linha,
**Para que** velocímetros e gráficos mostrem zonas vermelha/amarela/verde corretas.

#### Acceptance Criteria

1. Rota `/admin/metas-oee` (protegida, role: admin, gestor)
2. Tabela listando: Linha, Setor, Meta OEE Atual (%), Última Atualização, Ações (Editar)
3. Editar meta: abre modal
   - Linha (readonly, já selecionada)
   - Input "Nova Meta OEE (%)" (numérico 0-100, obrigatório)
   - Input "Justificativa" (textarea obrigatório - por que meta mudou?)
   - Botão "Salvar"
4. UPDATE em `linhas SET meta_oee = ?, meta_oee_justificativa = ?, meta_oee_updated_at = now() WHERE id = ?`
5. Audit trail: registra alteração old meta → new meta + justificativa
6. Validação: meta entre 50% e 100% (alertar se < 50% "Meta muito baixa, confirmar?")
7. Impacto imediato: após salvar, velocímetros e gráficos atualizam zonas de cor
8. Histórico de metas: botão "Ver Histórico" → modal timeline mostrando mudanças ao longo do tempo

---

### Story 7.3: Criar Tela de Gerenciamento de Usuários

**Como** admin,
**Eu quero** criar usuários com roles e setores associados,
**Para que** controle de acesso via RLS funcione corretamente.

#### Acceptance Criteria

1. Rota `/admin/usuarios` (protegida, role: admin)
2. Tabela listando: Nome, Email, Role, Setor (se operador/supervisor), Status (Ativo/Inativo), Ações (Editar, Desativar)
3. Botão "Novo Usuário" → abre modal:
   - Input "Nome Completo" (obrigatório)
   - Input "Email" (obrigatório, validação formato email)
   - Select "Role" (operador, supervisor, gestor, admin - obrigatório)
   - Select "Setor" (condicional - obrigatório se role = operador ou supervisor, disabled se gestor/admin)
   - Input "Senha Temporária" (obrigatório, min 8 caracteres)
   - Checkbox "Forçar troca de senha no primeiro login"
   - Botão "Criar Usuário"
4. Fluxo: INSERT em `auth.users` via Supabase Admin API → INSERT em `user_roles` (user_id, role, setor_id)
5. Email automático: enviar credenciais para usuário (via Supabase Auth ou Edge Function)
6. Editar usuário: alterar role/setor/status (não email - Supabase não permite)
7. Desativar usuário: soft-delete (status = 'inativo'), não DELETE físico
8. Reset de senha: botão "Resetar Senha" → envia link de recuperação via email
9. Filtros: buscar por nome/email, filtrar por role ou setor
10. Bulk actions: selecionar múltiplos usuários → desativar em batch

---

### Story 7.4: Criar Seed Data de Books de Paradas (MVP)

**Como** desenvolvedor,
**Eu quero** carregar Books de Paradas via seed.sql,
**Para que** operadores tenham códigos disponíveis no MVP sem aguardar Atividade 06.

#### Acceptance Criteria

1. Arquivo `supabase/seed-books.sql` criado
2. Estrutura hierárquica: Classe → Grande Parada → Apontamento → Grupo → Detalhamento
3. Seed data para **10 linhas SPEP** (~50 códigos por linha = ~500 registros):
   - Linha A SPEP: códigos P1.1 a P1.50 (exemplo: P1.1 = Manutenção Planejada, P1.2 = Sem Programação PMP, etc.)
   - Linha B SPEP: mesmo padrão com variações
   - ...Linha SLE
4. INSERTs em tabela `books_paradas`: `(linha_id, codigo, classe, grande_parada, apontamento, grupo, detalhamento, is_ativo)`
5. Códigos comuns em todas as linhas: P1.1 (Manutenção Planejada), P2.1 (Quebra/Falha), P3.1 (Falta de Material)
6. Códigos específicos por linha: baseado em características (ex: Linha A tem código "P5.1 - Troca de Filtro Específico")
7. Script executável: `supabase db reset` → limpa dados + aplica migrations + executa seed
8. Validação: query `SELECT COUNT(*) FROM books_paradas GROUP BY linha_id` → deve retornar ~50 por linha
9. Documentação: README.md com instrução "Para popular Books de Paradas: `supabase db reset`"
10. **Nota:** CRUD interface de Books fica pós-MVP (aguardando Atividade 06 documentar hierarquia completa)

---

### Story 7.5: Adicionar Tela de Configurações do Sistema

**Como** admin,
**Eu quero** configurar parâmetros globais do sistema,
**Para que** comportamentos sejam customizáveis sem alterar código.

#### Acceptance Criteria

1. Rota `/admin/configuracoes` (protegida, role: admin)
2. Seções de configuração:
   - **Sessões:** Timeout de sessão (minutos), Intervalo de keep-alive (minutos)
   - **Offline:** Tamanho máximo buffer IndexedDB (registros), Intervalo de tentativa de sync (segundos)
   - **Dashboards:** Stale time de cache React Query (minutos), Itens por página padrão em tabelas
   - **Notificações:** Habilitar/desabilitar toasts, Duração de toasts (segundos)
   - **Validação:** Tolerância de cálculo OEE para validação (%), Duração mínima de pequenas paradas (minutos)
3. Tabela `system_config`: key (text PK), value (jsonb), description (text), updated_by, updated_at
4. Formulário: cada config tem input apropriado (numérico, toggle, etc.)
5. Botão "Salvar Configurações" → UPSERTs em `system_config`
6. Validações: timeouts > 0, buffer size entre 1.000-10.000, etc.
7. Impacto imediato: frontend lê configs via query ao inicializar
8. Valores padrão: se key não existe, usar defaults hardcoded
9. Audit trail: registra alterações de configurações

---

### Story 7.6: Implementar Profile & Preferências do Usuário

**Como** usuário,
**Eu quero** personalizar preferências da minha conta,
**Para que** sistema se adapte ao meu workflow.

#### Acceptance Criteria

1. Botão "Meu Perfil" no user menu (header, canto superior direito)
2. Modal ou página `/perfil` com abas:
   - **Dados Pessoais:** Nome, Email (readonly), Foto (upload avatar)
   - **Senha:** Trocar senha (senha atual + nova senha + confirmar)
   - **Preferências:** Setor padrão (pré-seleciona nos filtros), Linha padrão, Período padrão, Idioma (apenas PT-BR no MVP)
   - **Notificações:** Habilitar/desabilitar toasts, Notificar apontamentos rejeitados
3. Tabela `user_preferences`: user_id (PK FK), setor_padrao_id, linha_padrao_id, periodo_padrao, preferences (jsonb)
4. Salvar: UPSERT em `user_preferences`
5. Avatar: upload para Supabase Storage bucket `avatars/{user_id}.jpg`, resize automático para 200×200px
6. Trocar senha: validar senha atual via `supabase.auth.updateUser({ password: novaSenha })`
7. Logout button: "Sair da Conta" → `supabase.auth.signOut()` → redirect `/login`

---

**Fim do Epic 7**

Este epic dá autonomia para equipe operacional (engenharia, gestão) parametrizar sistema sem depender de desenvolvedores. CRUD de Books fica pós-MVP aguardando doc da Atividade 06.

---

