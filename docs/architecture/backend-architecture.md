# Backend Architecture

[← Voltar para Índice](./index.md)

## Arquitetura Backend do Sistema OEE

### Visão Geral

Este sistema utiliza **Supabase** como Backend-as-a-Service, fornecendo infraestrutura completa para autenticação, banco de dados PostgreSQL, APIs auto-geradas e real-time subscriptions.

### Componentes Principais

#### 1. Supabase Core
- **PostgreSQL Database** - Banco de dados principal
- **PostgREST API** - API REST auto-gerada
- **Realtime Server** - Subscriptions em tempo real
- **Auth Service** - Autenticação e autorização
- **Storage** - Armazenamento de arquivos (se necessário)

#### 2. Edge Functions
Funções serverless para lógica de negócio customizada:
- **Integração CLPs** - Receber dados de sensores via gateway
- **Integração TOTVS** - Sincronização bidirecional com ERP
- **Cálculo de OEE** - Processamento de métricas complexas
- **Notificações** - Alertas e avisos

#### 3. Database Layer
- **Functions** - Lógica no banco (cálculos, validações)
- **Triggers** - Audit trail automático, atualização de caches
- **Views** - Agregações e consultas otimizadas
- **RLS Policies** - Controle de acesso granular

### Fluxo de Dados

```
CLPs → Gateway → Edge Function → PostgreSQL
                                    ↓
TOTVS ←→ Edge Function ←→ PostgreSQL
                                    ↓
Frontend ←→ PostgREST API ←→ PostgreSQL
            (Realtime)
```

### Service Architecture

#### Apontamentos (Transacionais)
- Registros de paradas, produção e qualidade
- Validação em tempo real
- Offline-first com IndexedDB
- Sincronização automática

#### Cálculo de OEE
- Triggers para atualização automática
- View materializada para performance
- Cache de resultados por período
- Recalculo sob demanda

#### Audit & Compliance
- Audit trail em todas as tabelas críticas
- Assinatura eletrônica com hash SHA-256
- Rastreabilidade completa (ALCOA+)
- Row Level Security (RLS)

### Segurança

#### Row Level Security (RLS)
- **Operador:** CRUD próprios apontamentos
- **Supervisor:** Read setor + assinar registros
- **Gestor:** Read all + relatórios
- **Admin:** Full access

#### Audit Trail
- Tabelas `*_audit` para histórico completo
- Triggers automáticos em INSERT/UPDATE/DELETE
- Campos: who, what, when, where (IP, device)

---

**Fonte:** `docs/architecture.md` - Seção Introduction  
**Última Atualização:** 2025-10-25
