# Análise Competitiva: Sistema OEE SicFar
## Executive Summary

**Data da Análise:** 18 de Outubro de 2025
**Versão:** 1.0
**Responsável:** Equipe de Projeto SysOEE
**Consultor:** Rafael Gusmão

---

## 1. Objetivo da Análise

Esta análise competitiva foi conduzida para **apoiar o levantamento de requisitos funcionais** do Sistema OEE da SicFar, identificando soluções disponíveis no mercado e subsidiando a decisão **Build vs Buy**.

**Escopo do Projeto:**
- **37 linhas de produção** em 4 setores (SPEP, SPPV, Líquidos, CPHD)
- **Meta de implantação:** Janeiro/2026 (~8 meses)
- **Orçamento estimado:** R$ 400-800k

**Contexto Crítico:** Indústria farmacêutica sujeita a BPF (Boas Práticas de Fabricação) com requisitos **ALCOA+** para integridade de dados e necessidade de **validação formal** do sistema (IQ/OQ/PQ).

---

## 2. Concorrentes Analisados

Foram analisados **7 concorrentes** em 3 níveis de prioridade:

### Priority 1 - Core Competitors (Análise Profunda)
- **TOTVS** - ERP já utilizado pela SicFar (decisão Build vs Buy interna)
- **Aloee** - Solução OEE brasileira moderna (SaaS, UX mobile-first, deployment rápido)
- **Tractan** - Rastreabilidade + OEE (forte em compliance pharma, experiência BPF)

### Priority 2 - Emerging Alternatives (Análise Moderada)
- **PPI-Multitask** - MES enterprise para indústria de processos (batch manufacturing)
- **Evocon** - OEE internacional (melhor UX do mercado, cloud-native, 500+ clientes)

### Priority 3 - Peripheral Players (Análise Superficial)
- **WEG** - Automação industrial (software não é core business)
- **Cogtive** - Analytics industrial / IoT (não é OEE operacional)

---

## 3. Principais Achados

### Achado #1: Nenhuma Solução é "Pharma-Ready" Out-of-the-Box

**Realidade do mercado:**
Todas as soluções analisadas são **genéricas** (multi-indústria) e **não foram desenhadas para BPF/ALCOA+**:

- ❌ **Audit trail básico** - Insuficiente para validação GMP
- ❌ **Contemporaneidade não forçada** - Sistemas permitem apontamentos posteriores
- ❌ **Controles ALCOA+ não nativos** - Atribuibilidade, originalidade, durabilidade não são embarcados
- ⚠️ **Exceção parcial:** Tractan tem experiência em pharma, mas ainda requer customizações significativas

**Implicação crítica:**
Qualquer solução "Buy" vai requerer **customizações pesadas** para atender requisitos regulatórios. O mito de "comprar solução pronta e validar em 3 meses" não é realista.

---

### Achado #2: Trade-off Fundamental - Velocidade vs Compliance

**Não existe solução que maximize todos os critérios simultaneamente:**

| Prioridade | Solução Recomendada | Trade-off Aceito |
|------------|---------------------|------------------|
| **Velocidade de implantação** | Evocon (1-2 meses) / Aloee (2-3 meses) | ❌ Compliance pharma fraco |
| **Compliance pharma** | Tractan / Build SysOEE | ⏰ Tempo de implantação maior |
| **Menor risco** | TOTVS (já instalado) | 😞 UX ruim + aderência média |
| **Máximo controle** | Build SysOEE | 💰 Custo + tempo + risco técnico |

**Decisão estratégica:** SicFar precisa definir qual prioridade é **inegociável** antes de escolher solução.

---

### Achado #3: Análise de Custos (TCO 3 Anos)

**Soluções SaaS (Custo Recorrente Perpétuo):**
- **Evocon:** R$ 360-750k (mais barato, mas não pharma)
- **Aloee:** R$ 648k-2.6M (ampla variação de pricing)
- **Tractan:** R$ 450k-1.35M (licenciamento + suporte anual)

**Soluções Build/Customize (Investimento Inicial + Manutenção):**
- **Build SysOEE:** R$ 640k-1.05M (competitivo em 3 anos)
- **TOTVS customização:** R$ 450-800k (menor custo, mas menor aderência)
- **PPI-Multitask:** R$ 1.45-3.2M ❌ (muito caro, desconsiderar)

**Insight:** Build SysOEE tem TCO **comparável** a soluções Buy em 3 anos, mas com 100% aderência a requisitos.

---

### Achado #4: UX é Diferencial Crítico Para Adoção

**Ranking de UX (baseado em reviews, demos e análise):**

1. 🥇 **Evocon** - Melhor UX do mercado (4.5-4.8/5 em reviews G2/Capterra)
2. 🥈 **Aloee** - UX moderna, mobile-first, baixa curva de aprendizado
3. 🥉 **Tractan** - UX funcional (foco compliance, não beleza)
4. **Build SysOEE** - Depende da execução (oportunidade de fazer bem se inspirar em Evocon)
5. **TOTVS** - UX complexa ❌ (operadores resistem ao uso, problema conhecido)

**Lição crítica:**
Sistemas que operadores não usam = contemporaneidade comprometida = não-conformidade BPF.
**UX ruim é risco de compliance**, não apenas problema de "usabilidade".

---

### Achado #5: Validação GMP é Desafio Subestimado

**Timeline realista de validação:**
```
Software pronto → 6-12 meses de validação → Sistema validado
```

**Complexidade por tipo de solução:**
- **SaaS internacional** (Evocon): Validação **muito complexa** (dados em cloud internacional, vendor sem experiência GMP) ❌
- **SaaS brasileiro** (Aloee, Tractan): Mais viável, mas ainda requer 6-12 meses de trabalho intenso ⚠️
- **TOTVS**: Vendor tem experiência em pharma (administrativo), mas não em chão de fábrica validado ⚠️
- **Build SysOEE**: Validação sob controle da SicFar, mas requer documentação extensa (DQ, IQ, OQ, PQ) ⚠️

**Alerta vermelho:**
Meta Janeiro/2026 (~8 meses) **não inclui tempo de validação** na maioria dos cenários.
Sistema implantado ≠ Sistema validado.

---

## 4. Ranking Final dos Concorrentes

| Rank | Concorrente | Fit Pharma | Custo (3 anos) | Timeline Completo | Status |
|------|-------------|------------|----------------|-------------------|--------|
| 🥇 | **Tractan** | ⭐⭐⭐⭐⭐ | R$ 450k-1.35M | 4-6 meses + 6-12 validação | **TOP CANDIDATO** |
| 🥈 | **Aloee** | ⭐⭐⭐ | R$ 648k-2.6M | 2-3 meses + 6-12 validação | **TOP CANDIDATO** |
| 🥉 | **Build SysOEE** | ⭐⭐⭐⭐⭐ | R$ 640k-1.05M | 8-12 meses + 6-12 validação | **TOP CANDIDATO** |
| 4º | **TOTVS** | ⭐⭐ | R$ 450-800k | 6-8 meses + 6-12 validação | Considerar |
| 5º | **Evocon** | ⭐ | R$ 360-750k | 1-2 meses (SEM validação) | Piloto/Inspiração |
| 6º | **PPI-Multitask** | ⭐⭐⭐⭐ | R$ 1.45-3.2M | 12-18 meses + validação | ❌ Desconsiderar |
| 7º | **WEG** | ⭐ | ❓ | ❓ | ❌ Desconsiderar |
| 8º | **Cogtive** | ⭐ | ❓ | ❓ | ❌ Desconsiderar |

---

## 5. Top 3 Finalistas - Análise Detalhada

### 🥇 Tractan - "Buy Integrated Solution"

**Por que é #1:**
- ✅ **Única solução com DNA pharma:** Rastreabilidade + OEE + BPR eletrônico + compliance integrado
- ✅ **Experiência em validação GMP:** Provável que tenha cases validados em outras pharmas
- ✅ **Integração com qualidade:** LIMS + rastreabilidade nativa (vai além de OEE)
- ✅ **Audit trail robusto:** Foco em compliance desde design, não add-on posterior

**Por que NÃO escolher:**
- ❌ Custo mais alto que Aloee (mas justificável se rastreabilidade for necessária)
- ❌ Complexidade maior (curva de aprendizado, não é "plug and play")
- ❓ Pode ser overkill **SE** SicFar não precisar de rastreabilidade avançada (validar se já tem sistema)

**Melhor para:** SicFar que prioriza **compliance pharma** e quer **solução mais completa** (rastreabilidade + OEE integrados).

**Próximos passos:**
1. Demo comercial + solicitar cases de pharma validados
2. Proposta detalhada para 37 linhas
3. Avaliar se rastreabilidade do Tractan complementa ou compete com sistemas existentes

---

### 🥈 Aloee - "Buy Modern OEE"

**Por que é #2:**
- ✅ **Deployment mais rápido:** 2-3 meses vs 4-6 (Tractan) ou 8-12 (Build)
- ✅ **UX moderna:** Melhor que TOTVS e Tractan, operadores vão adotar facilmente
- ✅ **Especialização OEE:** Foco 100% em OEE (vs módulo de MES/ERP)
- ✅ **Custo competitivo:** Comparável a build em 3 anos, mais barato que PPI/Tractan

**Por que NÃO escolher:**
- ❌ **Não é pharma-native:** ALCOA+/BPF requerem customização pesada via APIs/wrappers
- ❌ **Validação GMP incerta:** Vendor pode não ter experiência (risco de 12+ meses de validação)
- ❌ **Custo recorrente alto:** R$ 200-800k/ano em perpetuidade para 37 linhas

**Melhor para:** SicFar que prioriza **velocidade de implantação** e aceita trabalho de customização/validação posterior.

**Próximos passos:**
1. Trial gratuito de 30 dias em 2-3 linhas
2. Demo comercial com perguntas específicas sobre ALCOA+, audit trail, contemporaneidade
3. Solicitar referências de casos pharma (se existirem)

---

### 🥉 Build SysOEE - "Build Custom Pharma-Native"

**Por que é #3:**
- ✅ **100% aderência requisitos:** Desenhado especificamente para SicFar + BPF desde o início
- ✅ **ALCOA+ nativo:** Contemporaneidade forçada, audit trail completo, atribuibilidade desde design
- ✅ **Controle total:** Flexibilidade máxima para evoluções futuras, sem vendor lock-in
- ✅ **TCO competitivo:** R$ 640k-1.05M (3 anos) vs R$ 648k-2.6M (Aloee)
- ✅ **Diferenciação estratégica:** SicFar pode licenciar para outras pharmas no futuro (receita adicional)

**Por que NÃO escolher:**
- ❌ **Risco técnico alto:** Desenvolvimento próprio, dependência de equipe interna/externa
- ❌ **Timeline longo:** 8-12 meses desenvolvimento + 6-12 validação = **14-24 meses total**
- ❌ **Meta Janeiro/2026 inviável:** Requer extensão de prazo **OU** solução temporária intermediária

**Melhor para:** SicFar que tem **visão de longo prazo**, aceita timeline estendido, e quer **solução sob medida pharma-native**.

**Próximos passos:**
1. Validar capacidade interna de desenvolvimento (time próprio vs consultoria)
2. Definir stack tecnológico (backend, frontend, database)
3. Planejar abordagem de validação (documentação DQ/IQ/OQ/PQ desde início)

---

## 6. Gaps de Mercado Identificados

Análise revelou **4 gaps críticos** que nenhum concorrente resolve completamente:

1. **Gap 1 - OEE Pharma-Native:**
   Nenhuma solução nasce com ALCOA+/BPF embarcado. Todas requerem customização.

2. **Gap 2 - UX para Operador + Integração ERP:**
   Aloee/Evocon têm UX excelente, mas integrações fracas com ERP/LIMS.
   TOTVS integra perfeitamente, mas UX é ruim.
   **Ninguém tem os dois.**

3. **Gap 3 - Multi-Setor com Books Customizados:**
   4 setores + 37 linhas + books específicos por linha = configuração complexa.
   Soluções genéricas não lidam bem com esta heterogeneidade.

4. **Gap 4 - Velocidade Nominal por SKU:**
   Maioria calcula Performance baseado em velocidade da **máquina**.
   SicFar precisa calcular por **SKU** (cada produto tem velocidade diferente).

**Oportunidade:**
Build SysOEE pode resolver **todos os 4 gaps** desde o design.
Soluções "Buy" resolvem apenas parcialmente (2-3 gaps com customizações).

---

## 7. Recomendações Estratégicas

### Cenário A: Prioridade é Compliance Pharma ✅ (RECOMENDADO)

**Decisão:** 🥇 **Tractan** (curto prazo) → **Build SysOEE** (médio prazo)

**Roadmap Faseado:**

**Fase 1 (Meses 1-6): Piloto Tractan**
- Implantar Tractan em **5-10 linhas piloto** (1 por setor)
- Objetivo: Aprender requisitos reais, treinar equipe, validar conceitos
- Custo: R$ 50-150k (piloto limitado)
- Risco: Baixo (não é full deployment)

**Fase 2 (Meses 4-12): Desenvolvimento SysOEE (paralelo)**
- Desenvolver SysOEE com base nos aprendizados do Tractan
- Design pharma-native (ALCOA+, contemporaneidade forçada, audit trail completo)
- Custo: R$ 400-600k (desenvolvimento)

**Fase 3 (Meses 12-18): Validação + Roll-out SysOEE**
- Validação GMP do SysOEE (IQ/OQ/PQ)
- Roll-out gradual nas 37 linhas
- Substituir Tractan progressivamente
- Manter Tractan como backup/comparação durante transição

**Justificativa:**
- ✅ **Mitiga risco:** Tractan funciona enquanto SysOEE é desenvolvido (produção não para)
- ✅ **Aprendizado real:** Investir R$ 400-600k em build DEPOIS de aprender com Tractan
- ✅ **SysOEE será melhor:** Aprende com erros/acertos do Tractan antes de codificar
- ✅ **Compliance garantido:** Tractan tem DNA pharma, SysOEE será pharma-native
- ⚠️ **Custo total maior:** Tractan (R$ 50-150k) + Build (R$ 400-600k) = R$ 450-750k

**Timeline total:** 18-24 meses (realista para pharma validado)

---

### Cenário B: Prioridade é Velocidade ⚠️ (Risco Médio)

**Decisão:** 🥈 **Aloee** + Customizações pharma

**Roadmap:**
1. **Fase 1 (Meses 1-3):** Implantar Aloee em todas 37 linhas (OEE básico funcionando)
2. **Fase 2 (Meses 3-9):** Customizar Aloee para ALCOA+ (via APIs, wrappers, middleware)
3. **Fase 3 (Meses 9-15):** Validação GMP do sistema customizado

**Justificativa:**
- ✅ **Atende meta Janeiro/2026** (deployment básico sem validação)
- ✅ **Operadores terão UX moderna** (adoção alta, contemporaneidade melhor que TOTVS)
- ❌ **Customizações pharma complexas:** APIs de Aloee podem não cobrir todos os casos ALCOA+
- ❌ **Validação desafiadora:** Validar sistema "meio Aloee, meio customização" é mais difícil

**Risco:** Sistema funcionará, mas validação pode levar 12-18 meses (vs 6-12 esperado).

---

### Cenário C: Prioridade é Menor Risco (Conservador)

**Decisão:** **TOTVS** Customização Limitada

**Roadmap:**
1. **Fase 1 (Meses 1-6):** Customizar TOTVS Manufatura para OEE básico
2. **Fase 2 (Meses 6-12):** Validação GMP do TOTVS customizado
3. **Fase 3 (Futuro):** Migrar para solução melhor quando maturidade aumentar

**Justificativa:**
- ✅ **Menor risco técnico:** Vendor conhecido, infraestrutura existente, time conhece plataforma
- ✅ **Integração ERP nativa:** Dados de produtos, lotes, ordens fluem automaticamente
- ❌ **UX ruim:** Operadores resistem = contemporaneidade comprometida = **risco de compliance**
- ❌ **Aderência pharma baixa:** 60-70% requisitos atendidos (customizações não resolvem tudo)

**Não recomendado:** UX inadequada é deal-breaker para BPF (contemporaneidade crítica).

---

## 8. Próximos Passos (4 Semanas)

### Semana 1-2: Validação Interna

**Entrevistas com stakeholders:**
- **Maxwell Cruz Cortez** (Gerente Industrial):
  - Validar prioridades: velocidade vs compliance?
  - Orçamento real disponível?
  - Timeline é negociável?

- **Sávio Correia Rafael** (Gerente de Processos):
  - Experiência atual com TOTVS (limitações específicas?)
  - SicFar já tem sistema de rastreabilidade? (afeta decisão Tractan)
  - Requisitos de validação mais críticos?

- **Operadores de chão de fábrica:**
  - Teste de UX: mostrar demos (Aloee, Evocon, TOTVS)
  - O que faria eles usarem o sistema contemporaneamente?
  - Dificuldades com sistemas atuais?

**Validação de premissas técnicas:**
- CLPs instalados: Bottelpack, Pró Maquia, Bausch Strobbel (confirmar modelos exatos)
- Capacidade de integração TOTVS (APIs disponíveis?)
- Infraestrutura de TI (servidores, rede nas áreas limpas, WiFi)

---

### Semana 3: Demos Comerciais (Fase 2 da Análise)

**1. Tractan:**
- Demo comercial completo (OEE + rastreabilidade + BPR)
- Solicitar cases de pharma validados (documentação IQ/OQ se possível)
- Proposta comercial detalhada para 37 linhas
- Perguntas críticas:
  - Experiência em validação GMP? Quantos clientes pharma validados?
  - Como sistema garante contemporaneidade?
  - Audit trail atende ALCOA+? (demonstrar funcionalidade)

**2. Aloee:**
- Trial gratuito de 30 dias em 2-3 linhas (dados reais de produção)
- Demo comercial com perguntas sobre:
  - Suporta velocidade nominal por SKU?
  - Como trata pequenas paradas (<10min)?
  - APIs disponíveis para customizações ALCOA+?
- Proposta comercial para 37 linhas
- Solicitar referências de pharma (se existirem)

**3. Evocon:**
- Trial gratuito (benchmark de UX, não para produção validada)
- Objetivo: Entender o que torna UX excepcional
- Usar como inspiração para SysOEE caso decisão seja Build

---

### Semana 4: Decisão Final

**Consolidação:**
1. Compilar achados das entrevistas internas
2. Compilar achados dos demos comerciais
3. Atualizar análise competitiva com dados reais (Fase 2)
4. Preparar apresentação executiva

**Apresentação para Diretoria:**
- Participantes: Diretoria + Consultor Rafael Gusmão + Maxwell + Sávio
- Conteúdo: Executive Summary + Recomendação fundamentada
- Formato: 30-45 min apresentação + 30 min discussão

**Decisão:**
- **Build vs Buy vs Hybrid?**
- Aprovação de orçamento
- Aprovação de timeline
- Kick-off do projeto escolhido

---

## 9. Conclusão

**Realidade do mercado:**
Não existe "bala de prata". Cada alternativa tem trade-offs significativos que precisam ser aceitos conscientemente.

**Trade-offs principais:**
- **Tractan** = Melhor fit pharma, mas custo mais alto e complexidade maior
- **Aloee** = Deployment mais rápido, mas customizações pharma pesadas
- **Build SysOEE** = Controle total e aderência 100%, mas risco técnico e timeline longo (18-24 meses)

**Recomendação do analista:**

🎯 **Cenário A (Tractan → Build SysOEE faseado)** é a opção mais **robusta para ambiente pharma regulado**, apesar de custo e timeline maiores.

**Justificativa:**
- ✅ Mitiga risco através de abordagem faseada
- ✅ Garante compliance desde o início (Tractan tem DNA pharma)
- ✅ Aprendizado real antes de investir R$ 400-600k em build
- ✅ Timeline realista (18-24 meses) inclui validação completa

**Alternativas:**
- ⚠️ **SE** timeline Janeiro/2026 for **absolutamente inflexível**: Considerar Aloee com compromisso de validação posterior (aceitar risco de auditoria sem sistema validado).
- ❌ **NÃO recomendado:** PPI (overkill), WEG (software não é core), Cogtive (não é OEE operacional), TOTVS standalone (UX inadequada compromete BPF).

**Próximo passo crítico:**
Validar com Maxwell e Sávio se timeline pode ser estendido para 18-24 meses (incluindo validação).
**Se NÃO:** Decisão muda para Aloee (mais rápido, mas maior risco regulatório).
**Se SIM:** Tractan → Build é a escolha mais sólida.

---

**Documento completo disponível em:** `docs/competitor-analysis.md` (73 páginas com perfis detalhados de todos os concorrentes)

---

*Análise conduzida por: Mary (Business Analyst) - BMAD Agent System*
*Data: 18/10/2025*
