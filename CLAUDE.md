---
description: 
alwaysApply: false
---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## LANGUAGE

**IMPORTANTE**: Sempre responda em português brasileiro, escreva comentários no código em português e gere toda documentação em português.

## Visão Geral do Projeto

Este é o repositório do **Sistema OEE (Overall Equipment Effectiveness) para SicFar**, um projeto de monitoramento de eficiência operacional para a indústria farmacêutica Farmace. O sistema calcula e monitora a eficiência global dos equipamentos através de três componentes principais: **Disponibilidade**, **Performance** e **Qualidade**.

### Contexto Regulatório
- Indústria farmacêutica sujeita a BPF (Boas Práticas de Fabricação)
- Todos os dados devem seguir os princípios **ALCOA+** (Atribuível, Legível, Contemporâneo, Original, Exato, Completo, Consistente, Durável, Disponível)
- Validação formal do sistema será necessária (QI, QO, QP)

### Escopo MVP
- **37 linhas de produção** em 4 setores: SPEP (20 linhas), SPPV (10 linhas), Líquidos (5 linhas), CPHD (2 linhas)
- Cada linha possui múltiplos SKUs com velocidades nominais diferentes
- Implantação prevista: Janeiro/2026

## Estrutura de Documentação

### Documentação de Especificações
```
docs/
├── EspecificacaoUsuario/     # Especificações originais completas do usuário
│   ├── md/                   # Versões em markdown (usar estas)
│   ├── doc/                  # Versões Word originais (referência)
│   └── pptx/                 # Apresentações (referência)
│
├── project/                  # Resumos estruturados das especificações
│   ├── README.md            # Índice navegável de todos os documentos
│   ├── 00-Visao-Geral-Projeto.md
│   ├── 01-Formacao-Equipe-Projeto.md
│   ├── 02-Levantamento-Processo-Atual.md
│   ├── 03-Definicao-Escopo-Projeto.md
│   ├── 04-Glossario-Termos.md          # Glossário completo do domínio
│   ├── 05-Metodologia-Calculo.md       # CRÍTICO: Fórmulas de OEE
│   ├── 07-Identificacao-Fontes-Dados.md # Integrações CLPs, TOTVS
│   ├── 08-Indicadores-Secundarios.md   # MTBF, MTTR, Taxa de Utilização
│   ├── 09-Validacao-Tecnica-SicFar.md  # Requisitos técnicos, gráficos
│   ├── 10-Planejamento-Programacao.md
│   ├── 11-Responsabilidades-Stakeholders.md
│   └── 12-Estrutura-Necessaria.md
│
└── database/                 # (futuro) Modelagem de banco de dados
```

**Nota**: Não há Atividade 06 nas especificações originais. A numeração passa da 05 para 07.

### Como Usar a Documentação
1. **Visão geral**: Comece por `docs/project/00-Visao-Geral-Projeto.md`
2. **Implementação técnica**: Consulte docs 05, 07, 08, 09 (são CRÍTICOS)
3. **Glossário de termos**: Use doc 04 para entender terminologia do domínio
4. **Especificações completas**: Consulte `docs/EspecificacaoUsuario/md/` quando precisar de detalhes

## Arquitetura do Sistema

### Componentes Principais

#### 1. Fontes de Dados
- **CLPs**: Bottelpack, Pró Maquia, Bausch Strobbel (dados de produção em tempo real)
- **Apontamentos Manuais**: Paradas, retrabalhos, via Diários de Bordo e interface SicFar
- **TOTVS (ERP)**: Dados de produtos, lotes, perdas de qualidade

#### 2. Estrutura de Dados
- **Hierarquia de Paradas**: 5 níveis (Classe → Grande Parada → Apontamento → Grupo → Detalhamento)
- **Segmentação Temporal**: Dia, Semana, Mês, Trimestre, Ano
- **Cada linha possui**: Book específico de códigos de paradas
- **Cada SKU possui**: Velocidade nominal diferente (base para cálculos)

#### 3. Cálculo de OEE

**Fórmula principal**:
```
OEE (%) = Disponibilidade × Performance × Qualidade

Onde:
- Disponibilidade = (Tempo de Operação / Tempo Disponível) × 100
- Performance = (Tempo Operacional Líquido / Tempo de Operação) × 100
- Qualidade = Qualidade_Unidades × Qualidade_Retrabalho

Tempo Disponível = Tempo Calendário - Paradas Estratégicas
```

**IMPORTANTE**:
- Todas as conversões devem ser feitas em **horas**
- Pequenas paradas (< 10 min) afetam **Performance**, não Disponibilidade
- Paradas Estratégicas **NÃO** entram no tempo disponível
- Sistema deve calcular cada componente separadamente (não apenas o OEE final)

Ver `docs/project/05-Metodologia-Calculo.md` para fórmulas completas e exemplos.

#### 4. Indicadores Secundários
- **MTBF**: Tempo médio entre falhas
- **MTTR**: Tempo médio para reparo
- **Taxa de Utilização**: Uso vs capacidade instalada
- **Índices de Indisponibilidade**: Planejada vs Não Planejada

#### 5. Visualizações Obrigatórias
- Velocímetro de OEE (com meta por linha)
- Componentes do OEE (barras comparativas)
- Gráfico de Pareto de Paradas (principal ferramenta de gestão)
- Tabelas Consolidadas (por período e por linha)
- Histórico de tendências (últimas 10 semanas)
- Gráfico de Rosca (Planejadas vs Não Planejadas)
- Resumo de Horas Totais (barras empilhadas)
- MTBF e MTTR ao longo do tempo

Ver `docs/project/09-Validacao-Tecnica-SicFar.md` para especificações completas de cada gráfico.

## Setores Produtivos (Escopo MVP)

### SPEP - Soluções Parenterais de Embalagem Plástica
- 10 linhas de envase (A, B, C, D, E, F, G, H, I, SLE)
- 10 linhas de embalagem (Esteiras 02, 04, 05, 06, 07, 08, 09, 10, H, I)
- Apontamento contemporâneo por operadores em computadores nas áreas limpas

### SPPV - Soluções Parenterais de Pequeno Volume (Vidros)
- 5 linhas de envase (Vidro 01 a 05)
- 5 linhas de embalagem (Sala 01, 02, 04, 05, 06)
- Inspeção Eletrônica também fornece dados de produção
- Um computador para todas as áreas limpas

### Líquidos - Líquidos Orais
- 3 linhas de envase (Linha A (L), B (L), C (L))
- 2 linhas de embalagem (Encartuchadeiras Vertopack e Hicart)
- Gotas (pequeno volume) e Xaropes (grande volume)

### CPHD - Concentrado Polieletrolítico para Hemodiálise
- 2 linhas (Linha Ácida e Linha Básica)
- Apontamento na documentação (fora da área limpa)

**IMPORTANTE**: Duas linhas não podem ter mesma nomenclatura. Renomeações feitas:
- CPHD: "Linha A" → "Linha Básica"
- Líquidos: "Linha A" → "Linha A (L)"
- SPEP01: "Linha A" (mantida)

## Princípios de Desenvolvimento

### Criação de Arquivos e Documentação
- **NUNCA** crie arquivos de documentação (*.md, README, etc.) a menos que **explicitamente solicitado** pelo usuário

### Integridade de Dados (ALCOA+)
- **Atribuível**: Todo registro deve ter autor e timestamp
- **Legível**: Clareza nas informações
- **Contemporâneo**: Registro no momento da ocorrência (crítico para paradas)
- **Original**: Sem reconstruções posteriores
- **Exato**: Dados precisos e completos
- **Completo**: Não omitir dados, mesmo desvios
- **Consistente**: Sequência lógica e cronológica
- **Durável**: Armazenamento seguro e de longo prazo
- **Disponível**: Acessível para auditorias

### Cálculos e Performance
- Todos os cálculos de OEE devem ser convertidos para **horas**
- Sistema deve suportar segmentação por: linha, setor, turno, período, tipo de parada
- Cumulatividade obrigatória (dia, semana, mês, trimestre, ano)
- Cache/otimização necessária para evitar recálculos constantes
- Sistema deve permanecer logado durante todo o turno (sem desconexões)

### Sessões e Usuários
- Até 100 usuários simultâneos (ou 44 usuários master por linha)
- Sistema **NÃO PODE** desconectar automaticamente durante o turno
- Paradas devem ser registradas contemporaneamente (risco crítico se sistema cair)
- Diário de Bordo Impresso como backup obrigatório

## Desenvolvimento (Futuro)

### Tecnologias a Definir
- Back-end: (a definir)
- Front-end: (a definir)
- Banco de Dados: (a definir)
- Integração CLPs: Protocolo/API (a definir)
- Integração TOTVS: API (a definir)

### Estrutura Futura Recomendada
```
src/
├── backend/
│   ├── api/
│   ├── models/
│   ├── services/
│   │   ├── calculo-oee/      # Lógica de cálculo de OEE
│   │   ├── integracao-clp/   # Integração com CLPs
│   │   └── integracao-totvs/ # Integração com ERP
│   └── utils/
├── frontend/
│   ├── components/
│   │   ├── graficos/          # Componentes de visualização
│   │   └── apontamento/       # Telas de apontamento
│   └── pages/
└── database/
    ├── migrations/
    └── seeds/
```

## Stakeholders e Validação

### Equipe Principal
- **Cícero Emanuel da Silva**: Líder de TI
- **Sávio Correia Rafael**: Gerente de Processos (validação operacional)
- **Maxwell Cruz Cortez**: Gerente Industrial
- **Consultor Rafael Gusmão**: Validação técnica de TODOS os marcos principais

### Fluxo de Aprovação (Fase de Programação)
1. Configuração Inicial → Apresentação Nível 1 (Diretoria + Consultor)
2. Aprovação → Apresentação Nível 2 (Gestores + Áreas Suporte)
3. Desenvolvimento Back-end → Validação Consultor + Sávio Rafael
4. Desenvolvimento Front-end → Apresentação Final (Todos)
5. Aprovação Final → Treinamentos → MVP

## Comandos Úteis

```bash
# Navegação na documentação
cat docs/project/README.md              # Índice de documentos
ls docs/project/                        # Listar resumos
ls docs/EspecificacaoUsuario/md/        # Especificações completas

# Verificar estrutura
tree docs/ -L 2                         # Ver estrutura de documentação
```

## Referências Rápidas

### Fórmulas Críticas
Ver `docs/project/05-Metodologia-Calculo.md` linhas 13-105

### Gráficos Obrigatórios
Ver `docs/project/09-Validacao-Tecnica-SicFar.md` linhas 46-156

### Fontes de Dados
Ver `docs/project/07-Identificacao-Fontes-Dados.md` linhas 13-19, 63-65

### Glossário Completo
Ver `docs/project/04-Glossario-Termos.md` para todos os termos do domínio

### Infraestrutura Necessária
Ver `docs/project/12-Estrutura-Necessaria.md` para requisitos de hardware/usuários

## Notas Importantes

1. **Não há Atividade 06**: A numeração das atividades pula da 05 para 07
2. **Velocidade Nominal**: Cada SKU tem velocidade diferente (não usar capacidade nominal da máquina)
3. **Pequenas Paradas**: < 10 min vão para Performance, não Disponibilidade
4. **Paradas Estratégicas**: NÃO entram no cálculo do OEE (são excluídas do tempo disponível)
5. **Validação Obrigatória**: Consultor Rafael Gusmão deve aprovar todos os marcos
6. **Data de Implantação**: Meta é 01/Janeiro/2026
7. **Book de Paradas**: Ainda não documentado (PENDENTE - Atividade 06 ausente)
