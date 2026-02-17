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
└── database/                 # Modelagem de banco de dados
```

### Como Usar a Documentação
1. **Visão geral**: Comece por `docs/project/00-Visao-Geral-Projeto.md`
2. **Implementação técnica**: Consulte docs 05, 07, 08, 09 (são CRÍTICOS)
3. **Glossário de termos**: Use doc 04 para entender terminologia do domínio
4. **Especificações completas**: Consulte `docs/EspecificacaoUsuario/md/` quando precisar de detalhes

## Arquitetura do Sistema

### Componentes Principais

#### 1. Fontes de Dados
- **Apontamentos Manuais**: Produção, Perdas, Paradas, retrabalhos, via Diários de Bordo.

#### 2. Estrutura de Dados
- **Hierarquia de Paradas**: 5 níveis (Classe → Grande Parada → Apontamento → Grupo → Detalhamento)
- **Segmentação Temporal**: Dia, Semana, Mês, Trimestre, Ano
- **Cada linha possui**: Book específico de códigos de paradas
- **Cada SKU possui**: Velocidade nominal diferente (base para cálculos)

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

## Princípios de Desenvolvimento

### Criação de Arquivos e Documentação
- **NUNCA** crie arquivos de documentação (*.md, README, etc.) a menos que **explicitamente solicitado**

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

### Formatação numérica (pt-BR)
- **Brasil**: separador de milhar = **ponto (.)**, separador decimal = **vírgula (,)**. Ex.: 5.818 = cinco mil oitocentas e dezoito unidades; 5.818,50 = cinco mil com 50 centésimos.
- **Campos de quantidade ou númericos**: o usuário digita/visualiza em pt-BR (ex.: 5.818). Ao **persistir**, converter para número sem formatação (ex.: 5818). Ao **exibir**, formatar com `toLocaleString('pt-BR', ...)`.
- **Nunca** enviar ao banco o valor "5.818" como número literal (seria interpretado como 5,818 unidades). O banco deve receber sempre **unidades** (ex.: 5818).
- Aplicar a mesma regra em qualquer input de números para o usuário em pt-BR.

### Cálculos e Performance
- Todos os cálculos de OEE devem ser convertidos para **horas**
- Sistema deve suportar segmentação por: linha, setor, turno, período, tipo de parada
- Cumulatividade obrigatória (dia, semana, mês, trimestre, ano)
- Cache/otimização necessária para evitar recálculos constantes
- Sistema deve permanecer logado durante todo o turno (sem desconexões)

### Sessões e Usuários
- Até 500 usuários simultâneos
- Sistema **NÃO PODE** desconectar automaticamente durante o turno

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