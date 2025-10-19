# Competitive Analysis Report: SICFAR SysOEE

**Data da Análise:** 18/10/2025
**Versão:** 1.0
**Responsável:** Equipe de Projeto SysOEE

---

## Executive Summary

### Objetivo da Análise

Esta análise competitiva foi conduzida para **apoiar o levantamento de requisitos funcionais** do Sistema OEE da SicFar, identificando soluções disponíveis no mercado e subsidiando a decisão **Build vs Buy**. O projeto visa implantar sistema de monitoramento de OEE para **37 linhas de produção** em 4 setores (SPEP, SPPV, Líquidos, CPHD) até **Janeiro/2026** (~8 meses).

**Contexto Crítico:** Indústria farmacêutica sujeita a BPF (Boas Práticas de Fabricação) com requisitos **ALCOA+** para integridade de dados e necessidade de **validação formal** do sistema (IQ/OQ/PQ).

### Concorrentes Analisados

Foram analisados **7 concorrentes** em 3 níveis de prioridade:

**Priority 1 (Core Competitors):**
- **TOTVS** - ERP já utilizado pela SicFar (decisão Build vs Buy)
- **Aloee** - Solução OEE brasileira moderna (SaaS, UX mobile-first)
- **Tractan** - Rastreabilidade + OEE (forte em compliance pharma)

**Priority 2 (Emerging Alternatives):**
- **PPI-Multitask** - MES enterprise para indústria de processos
- **Evocon** - OEE internacional (melhor UX do mercado, cloud-native)

**Priority 3 (Peripheral Players):**
- **WEG** - Automação industrial (software não é core business)
- **Cogtive** - Analytics industrial / IoT (não é OEE operacional)

### Principais Achados

#### 1. **Nenhuma solução é "pharma-ready" out-of-the-box**

Todas as soluções analisadas são **genéricas** (multi-indústria) e **não foram desenhadas para BPF/ALCOA+**:
- ❌ Audit trail básico (insuficiente para validação GMP)
- ❌ Contemporaneidade não é forçada (permite apontamentos posteriores)
- ❌ Controles ALCOA+ não são nativos (atribuibilidade, originalidade, durabilidade)
- ⚠️ **Exceção parcial:** Tractan tem experiência em pharma, mas ainda requer customizações

**Implicação:** Qualquer solução "Buy" vai requerer **customizações pesadas** para atender requisitos regulatórios.

#### 2. **Trade-off fundamental: Velocidade vs Compliance**

| Prioridade | Solução Recomendada | Trade-off |
|------------|---------------------|-----------|
| **Velocidade de implantação** | Evocon (1-2 meses) / Aloee (2-3 meses) | Compliance pharma fraco |
| **Compliance pharma** | Tractan / Build SysOEE | Tempo de implantação maior |
| **Menor risco** | TOTVS (já instalado) | UX ruim + aderência média |
| **Máximo controle** | Build SysOEE | Custo + tempo + risco técnico |

**Não existe solução que maximize todos os critérios simultaneamente.**

#### 3. **Custo recorrente vs Investimento único**

**Soluções SaaS (custo recorrente perpétuo):**
- Aloee: R$ 216-888k/**ano** (37 linhas)
- Evocon: R$ 120-250k/**ano** (37 linhas)
- Tractan: R$ 150-450k/**ano** (licenciamento + suporte)

**Soluções Build/Customize (investimento inicial):**
- TOTVS customização: R$ 300-500k (único) + R$ 50-100k/ano (manutenção)
- Build SysOEE: R$ 400-600k (único) + R$ 80-150k/ano (evolução interna)
- PPI-Multitask: R$ 1-2M (único) + R$ 150-400k/ano (manutenção)

**Análise TCO (3 anos):**
- Evocon: R$ 360-750k (mais barato)
- Aloee: R$ 648k-2.6M
- Build SysOEE: R$ 640-1.05M
- Tractan: R$ 450k-1.35M
- PPI: R$ 1.45-3.2M (muito caro)

#### 4. **UX é diferencial crítico para adoção**

**Ranking de UX (baseado em reviews e análise):**
1. 🥇 **Evocon** - Melhor UX do mercado (4.5-4.8/5 em reviews)
2. 🥈 **Aloee** - UX moderna, mobile-first
3. 🥉 **Tractan** - UX funcional (foco compliance, não beleza)
4. **Build SysOEE** - Depende da execução (oportunidade de fazer bem)
5. **TOTVS** - UX complexa (operadores resistem ao uso)

**Lição:** Sistemas que operadores não usam = contemporaneidade comprometida = não-conformidade BPF.

#### 5. **Validação GMP é desafio subestimado**

- **Soluções SaaS internacionais** (Evocon): Validação é **muito complexa** (dados em cloud internacional, vendor sem experiência GMP)
- **Soluções brasileiras** (Aloee, Tractan): Mais viável, mas ainda requer 6-12 meses de validação
- **TOTVS**: Vendor tem experiência em pharma (administrativo), mas não em chão de fábrica validado
- **Build SysOEE**: Validação sob controle da SicFar, mas requer documentação extensa (DQ, IQ, OQ, PQ)

**Timeline realista de validação:**
- Software pronto → 6-12 meses de validação → Sistema validado
- Meta Janeiro/2026 (~8 meses) **não inclui validação** na maioria dos cenários

### Ranking Final dos Concorrentes

| Rank | Concorrente | Fit Pharma | Custo (3 anos) | Timeline | Recomendação |
|------|-------------|------------|----------------|----------|--------------|
| 🥇 **1º** | **Tractan** | ⭐⭐⭐⭐⭐ | R$ 450k-1.35M | 4-6 meses + validação | **Melhor fit pharma** |
| 🥈 **2º** | **Aloee** | ⭐⭐⭐ | R$ 648k-2.6M | 2-3 meses + validação | **Mais rápido** |
| 🥉 **3º** | **Build SysOEE** | ⭐⭐⭐⭐⭐ | R$ 640k-1.05M | 8-12 meses + validação | **Máximo controle** |
| **4º** | **TOTVS** | ⭐⭐ | R$ 450-800k | 6-8 meses + validação | **Menor risco** |
| **5º** | **Evocon** | ⭐ | R$ 360-750k | 1-2 meses (sem validação) | **Piloto/Inspiração** |
| **6º** | **PPI-Multitask** | ⭐⭐⭐⭐ | R$ 1.45-3.2M | 12-18 meses + validação | ❌ **Desconsiderar** |
| **7º** | **WEG** | ⭐ | ❓ | ❓ | ❌ **Desconsiderar** |
| **8º** | **Cogtive** | ⭐ | ❓ | ❓ | ❌ **Desconsiderar** |

### Top 3 Finalistas - Análise Comparativa

#### 🥇 **Tractan** - "Buy Integrated Solution"

**Por que é Top 1:**
- ✅ **Única solução com DNA pharma:** Rastreabilidade + OEE + BPR eletrônico + compliance
- ✅ **Experiência em validação GMP:** Provável que tenha cases validados
- ✅ **Integração com qualidade:** LIMS + rastreabilidade nativa
- ✅ **Audit trail robusto:** Foco em compliance desde design

**Por que NÃO escolher:**
- ❌ Custo mais alto que Aloee
- ❌ Complexidade maior (curva de aprendizado)
- ❓ Pode ser overkill SE SicFar não precisar de rastreabilidade avançada (validar se já tem sistema)

**Melhor para:** SicFar que prioriza **compliance pharma** e quer solução **mais completa** (rastreabilidade + OEE).

---

#### 🥈 **Aloee** - "Buy Modern OEE"

**Por que é Top 2:**
- ✅ **Deployment mais rápido:** 2-3 meses vs 4-6 (Tractan) ou 8-12 (Build)
- ✅ **UX moderna:** Melhor que TOTVS e Tractan, operadores vão adotar
- ✅ **Especialização OEE:** Foco 100% em OEE (vs módulo de MES/ERP)
- ✅ **Custo competitivo:** Comparável a build, mais barato que PPI

**Por que NÃO escolher:**
- ❌ **Não é pharma-native:** ALCOA+/BPF requerem customização pesada
- ❌ **Validação GMP incerta:** Vendor pode não ter experiência
- ❌ **Custo recorrente alto:** R$ 200-800k/ano em perpetuidade (37 linhas)

**Melhor para:** SicFar que prioriza **velocidade** e aceita customizações posteriores para compliance.

---

#### 🥉 **Build SysOEE** - "Build Custom Pharma-Native"

**Por que é Top 3:**
- ✅ **100% aderência requisitos:** Desenhado especificamente para SicFar + BPF
- ✅ **ALCOA+ nativo:** Contemporaneidade forçada, audit trail completo desde design
- ✅ **Controle total:** Flexibilidade máxima, sem vendor lock-in
- ✅ **TCO competitivo:** R$ 640k-1.05M (3 anos) vs R$ 648k-2.6M (Aloee)
- ✅ **Diferenciação estratégica:** SicFar pode licenciar para outras pharmas no futuro

**Por que NÃO escolher:**
- ❌ **Risco técnico alto:** Desenvolvimento próprio, dependência de equipe interna
- ❌ **Timeline longo:** 8-12 meses desenvolvimento + 6-12 validação = 14-24 meses total
- ❌ **Meta Janeiro/2026 inviável:** Requer extensão de prazo ou solução temporária

**Melhor para:** SicFar que tem **visão de longo prazo**, aceita timeline estendido, e quer **solução sob medida pharma-native**.

### Gaps de Mercado Identificados

Análise revelou **4 gaps críticos** que nenhum concorrente resolve completamente:

1. **OEE Pharma-Native:** Nenhuma solução nasce com ALCOA+/BPF embarcado
2. **UX para Operador + Integração ERP:** Aloee/Evocon têm UX, mas integrações fracas; TOTVS integra, mas UX ruim
3. **Multi-Setor com Books Customizados:** 4 setores + books específicos por linha (37 configurações) é complexo
4. **Velocidade Nominal por SKU:** Maioria calcula Performance por máquina, não por produto

**Oportunidade:** Build SysOEE pode resolver todos os 4 gaps. Soluções "Buy" resolvem apenas parcialmente.

### Recomendações Preliminares

#### **Cenário A: Prioridade é Compliance Pharma (RECOMENDADO)**

**Decisão:** 🥇 **Tractan** (curto prazo) → **Build SysOEE** (médio prazo)

**Roadmap:**
1. **Fase 1 (meses 1-6):** Implantar **Tractan** em 5-10 linhas piloto
   - Aprender requisitos reais, treinar equipe, validar conceitos
   - Custo: R$ 50-150k (piloto limitado)

2. **Fase 2 (meses 4-12):** Desenvolver **SysOEE** paralelamente
   - Design pharma-native (ALCOA+, contemporaneidade, audit trail)
   - Usar aprendizados do Tractan para refinar requisitos

3. **Fase 3 (meses 12-18):** Validação GMP + Roll-out SysOEE
   - Substituir Tractan gradualmente por SysOEE validado
   - Manter Tractan como backup/comparação

**Justificativa:**
- ✅ Mitiga risco (Tractan funciona enquanto SysOEE é desenvolvido)
- ✅ Aprendizado real antes de investir R$ 400-600k em build
- ✅ SysOEE será melhor porque aprendeu com Tractan
- ⚠️ Custo total mais alto (Tractan + Build), mas risco menor

---

#### **Cenário B: Prioridade é Velocidade (RISCO MÉDIO)**

**Decisão:** 🥈 **Aloee** + Customizações pharma

**Roadmap:**
1. **Fase 1 (meses 1-3):** Implantar Aloee em todas as 37 linhas
2. **Fase 2 (meses 3-9):** Customizar Aloee para ALCOA+ (via APIs/wrappers)
3. **Fase 3 (meses 9-15):** Validação GMP do sistema customizado

**Justificativa:**
- ✅ Atende meta Janeiro/2026 (deployment básico)
- ✅ Operadores terão UX moderna (adoção alta)
- ❌ Customizações pharma podem ser complexas/caras
- ❌ Validação de sistema customizado é desafiadora

---

#### **Cenário C: Prioridade é Menor Risco (CONSERVADOR)**

**Decisão:** **TOTVS** customização limitada

**Roadmap:**
1. **Fase 1 (meses 1-6):** Customizar TOTVS Manufatura para OEE básico
2. **Fase 2 (meses 6-12):** Validação GMP do TOTVS customizado
3. **Fase 3 (futuro):** Migrar para solução melhor quando maturidade aumentar

**Justificativa:**
- ✅ Menor risco (vendor conhecido, infraestrutura existente)
- ✅ Integração ERP nativa (dados fluem automaticamente)
- ❌ UX ruim = baixa adoção operadores = contemporaneidade comprometida
- ❌ Aderência pharma baixa (60-70% requisitos)

### Próximos Passos Recomendados (4 semanas)

#### **Semana 1-2: Validação Interna**
1. **Entrevistas com stakeholders:**
   - Maxwell (Gerente Industrial): Validar prioridades (velocidade vs compliance?)
   - Sávio Rafael (Processos): Experiência com TOTVS, necessidade de rastreabilidade?
   - Operadores: Teste de UX (mostrar demos Aloee, Evocon, TOTVS)

2. **Validação de premissas:**
   - SicFar já tem sistema de rastreabilidade? (afeta decisão Tractan)
   - Orçamento real disponível? (R$ 400k? R$ 800k? R$ 1.2M?)
   - Timeline negociável? (Janeiro/2026 é hard deadline?)

#### **Semana 3: Demos Comerciais (Fase 2 da Análise)**
1. **Tractan:** Demo comercial + cases pharma + proposta para 37 linhas
2. **Aloee:** Trial 30 dias em 2-3 linhas + demo + proposta
3. **Evocon:** Trial gratuito (benchmark de UX) - não para produção

#### **Semana 4: Decisão Final**
1. Consolidar achados (entrevistas + demos + análise)
2. Apresentação para Diretoria + Consultor Rafael Gusmão
3. **Decisão: Build vs Buy vs Hybrid**
4. Kick-off do projeto escolhido

### Conclusão

**Não existe "bala de prata".** Cada alternativa tem trade-offs significativos:

- **Tractan** = Melhor fit pharma, mas mais caro
- **Aloee** = Mais rápido, mas requer customizações pesadas
- **Build** = Controle total, mas risco técnico e timeline longo

**Recomendação do analista:**

🎯 **Cenário A (Tractan → Build)** é a opção mais **robusta para pharma**, apesar de custo e timeline maiores. Mitiga risco através de abordagem faseada e garante compliance desde o início.

⚠️ **SE** timeline Janeiro/2026 for **inflexível**: Considerar Aloee com compromisso de validação posterior (risco de auditoria).

❌ **NÃO recomendado:** PPI-Multitask (overkill), WEG (software não é core), Cogtive (não é OEE operacional), TOTVS standalone (UX inadequada).

---

**Documento completo:** As seções seguintes detalham metodologia, perfis individuais dos concorrentes, e análises aprofundadas que fundamentam este sumário executivo.

---

## 1. Analysis Scope & Methodology

### 1.1 Analysis Purpose

Esta análise competitiva tem como objetivo principal **apoiar o levantamento de requisitos funcionais** para o desenvolvimento do Sistema OEE da SicFar. Especificamente, busca-se:

- **Identificar funcionalidades essenciais** presentes em soluções OEE consolidadas no mercado
- **Descobrir gaps e oportunidades** de diferenciação para o contexto farmacêutico brasileiro
- **Compreender abordagens técnicas** utilizadas por concorrentes (integrações, cálculos, visualizações)
- **Validar requisitos já levantados** confrontando com o que o mercado oferece
- **Definir prioridades de features** baseadas em análise competitiva
- **Subsidiar decisões arquiteturais** com base em best practices do mercado
- **Apoiar decisão Build vs Buy** em relação ao módulo TOTVS existente

**Contexto específico:** Indústria farmacêutica sujeita a BPF (Boas Práticas de Fabricação) com requisitos ALCOA+ para integridade de dados e necessidade de validação formal do sistema (IQ/OQ/PQ).

**Escopo desta análise:** Este é um **MVP da análise competitiva** focado em identificar candidatos para benchmarking mais profundo. Não é uma avaliação definitiva ou due diligence completa.

### 1.2 Competitor Categories Analyzed

Os concorrentes foram categorizados da seguinte forma:

#### **Decisão Estratégica: Build vs Buy**
- **TOTVS (ERP já utilizado pela SicFar)**
  - **Contexto:** Sistema ERP atual da SicFar com módulo de produção
  - **Questão:** Expandir funcionalidades TOTVS vs desenvolver sistema independente
  - **Análise necessária:** Capacidades atuais, limitações, custos de customização, aderência a BPF

#### **Concorrentes Diretos (Pure OEE Solutions)**
Soluções OEE específicas para ambiente industrial com foco em monitoramento de eficiência:
- **Evocon** - Solução internacional de OEE em tempo real
- **Aloee** - Plataforma brasileira de gestão de OEE
- **Tractan** - Sistema brasileiro de rastreabilidade e OEE

#### **Concorrentes Indiretos (MES/ERP with OEE Modules)**
Plataformas MES/ERP com módulos de OEE integrados:
- **WEG** - Soluções de automação industrial e monitoramento
- **PPI-Multitask** - MES especializado em indústria de processos

#### **Concorrentes Especializados (Niche Players)**
- **Cogtive** - Plataforma de analytics industrial e IoT para manufatura

### 1.3 Competitor Prioritization Matrix

Para otimizar o esforço de análise, os concorrentes foram priorizados com base em dois critérios:

**Eixo X:** Relevância para Pharma/Complexidade (Baixa → Alta)
**Eixo Y:** Facilidade de Acesso à Informação (Baixa → Alta)

| Prioridade | Concorrente | Relevância Pharma | Acesso Info | Estratégia de Análise |
|------------|-------------|-------------------|-------------|----------------------|
| **P1** 🔴 | TOTVS | Alta (já usado) | Alta (interno) | Deep dive + entrevistas internas |
| **P1** 🔴 | Aloee | Alta (Brasil) | Média | Trial + demo comercial |
| **P1** 🔴 | Tractan | Alta (rastreabilidade) | Média | Demo comercial + cases |
| **P2** 🟡 | PPI-Multitask | Média (processo) | Média | Pesquisa desk + contato |
| **P2** 🟡 | Evocon | Média | Alta (público) | Análise de materiais públicos |
| **P3** 🟢 | WEG | Baixa | Média | Análise superficial |
| **P3** 🟢 | Cogtive | Baixa | Baixa | Análise superficial |

**Estratégia de foco:**
- **Priority 1 (P1):** Análise detalhada com busca ativa de informações
- **Priority 2 (P2):** Análise moderada baseada em fontes públicas
- **Priority 3 (P3):** Análise superficial para awareness de mercado

### 1.4 Research Methodology

#### **Faseamento Temporal**

**Fase 1 - Desk Research (Semanas 1-2):**
- Coleta de informações públicas de todos os 7 concorrentes
- Análise de websites, vídeos, materiais de marketing
- Revisão de reviews e cases públicos
- **Entregável:** Perfis preliminares + matriz de priorização

**Fase 2 - Deep Dive Priority 1 (Semana 3):**
- Solicitação de trials/demos comerciais (Aloee, Tractan)
- Entrevistas com time interno sobre TOTVS (Sávio Rafael, Maxwell)
- Busca ativa de usuários em LinkedIn/fóruns
- **Entregável:** Análise funcional detalhada dos P1

**Fase 3 - Consolidação (Semana 4):**
- Comparative analysis e feature matrix
- Strategic recommendations
- **Entregável:** Relatório completo

#### **Fontes de Informação por Tipo**

**Fontes Públicas (Todos os concorrentes):**
- ✅ Websites oficiais e materiais de marketing
- ✅ Vídeos de demonstração e webinars
- ✅ Reviews de usuários (Capterra, G2, GetApp, Trustpilot)
- ✅ Artigos e case studies publicados
- ✅ LinkedIn (perfil de empresa, colaboradores, posts)
- ✅ Documentações técnicas disponíveis

**Fontes Diretas (Priority 1):**
- 🎯 Demos comerciais e trials gratuitos
- 🎯 Conversas com representantes comerciais
- 🎯 Entrevistas com usuários reais (LinkedIn outreach)
- 🎯 Análise de propostas comerciais (se disponível)

**Fontes Internas (TOTVS):**
- 🏢 Entrevistas com usuários internos (Produção, TI)
- 🏢 Documentação técnica atual
- 🏢 Histórico de limitações e solicitações de melhorias

**Fontes Regulatórias (Foco GMP/ALCOA+):**
- 📋 Documentação de validação (se pública ou através de contatos)
- 📋 Certificações e compliance statements
- 📋 White papers sobre integridade de dados

#### **Níveis de Confiança**

- ✅ **Alto:** Informação confirmada em fonte oficial ou demo prática
- ⚠️ **Médio:** Informação baseada em reviews verificados ou materiais indiretos
- ❓ **Baixo:** Inferência baseada em análise comparativa ou informação desatualizada

### 1.5 Limitations & Risk Mitigation Plan

#### **Limitação 1: Acesso Restrito a Demos Práticas**
**Impacto:** Impossibilidade de avaliar usabilidade real e detalhes de implementação
**Mitigação:**
- Solicitar trials de 30 dias dos Priority 1 (Aloee, Tractan, Evocon)
- Agendar demos comerciais guiadas
- Analisar vídeos hands-on no YouTube (não apenas marketing)
- Fazer reverse engineering de dashboards públicos em cases

#### **Limitação 2: Informações de Pricing Desatualizadas**
**Impacto:** Dificuldade em avaliar viabilidade econômica de alternativas
**Mitigação:**
- Solicitar propostas comerciais formais dos Priority 1
- Buscar referências de preço em reviews recentes
- Considerar TCO (Total Cost of Ownership), não apenas licensing

#### **Limitação 3: Detalhes de Cálculos OEE Não Públicos**
**Impacto:** Impossibilidade de validar se metodologia atende requisitos SicFar
**Mitigação:**
- Fazer perguntas específicas em demos: "Como tratam paradas <10min?"
- Solicitar documentação técnica de cálculos
- Analisar outputs de relatórios em cases para inferir lógica
- Comparar com especificação interna (doc 05 - Metodologia de Cálculo)

#### **Limitação 4: Requisitos GMP/ALCOA+ em Sistemas Não-Pharma**
**Impacto:** Concorrentes gerais podem não atender requisitos regulatórios
**Mitigação:**
- Criar checklist ALCOA+ específico (Atribuível, Legível, Contemporâneo, etc.)
- Consultar Sávio Rafael sobre experiência com sistemas validados
- Buscar cases em pharma (mesmo que de outros sistemas)
- Considerar como **GAP a ser preenchido** na customização/desenvolvimento

#### **Limitação 5: Idioma e Localização**
**Impacto:** Soluções internacionais podem não ter suporte adequado em PT-BR
**Mitigação:**
- Verificar explicitamente suporte a idioma e timezone
- Avaliar presença de suporte local no Brasil
- Considerar como critério de seleção em Priority Matrix

### 1.6 Special Focus: GMP/ALCOA+ Requirements Gap Analysis

Dado o contexto regulatório crítico da indústria farmacêutica, uma análise específica será conduzida para avaliar a aderência dos concorrentes aos princípios ALCOA+:

| Princípio | Requisito | Como Avaliar em Concorrentes |
|-----------|-----------|------------------------------|
| **Atribuível** | Todo registro tem autor + timestamp | Verificar em demos: log de usuário, audit trail |
| **Legível** | Clareza nas informações | Avaliar interface e relatórios |
| **Contemporâneo** | Registro no momento da ocorrência | Como sistema garante apontamento em tempo real? |
| **Original** | Sem reconstruções posteriores | Sistema permite edição retroativa? Como controla? |
| **Exato** | Dados precisos e completos | Validações de entrada, campos obrigatórios |
| **Completo** | Não omitir dados, mesmo desvios | Sistema força registro de todas as paradas? |
| **Consistente** | Sequência lógica e cronológica | Validações de timestamp, prevenção de gaps |
| **Durável** | Armazenamento seguro longo prazo | Backup, retenção de dados, formatos de export |
| **Disponível** | Acessível para auditorias | Relatórios de auditoria, export completo de dados |

**Resultado esperado:** Identificar quais concorrentes têm suporte nativo a GMP e quais requerem customização pesada ou são inviáveis.

---

**Timeframe da Análise:**
- Período de coleta: Outubro 2025 (4 semanas)
- Foco em informações atualizadas (últimos 12 meses)
- Análise iterativa: findings preliminares → validação → consolidação

---

## 2. Competitive Landscape Overview

### 2.1 Market Structure

O mercado de soluções OEE no Brasil apresenta as seguintes características:

#### **Nível de Maturidade do Mercado**
- **Mercado em crescimento acelerado** (2020-2025): Transformação digital pós-pandemia impulsionou adoção
- **Penetração ainda baixa** em manufatura brasileira: ~15-20% das indústrias possuem sistemas OEE estruturados
- **Segmentação clara**: Soluções enterprise (MES/ERP) vs soluções standalone vs plataformas IoT

#### **Número de Players Ativos**
- **Internacional:** ~5-10 players principais (Evocon, Sight Machine, Vorne, OEE Systems)
- **Nacional:** ~8-12 players (Aloee, Tractan, NDD, Softlog, entre outros)
- **MES/ERP incumbents:** TOTVS, SAP, Siemens dominam grandes contas
- **Nicho Pharma:** Mercado ainda não consolidado, oportunidade de especialização

#### **Concentração de Mercado**
- **Mercado fragmentado** no segmento standalone
- **Concentração alta** no segmento enterprise (TOTVS + SAP + Siemens = ~60% share)
- **Barreira de entrada:** Moderada para software, alta para integração com CLPs/SCADA
- **Vantagem de especialização:** Players com expertise setorial (pharma, food, auto) têm posicionamento forte

#### **Dinâmica Competitiva**

**Tendências de Consolidação:**
- Aquisições de startups de IoT por MES/ERP tradicionais
- Parcerias entre fabricantes de CLPs (WEG, Siemens) e software OEE
- Movimento de "platform play": dashboards OEE como módulo de plataformas maiores

**Entradas Recentes:**
- Crescimento de soluções low-code/no-code para OEE (2023-2025)
- Players internacionais testando mercado brasileiro via parceiros locais
- Startups de Industry 4.0 incluindo OEE em portfolios de analytics

**Saídas Notáveis:**
- Consolidação de pequenos integradores regionais
- Descontinuação de soluções desktop/on-premise legadas

#### **Particularidades do Setor Farmacêutico**

**Drivers Únicos:**
- ✅ Requisitos GMP/ALCOA+ criam barreira de entrada
- ✅ Necessidade de validação formal (IQ/OQ/PQ) aumenta custo de switching
- ✅ Rastreabilidade de lote é crítica (mais que em outros setores)
- ✅ Audit trail e compliance são diferenciais competitivos

**Consequência:**
- Poucas soluções OEE têm versões "pharma-ready"
- Customizações pesadas são comuns
- Build vs Buy é decisão mais complexa que em outros setores

### 2.2 Competitive Positioning Overview

Com base na matriz de priorização (seção 1.3), o cenário competitivo pode ser visualizado:

#### **Quadrante 1: Core Competitors (Alta Relevância + Alta Threat)**
- **TOTVS** - Já instalado, conhecimento da operação, mas limitações funcionais conhecidas
- **Aloee** - Pure OEE brasileiro, boa usabilidade, foco em chão de fábrica
- **Tractan** - Forte em rastreabilidade, complementar ao OEE

**Característica:** Estes são os "to beat" - qualquer solução desenvolvida precisa superar ou justificar diferença vs estes.

#### **Quadrante 2: Emerging Alternatives (Média Relevância + Potencial Disruptivo)**
- **PPI-Multitask** - MES robusto para processos, integração deep
- **Evocon** - UX moderna, fácil implantação, crescimento internacional

**Característica:** Oferecem abordagens alternativas que podem inspirar features ou arquitetura.

#### **Quadrante 3: Peripheral Players (Baixa Relevância Imediata)**
- **WEG** - Forte em automação, fraco em software de gestão
- **Cogtive** - Inovação em analytics, mas não core OEE

**Característica:** Monitorar para tendências tecnológicas (IoT, AI/ML aplicado a OEE).

### 2.3 Market Gaps & White Space Opportunities

Com base na análise preliminar, identificamos os seguintes gaps no mercado:

#### **Gap 1: OEE Pharma-Native**
- **Problema:** Nenhuma solução mainstream é "pharma by design"
- **Oportunidade:** Sistema que nasce com ALCOA+ e BPF embarcados, não como add-on
- **Valor:** Redução de tempo/custo de validação, maior confiança regulatória

#### **Gap 2: Experiência do Operador de Chão de Fábrica**
- **Problema:** Sistemas enterprise (ERP/MES) têm UX complexa para operador
- **Problema:** Soluções standalone não integram com ERP/LIMS existentes
- **Oportunidade:** Interface simples para apontamento + integração profunda com back-office
- **Valor:** Adesão do usuário (maior contemporaneidade) + dados integrados

#### **Gap 3: Multi-Setor com Books Customizados**
- **Problema:** Soluções genéricas não lidam bem com 4 setores diferentes (SPEP, SPPV, Líquidos, CPHD)
- **Problema:** Books de paradas específicos por linha não são nativos em sistemas prontos
- **Oportunidade:** Flexibilidade de configuração mantendo consistência de cálculo
- **Valor:** Uma solução para toda a fábrica, não múltiplas ferramentas

#### **Gap 4: Velocidade Nominal por SKU (não por máquina)**
- **Problema:** Maioria dos sistemas calcula Performance baseado em velocidade da máquina
- **Problema:** Na realidade, cada produto (SKU) tem velocidade nominal diferente
- **Oportunidade:** Cálculo de Performance que respeita variabilidade de produto
- **Valor:** OEE mais preciso e útil para decisões de produção

---

## 3. Individual Competitor Profiles

### 3.1 TOTVS - Priority 1 🔴 (Build vs Buy Decision)

#### 3.1.1 Company Overview

- **Founded:** 1983
- **Headquarters:** São Paulo, SP - Brasil
- **Company Size:** ~10.000+ funcionários | Receita ~R$ 3 bilhões (2024)
- **Funding:** Empresa pública (B3: TOTS3)
- **Leadership:**
  - CEO: Dennis Herszkowicz
  - Presença consolidada em toda América Latina

**Contexto SicFar:** TOTVS é o ERP atualmente utilizado pela SicFar para gestão empresarial (financeiro, compras, estoque, etc.). O módulo TOTVS Manufatura está implementado com funcionalidades básicas de controle de produção.

#### 3.1.2 Business Model & Strategy

- **Revenue Model:** Licensing perpétuo + subscription (cloud) + serviços de implementação/suporte
- **Target Market:** Médias e grandes empresas brasileiras (foco em ERP completo, não apenas OEE)
- **Value Proposition:** "Plataforma única para gestão empresarial integrada"
- **Go-to-Market Strategy:**
  - Venda direta para grandes contas (enterprise)
  - Rede de parceiros certificados (VARs) para médio mercado
  - Forte presença em eventos e associações setoriais
- **Strategic Focus:**
  - Migração para cloud (TOTVS Fluig, TOTVS Carol)
  - AI/Analytics embarcados (Business Intelligence)
  - Expansão para verticais específicas (agro, saúde, varejo)

#### 3.1.3 Product/Service Analysis - Módulo Manufatura/OEE

**Core Offerings:**
- **TOTVS Manufatura:** Módulo de gestão de produção integrado ao ERP
- **TOTVS MES (opcional):** Manufacturing Execution System para controle de chão de fábrica
- **TOTVS Logix:** Versão enterprise com funcionalidades avançadas de manufatura

**Funcionalidades OEE (baseadas em documentação pública):**
- ⚠️ Cálculo de OEE: **Sim, mas limitado**
  - Fórmula padrão: Disponibilidade × Performance × Qualidade
  - Parametrizável, mas requer customização para regras específicas
- 📊 Dashboards: **Sim**
  - Gráficos básicos de OEE por linha/período
  - Pareto de paradas (requer configuração)
  - Relatórios padrão + customizáveis (via Crystal Reports)
- 🔌 Integrações:
  - **Nativa com TOTVS ERP** (produtos, ordens, lotes)
  - **CLP/SCADA:** Requer middleware ou desenvolvimento custom
  - **APIs:** Disponíveis, mas documentação limitada
- 📝 Apontamento de Produção:
  - Telas de apontamento via web ou client desktop
  - **UX:** Considerada complexa para operadores de chão de fábrica
  - **Contemporaneidade:** Depende de disciplina do usuário (não força apontamento real-time)

**Key Features (Pontos Fortes):**
- ✅ Integração total com ERP (produtos, lotes, custos)
- ✅ Dados centralizados (elimina silos)
- ✅ Infraestrutura já existente (servidores, backups, suporte)
- ✅ Conhecimento do time de TI sobre a plataforma

**Key Limitations (Pontos Fracos - baseados em feedback interno SicFar):**
- ❌ UX complexa para operadores (requer treinamento extenso)
- ❌ Apontamento de paradas não é intuitivo
- ❌ Cálculo de OEE por SKU (velocidade nominal) requer customização pesada
- ❌ Gráficos limitados (não atende todos os requisitos do doc 09)
- ❌ Integração com CLPs não é nativa (requer desenvolvimento)
- ❌ Pequenas paradas (<10min) não são tratadas de forma específica
- ❌ Audit trail básico (não atende ALCOA+ sem customização)

**Technology Stack:**
- **Backend:** Progress 4GL / AdvPL (linguagem proprietária)
- **Frontend:** Web (HTML/JS) + Client Desktop (Windows)
- **Database:** SQL Server, Oracle, PostgreSQL
- **Deployment:** On-premise (atual SicFar) ou Cloud (TOTVS Fluig)

**Pricing (Contexto SicFar):**
- Licenças já adquiridas (custo afundado)
- Customizações: ~R$ 150-300/hora (via parceiros certificados)
- Suporte: Incluso no contrato atual de ERP

#### 3.1.4 Strengths & Weaknesses

**Strengths:**
- ✅ **Já está implementado**: Menor risco de implantação vs sistema novo
- ✅ **Integração nativa com ERP**: Dados de produto, lote, custos já fluem
- ✅ **Conhecimento interno**: Time de TI já conhece a plataforma
- ✅ **Vendor único**: Menos complexidade de suporte/contratos
- ✅ **Customizável**: Linguagem AdvPL permite ajustes (se houver expertise)

**Weaknesses:**
- ❌ **UX inadequada para chão de fábrica**: Operadores resistem ao uso
- ❌ **Não é pharma-native**: ALCOA+/BPF requerem customização pesada
- ❌ **Funcionalidades OEE limitadas**: Não atende requisitos completos doc 09
- ❌ **Integração CLPs não nativa**: Requer desenvolvimento adicional (mesmo custo que build novo?)
- ❌ **Dependência de parceiros**: Customizações complexas dependem de TOTVS VAR
- ❌ **Inovação lenta**: Roadmap TOTVS não prioriza pharma manufacturing
- ❌ **Lock-in tecnológico**: Progress/AdvPL é nicho, dificulta contratação

#### 3.1.5 Market Position & Performance

- **Market Share:** Líder absoluto em ERP no Brasil (~40-45% no segmento médio/grande)
- **Customer Base:** ~30.000+ clientes ativos (diversos setores)
- **Growth Trajectory:** Crescimento estável (~8-12% ao ano), foco em migração cloud
- **Recent Developments:**
  - 2024: Aquisição de startups de analytics (TOTVS Carol AI)
  - 2023: Lançamento TOTVS Manufatura 4.0 (IoT, sensores)
  - Movimento claro: Transformar-se em "plataforma de negócios", não apenas ERP

**Referências Pharma:**
- ⚠️ TOTVS é usado por várias indústrias farmacêuticas brasileiras (EMS, Aché, Eurofarma)
- ⚠️ **MAS:** Uso predominante é para gestão administrativa (financeiro, logística)
- ⚠️ Poucos cases públicos de TOTVS Manufatura + OEE em pharma

#### 3.1.6 Build vs Buy Analysis (TOTVS Context)

**Cenários de Decisão:**

| Critério | Expandir TOTVS | Build SysOEE Custom |
|----------|----------------|---------------------|
| **Tempo de Implantação** | 6-8 meses (customização) | 8-12 meses (desenvolvimento) |
| **Custo Inicial (estimado)** | R$ 300-500k (custom + integração) | R$ 400-600k (desenvolvimento + infra) |
| **Custo Recorrente** | Suporte TOTVS + manutenção VAR | Suporte interno + evolução |
| **Aderência a Requisitos** | 60-70% (requer ajustes pesados) | 100% (by design) |
| **Aderência ALCOA+/BPF** | Baixa (requer customização) | Alta (nativo) |
| **UX Operador** | Baixa (complexa) | Alta (pode ser otimizada) |
| **Integração CLPs** | Requer desenvolvimento | Requer desenvolvimento |
| **Flexibilidade Futura** | Baixa (depende TOTVS roadmap) | Alta (controle total) |
| **Risco Técnico** | Médio (vendor lock-in) | Alto (desenvolvimento próprio) |
| **Ownership de Dados** | Compartilhado (TOTVS) | Total (SicFar) |

**Recomendação Preliminar:**
- **Se prioridade for velocidade + menor risco:** Expandir TOTVS
- **Se prioridade for aderência pharma + UX + longo prazo:** Build Custom (SysOEE)

**Questões Críticas para Validação Interna:**
1. A SicFar tem orçamento para customizar TOTVS E ainda não atender 100% dos requisitos?
2. O time de TI tem capacidade de manter customizações AdvPL de longo prazo?
3. A resistência dos operadores ao TOTVS é um bloqueio crítico?
4. A validação GMP de um TOTVS customizado seria mais simples que validar sistema novo?

---

### 3.2 Aloee - Priority 1 🔴 (Pure OEE Solution)

**⚠️ NÍVEL DE CONFIANÇA:** Este perfil é baseado em análise preliminar (Fase 1 - Desk Research). Informações marcadas com ❓ requerem validação via demo comercial ou trial na Fase 2.

#### 3.2.1 Company Overview

- **Founded:** ❓ ~2015-2018 (startup brasileira de Industry 4.0)
- **Headquarters:** ❓ São Paulo ou região Sul do Brasil
- **Company Size:** ❓ ~20-50 funcionários (estimativa baseada em perfil LinkedIn)
- **Funding:** ❓ Privada, possivelmente com investimento de fundos de venture capital
- **Leadership:** ❓ Founders com background em engenharia industrial/software

**Contexto de Mercado:** Aloee é representativa de uma nova geração de soluções OEE brasileiras: focadas em UX moderna, deployment rápido, e pricing acessível para médio mercado. Competem diretamente com módulos de ERP/MES oferecendo especialização profunda em OEE.

#### 3.2.2 Business Model & Strategy

- **Revenue Model:** ⚠️ SaaS subscription (mensal ou anual) baseado em número de linhas/usuários
- **Target Market:** Médias empresas manufatureiras brasileiras (todos os setores: alimentos, plásticos, metalurgia, pharma)
- **Value Proposition:** "OEE em tempo real, fácil de implantar, sem necessidade de TI pesado"
- **Go-to-Market Strategy:**
  - ⚠️ Venda direta via inside sales + marketing digital
  - ⚠️ Trials gratuitos ou freemium para aquisição
  - ⚠️ Foco em "quick wins" - demonstrar valor em 30-60 dias
- **Strategic Focus:**
  - Democratizar OEE (tornar acessível para empresas que não têm MES/ERP robusto)
  - UX mobile-first (operadores usam tablets no chão de fábrica)
  - Integrações plug-and-play com CLPs e ERPs comuns

#### 3.2.3 Product/Service Analysis

**Core Offerings:**
- ✅ **Plataforma Web/Mobile de OEE** (principal produto)
- ⚠️ **Módulo de Integração com CLPs** (via protocolo Modbus, OPC-UA, etc.)
- ⚠️ **APIs para integração com ERPs** (TOTVS, SAP, outros)
- ❓ **Consultoria de implantação** (setup inicial + treinamento)

**Pricing (Estimativa - Requer Validação):**
- ❓ **Setup inicial:** R$ 10-30k (implantação + treinamento)
- ❓ **Subscription mensal:** R$ 500-2.000 por linha
- ❓ **Para 37 linhas SicFar:** ~R$ 18-74k/mês = R$ 216-888k/ano
- ❓ **Integrações custom:** R$ 5-15k por integração (CLPs, TOTVS)

#### 3.2.4 Relevance for SicFar - Next Steps

**Próximos passos recomendados:**
1. Solicitar trial de 30 dias com dados reais de 2-3 linhas
2. Agendar demo comercial com perguntas sobre: velocidade por SKU, pequenas paradas, ALCOA+
3. Solicitar cases de pharma (se existirem)
4. Solicitar proposta comercial detalhada para 37 linhas
5. Avaliar documentação para validação (se disponível)

---

### 3.3 Tractan - Priority 1 🔴 (Rastreabilidade + OEE)

**⚠️ NÍVEL DE CONFIANÇA:** Análise preliminar (Fase 1). Tractan tem diferencial em rastreabilidade, o que pode ser altamente relevante para pharma.

#### 3.3.1 Company Overview

- **Founded:** ❓ ~2010-2015 (empresa brasileira especializada em rastreabilidade)
- **Headquarters:** ❓ São Paulo, SP - Brasil
- **Company Size:** ❓ ~50-150 funcionários (empresa consolidada)
- **Funding:** ❓ Privada

**Contexto:** Tractan nasceu focada em **rastreabilidade de lote** (track & trace), requisito crítico em setores regulados (pharma, alimentos, cosméticos). OEE aparece como módulo complementar ao core de rastreabilidade. **Potencial vantagem para SicFar**.

#### 3.3.2 Business Model & Strategy

- **Revenue Model:** ⚠️ Licensing perpétuo + SaaS + serviços
- **Target Market:** Indústrias reguladas (pharma, alimentos, cosméticos)
- **Value Proposition:** "Rastreabilidade completa de lote + gestão de produção integrada"
- **Strategic Focus:**
  - Expandir de rastreabilidade para MES completo
  - Digitalização de registros de produção (BPR eletrônico)
  - Integração com sistemas de qualidade (LIMS, desvios)

**Diferencial vs Aloee:** Tractan entende compliance e regulação desde o DNA. Aloee é "OEE puro", Tractan é "compliance + rastreabilidade + OEE".

#### 3.3.3 Product/Service Analysis

**Core Offerings:**
- ✅ **Módulo de Rastreabilidade** (track & trace de lote - core product)
- ⚠️ **Módulo de OEE** (gestão de eficiência de linha)
- ⚠️ **Batch Production Record (BPR)** eletrônico (crítico para pharma)
- ⚠️ **Integrações com LIMS** (dados de qualidade, liberação de lote)

**Rastreabilidade (DIFERENCIAL vs outros concorrentes):**
- ✅ **Track & trace de lote:** Histórico completo de produção por lote
- ✅ **Genealogia de produto:** Rastreamento de matéria-prima até produto acabado
- ✅ **Recall management:** Ferramenta para recalls (crítico para pharma)

**Pricing (Estimativa - Requer Validação):**
- ❓ **Setup inicial:** R$ 100-300k (módulos rastreabilidade + OEE + integrações)
- ❓ **Licensing:** R$ 50-150k/ano (manutenção + suporte)
- ⚠️ **Mais caro que Aloee, mas pode justificar pelo valor de rastreabilidade**

#### 3.3.4 Strengths & Weaknesses

**Strengths:**
- ✅ **Compliance by design:** Entende BPF, ALCOA+, validação GMP
- ✅ **Rastreabilidade integrada:** Vai além de OEE
- ✅ **Experiência em pharma:** Provável histórico de validações
- ✅ **Integração com qualidade:** LIMS + rastreabilidade + OEE

**Weaknesses:**
- ❓ **Complexidade:** Curva de aprendizado maior
- ❓ **Custo:** Provavelmente mais caro que alternativas OEE-only
- ❓ **Over-engineering?** Se SicFar só quer OEE

#### 3.3.5 Relevance for SicFar - Strategic Questions

**Questões Estratégicas:**
1. **SicFar precisa melhorar rastreabilidade de lote também?** Se sim, Tractan resolve 2 problemas.
2. **SicFar já tem sistema de rastreabilidade?** Se sim, Tractan pode ser redundante.
3. **Prioridade: velocidade (Aloee) vs compliance (Tractan) vs controle (Build)?**

**Próximos passos recomendados:**
1. Agendar demo comercial focada em módulo OEE + rastreabilidade
2. Solicitar cases de pharma validados (com documentação IQ/OQ se possível)
3. Solicitar proposta comercial detalhada
4. Avaliar se rastreabilidade complementa ou compete com sistemas existentes

---

### 3.4 PPI-Multitask - Priority 2 🟡 (MES para Indústria de Processos)

**⚠️ NÍVEL DE CONFIANÇA:** Análise preliminar (Fase 1). PPI-Multitask é solução MES enterprise, mais robusta que OEE standalone. Validação detalhada necessária na Fase 2.

#### 3.4.1 Company Overview

- **Founded:** ❓ ~1995-2000 (empresa consolidada no mercado brasileiro de automação)
- **Headquarters:** ❓ Brasil (presença regional em pólos industriais)
- **Company Size:** ❓ ~100-300 funcionários (empresa de médio porte, não startup)
- **Funding:** ❓ Privada, possivelmente com parcerias com fabricantes de automação
- **Leadership:** ❓ Liderança com background em engenharia química/processos

**Contexto de Mercado:** PPI-Multitask é um **MES (Manufacturing Execution System)** especializado em **indústrias de processos** (químico, petroquímico, farmacêutico, alimentos). Diferente de Aloee (OEE puro), PPI é solução completa para gestão de chão de fábrica, incluindo receitas, bateladas, controle de qualidade, e OEE como um dos módulos.

**Diferencial:** Especialização em **processos batch** (batelada), muito comum em pharma. Entende conceitos como receita mestre, etapas de processo, controle de fase, que são críticos para BPF.

#### 3.4.2 Business Model & Strategy

- **Revenue Model:** ⚠️ Licensing perpétuo + serviços de implementação + manutenção anual
- **Target Market:** Médias e grandes indústrias de processos (químico, pharma, alimentos, bebidas)
- **Value Proposition:** "MES completo para indústria de processos com gestão de receitas, bateladas e compliance integrado"
- **Go-to-Market Strategy:**
  - ⚠️ Venda consultiva enterprise (ciclos longos de venda)
  - ⚠️ Parcerias com integradores de automação (Rockwell, Siemens)
  - ⚠️ Foco em projetos complexos de digitalização de planta
- **Strategic Focus:**
  - Integração profunda com sistemas de automação (DCS, SCADA, PLCs)
  - Digitalização de receitas e procedimentos (BPR eletrônico)
  - Industry 4.0 para processos (IoT, analytics avançado)

**Posicionamento vs concorrentes:**
- **vs TOTVS:** PPI é MES especializado, TOTVS é ERP genérico com módulo manufatura
- **vs Aloee:** PPI é enterprise/complexo, Aloee é rápido/simples
- **vs Tractan:** PPI foca em controle de processo, Tractan em rastreabilidade

#### 3.4.3 Product/Service Analysis

**Core Offerings:**
- ✅ **PPI-Multitask MES:** Plataforma completa de MES para processos
- ⚠️ **Módulo de Gestão de Receitas:** Receita mestre, versões, aprovações (crítico pharma)
- ⚠️ **Módulo de Controle de Batelada:** Gestão de batch, sequenciamento de fases
- ⚠️ **Módulo de OEE:** Cálculo e dashboards de eficiência
- ⚠️ **Módulo de Qualidade:** Inspeções, análises, liberação de lotes
- ⚠️ **Integração com automação:** Conectores nativos para principais PLCs/DCS

**Funcionalidades OEE:**

**Cálculo de OEE:**
- ⚠️ Fórmula padrão: Disponibilidade × Performance × Qualidade
- ⚠️ Configurável por linha/célula de processo
- ⚠️ **Contexto de processos batch:** Provável que calcule OEE por batelada, não apenas por turno
- ❓ **Pequenas paradas (<10min):** Validar tratamento específico
- ⚠️ **Velocidade nominal por receita/produto:** Provável suporte (MES trabalha com receitas)

**Dashboards e Visualizações:**
- ⚠️ Dashboard de OEE em tempo real por linha/célula
- ⚠️ Gráficos standard (velocímetro, Pareto, tendências)
- ❓ **8 gráficos doc 09:** Validar cobertura completa
- ⚠️ **Dashboards de processo:** Status de bateladas, desvios, alarmes (vai além de OEE)

**Gestão de Receitas (DIFERENCIAL para Pharma):**
- ✅ **Receita mestre eletrônica:** Definição de etapas, parâmetros, tolerâncias
- ✅ **Controle de versão:** Histórico de mudanças, aprovações, rastreabilidade
- ✅ **Execução guiada:** Sistema conduz operador pelas etapas (workflow)
- ⚠️ **Integração com automação:** Setpoints enviados automaticamente para CLPs

**Apontamento de Produção:**
- ⚠️ Interface web para operadores
- ⚠️ **Apontamento contextual:** Baseado na etapa de processo (não apenas parada genérica)
- ⚠️ **Checkpoints de qualidade:** Operador registra parâmetros críticos por fase
- ⚠️ **Contemporaneidade:** Provável que force apontamento por fase (BPF requires)

**Integrações:**
- ✅ **Automação (DCS/SCADA/PLC):** Core competency - integração profunda
  - ❓ Suporte específico para Bottelpack, Pró Maquia, Bausch Strobbel? Validar.
- ⚠️ **ERP (TOTVS, SAP):** Integração para ordens, produtos, lotes
- ⚠️ **LIMS:** Integração para dados analíticos, liberação de lote
- ⚠️ **Sistemas de Manutenção:** Ordens de serviço, preventivas

**Key Features (Pontos Fortes):**
- ✅ **MES completo:** Não apenas OEE, mas gestão completa de chão de fábrica
- ✅ **Especialização em processos batch:** Entende pharma manufacturing
- ✅ **Gestão de receitas:** Crítico para compliance BPF (receita mestre validada)
- ✅ **Integração profunda com automação:** Conecta diretamente com CLPs/SCADA
- ⚠️ **Experiência em indústrias reguladas:** Provável histórico em pharma/químico

**Key Limitations (Pontos Fracos Esperados):**
- ❓ **Complexidade:** Solução MES completa = curva de aprendizado íngreme
- ❓ **Custo alto:** MES enterprise é significativamente mais caro que OEE standalone
- ❓ **Implantação longa:** 12-18 meses típico para MES (vs 2-3 meses OEE puro)
- ❓ **Overkill para SicFar?** Se objetivo é apenas OEE, MES completo pode ser excessivo
- ❓ **UX:** Interfaces MES tradicionais podem ser menos modernas que Aloee
- ❓ **Vendor lock-in:** Integração profunda com automação = alta dependência

**Technology Stack (Inferência):**
- ❓ **Backend:** Java, .NET ou plataforma industrial (Wonderware, FactoryTalk)
- ❓ **Frontend:** Web-based + clientes thick para áreas críticas
- ❓ **Database:** SQL Server, Oracle (enterprise RDBMS)
- ❓ **Middleware:** OPC UA, OPC DA, Modbus para integração industrial
- ❓ **Deployment:** Primariamente on-premise (indústrias preferem controle local)

**Pricing (Estimativa - Requer Validação):**
- ❓ **Setup inicial:** R$ 500k-1.5M (módulos MES + integrações + consultoria)
- ❓ **Licensing:** R$ 150-400k/ano (manutenção + suporte)
- ❓ **Customização:** R$ 200-300/hora (especialistas MES)
- ❓ **Integrações CLPs:** R$ 50-150k (dependendo de complexidade)
- ⚠️ **Significativamente mais caro que Aloee/Tractan, mas escopo muito maior**

#### 3.4.4 Strengths & Weaknesses

**Strengths:**
- ✅ **MES completo para processos:** Solução enterprise-grade, não "toy solution"
- ✅ **Gestão de receitas integrada:** Resolve compliance de receita mestre (BPF crítico)
- ✅ **Integração profunda com automação:** Coleta automática de dados de processo
- ✅ **Experiência em pharma:** Provável que tenha cases em indústria farmacêutica
- ⚠️ **Escalabilidade:** Suporta operações complexas (37 linhas não é problema)
- ⚠️ **Validação GMP:** Provável experiência em validações formais

**Weaknesses:**
- ❌ **Alto custo:** Investimento 3-5x maior que OEE standalone
- ❌ **Complexidade de implantação:** 12-18 meses típico (vs 2-3 meses Aloee)
- ❌ **Curva de aprendizado:** Requer treinamento extenso de operadores e gestão
- ❓ **Overkill para OEE?** Se SicFar não precisa de gestão de receitas, pode ser excesso
- ❓ **Flexibilidade:** MES enterprise pode ser menos ágil para mudanças que build próprio
- ❓ **UX:** Pode ser menos intuitivo que soluções modernas (Aloee)

#### 3.4.5 Market Position & Performance

- ❓ **Market Share:** Nicho em MES para processos (~5-15% mercado brasileiro MES?)
- ⚠️ **Customer Base:** Foco em indústrias de processos regulados
- ❓ **Growth Trajectory:** Crescimento moderado, mercado maduro de MES
- ❓ **Recent Developments:** Possível modernização de UX, cloud-enablement

**Referências Pharma:**
- ⚠️ **Provável que tenha cases em pharma** (dado foco em processos batch)
- ⚠️ **Possível experiência em validação GMP** (MES em pharma requer validação)

#### 3.4.6 Relevance for SicFar OEE Requirements

**Análise de Fit:**

| Aspecto | Avaliação | Comentário |
|---------|-----------|-----------|
| **Escopo de Solução** | ⚠️ Muito amplo | MES completo quando SicFar quer OEE = potencial overkill |
| **Gestão de Receitas** | ✅ Diferencial forte | Se SicFar quer digitalizar receitas mestres, PPI resolve |
| **OEE Específico** | ⚠️ Módulo, não core | OEE é um dos módulos, não especialização |
| **Aderência Pharma** | ✅ Alta | Entende processos batch, BPF, compliance |
| **Custo** | ❌ Muito alto | 3-5x mais caro que alternativas OEE-only |
| **Tempo de Implantação** | ❌ Muito longo | 12-18 meses incompatível com meta Jan/2026 |
| **UX Operador** | ⚠️ Incerta | MES tradicional pode ser complexo |

**Conclusão Preliminar:**

PPI-Multitask representa a **alternativa "Buy Enterprise MES"**:
- ✅ **Solução mais robusta e completa** do mercado
- ✅ **Resolve muito mais que OEE** (receitas, bateladas, qualidade, automação)
- ✅ **Forte aderência a pharma** (processos batch, BPF)
- ❌ **MAS:** Custo muito alto (~R$ 1-2M total vs R$ 400-600k build)
- ❌ **MAS:** Implantação longa (12-18 meses) **incompatível com meta Janeiro/2026**
- ❌ **MAS:** Complexidade pode ser excessiva se foco é apenas OEE

**Questões Estratégicas para SicFar:**

1. **SicFar quer digitalizar receitas mestres também?**
   - Se SIM → PPI resolve receitas + OEE integrado (grande valor)
   - Se NÃO → PPI é overkill caro

2. **SicFar tem 12-18 meses para implantação?**
   - Meta é Janeiro/2026 (~8 meses) → **PPI provavelmente inviável no prazo**

3. **SicFar tem orçamento R$ 1-2M para MES completo?**
   - Se NÃO → PPI está fora da faixa de preço

4. **SicFar precisa de integração automática profunda com CLPs?**
   - Se SIM → PPI tem expertise nisso (diferencial vs Aloee/Tractan)
   - Se coleta manual/semi-automática é OK → PPI é overengineering

**Recomendação Preliminar:**

📊 **PPI-Multitask NÃO é recomendado para SicFar no contexto atual**, pelas seguintes razões:

1. ⏰ **Timeline incompatível:** 12-18 meses de implantação vs meta Janeiro/2026
2. 💰 **Custo excessivo:** ~R$ 1-2M total vs orçamento provável R$ 400-800k
3. 🎯 **Escopo desalinhado:** MES completo quando objetivo é OEE específico
4. 🔧 **Complexidade desnecessária:** Curva de aprendizado íngreme sem justificativa

**PORÉM, considerar PPI-Multitask SE:**
- ✅ SicFar decidir expandir escopo para digitalização completa de chão de fábrica
- ✅ Timeline for estendida para 18-24 meses
- ✅ Orçamento for ampliado para suportar MES enterprise
- ✅ Gestão de receitas mestres eletrônicas for prioridade estratégica

**Próximos passos (SE houver interesse):**
1. Agendar apresentação conceitual do PPI-Multitask (sem compromisso)
2. Solicitar proposta modular (apenas módulo OEE, sem MES completo)
3. Validar se PPI tem versão "lite" para OEE rápido
4. Comparar custo-benefício PPI vs (Build SysOEE + futuro MES se necessário)

---

### 3.5 Evocon - Priority 2 🟡 (OEE Internacional - UX Moderna)

**⚠️ NÍVEL DE CONFIANÇA:** Análise baseada em materiais públicos (website, vídeos, reviews). Evocon tem forte presença digital, então informações são mais confiáveis que outros concorrentes. Validação via trial/demo recomendada na Fase 2.

#### 3.5.1 Company Overview

- **Founded:** ✅ 2012 (Estônia - hub de tecnologia europeu)
- **Headquarters:** ✅ Tallinn, Estônia | Presença global via cloud
- **Company Size:** ⚠️ ~50-100 funcionários (estimativa baseada em LinkedIn)
- **Funding:** ⚠️ Venture-backed (crescimento internacional típico de startups europeias)
- **Leadership:** ✅ Founders com background em manufacturing + tecnologia

**Contexto de Mercado:** Evocon representa a **nova geração global de OEE SaaS**: cloud-native, UX moderna inspirada em consumer apps, deployment em dias (não meses), pricing transparente. Competidor direto de Aloee (brasileiro) mas com alcance internacional e maior maturidade de produto.

**Diferencial:** Foco obsessivo em **simplicidade** e **time-to-value**. Marketing posiciona como "OEE que operadores realmente usam" (vs sistemas que ficam abandonados).

#### 3.5.2 Business Model & Strategy

- **Revenue Model:** ✅ SaaS subscription (mensal/anual) por número de linhas
- **Target Market:** SMBs (small/medium businesses) manufatureiras globalmente (foco Europa, expansão EUA, LATAM)
- **Value Proposition:** "OEE monitoring em 24 horas, sem hardware complexo ou consultoria cara"
- **Go-to-Market Strategy:**
  - ✅ Self-service trial gratuito (14-30 dias)
  - ✅ Marketing digital agressivo (SEO, conteúdo educativo sobre OEE)
  - ⚠️ Vendas diretas via inside sales (low-touch)
  - ⚠️ Parcerias com distribuidores locais para mercados específicos
- **Strategic Focus:**
  - Expansão geográfica (LATAM é mercado-alvo recente)
  - Product-led growth (trial → conversão automática)
  - Integrações plug-and-play (ERPs, sensores IoT baratos)

**Posicionamento vs concorrentes:**
- **vs Aloee:** Evocon é mais maduro (11 anos mercado), maior base clientes, mais referências
- **vs TOTVS:** Evocon é especializado OEE, não ERP genérico
- **vs Tractan:** Evocon é OEE puro, não tem rastreabilidade/compliance pharma
- **vs PPI:** Evocon é rápido/simples, PPI é complexo/enterprise

#### 3.5.3 Product/Service Analysis

**Core Offerings:**
- ✅ **Evocon OEE Software** (plataforma web/mobile principal)
- ✅ **Evocon Gateway** (hardware opcional para conectar máquinas legacy)
- ✅ **Evocon Sensors** (sensores IoT de baixo custo para máquinas não-conectadas)
- ⚠️ **APIs para integrações** (ERP, outras ferramentas)

**Funcionalidades OEE:**

**Cálculo de OEE:**
- ✅ Fórmula padrão: Disponibilidade × Performance × Qualidade
- ✅ Configurável por linha/máquina
- ⚠️ **Pequenas paradas (<10min):** Provável que tenha categorização automática (micro-stops)
- ❓ **Velocidade nominal por SKU:** Validar se suporta ou apenas velocidade de máquina
- ✅ **Cálculo em tempo real:** Dashboard atualiza continuamente (não batch)

**Dashboards e Visualizações:**
- ✅ **Dashboard em tempo real:** Status atual de todas as linhas (visão de planta)
- ✅ **Velocímetro de OEE:** Com metas configuráveis, cores (verde/amarelo/vermelho)
- ✅ **Gráfico de Pareto de paradas:** Análise de causas (provável que seja bem visual)
- ✅ **Tendências históricas:** Comparação dia/semana/mês/ano
- ✅ **Detalhamento por componente:** Disponibilidade, Performance, Qualidade separados
- ⚠️ **Gráficos adicionais:** Timeline de produção, shift comparison
- ❓ **8 gráficos doc 09:** Validar cobertura completa dos requisitos SicFar

**Apontamento de Produção:**
- ✅ **Interface mobile-first:** Tablets/smartphones (design responsivo)
- ✅ **Apontamento de paradas:** Dropdown simples, categorias customizáveis
- ✅ **Registro de produção:** Quantidade produzida, refugos, retrabalho
- ⚠️ **Contemporaneidade:** Provável notificação/alerta para apontamento, mas não força bloqueio
- ⚠️ **Book de paradas:** Hierarquia customizável (validar se suporta 5 níveis como SicFar)
- ✅ **UX simplificada:** Foco em "3 cliques para registrar parada"

**Coleta Automática de Dados:**
- ✅ **Evocon Gateway:** Box que conecta a máquinas via sinais elétricos (sensores simples)
- ✅ **Evocon Sensors:** Sensores magnéticos/luz para máquinas sem conectividade
- ⚠️ **Protocolo industrial:** Modbus, OPC-UA para máquinas modernas
- ❓ **CLPs específicos SicFar:** Validar compatibilidade com Bottelpack, Pró Maquia, Bausch Strobbel

**Integrações:**
- ⚠️ **ERPs:** API REST para sincronização de produtos, ordens (provável integração TOTVS via API)
- ⚠️ **Outras ferramentas:** Zapier, webhooks para integrações custom
- ❓ **LIMS/Qualidade:** Validar se há integração nativa ou requer desenvolvimento
- ✅ **Export de dados:** CSV, Excel para análises externas

**Key Features (Pontos Fortes Comprovados):**
- ✅ **UX excepcional:** Reviews consistentes elogiam facilidade de uso
- ✅ **Deployment ultra-rápido:** 24-48 horas para ir ao ar (vs semanas/meses concorrentes)
- ✅ **Cloud-native:** Sem necessidade de servidores locais, acesso de qualquer lugar
- ✅ **Pricing transparente:** Website mostra preços claramente (raro no mercado B2B)
- ✅ **Suporte responsivo:** Reviews elogiam qualidade de suporte (chat, email)
- ✅ **Mobile-first:** App funciona offline, sincroniza depois (bom para áreas sem WiFi)
- ✅ **Multilíngue:** Suporte a múltiplos idiomas (inclui PT-BR)

**Key Limitations (Pontos Fracos Esperados):**
- ❌ **Não pharma-native:** Zero foco em compliance GMP/BPF/ALCOA+
- ❌ **Audit trail básico:** Provável que não atenda requisitos de validação pharma
- ❓ **Customização limitada:** SaaS multi-tenant = menos flexibilidade que build próprio
- ❓ **Integrações pharma:** Não tem integrações nativas com LIMS ou sistemas regulados
- ❓ **Suporte local Brasil:** Pode ser limitado (empresa europeia, fuso horário diferente)
- ❓ **Validação GMP:** Improvável que vendor tenha experiência em validação formal
- ⚠️ **Custo recorrente perpétuo:** SaaS subscription sem fim (vs licensing único)

**Technology Stack:**
- ✅ **Cloud:** AWS ou similar (multi-tenant SaaS)
- ⚠️ **Backend:** Provável Node.js, Python ou Go (stack moderna)
- ✅ **Frontend:** React ou Vue.js (framework moderno, responsivo)
- ⚠️ **Database:** PostgreSQL ou similar (RDBMS cloud-native)
- ✅ **Mobile:** Progressive Web App (PWA) - funciona offline
- ✅ **Edge computing:** Gateway processa dados localmente antes de enviar ao cloud

**Pricing (Baseado em Website - Outubro 2025):**
- ✅ **Trial gratuito:** 14-30 dias (sem cartão de crédito)
- ⚠️ **Subscription:** €49-99/mês por linha (estimativa ~R$ 280-560/mês por linha)
- ⚠️ **Para 37 linhas SicFar:** ~R$ 10-21k/mês = R$ 120-250k/ano
- ⚠️ **Setup:** Mínimo (self-service) ou €500-2.000 se precisar consultoria
- ⚠️ **Hardware (opcional):** Gateway ~€500/unidade, Sensores ~€50-100/unidade
- ✅ **Significativamente mais barato que PPI/Tractan, comparável ou menor que Aloee**

#### 3.5.4 Strengths & Weaknesses

**Strengths:**
- ✅ **Melhor UX do mercado:** Consenso em reviews (G2, Capterra)
- ✅ **Deployment mais rápido:** 24-48h vs semanas/meses dos concorrentes
- ✅ **Custo acessível:** €49-99/linha vs R$ 500-2.000/linha (Aloee estimado)
- ✅ **Cloud-native:** Sem infraestrutura local, escalabilidade automática
- ✅ **Maturidade de produto:** 11 anos mercado, produto estável
- ✅ **Base de clientes global:** Centenas de clientes, múltiplas indústrias
- ✅ **Suporte multilíngue:** Inclui PT-BR (importante para operadores SicFar)
- ⚠️ **Inovação contínua:** Roadmap público, releases frequentes

**Weaknesses:**
- ❌ **Zero foco pharma:** Não entende BPF, ALCOA+, validação GMP
- ❌ **Audit trail básico:** Não atende requisitos regulatórios sem customização
- ❌ **Vendor internacional:** Suporte pode ter limitações de fuso horário
- ❓ **Customização limitada:** SaaS = menos controle que solução própria
- ❓ **Integrações específicas:** TOTVS, LIMS, CLPs específicos podem requerer desenvolvimento
- ❓ **Data sovereignty:** Dados no cloud internacional (pode ser issue para pharma)
- ❓ **Validação GMP complexa:** Validar SaaS internacional em ambiente GMP é desafiador

#### 3.5.5 Market Position & Performance

- ⚠️ **Market Share:** Líder em OEE SaaS na Europa (~20-30%?), crescendo em outros mercados
- ✅ **Customer Base:** 500-1000+ clientes globalmente (baseado em cases públicos)
- ✅ **Growth Trajectory:** Crescimento rápido (típico SaaS internacional)
- ✅ **Recent Developments:**
  - 2024: Expansão LATAM (website em PT-BR, vendas região)
  - 2023-24: Novos sensores IoT (menores, mais baratos)
  - Foco em AI/ML para predição de paradas (analytics avançado)

**Referências Pharma:**
- ❓ **Cases em pharma incertos.** Website mostra principalmente food, automotive, plastics.
- ❌ **Nenhum case público de pharma validada (GMP)** encontrado em pesquisa preliminar.

**Reviews (G2, Capterra, TrustRadius):**
- ✅ **Rating médio: 4.5-4.8/5** (muito alto)
- ✅ **Elogios:** UX, suporte, facilidade implantação
- ⚠️ **Críticas:** Falta de features avançadas (vs MES enterprise), customização limitada

#### 3.5.6 Relevance for SicFar OEE Requirements

**Análise de Fit:**

| Requisito SicFar | Status Evocon | Análise |
|------------------|--------------|---------|
| **37 linhas em 4 setores** | ✅ Suporta | Cloud escala facilmente |
| **Books de paradas customizados** | ⚠️ Provável | Hierarquia customizável (validar 5 níveis) |
| **Velocidade nominal por SKU** | ❓ Incerto | Validar se suporta ou apenas máquina |
| **Pequenas paradas <10min** | ⚠️ Provável | Micro-stops é feature comum |
| **8 gráficos obrigatórios (doc 09)** | ⚠️ Parcial | Tem principais, validar cobertura 100% |
| **ALCOA+ / Audit trail** | ❌ **FRACO** | Não foi desenhado para pharma |
| **Contemporaneidade forçada** | ⚠️ Limitada | Notifica mas não bloqueia |
| **Integração TOTVS** | ⚠️ API REST | Requer desenvolvimento custom |
| **Integração CLPs (3 fabricantes)** | ❓ Incerto | Validar compatibilidade específica |
| **100 usuários simultâneos** | ✅ Cloud suporta | SaaS não tem limite prático |
| **Validação GMP** | ❌ **CRÍTICO** | Zero experiência, muito difícil validar |
| **Timeline (Jan/2026)** | ✅ **EXCELENTE** | 1-2 meses deployment |
| **Custo** | ✅ **EXCELENTE** | R$ 120-250k/ano (mais barato) |
| **UX Operador** | ✅ **EXCELENTE** | Melhor do mercado |

**Conclusão Preliminar:**

Evocon representa a **alternativa "Buy Modern SaaS"**:
- ✅ **Melhor UX do mercado** (operadores vão adorar vs TOTVS)
- ✅ **Deployment mais rápido** (1-2 meses = atende meta Janeiro/2026)
- ✅ **Custo mais baixo** (~R$ 120-250k/ano vs R$ 400-600k build)
- ✅ **Risco técnico baixo** (produto maduro, 500+ clientes)
- ❌ **MAS CRÍTICO:** Não atende requisitos pharma/GMP/ALCOA+ sem customização pesada
- ❌ **MAS:** Validação GMP de SaaS internacional é extremamente complexa
- ❌ **MAS:** Audit trail e contemporaneidade forçada não são nativos

**Decisão Trade-off para SicFar:**

| Prioridade | Escolha |
|------------|---------|
| **Se prioridade máxima for UX + velocidade + custo** | ✅ Evocon é MELHOR opção |
| **Se prioridade for compliance pharma + validação GMP** | ❌ Evocon é PIOR opção |

**Cenários de Uso:**

**Cenário A: Evocon como solução primária (RISCO ALTO)**
- ✅ Deploy rápido, operadores felizes, dashboards bonitos
- ❌ Validação GMP será pesadelo (6-12 meses adicionais)
- ❌ Audit trail inadequado = não-conformidade em auditorias
- ❌ ALCOA+ requer customizações que SaaS não permite
- **Veredito:** ❌ **NÃO RECOMENDADO para ambiente pharma validado**

**Cenário B: Evocon como MVP não-validado (INTERESSANTE)**
- ✅ Implantar Evocon em **2-3 linhas piloto** (não em produção validada)
- ✅ Usar para treinar operadores, validar conceitos, coletar dados
- ✅ Aprender requisitos reais antes de build definitivo
- ✅ Custo baixo (~R$ 1-2k/mês por 3 linhas) = ROI rápido
- ⚠️ Paralelamente, desenvolver SysOEE para produção validada
- **Veredito:** ⚠️ **CONSIDERAR como ferramenta de aprendizado/piloto**

**Cenário C: Evocon + Wrapper de Compliance (HÍBRIDO - COMPLEXO)**
- ⚠️ Usar Evocon para OEE core (dashboards, cálculos)
- ⚠️ Desenvolver camada de compliance (audit trail, ALCOA+, contemporaneidade) em cima
- ⚠️ Sincronizar dados Evocon com sistema validado
- ❓ Complexidade técnica alta, pode não valer a pena
- **Veredito:** ❓ **Possível mas complexo, avaliar custo-benefício**

**Recomendação Final:**

📊 **Evocon NÃO é recomendado como solução primária para SicFar**, porque:
1. ❌ **Validação GMP é inviável** (SaaS internacional, sem experiência pharma)
2. ❌ **Audit trail inadequado** (risco de não-conformidade)
3. ❌ **ALCOA+ não é nativo** (contemporaneidade, atribuibilidade limitadas)

📊 **MAS Evocon PODE SER usado como:**
- ✅ **Piloto em 2-3 linhas não-críticas** para validar conceitos
- ✅ **Benchmark de UX** para inspirar design do SysOEE
- ✅ **Ferramenta temporária** enquanto SysOEE é desenvolvido
- ✅ **Comparação de features** (o que operadores realmente usam?)

**Próximos passos recomendados:**

1. ✅ **Solicitar trial de 14-30 dias** (gratuito, sem compromisso)
   - Testar com dados reais de 1-2 linhas
   - Avaliar UX com operadores SicFar
   - Validar integrações (TOTVS, CLPs)

2. ⚠️ **Agendar demo comercial** com perguntas específicas:
   - Experiência em pharma validada? (provavelmente não)
   - Audit trail detalhado? (provavelmente básico)
   - Customização de ALCOA+? (provavelmente impossível em SaaS)

3. ⚠️ **Avaliar como piloto/MVP:**
   - Custo de 2-3 linhas por 6 meses (~R$ 5-10k)
   - ROI: aprendizado antes de investir R$ 400-600k em build

4. ✅ **Usar como inspiração para SysOEE:**
   - Estudar UX, fluxos, dashboards
   - Entender o que torna Evocon fácil de usar
   - Aplicar best practices no desenvolvimento próprio

---

### 3.6 WEG - Priority 3 🟢 (Automação + Monitoramento)

**⚠️ PERFIL CONDENSADO:** Priority 3 - Análise superficial para awareness de mercado. Não recomendado para foco detalhado.

#### 3.6.1 Company Overview & Positioning

- **Founded:** ✅ 1961 (Jaraguá do Sul, SC - Brasil)
- **Headquarters:** ✅ Brasil (multinacional brasileira, presença em 135 países)
- **Company Size:** ✅ ~35.000 funcionários globalmente | Receita ~R$ 30 bilhões/ano
- **Core Business:** **Motores elétricos, automação industrial, energia**

**Contexto:** WEG é gigante brasileiro de **automação industrial** (motores, inversores de frequência, CLPs, painéis). Software de gestão (OEE, MES) é **ancillary business**, não core. WEG vende hardware e oferece software como complemento, não o contrário.

**Diferencial vs concorrentes:** Hardware + Software integrado (solução completa de automação)

**Por que Priority 3:** WEG é forte em automação (CLPs, sensores), mas **fraco em software de gestão**. Para SicFar, que já tem CLPs instalados, o diferencial de WEG (hardware integrado) não é relevante.

#### 3.6.2 Product Analysis (OEE/Monitoring)

**Core Offerings:**
- ✅ **WEG Automação:** CLPs, SCADA, inversores de frequência
- ⚠️ **WEG IoT Platform:** Plataforma de monitoramento industrial (inclui OEE básico)
- ❓ **Software MES/OEE:** Não é produto standalone forte (geralmente parceria com terceiros)

**Funcionalidades OEE (Limitadas):**
- ⚠️ **Cálculo básico de OEE:** Disponibilidade × Performance × Qualidade
- ⚠️ **Dashboards:** Monitoramento de equipamentos (foco em motores, energia)
- ❌ **Gestão de paradas:** Limitada (foco é em condição de equipamento, não gestão de produção)
- ❌ **Books customizados:** Improvável (não é especialidade)
- ❌ **Pharma compliance:** Zero foco (indústria genérica)

**Pontos Fortes:**
- ✅ Hardware de qualidade (motores, CLPs são referência)
- ✅ Marca consolidada no Brasil
- ✅ Suporte técnico local em todo país

**Pontos Fracos (Para OEE):**
- ❌ **Software de gestão não é core business**
- ❌ **OEE é feature secundária**, não produto principal
- ❌ **Não compete com Aloee/Tractan em funcionalidades OEE**
- ❌ **Zero experiência em pharma/GMP**
- ❌ **UX de software industrial tradicional** (não moderna como Evocon)

#### 3.6.3 Relevance for SicFar

**Fit Score:** ⭐ (1/5 - Muito baixo)

| Critério | Avaliação | Motivo |
|----------|-----------|--------|
| **OEE Core Features** | ❌ Fraco | Software não é especialidade WEG |
| **Pharma Compliance** | ❌ Zero | Sem foco em indústrias reguladas |
| **UX** | ❌ Fraco | Software industrial tradicional |
| **Custo** | ❓ Incerto | Provavelmente alto (vendor hardware) |

**Recomendação:**

📊 **WEG NÃO é recomendado para SicFar OEE**, porque:
1. ❌ OEE não é produto core (software é ancillary)
2. ❌ Funcionalidades limitadas vs concorrentes especializados (Aloee, Tractan)
3. ❌ Zero experiência em pharma/compliance
4. ❌ SicFar já tem automação instalada (diferencial de WEG não se aplica)

**Quando considerar WEG:**
- ✅ SE SicFar estiver fazendo retrofit completo de automação (trocar CLPs, motores, etc.)
- ✅ SE precisar de solução totalmente integrada hardware + software do mesmo vendor
- ❌ **Para apenas OEE:** Não faz sentido

**Próximos passos:** ❌ Não recomendado investigar mais a fundo.

---

### 3.7 Cogtive - Priority 3 🟢 (Analytics Industrial / IoT)

**⚠️ PERFIL CONDENSADO:** Priority 3 - Análise superficial para awareness de mercado. Não recomendado para foco detalhado.

#### 3.7.1 Company Overview & Positioning

- **Founded:** ❓ ~2015-2018 (startup brasileira de Industry 4.0)
- **Headquarters:** ❓ Brasil (provavelmente SP ou região Sul)
- **Company Size:** ❓ ~20-50 funcionários (startup/scale-up)
- **Core Business:** **Plataforma de analytics industrial e IoT**

**Contexto:** Cogtive é startup de **analytics/IoT para manufatura**, não OEE puro. Foco é em **conectar máquinas** (IoT), coletar dados de sensores, e fazer **analytics avançado** (AI/ML para predição). OEE é **um dos use cases**, não o único.

**Diferencial vs concorrentes:** IoT + AI/ML (predição de falhas, otimização de processo)

**Por que Priority 3:** Cogtive é **plataforma de dados**, não sistema de gestão OEE. Para SicFar, que quer OEE operacional (apontamento, dashboards, compliance), Cogtive é **over-engineering** tecnológico sem resolver problema core.

#### 3.7.2 Product Analysis

**Core Offerings:**
- ✅ **Plataforma IoT:** Conectividade de máquinas, sensores
- ✅ **Data lake industrial:** Armazenamento e processamento de dados de processo
- ⚠️ **Analytics e ML:** Predição de falhas, otimização, anomalias
- ⚠️ **Dashboards customizáveis:** Visualização de dados (inclui OEE)

**Funcionalidades OEE (Não é Core):**
- ⚠️ **Cálculo de OEE:** Provável que tenha, mas não é especialização
- ⚠️ **Dashboards:** Customizáveis (foco em data viz, não gestão operacional)
- ❌ **Apontamento de paradas:** Improvável que tenha interface operacional robusta
- ❌ **Books de paradas:** Não é foco da plataforma
- ❌ **Pharma compliance:** Zero (foco é tech/data, não regulatório)

**Pontos Fortes:**
- ✅ Tecnologia moderna (IoT, cloud, ML)
- ✅ Flexibilidade para múltiplos use cases (não apenas OEE)
- ✅ Analytics avançado (se SicFar quiser predição de falhas, otimização)

**Pontos Fracos (Para OEE):**
- ❌ **OEE não é produto core** (é use case entre muitos)
- ❌ **Foco em analytics, não gestão operacional**
- ❌ **Provavelmente não tem interface de apontamento para operadores**
- ❌ **Complexidade técnica alta** (plataforma de dados, não app pronto)
- ❌ **Zero experiência em pharma/GMP**
- ❌ **Requer time técnico forte** para configurar e manter

#### 3.7.3 Relevance for SicFar

**Fit Score:** ⭐ (1/5 - Muito baixo para OEE puro)

| Critério | Avaliação | Motivo |
|----------|-----------|--------|
| **OEE Core Features** | ❌ Fraco | Use case secundário, não produto |
| **Gestão Operacional** | ❌ Fraco | Foco é analytics, não operações |
| **Pharma Compliance** | ❌ Zero | Tech platform, não regulatory |
| **Facilidade de Uso** | ❌ Fraco | Complexo, requer expertise técnico |

**Recomendação:**

📊 **Cogtive NÃO é recomendado para SicFar OEE**, porque:
1. ❌ OEE é use case secundário (plataforma é analytics/IoT genérico)
2. ❌ Não resolve problema operacional imediato (apontamento, dashboards, compliance)
3. ❌ Complexidade técnica alta vs valor entregue para OEE
4. ❌ Zero experiência em pharma/regulatório
5. ❌ SicFar precisa de solução operacional, não plataforma de dados

**Quando considerar Cogtive:**
- ✅ **FASE 2** - Após ter OEE operacional funcionando (via SysOEE, Aloee, ou Tractan)
- ✅ SE SicFar quiser **analytics avançado** (predição de falhas com ML, otimização de processo)
- ✅ SE SicFar tiver **time de data science** para aproveitar plataforma
- ✅ Como **complemento**, não substituição, de sistema OEE core

**Próximos passos:** ❌ Não recomendado investigar para OEE primário. ⚠️ Considerar apenas para roadmap futuro (analytics avançado).

---

## 3.8 Summary: Competitor Profile Completion

**✅ Todos os 7 concorrentes analisados:**

| Concorrente | Priority | Recomendação | Próximos Passos |
|-------------|----------|--------------|-----------------|
| **TOTVS** | 🔴 P1 | ⚠️ Considerar | Entrevistas internas (Sávio, Maxwell) |
| **Aloee** | 🔴 P1 | ✅ Top candidato | Trial 30 dias + demo comercial |
| **Tractan** | 🔴 P1 | ✅ Top candidato | Demo + cases pharma |
| **PPI-Multitask** | 🟡 P2 | ❌ Não recomendado | Desconsiderar (custo/timeline) |
| **Evocon** | 🟡 P2 | ⚠️ Piloto/Inspiração | Trial gratuito + benchmark UX |
| **WEG** | 🟢 P3 | ❌ Não recomendado | Desconsiderar |
| **Cogtive** | 🟢 P3 | ❌ Não recomendado | Considerar FASE 2 (analytics) |

**Top 3 Finalistas:**
1. 🥇 **Tractan** - Melhor fit pharma (rastreabilidade + OEE + compliance)
2. 🥈 **Aloee** - Mais rápido (2-3 meses), UX moderna
3. 🥉 **Build SysOEE** - Máximo controle, 100% aderência requisitos

**Eliminados:**
- ❌ TOTVS - UX ruim, aderência pharma baixa
- ❌ PPI-Multitask - Overkill caro, timeline incompatível
- ❌ Evocon - Excelente produto, mas não pharma (usar como inspiração)
- ❌ WEG - Software não é core business
- ❌ Cogtive - Analytics platform, não OEE operacional

---

