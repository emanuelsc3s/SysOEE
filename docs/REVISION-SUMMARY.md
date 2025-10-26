# Revisão de Documentação do Projeto - 26/10/2025

## 📋 Arquivos Criados/Revisados

### ✅ Novos Arquivos Gerados:

1. **`docs/prd/epic-1-foundation-infrastructure-REVISED.md`**
   - Epic 1 completo SEM CI/CD
   - 7 stories (removida antiga Story 1.7)
   - Story 1.8 renumerada → Story 1.7

2. **`docs/prd/epic-3-apontamentos-manuais-REVISED.md`**
   - Epic 3 completo SEM sensores/IoT
   - 5 stories (removidas Stories 3.5 e 3.6)
   - Story 3.7 renumerada → Story 3.5

---

## 🔄 Principais Mudanças

### Epic 1: Foundation & Core Infrastructure

#### Mudanças Estruturais:
- ❌ **REMOVIDO:** Story 1.7 (Configurar CI/CD GitHub Actions e Vercel)
- ✅ **RENUMERADO:** Story 1.8 → Story 1.7 (Health-Check Route)
- ✅ **ATUALIZADO:** Objetivo do Epic (remover referência a Vercel)

#### Story 1.1 - Setup Turborepo:
- ❌ Removido: `apps/gateway` (não haverá gateway Node.js)
- ✅ Mantido: `apps/web` + packages (ui, database, config)
- ✅ Adicionado: Validar que deploy GitHub → Cloudflare funciona

#### Story 1.4 - Schema Banco:
- ❌ **REMOVIDO:** Tabela `ordens_producao_ativas` (não haverá sensores)
- ✅ Adicionada nota explicativa no AC#7

#### Story 1.7 (nova) - Health-Check:
- ✅ Validar deploy produção: `https://sysoee.farmace.io/health`
- ✅ Testar commit → Cloudflare deploy automático
- ✅ Remover referências a Vercel

---

### Epic 3: Apontamentos Contemporâneos

#### Mudanças Estruturais:
- 📝 **RENOMEADO:** "Apontamentos Contemporâneos & Integração IoT" → "Apontamentos Contemporâneos Manuais"
- ❌ **REMOVIDO:** Story 3.5 (Desenvolver Gateway SICFAR Node.js)
- ❌ **REMOVIDO:** Story 3.6 (Configurar Gateway como Serviço Windows)
- ✅ **RENUMERADO:** Story 3.7 → Story 3.5 (Paradas Meia-Noite)

#### Objetivo Atualizado:
**ANTES:**
> "...Gateway SICFAR integra sensores KEYENCE lendo arquivos TXT..."

**AGORA:**
> "...Todos os dados de produção e paradas serão registrados manualmente pelos operadores."

#### Nota Adicionada no Final:
> "Este sistema foi projetado para captura manual de dados. Não haverá integração com sensores KEYENCE, CLPs ou gateways IoT no escopo do MVP."

---

## 📂 Próximos Passos para Aplicar Mudanças

### 1. Substituir Arquivos Originais:

```bash
cd /home/emanuel/SysOEE

# Backup dos originais
mv docs/prd/epic-1-foundation-infrastructure.md \
   docs/prd/epic-1-foundation-infrastructure-OLD.md

mv docs/prd/epic-3-apontamentos-integracao-iot.md \
   docs/prd/epic-3-apontamentos-integracao-iot-OLD.md

# Aplicar versões revisadas
mv docs/prd/epic-1-foundation-infrastructure-REVISED.md \
   docs/prd/epic-1-foundation-infrastructure.md

mv docs/prd/epic-3-apontamentos-manuais-REVISED.md \
   docs/prd/epic-3-apontamentos-manuais.md
```

### 2. Atualizar Índice (docs/prd/index.md ou README.md):

Trocar referência:
- ❌ `epic-3-apontamentos-integracao-iot.md`
- ✅ `epic-3-apontamentos-manuais.md`

### 3. Verificar Outros Documentos que Referenciam IoT/CI/CD:

```bash
# Buscar menções a remover
grep -r "GitHub Actions" docs/
grep -r "Vercel" docs/
grep -r "Gateway SICFAR" docs/
grep -r "KEYENCE" docs/
grep -r "sensores" docs/
grep -r "IoT" docs/

# Arquivos prováveis a atualizar:
# - docs/architecture/external-apis.md
# - docs/architecture/core-workflows.md
# - docs/architecture/tech-stack.md
# - docs/prd.md (se existir versão consolidada)
```

---

## ✅ Checklist de Validação

Após aplicar mudanças, verificar:

- [ ] Epic 1 tem exatamente 7 stories (1.1 a 1.7)
- [ ] Epic 3 tem exatamente 5 stories (3.1 a 3.5)
- [ ] Nenhuma menção a "GitHub Actions" ou "Vercel" no Epic 1
- [ ] Nenhuma menção a "Gateway", "KEYENCE", "sensores" no Epic 3
- [ ] Story 1.4 NÃO menciona tabela `ordens_producao_ativas`
- [ ] Story 1.7 valida deploy em `https://sysoee.farmace.io`
- [ ] Título Epic 3 atualizado para "Apontamentos Manuais"
- [ ] Índice (README ou index.md) aponta para arquivo correto do Epic 3

---

## 🎯 Resumo Executivo

### O Que Foi Removido:
1. ❌ CI/CD (GitHub Actions, Vercel) - Deploy já configurado externamente
2. ❌ Gateway IoT Node.js - Sem integração com sensores
3. ❌ Windows Service - Não aplicável
4. ❌ Tabela ordens_producao_ativas - Sem sensores

### O Que Permanece:
1. ✅ 7 stories Epic 1 (fundação técnica)
2. ✅ 5 stories Epic 3 (apontamentos manuais)
3. ✅ Offline-first (IndexedDB)
4. ✅ Keep-alive sessões 8h+
5. ✅ Validação de deploy em produção

### Ambiente Atual (Já Configurado):
- ✅ GitHub: https://github.com/emanuelsc3s/SysOEE.git
- ✅ Deploy: GitHub → Cloudflare Pages (automático)
- ✅ DNS: https://sysoee.farmace.io

---

## 📌 Informações Importantes

**Deploy Automático:**
- Não requer configuração no projeto (já feito externamente)
- Commit no GitHub → Cloudflare deploy (~2-3min)
- Não criar arquivos `.github/workflows/` ou `wrangler.toml`

**Sensores/IoT:**
- Totalmente fora do escopo MVP
- 100% apontamentos manuais pelos operadores
- Sem integrações com CLPs, KEYENCE ou TOTVS automático

**Estrutura Simplificada:**
```
SysOEE/
├── apps/
│   └── web/          ← Apenas frontend React
├── packages/
│   ├── ui/
│   ├── database/
│   └── config/
├── supabase/
│   ├── migrations/
│   └── seed.sql
└── docs/
```

---

**Criado em:** 26/10/2025
**Autor:** Sarah (Product Owner)
**Versão:** 1.0
