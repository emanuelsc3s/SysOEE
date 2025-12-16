# SICFAR SysOEE

Este diretório contém os resumos estruturados de todas as atividades e especificações do Projeto OEE (Overall Equipment Effectiveness) para implementação no sistema SicFar da Farmace.

## Índice de Documentos

### Visão Geral
- [**00 - Visão Geral do Projeto**](00-Visao-Geral-Projeto.md)
  - Objetivos estratégicos
  - Decisões de plataforma e responsabilidades
  - Grandes marcos do projeto
  - Cronograma de implantação

## Fase de Pré-Work

### Estruturação do Projeto
- [**01 - Formação da Equipe de Projeto**](01-Formacao-Equipe-Projeto.md)
  - Definição de responsáveis por cada frente
  - Estrutura das equipes: Produção, Qualidade, Engenharia, TI
  - Papel da consultoria

- [**02 - Levantamento do Processo Atual (AS-IS)**](02-Levantamento-Processo-Atual.md)
  - Mapeamento do processo atual em Excel
  - Consolidação de dados
  - Estrutura de classificação das paradas
  - Pontos de melhoria identificados

- [**03 - Definição do Escopo e Limitações**](03-Definicao-Escopo-Projeto.md)
  - Delimitação de áreas e linhas
  - MVP: 37 linhas de produção
  - Setores incluídos: SPEP, SPPV, Líquidos, CPHD
  - Fase 02 (futuro)

### Padronização e Metodologia
- [**04 - Glossário de Termos**](04-Glossario-Termos.md)
  - Definições de OEE, Disponibilidade, Performance, Qualidade
  - Tipos de paradas e tempos
  - Indicadores de manutenção (MTBF, MTTR)
  - Processos e setores produtivos

- [**05 - Metodologia de Cálculo**](05-Metodologia-Calculo.md)
  - Fórmulas padronizadas para OEE e seus componentes
  - Velocidade nominal do equipamento
  - Produtividade por setor
  - Requisitos do sistema de cálculo

### Coleta e Análise de Dados
- [**07 - Identificação de Fontes de Dados**](07-Identificacao-Fontes-Dados.md)
  - CLPs, Apontamentos Manuais e TOTVS
  - Diário de Bordo Impresso
  - Princípios ALCOA+
  - Tabela resumo de fontes

- [**08 - Indicadores Secundários**](08-Indicadores-Secundarios.md)
  - MTBF (Tempo Médio Entre Falhas)
  - MTTR (Tempo Médio para Reparo)
  - Taxa de Utilização
  - Índices de Indisponibilidade (Planejada e Não Planejada)

## Fase de Programação

### Validação Técnica
- [**09 - Validação Técnica para Sistema OEE SicFar**](09-Validacao-Tecnica-SicFar.md)
  - Base de dados e estrutura de apontamentos
  - Gráficos e ferramentas visuais
  - Segmentação de dados
  - Requisitos de interface (Front-end e Back-end)

- [**16 - Modelagem de Banco (Supabase/Postgres) para OEE**](16-Modelagem-Banco-Supabase-OEE.md)
  - Entidades e relacionamentos (lote, produção, paradas, qualidade)
  - Mapeamento UI/localStorage → Supabase
  - Considerações de ALCOA+ e RLS

### Planejamento e Estrutura
- [**10 - Refinamento do Planejamento de Programação**](10-Planejamento-Programacao.md)
  - Marcos da fase de programação
  - Apresentações e validações
  - Desenvolvimento (Back-end e Front-end)
  - Cronograma de aprovações

- [**11 - Responsabilidades dos Stakeholders**](11-Responsabilidades-Stakeholders.md)
  - Definição de papéis e atribuições
  - Operadores, Encarregados, Analistas de Dados
  - Supervisores, Coordenadores, Gestores
  - Técnicos e Engenheiros

- [**12 - Estrutura Necessária**](12-Estrutura-Necessaria.md)
  - Equipamentos (computadores)
  - Estrutura de usuários no SicFar
  - Infraestrutura para impressão
  - Requisitos críticos do sistema

## Expansões Regulatórias e de Qualidade

### Requisitos Complementares Identificados
- [**13 - Gestão de Treinamentos de Operadores**](13-Gestao-Treinamentos.md)
  - Integração de operadores com registro de treinamentos em POPs
  - Validação de competências antes de executar atividades
  - Conformidade com ALCOA+ (Atribuível)
  - Bloqueio de sistema para operadores não qualificados
  - Rastreabilidade de treinamentos vigentes

- [**14 - Eventos de Desvio de Qualidade**](14-Eventos-Desvio-Qualidade.md)
  - Abertura e investigação de desvios de qualidade
  - Workflow completo (Abertura → Investigação → CAPA → Encerramento)
  - Vinculação de desvios com paradas, refugo e retrabalho
  - Impacto de desvios no OEE
  - Conformidade regulatória (BPF, ALCOA+)

- [**15 - Controle em Processo (IPC)**](15-Controle-Processo.md) ⚠️ **Levantamento Pendente**
  - Registro de controles em processo (pH, volume, aspecto, etc.)
  - Especificações por etapa produtiva
  - Ações automáticas em caso de não conformidade
  - Integração com desvios de qualidade
  - Impacto de controles OOS (Out of Specification) no OEE
  - **Status**: Requer levantamento com área de Qualidade

## Observações Importantes

### Atividade 06
Note que **não há Atividade 06** nas especificações originais. A numeração passa diretamente da Atividade 05 para a Atividade 07.

### Consultor Técnico
Todos os marcos e entregas são validados pelo **Consultor Rafael Gusmão** antes da transição para as próximas etapas.

### Data de Implantação Ideal
**01 de Janeiro de 2026** (melhor cenário) ou 01 de Outubro de 2025 (alternativa).

## Como Usar Este Material

1. **Para visão geral**: Comece pelo documento [00-Visao-Geral-Projeto.md](00-Visao-Geral-Projeto.md)
2. **Para implementação técnica**: Consulte os documentos 05, 07, 08 e 09
3. **Para gestão de pessoas**: Consulte os documentos 01, 11 e 12
4. **Para planejamento**: Consulte os documentos 03, 10
5. **Para referência de termos**: Use o documento 04
6. **Para requisitos regulatórios e de qualidade**: Consulte os documentos 13, 14 e 15

## Documentos Fonte
Os resumos foram criados a partir dos documentos originais localizados em:
`/home/emanuel/SysOEE/docs/EspecificacaoUsuario/md/`

---

**Data de criação dos resumos**: 18 de Outubro de 2025
**Última atualização**: 27 de Outubro de 2025 (Adição de docs 13, 14, 15)
**Idioma**: Português Brasileiro
**Projeto**: OEE - SicFar - Farmace
