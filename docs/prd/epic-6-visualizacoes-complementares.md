# Epic 6: Visualizações Complementares & Export

[← Voltar ao Índice](./index.md)

---


## Epic 6: Visualizações Complementares & Export

**Objetivo Expandido:** Completar os 8 gráficos obrigatórios adicionando 4 visualizações restantes: Gráfico de Rosca (Paradas Planejadas vs Não Planejadas), Resumo de Horas Totais (barras empilhadas mostrando uso do tempo), Histórico de Tendências (evolução semanal), e MTBF/MTTR (indicadores de manutenção). Implementar funcionalidades de export para Excel e PDF permitindo relatórios executivos. Dashboard completo atende 100% dos requisitos da documentação técnica (docs/project/09).

### Story 6.1: Implementar Gráfico de Rosca (Planejadas vs Não Planejadas)

**Como** gerente de PCP,
**Eu quero** visualizar proporção de paradas planejadas vs não planejadas,
**Para que** eu avalie nível de controle e previsibilidade da operação.

#### Acceptance Criteria

1. Componente `<PlannedVsUnplannedDonutChart>` usando Recharts (PieChart com innerRadius)
2. Query Supabase:
   ```sql
   SELECT
     CASE
       WHEN bp.classe = 'Parada Estratégica' OR bp.classe = 'Parada Planejada' THEN 'Planejadas'
       ELSE 'Não Planejadas'
     END as tipo,
     SUM(a.duracao_minutos) / 60 as horas_totais
   FROM apontamentos a
   JOIN books_paradas bp ON a.codigo_parada = bp.codigo
   WHERE a.linha_id = ? AND a.timestamp_ocorrencia BETWEEN ? AND ?
   GROUP BY tipo
   ```
3. Rosca (donut): innerRadius 60%, outerRadius 80%
4. Cores: Planejadas (azul #3B82F6), Não Planejadas (vermelho #EF4444)
5. Label centralizado no donut: percentual maior (ex: "65% Planejadas")
6. Tooltip: "Tipo: {Planejadas|Não Planejadas} | Horas: XX.Xh (YY% do total)"
7. Legend: abaixo do gráfico com checkboxes interativos
8. Insight text: abaixo da legend - "✓ Operação estável" se Planejadas > 60%, "⚠ Alta imprevisibilidade" se Não Planejadas > 60%
9. Animação: fade-in suave ao carregar
10. Responsivo: tamanho 300px (mobile), 400px (desktop)

---

### Story 6.2: Implementar Resumo de Horas Totais (Barras Empilhadas)

**Como** gestor,
**Eu quero** visualizar como tempo calendário foi utilizado em cada categoria,
**Para que** eu identifique onde há maior desperdício de capacidade.

#### Acceptance Criteria

1. Componente `<TimeSummaryStackedBarChart>` usando Recharts (BarChart stacked)
2. Query Supabase: calcular por linha/período:
   - Tempo Calendário (base 24h por dia)
   - Horas Valiosas (produção efetiva)
   - Paradas Estratégicas
   - Paradas por Indisponibilidade
   - Perdas por Performance
   - Perdas por Qualidade
3. Barra horizontal empilhada 100% (full-width do container)
4. Cores conforme metodologia:
   - Horas Valiosas: verde #22C55E
   - Paradas Estratégicas: azul #3B82F6
   - Paradas Indisponibilidade: vermelho #EF4444
   - Perdas Performance: laranja #F59E0B
   - Perdas Qualidade: amarelo #EAB308
5. Eixo Y: Linha (se múltiplas) ou único bar se linha única
6. Eixo X: Percentual (0-100%)
7. Tooltip: "Categoria: {nome} | Horas: XX.Xh (YY% do tempo calendário)"
8. Legend: ordenada por impacto (maior para menor)
9. Valores absolutos exibidos dentro das barras (se espaço suficiente)
10. Botão toggle: alternar entre view % e view horas absolutas

---

### Story 6.3: Implementar Histórico de Tendências (Últimas 10 Semanas)

**Como** gestor,
**Eu quero** visualizar evolução de OEE e paradas nas últimas 10-12 semanas,
**Para que** eu identifique tendências positivas/negativas e impacto de ações de melhoria.

#### Acceptance Criteria

1. Componente `<TrendHistoryChart>` usando Recharts (LineChart multi-series)
2. Query Supabase: `SELECT * FROM oee_agregado WHERE linha_id = ? AND periodo_tipo = 'semana' ORDER BY periodo_inicio DESC LIMIT 12`
3. Eixo X: Semana (formato "Sem XX/YYYY")
4. Eixo Y: Percentual (0-100%) ou Horas (dependendo do toggle)
5. Linhas disponíveis (usuário seleciona quais exibir via checkboxes):
   - OEE % (linha azul grossa)
   - Disponibilidade % (verde)
   - Performance % (laranja)
   - Qualidade % (amarelo)
   - Horas de Paradas Não Planejadas (vermelho, eixo Y secundário)
6. Linha de meta: horizontal tracejada (ex: 75% OEE)
7. Tooltip: ao hover em ponto → tooltip consolidado mostrando todos os valores daquela semana
8. Área preenchida sob linha OEE (área azul transparente)
9. Marcadores de eventos: annotations em semanas específicas (ex: "Manutenção preventiva realizada")
10. Botão "Ver Mais": expandir para últimas 24 semanas (modal full-screen)

---

### Story 6.4: Implementar Gráficos de MTBF e MTTR

**Como** gestor de manutenção,
**Eu quero** visualizar MTBF e MTTR ao longo do tempo,
**Para que** eu monitore confiabilidade dos equipamentos e efetividade da manutenção.

#### Acceptance Criteria

1. Componente `<MTBFMTTRChart>` usando Recharts (LineChart com 2 séries)
2. Query Supabase: `SELECT * FROM indicadores_secundarios_agregado WHERE linha_id = ? ORDER BY periodo_inicio DESC LIMIT 12`
3. Eixo X: Semana ou Mês
4. Eixo Y esquerdo: MTBF (horas)
5. Eixo Y direito: MTTR (horas)
6. Linha MTBF: azul, eixo esquerdo (valores geralmente maiores, ex: 50-200h)
7. Linha MTTR: vermelho, eixo direito (valores menores, ex: 1-10h)
8. Tooltip: "Semana: XX | MTBF: YYh (tempo médio entre falhas) | MTTR: ZZh (tempo médio de reparo)"
9. Insight box: abaixo do gráfico
   - "✓ MTBF crescente: equipamento mais confiável"
   - "⚠ MTTR aumentando: manutenção demorada"
10. Benchmark lines: linhas tracejadas mostrando médias históricas ou targets
11. Drill-down: click em ponto → modal listando falhas específicas daquela semana

---

### Story 6.5: Implementar Export de Dashboard para PDF

**Como** gestor,
**Eu quero** exportar dashboard completo para PDF,
**Para que** eu compartilhe relatórios executivos em reuniões e auditorias.

#### Acceptance Criteria

1. Botão "Exportar Dashboard" no header (ícone PDF)
2. Biblioteca `html2canvas` + `jspdf` instaladas
3. Click no botão:
   - Captura screenshot do dashboard completo (todos os gráficos visíveis)
   - Converte para canvas via `html2canvas(dashboardElement, { scale: 2 })`
   - Gera PDF via `jsPDF` com orientação landscape (A4)
   - Adiciona header no PDF: Logo SicFar + título "Relatório OEE - {Setor/Linha} - {Período}"
   - Adiciona footer: data de geração, usuário que gerou, versão do sistema
4. Filename: `OEE_Report_{setor}_{linha}_{data}.pdf`
5. Download automático após geração (browser download)
6. Loading state: modal "Gerando PDF..." com spinner (processo pode levar 5-10s)
7. Qualidade alta: scale 2x para imagens nítidas (não pixeladas)
8. Filtros aplicados exibidos no header do PDF (para contexto)
9. Tratamento de múltiplas páginas: se dashboard é muito longo, quebrar em páginas automaticamente
10. Fallback: se html2canvas falhar em algum navegador, exibir toast "Funcionalidade não suportada neste navegador. Use Chrome ou Edge."

---

### Story 6.6: Implementar Export de Tabela para Excel

**Como** analista,
**Eu quero** exportar tabela consolidada para Excel,
**Para que** eu faça análises adicionais e cruze com outros dados em planilhas.

#### Acceptance Criteria

1. Botão "Exportar para Excel" acima da Tabela Consolidada (ícone Excel verde)
2. Biblioteca `xlsx` instalada
3. Click no botão:
   - Captura dados da tabela atualmente filtrados/ordenados (não todos os dados, apenas visíveis)
   - Gera workbook XLSX via `XLSX.utils.json_to_sheet(data)`
   - Worksheet name: "OEE_{setor}_{periodo}"
   - Colunas: Linha, Setor, Período, Disponibilidade %, Performance %, Qualidade %, OEE %
   - Formatação: headers em bold, percentuais com 1 casa decimal, colunas auto-width
4. Metadata sheet adicional: "Filtros Aplicados" listando filtros de setor/linha/período
5. Filename: `OEE_Data_{setor}_{linha}_{data}.xlsx`
6. Download automático
7. Limite: se > 10.000 registros, alertar usuário "Muitos dados - aplicar filtros antes de exportar"
8. Loading state: botão com spinner durante geração
9. Toast sucesso: "Arquivo Excel gerado com sucesso - X linhas exportadas"

---

### Story 6.7: Adicionar Export de Gráfico Individual para PNG

**Como** usuário,
**Eu quero** exportar gráficos individuais como imagem PNG,
**Para que** eu insira em apresentações PowerPoint ou relatórios Word.

#### Acceptance Criteria

1. Botão de export (ícone camera/download) no canto superior direito de cada gráfico (hover para aparecer)
2. ECharts: usar método nativo `echartsInstance.getDataURL({ type: 'png', pixelRatio: 2 })`
3. Recharts: usar `html2canvas` para capturar componente do gráfico
4. Click no botão:
   - Captura gráfico em alta resolução (2x scale)
   - Gera PNG com fundo branco (não transparente)
   - Download com filename: `{tipo_grafico}_{linha}_{data}.png`
5. Incluir título e legenda na captura (não apenas o gráfico puro)
6. Loading state: botão com spinner por 1-2s durante geração
7. Qualidade: 1200×800px mínimo para uso em apresentações
8. Toast: "Imagem salva com sucesso"

---

**Fim do Epic 6**

Este epic completa os 8 gráficos obrigatórios e adiciona funcionalidades de export essenciais para relatórios executivos e reuniões gerenciais.

---

