# Tech Stack

[← Voltar para Índice](./index.md)

## Stack Tecnológico do Sistema OEE

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL gerenciado
  - APIs REST/GraphQL auto-geradas
  - Sistema de autenticação integrado
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Storage para arquivos

### Database
- **PostgreSQL** (via Supabase)
  - Versão gerenciada
  - Triggers e Functions
  - Views materializadas
  - Full audit trail

### Integrações
- **CLPs:**
  - Bottelpack
  - Pró Maquia
  - Bausch Strobbel
  - KEYENCE (via gateway SICFAR)
- **ERP:**
  - TOTVS (API/Webhooks)

### Infraestrutura
- **Edge Functions** - Para integrações CLPs/TOTVS
- **Supabase Realtime** - Atualizações em tempo real
- **IndexedDB** - Offline-first buffer

### Frontend (Definido no PRD)
- React 19
- TypeScript
- Offline-first architecture
- Real-time dashboards

### Compliance & Security
- Assinatura Eletrônica CFR 21 Part 11
- Audit Trail completo
- Row Level Security (RLS)
- Princípios ALCOA+

---

**Fonte:** `docs/architecture.md` - Seção Introduction  
**Última Atualização:** 2025-10-25
