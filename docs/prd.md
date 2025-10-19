# Sistema OEE para SicFar - Product Requirements Document (PRD)

**Versão:** 1.0
**Data:** 19 de Outubro de 2025
**Responsável:** John (Product Manager)
**Stakeholders:** Maxwell Cruz Cortez (Gerente Industrial), Sávio Correia Rafael (Gerente de Processos), Cícero Emanuel da Silva (Líder de TI)
**Consultor:** Rafael Gusmão (Validação Técnica)

---

## Goals and Background Context

### Goals

- Aumentar OEE médio geral de ~65% (baseline estimado) para 75% até Jun/2026
- Reduzir tempo de análise de dados de 40h/mês para 4h/mês até Mar/2026
- Garantir 100% contemporaneidade de apontamentos (conformidade BPF/ALCOA+)
- Aprovar validação formal (QI/QO/QP) até Ago/2026
- Reduzir paradas não planejadas em 25% através de gestão preditiva (MTBF/MTTR)
- Eliminar dependência de planilhas Excel e processos manuais fragmentados
- Fornecer visibilidade em tempo real sobre eficiência das 37 linhas de produção
- Criar fonte única de verdade para dados de OEE integrando CLPs, apontamentos manuais e TOTVS

### Background Context

A Farmace/SicFar opera 37 linhas de produção farmacêutica em 4 setores críticos (SPEP, SPPV, Líquidos, CPHD), mas enfrenta desafios operacionais significativos que impedem otimização de capacidade produtiva e gestão preditiva. O problema central é a falta de visibilidade em tempo real sobre eficiência das linhas, com dados fragmentados entre planilhas Excel, CLPs não integrados e apontamentos manuais não contemporâneos. Isso impossibilita análise estratégica baseada em dados concretos e representa risco regulatório crítico: apontamentos não contemporâneos violam princípios ALCOA+ exigidos pela ANVISA (IN 134, RDC 658) e FDA (CFR 21 Part 11), expondo a SicFar a potenciais warning letters em auditorias.

A solução proposta é um Sistema OEE Web pharma-native (React 19 + Supabase) com integrações CLPs/TOTVS, dashboards interativos avançados (8 gráficos obrigatórios), assinatura eletrônica CFR 21 Part 11, e offline-first para garantir zero data loss durante turnos de 8+ horas. O sistema será validado formalmente (QI/QO/QP) para uso em ambiente regulado, com meta de implantação em Janeiro/2026 (protótipo SPEP em Dezembro/2025).

### Change Log

| Data | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-19 | 1.0 | PRD inicial criado a partir de Project Brief | John (PM) |

---

## Requirements

### Functional Requirements

**FR1:** O sistema deve permitir registro de apontamentos contemporâneos (paradas, trocas de turno, perdas de qualidade) com campos obrigatórios: linha, turno, tipo de evento, código de parada do Book, timestamp automático, quantidade afetada e operador autenticado

**FR2:** O sistema deve integrar com sensores KEYENCE via gateway SICFAR, processando dados de produção/rejeição de arquivos TXT (4 registros/segundo) e atualizando tabela `ordens_producao_ativas` com contadores acumulados a cada 5 segundos

**FR3:** O sistema deve calcular OEE conforme metodologia validada: OEE (%) = Disponibilidade × Performance × Qualidade, onde Disponibilidade = (Tempo de Operação / Tempo Disponível) × 100, Performance = (Tempo Operacional Líquido / Tempo de Operação) × 100, e Qualidade = Qualidade_Unidades × Qualidade_Retrabalho

**FR4:** O sistema deve calcular cada componente de OEE separadamente (Disponibilidade, Performance, Qualidade) e armazenar resultados agregados por linha, turno, dia, semana, mês, trimestre e ano

**FR5:** O sistema deve exibir Velocímetro de OEE (gauge) com meta configurável por linha, diferenciando zonas vermelha/amarela/verde conforme metas específicas

**FR6:** O sistema deve exibir Gráfico de Pareto de Paradas em ordem decrescente mostrando principais causas de paradas em duração (horas) e impacto percentual sobre OEE, com drill-down de Grandes Paradas → Apontamento

**FR7:** O sistema deve exibir Gráfico de Componentes do OEE (barras comparativas) mostrando Disponibilidade, Performance, Qualidade e OEE consolidado para até 12 períodos comparativos (últimos 12 dias/semanas/meses)

**FR8:** O sistema deve exibir Tabela Consolidada com ordenação e filtros, apresentando versão por período (categorias de paradas × períodos) e versão por linha (tipos de parada × linhas de produção)

**FR9:** O sistema deve implementar filtros dinâmicos por setor (SPEP, SPPV, Líquidos, CPHD), linha, período (últimas 24h, semana, mês) e data range customizado

**FR10:** O sistema deve implementar fluxo de assinatura eletrônica híbrido: operador registra apontamento (status `draft`) → supervisor seleciona registros individualmente → re-autentica com PIN/Senha → assina batch completo (status `assinado`)

**FR11:** O sistema deve gerar hash SHA-256 de cada registro assinado combinado com timestamp, IP, device e salvar em tabela `assinaturas_eletronicas` com rastreabilidade completa

**FR12:** O sistema deve implementar audit trail completo via triggers PostgreSQL salvando: quem incluiu/alterou/excluiu, campo alterado, valor antes/depois, timestamp, IP e device em tabelas `*_audit`

**FR13:** O sistema deve funcionar completamente offline por até 8 horas (1 turno) armazenando dados não sincronizados em IndexedDB e sincronizando automaticamente quando conexão retornar

**FR14:** O sistema deve manter sessões ativas por 8+ horas através de auto-refresh de tokens (a cada 50 minutos), heartbeat (query leve a cada 5 minutos) e auto-reconnect com exponential backoff

**FR15:** O sistema deve exibir badge de status de conexão (Online/Offline) e alertar usuário sobre dados pendentes de sincronização com contador visual

**FR16:** O sistema deve permitir export de dashboards para Excel (via XLSX library) e PDF (via html2canvas + jsPDF) com filtros aplicados

**FR17:** O sistema deve classificar pequenas paradas (< 10 minutos) como impacto em Performance (não em Disponibilidade) conforme metodologia validada

**FR18:** O sistema deve excluir Paradas Estratégicas do Tempo Disponível (não entram no denominador do cálculo de Disponibilidade)

**FR19:** O sistema deve usar Velocidade Nominal por SKU (não capacidade nominal da máquina) como base para cálculo de Performance, permitindo diferentes velocidades para mesma linha

**FR20:** O sistema deve exibir Gráfico de Rosca mostrando distribuição percentual entre Paradas Planejadas (azul) e Não Planejadas (vermelho) segmentado por linha, setor, turno ou período

**FR21:** O sistema deve exibir Gráfico de Resumo de Horas Totais (barras empilhadas) categorizando: Horas Valiosas (verde), Paradas Estratégicas (azul), Paradas por Indisponibilidade (vermelho), Perdas por Performance (laranja), Perdas por Qualidade (amarelo)

**FR22:** O sistema deve calcular e exibir indicadores secundários: MTBF (tempo médio entre falhas), MTTR (tempo médio para reparo) e Taxa de Utilização ao longo do tempo

**FR23:** O sistema deve exibir Gráfico Histórico de Tendências (linhas) mostrando evolução das últimas 10-12 semanas de horas e % do OEE por categoria de parada

**FR24:** O sistema deve validar dados em tempo real (campos obrigatórios, SKU válido, operador autenticado, códigos de parada do Book da linha) antes de permitir salvamento

**FR25:** O sistema deve fornecer feedback visual imediato após registro de apontamento indicando: salvamento local (IndexedDB), sincronizando ou sincronizado com servidor

**FR26:** O sistema deve gerenciar Books de Paradas específicos por linha, permitindo que mesmo código tenha diferentes classificações hierárquicas (Classe → Grande Parada → Apontamento → Grupo → Detalhamento) entre linhas

**FR27:** O sistema deve preencher automaticamente Setor, Semana, Mês, Trimestre e Ano a partir da Data do apontamento para viabilizar segmentações temporais

**FR28:** O sistema deve implementar Row Level Security (RLS) no Supabase com permissões granulares por tipo de usuário: Operador (CRUD próprios apontamentos), Supervisor (read todos do setor + assinar), Gestor (read all + relatórios), Admin (full access)

**FR29:** O sistema deve tratar paradas que atravessam meia-noite calculando duração corretamente (ex: início 23:30 → término 00:45 = 1h15min)

**FR30:** O sistema deve permitir supervisor rejeitar registros individuais informando motivo obrigatório, devolvendo apontamento para operador corrigir (volta status `draft`)

### Non-Functional Requirements

**NFR1:** O sistema deve manter P95 de tempo de carregamento de dashboards < 2 segundos e P95 de interações (cliques, filtros) < 500ms

**NFR2:** O sistema deve suportar 100-500 usuários simultâneos (10 linhas MVP → 37 linhas completo) sem degradação de performance

**NFR3:** O sistema deve manter uptime > 99.5% durante horário produtivo (6h-22h, seg-sex) com SLA de Supabase Pro + Vercel

**NFR4:** O sistema deve garantir contemporaneidade de apontamentos com > 98% dos registros tendo timestamp dentro de 10 minutos da ocorrência real

**NFR5:** O sistema deve atender 100% dos princípios ALCOA+: Atribuível (user_id sempre preenchido via RLS), Legível (UI clara), Contemporâneo (offline buffer + timestamp automático), Original (triggers de auditoria), Exato (validações Zod + constraints PostgreSQL), Completo (campos obrigatórios), Consistente (foreign keys + transactions), Durável (backups PITR 7 dias + replicação Supabase), Disponível (uptime SLA 99.9%)

**NFR6:** O sistema deve atender requisitos CFR 21 Part 11 (FDA): assinatura eletrônica com hash SHA-256 + re-autenticação, audit trail completo, controle de acesso via RLS policies, validação formal QI/QO/QP

**NFR7:** O sistema deve usar HTTPS obrigatório (TLS 1.3), senhas hasheadas (bcrypt via Supabase Auth), Service Role Key armazenada em variável de ambiente (não hardcoded)

**NFR8:** O sistema deve funcionar em navegadores: Chrome 90+, Edge 90+, Firefox 88+ (desktop) e Chrome Mobile, Safari iOS 14+ (mobile via PWA)

**NFR9:** O sistema deve manter bundle inicial do frontend < 500KB através de lazy loading, code splitting por rota e tree-shaking

**NFR10:** O sistema deve implementar cache inteligente com React Query (stale time 5min) reduzindo requests em ~80%

**NFR11:** O sistema deve ser responsivo (mobile-first) com heights adaptativos: mobile (300px), tablet (400px), desktop (500px) e scroll horizontal em gráficos complexos quando necessário

**NFR12:** O sistema deve ser instalável como PWA (Progressive Web App) através de Service Worker com cache de assets, background sync e funcionamento offline completo

**NFR13:** O sistema deve armazenar até 10.000 registros não sincronizados no buffer local (IndexedDB) com política FIFO (First In First Out) caso limite seja atingido

**NFR14:** O sistema deve estar em português brasileiro para toda interface, mensagens de erro, documentação e comentários no código

**NFR15:** O sistema deve validar cálculos de OEE com margem de tolerância ±2% comparado a planilhas de validação do Gerente de Processos (Sávio Rafael)

---
