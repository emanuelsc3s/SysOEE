# Epic 1: Foundation & Core Infrastructure

[← Voltar ao Índice](./index.md)

---


## Epic 1: Foundation & Core Infrastructure

**Objetivo Expandido:** Estabelecer base sólida do projeto com monorepo Turborepo, infraestrutura Supabase configurada, autenticação funcional via Supabase Auth, mecanismos de offline-first (IndexedDB), sessões longas (keep-alive automático), e estrutura inicial de banco de dados. Entregar health-check route validando que deploy automático GitHub → Cloudflare Pages está funcionando corretamente.

### Story 1.1: Setup de Monorepo Turborepo com Apps Base

**Como** desenvolvedor,
**Eu quero** configurar monorepo Turborepo com estrutura apps/web (React 19 + Vite),
**Para que** eu tenha base técnica para desenvolvimento do frontend.

#### Acceptance Criteria

1. Repositório GitHub criado com estrutura Turborepo: `apps/web`, `packages/ui`, `packages/database`, `packages/config`
2. Apps/web: Vite 7 + React 19 + TypeScript 5.3+ rodando com `turbo dev` exibindo "Hello World"
3. Package.json raiz com scripts: `turbo dev`, `turbo build`, `turbo test`
4. ESLint + Prettier configurados em `packages/config` e aplicados em todos os apps
5. .gitignore configurado (node_modules, dist, .env, .turbo)
6. README.md raiz com instruções de setup (`npm install`, `turbo dev`)
7. Deploy automático GitHub → Cloudflare Pages já configurado externamente (validar que funciona)

---

### Story 1.2: Configurar Supabase Cloud e Conectar Frontend

**Como** desenvolvedor,
**Eu quero** criar projeto Supabase Pro e conectar apps/web via Supabase JS Client,
**Para que** eu tenha backend (PostgreSQL + Auth + Realtime) funcional desde o início.

#### Acceptance Criteria

1. Projeto Supabase criado no plano Pro com nome "SysOEE-MVP"
2. Variáveis de ambiente `.env.local` em apps/web: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. Supabase JS Client inicializado em `apps/web/src/lib/supabase.ts`
4. Health-check query: `SELECT 1` executado com sucesso no mount do App.tsx
5. Logs de conexão exibidos no console (URL do projeto, status connected)
6. Service Role Key armazenada em variável de ambiente (NÃO commitada no Git)
7. Documentação em README.md com passo-a-passo para obter keys do dashboard Supabase

---

### Story 1.3: Implementar Autenticação Básica (Email/Senha)

**Como** usuário do sistema,
**Eu quero** fazer login com email e senha,
**Para que** eu possa acessar o sistema de forma autenticada e rastreável.

#### Acceptance Criteria

1. Tela de Login (`/login`) com formulário: Email (input), Senha (password input), Botão "Entrar"
2. React Hook Form + Zod validando email formato válido e senha mínimo 8 caracteres
3. Função `signIn(email, password)` chamando `supabase.auth.signInWithPassword()`
4. Redirecionamento para `/dashboard` após login bem-sucedido
5. Mensagem de erro exibida se credenciais inválidas (toast ou text vermelho)
6. Estado de loading no botão "Entrar" (spinner + disabled) durante autenticação
7. Sessão JWT salva automaticamente pelo Supabase (localStorage)
8. Protected route `/dashboard` redirecionando para `/login` se não autenticado

---

### Story 1.4: Criar Schema Inicial de Banco de Dados

**Como** desenvolvedor,
**Eu quero** criar migrations SQL iniciais para tabelas core (users, setores, linhas, apontamentos, assinaturas_eletronicas),
**Para que** estrutura de dados esteja definida antes de implementar features.

#### Acceptance Criteria

1. Migration `20250101000000_initial_schema.sql` criada em `supabase/migrations/`
2. Tabela `setores`: id (uuid PK), nome (text NOT NULL), created_at (timestamp)
3. Tabela `linhas`: id (uuid PK), nome (text NOT NULL), setor_id (uuid FK → setores), velocidade_nominal_padrao (numeric), meta_oee (numeric 0-100), created_at
4. Tabela `apontamentos`: id (uuid PK), linha_id (uuid FK), user_id (uuid FK → auth.users), tipo_evento (enum), codigo_parada (text), timestamp_ocorrencia (timestamp NOT NULL), quantidade_afetada (numeric), observacoes (text), status (enum: draft, aguardando_assinatura, assinado), created_at, updated_at
5. Tabela `assinaturas_eletronicas`: id (uuid PK), apontamento_id (uuid FK), supervisor_id (uuid FK → auth.users), hash_sha256 (text NOT NULL), timestamp_assinatura (timestamp NOT NULL), ip_address (inet), device_info (jsonb)
6. Migration aplicada com sucesso via Supabase CLI: `supabase db push`
7. Seed data em `supabase/seed.sql`: 4 setores (SPEP, SPPV, Líquidos, CPHD) e 10 linhas SPEP

**Nota:** Tabela `ordens_producao_ativas` foi REMOVIDA - não haverá integração com sensores no MVP. Dados de produção virão de apontamentos manuais.

---

### Story 1.5: Implementar Offline-First Buffer (IndexedDB)

**Como** operador,
**Eu quero** que o sistema continue funcionando quando internet cair,
**Para que** eu não perca dados de apontamentos contemporâneos durante meu turno.

#### Acceptance Criteria

1. Biblioteca Dexie.js instalada e configurada em `apps/web/src/lib/db.ts`
2. Schema IndexedDB: tabela `pending_apontamentos` com campos: id, linha_id, tipo_evento, codigo_parada, timestamp_ocorrencia, quantidade_afetada, observacoes, created_at_local
3. Função `saveToPendingQueue(apontamento)` salvando no IndexedDB quando offline
4. Service `SyncService` tentando sincronizar pending_apontamentos com Supabase a cada 10 segundos
5. Event listeners `window.addEventListener('online')` e `offline` atualizando estado de conexão
6. Apontamentos sincronizados são removidos do IndexedDB automaticamente
7. UI exibindo badge de status: "Online" (verde), "Offline - X pendentes" (amarelo), "Sincronizando..." (azul)
8. Limite máximo de 10.000 registros no IndexedDB (FIFO - remove mais antigos se atingir limite)

---

### Story 1.6: Implementar Keep-Alive Automático de Sessões

**Como** operador,
**Eu quero** que minha sessão permaneça ativa durante todo o turno de 8 horas,
**Para que** eu não perca dados por desconexão automática e continue registrando apontamentos contemporâneos.

#### Acceptance Criteria

1. Supabase Client inicializado com `autoRefreshToken: true` em `lib/supabase.ts`
2. Timer setInterval executando `supabase.auth.getSession()` a cada 50 minutos (antes de token expirar em 1h)
3. Heartbeat query leve (`SELECT 1`) executado a cada 5 minutos para manter conexão PostgreSQL ativa
4. Contador de tempo de sessão exibido no header: "Sessão ativa: Xh Ymin"
5. Auto-reconnect implementado: se token refresh falhar, tentar 3x com exponential backoff (1s, 2s, 4s)
6. Log de atividade de keep-alive em console (dev mode) ou Supabase Dashboard (prod)
7. Toast de alerta se sessão falhar após 3 tentativas: "Sessão expirou. Faça login novamente."
8. Testes manuais: sessão permanece ativa por 8h+ sem interrupção

---

### Story 1.7: Criar Health-Check Route e Validar Deploy

**Como** desenvolvedor,
**Eu quero** rota de health-check funcionando no ambiente de produção,
**Para que** valide que deploy automático GitHub → Cloudflare está correto.

#### Acceptance Criteria

1. Rota `/health` (não autenticada) retornando JSON:
   ```json
   {
     "status": "ok",
     "version": "1.0.0",
     "timestamp": "2025-10-26T10:00:00Z",
     "database": "connected",
     "environment": "production"
   }
   ```
2. Health-check testando conexão Supabase: `SELECT 1` (retorna `database: "error"` se falhar)
3. Se Supabase falhar: retorna `{ "database": "error", "status": "degraded" }`
4. **Teste Local:** `http://localhost:5173/health` retorna 200 OK
5. **Teste Produção:** `https://sysoee.farmace.io/health` retorna 200 OK
6. Dashboard canary em `/dashboard` (rota autenticada) exibindo:
   - "Sistema OEE - Protótipo MVP"
   - Logo Farmace/SicFar
   - Card "Bem-vindo, {nome_usuario}"
7. Layout base com header: Logo, título "SysOEE", badge de status conexão, nome do usuário, botão "Sair"
8. Footer com versão do sistema e link para documentação
9. Navegação funcional (ainda sem páginas completas, mas estrutura de rotas pronta)
10. **Validar Deploy Automático:**
    - Fazer commit no GitHub
    - Aguardar deploy automático Cloudflare (~2-3min)
    - Verificar que mudança aparece em `https://sysoee.farmace.io`
11. Testes manuais: acessar `/health` retorna status 200 OK, acessar `/dashboard` sem login redireciona para `/login`

---

**Fim do Epic 1**

Este epic estabelece a fundação técnica sólida. Todos os epics subsequentes dependem desta infraestrutura estar operacional.

**Deploy:** Sistema já configurado externamente com deploy automático GitHub → Cloudflare Pages (https://sysoee.farmace.io). Não é necessário configurar CI/CD no projeto.

---
