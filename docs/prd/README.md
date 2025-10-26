# Product Requirements Document (PRD) - Sistema OEE SicFar

Este diretório contém o PRD fragmentado em épicos individuais para facilitar navegação e colaboração.

## Estrutura de Arquivos

### Arquivo Principal
- **[index.md](./index.md)** - PRD completo com visão geral, requisitos, design goals e lista de épicos

### Épicos Individuais

1. **[epic-1-foundation-infrastructure.md](./epic-1-foundation-infrastructure.md)**
   - **8 histórias**: Setup Turborepo, Supabase, Autenticação, Schema DB, Offline-First, Keep-Alive, CI/CD, Health-Check
   - Base técnica do sistema

2. **[epic-2-compliance-data-integrity.md](./epic-2-compliance-data-integrity.md)**
   - **5 histórias**: Audit Trail, RLS, Assinatura Eletrônica, Rejeição Apontamentos, Validação ALCOA+
   - Compliance regulatório ALCOA+ e CFR 21 Part 11

3. **[epic-3-apontamentos-integracao-iot.md](./epic-3-apontamentos-integracao-iot.md)**
   - **7 histórias**: Formulário Apontamento, Offline-First, Feedback Visual, Validação Books, Gateway SICFAR, Serviço Windows, Tratamento Meia-Noite
   - Core operacional do sistema

4. **[epic-4-calculo-oee.md](./epic-4-calculo-oee.md)**
   - **7 histórias**: Cálculo Disponibilidade, Performance, Qualidade, View Materializada, pg_cron, Indicadores Secundários (MTBF/MTTR), Validação com Gerente
   - Cérebro do sistema com fórmulas validadas

5. **[epic-5-dashboards-visualizacoes.md](./epic-5-dashboards-visualizacoes.md)**
   - **7 histórias**: Filtros Dinâmicos, Velocímetro OEE, Pareto, Componentes OEE, Tabela Consolidada, React Query Cache, Layout Responsivo
   - Top 4 gráficos essenciais

6. **[epic-6-visualizacoes-complementares.md](./epic-6-visualizacoes-complementares.md)**
   - **7 histórias**: Rosca Planejadas/Não Planejadas, Resumo Horas, Tendências, MTBF/MTTR, Export PDF, Export Excel, Export PNG
   - Gráficos complementares e exports

7. **[epic-7-configuracoes-dados-mestres.md](./epic-7-configuracoes-dados-mestres.md)**
   - **6 histórias**: Velocidades Nominais, Metas OEE, Gerenciamento Usuários, Books Seed Data, Configurações Sistema, Profile Usuário
   - Administração e dados mestres

8. **[epic-8-testes-validacao.md](./epic-8-testes-validacao.md)**
   - **8 histórias**: Stress Test, Sessões Longas, Bundle Optimization, Usabilidade, Documentação, Demo, Validação GMP, Checklist Go-Live
   - Validação final e preparação para produção

## Total de Histórias

**55 user stories** distribuídas em **8 épicos**

## Navegação

Cada arquivo de épico contém:
- Link de retorno ao índice no topo
- Objetivo expandido do épico
- Histórias detalhadas com acceptance criteria
- Conclusão do épico

## Uso

1. Comece pelo [index.md](./index.md) para ter visão completa do PRD
2. Navegue para épicos específicos conforme necessidade
3. Use os links de navegação para voltar ao índice

## Versão

**Versão:** 1.0
**Data:** 19 de Outubro de 2025
**Responsável:** John (Product Manager)

---

[← Voltar para /docs](../)
