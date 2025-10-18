# Atividade 09 - Validação Técnica para Sistema OEE SicFar

## Objetivo
Definir metodologias de cálculo, gráficos e ferramentas visuais que deverão estar presentes no OEE SicFar, permitindo que a equipe técnica de programação e TI avalie a viabilidade de implementação. Validar se o sistema comporta a lógica de cálculo, parâmetros definidos e estrutura de dados prevista.

## Justificativa
Esta etapa é fundamental para garantir que todas as necessidades funcionais e técnicas do OEE estejam plenamente contempladas no SicFar antes do início da fase de desenvolvimento. Apresentar ao programador o detalhamento técnico completo da solução.

## Conteúdo da Validação

### Apresentação ao Programador
- Fórmulas de cálculo dos indicadores principais (Disponibilidade, Performance, Qualidade, OEE)
- Indicadores secundários (MTBF, MTTR, Taxa de Utilização, etc.)
- Regras e exceções de cálculo
- Especificações das visualizações gráficas (barras, pizza, linha do tempo, radar, etc.)
- Filtros por linha, turno, lote, setor produtivo, etc.
- Campos obrigatórios a serem capturados e integrados via CLP, apontamentos manuais ou ERP

### Benefícios
- Antecipar limitações do sistema
- Evitar retrabalhos no desenvolvimento
- Assegurar consistência, rastreabilidade e usabilidade
- Garantir que OEE reflita com precisão a realidade fabril
- Atender necessidades de Produção, Qualidade, Engenharia e Gestão

## Base de Dados

### Estrutura de Apontamentos
Cada apontamento deve carregar informações básicas que permitem eficiência no uso da ferramenta:

#### 1. Linha Produtiva
- Respeitar lista da atividade "Definição do escopo e fronteiras do projeto"
- **Obrigatório**: Duas linhas não podem ter mesma nomenclatura
- Renomeações necessárias:
  - CPHD: Linha A → **Linha Básica**
  - Líquidos Orais: Linha A → **Linha A (L)**
  - SPEP01: Linha A permanece

**Setor**: Preenchimento automático via fórmulas (PROCX/PROCV) a partir de tabela pré-definida

#### 2. Data e Dimensões Temporais
**Data**: Registro automático a partir do apontamento (sem entrada manual)

**Segmentações temporais automáticas**:
- **Semana**: =NÚMSEMANA(Data;)
- **Mês**: =TEXTO(Data; "mmm") - retorna "Jan", "Fev", etc.
- **Trimestre**: =INT((MÊS(Data)-1)/3)+1 & "T" & TEXTO(Data; "aa") - retorna "2T25"
- **Ano**: =TEXTO(Data; "aa")

**Análises viabilizadas**:
- Dia e Semana: análises operacionais de curto prazo
- Mês: acompanhamento de ciclos de planejamento mensais
- Trimestre: alinhamento com governança corporativa e relatórios trimestrais
- Ano: avaliação de metas anuais e comparativos interanuais

#### 3. Apontamento de Paradas
**Lançamento**: Computadores nas áreas produtivas
**Formato**: Código base (ex: P1.1) + horários de início e término
**Cálculo de duração**: Subtração simples com lógica para paradas que atravessam meia-noite

**Exemplo de fórmula Excel**: =SE(A1>B1;A1-B1;A1+1-B1)

**Preenchimento automático**: A partir do código, sistema preenche:
- Classe (ex: Parada Estratégica)
- Grande Parada (ex: Sem Programação de Produção)
- Apontamento (ex: Sem Programação PMP)

**Book de paradas**:
- Cada linha possui número diferente de paradas
- Máscaras concatenadas com Linha de Produção
- Mesmo código pode ter diferentes classificações entre linhas

**Observação importante**: Seria possível criar códigos únicos, mas quebraria sequenciamento e poderia gerar dúvidas. Como cálculo é interno, não há problema em ter diferentes descrições para mesmo código entre linhas.

## Gráficos e Ferramentas

### Conceito Fundamental: Segmentação de Dados

**Definição**: Capacidade de filtrar, agrupar e analisar informações de forma direcionada conforme critérios definidos (linha de produção, tipo de parada, setor, turno, período).

**Importância**:
- Transformar grandes volumes de dados em insights úteis
- Permitir decisões baseadas em recortes relevantes e operacionais
- Viabilizar identificação de gargalos
- Rastreabilidade de falhas
- Comparação entre desempenhos individuais ou combinados
- Direcionar ações corretivas e preventivas

### 1. Resumo de Horas Totais

**Tipo**: Gráfico de barras empilhadas

**Categorias exibidas**:
- Horas valiosas (verde)
- Paradas estratégicas (azul)
- Paradas por indisponibilidade (vermelho)
- Perdas por performance (laranja)
- Perdas por qualidade (amarelo)

**Cálculo**:
- Somatório das paradas apontadas no OEE SicFar
- Horas valiosas: Unidades Boas / Produtividade Ideal, OU Tempo Calendário - outras 4 paradas

**Benefícios**:
- Visão clara de como tempo foi utilizado ou desperdiçado
- Identificação imediata de quais perdas impactam mais
- Diferenciação por cores facilita interpretação
- Comparações rápidas entre áreas, turnos ou equipamentos

### 2. Velocímetro de OEE

**Tipo**: Gráfico de velocímetro

**Indicadores**:
- OEE principal
- Taxa de Utilização (gráfico adicional)

**Particularidade importante**:
- Cada linha possui metas de OEE diferentes
- Parcelas das barras (vermelho, amarelo, verde) podem variar conforme segmentação
- Exemplos: Linha E (SPEP02) vs Linha F têm duração de campanhas diferentes (24h vs 179h)

**Segmentação**: Por linha, setor ou grupo de linhas

### 3. Componentes do OEE

**Tipo**: Gráfico de barras

**Exibição**: Disponibilidade, Performance, Qualidade e OEE consolidado

**Visualizações**:
- Por período: dia, semana, mês, trimestre, ano
- Até 12 períodos comparativos (últimos 12 dias, semanas ou meses)
- Uma linha específica ou múltiplas linhas combinadas
- Aba adicional: componentes de cada linha lado a lado

**Benefícios**:
- Análise direcionada das causas de baixa eficiência
- Acompanhamento de tendências
- Medição de impacto de ações de melhoria
- Gerenciamento visual e comunicação entre níveis tático e operacional

### 4. Gráfico Histórico - Tendência de Paradas e Horas Trabalhadas

**Tipo**: Gráfico de linhas

**Exibição**: Evolução semanal das horas e/ou % do OEE em cada categoria

**Segmentação**: Por parada específica, linha ou setor

**Período**: Últimas 10 semanas

**Apresentação**: Duração em horas E % do OEE que a variável impactou

**Benefícios**:
- Identificar tendências e recorrências
- Avaliar impacto de ações de melhoria
- Decisões estratégicas de médio e longo prazo

### 5. Gráfico de Pareto de Paradas

**Tipo**: Gráfico de Pareto (barras verticais ou horizontais)

**Apresentação**: Ordem decrescente das principais causas de paradas em duração (horas) e impacto percentual sobre OEE

**Categorias (Grandes Paradas)**:
- Sem Programação PMP
- Manutenção Planejada
- Início e Fim de Produção
- Setup e Processos
- Validação e Qualificação
- Gestão de Pessoas
- Utilidades
- Falta de Materiais
- Controles de Qualidade
- Fluxo de Produção
- Pessoas - Não Planejadas
- Pequenas Paradas
- Velocidade Reduzida
- Refugo
- Reprocesso
- Ajuste Operacional
- Quebra Falha

**Níveis de análise**:
- Grandes Paradas
- Apontamento (detalhamento, ex: dentro de Utilidades → Falta de Energia, Ar Comprimido, etc.)

**Importância**:
- Principal ferramenta dos gestores na metodologia "ver e agir"
- Identificar maiores ofensores da eficiência operacional
- Priorizar ações corretivas com base em dados concretos
- Instrumento estratégico para planejamentos de médio e longo prazo
- Revelar padrões persistentes de perdas
- Orientar investimentos em melhoria contínua
- Mensurar efetividade das ações implementadas

### 6. Tabela Consolidada

**Duas versões**:

#### a) Versão por Período
- **Linhas**: Categorias de paradas
- **Colunas**: Períodos de análise (dias, semanas, meses, trimestres, anos)
- **Uso**: Visualização de tendências, sazonalidades, variações ao longo do tempo

#### b) Versão por Linha de Produção
- **Linhas**: Tipos de parada
- **Colunas**: Cada linha de produção
- **Uso**: Comparações diretas entre linhas, identificar boas práticas, pontos críticos
- **Consolidação adicional**: Por setor e processo produtivo (envase, embalagem)

**Separação clara**: Paradas planejadas vs não planejadas

**Indicadores incluídos**:
- Índice de Disponibilidade
- Taxa de Utilização
- OEE

**Benefícios**: Robustez analítica em reuniões, auditorias, revisões gerenciais

### 7. Gráfico de Rosca - Distribuição entre Paradas Planejadas e Não Planejadas

**Tipo**: Gráfico de rosca

**Exibição**: Distribuição percentual entre Paradas Planejadas (azul) e Não Planejadas (vermelho)

**Interpretação**:
- Operação eficiente: maior parte paradas planejadas
- Predominância de não planejadas: falhas sistêmicas, baixa previsibilidade, ausência de planejamento

**Importância**:
- Papel estratégico para Produção e PCP
- Avaliar nível de controle e previsibilidade
- Linhas com alta proporção de planejadas: maior estabilidade operacional
- Alto impacto visual para reuniões gerenciais

**Segmentação**: Por linha, setor, turno ou período

### 8. MTBF e MTTR

**Apresentação**: Gráficos mostrando evolução ao longo do tempo

**Benefícios**:
- Análise de confiabilidade dos equipamentos
- Identificar frequência de falhas (MTBF)
- Tempo médio de reparo (MTTR)
- Visão sobre estabilidade operacional
- Efetividade das ações de manutenção
- Decisões voltadas à redução de paradas
- Aumento da disponibilidade dos ativos

## Pequenas Paradas

### Conceito
Interrupções operacionais de curta duração (< 10 minutos) que ocorrem com frequência.

### Tratamento no OEE
- **NÃO contabilizar como tempo de indisponibilidade**
- **Impacto refletido no indicador de Performance**

### Justificativa
- Equipamentos tecnicamente disponíveis
- Ritmo de produção afetado pela frequência
- Evita inflar indicador de indisponibilidade
- Evidencia perdas de ritmo produtivo

### Dados da Farmace (ferramenta atual)
- Total: 139.800h com 77.216h 36' de paradas
- Total de apontamentos: 51.703
- Paradas < 10 min: 12.152 apontamentos (23,5% dos lançamentos)
- Duração das pequenas paradas: 0,9% do tempo calendário, 1,6% das paradas por indisponibilidade

### Melhorias possíveis
- Automações
- Ajustes de setup
- Treinamentos operacionais
- Padronizações

## Conclusão
A validação técnica assegura que o sistema OEE SicFar esteja alinhado com as necessidades operacionais da Farmace. Todos os elementos descritos visam garantir rastreabilidade, consistência e eficácia no monitoramento e gestão da eficiência das linhas de produção. Este documento serve como base para desenvolvimento e parametrização do sistema, com validação contínua pelas áreas de TI, Engenharia, Produção e Qualidade.
