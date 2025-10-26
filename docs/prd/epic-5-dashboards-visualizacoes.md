# Epic 5: Dashboards Interativos & Visualizações (Top 4 Gráficos)

[← Voltar ao Índice](./index.md)

---


## Epic 5: Dashboards Interativos & Visualizações (Top 4 Gráficos)

**Objetivo Expandido:** Criar dashboard principal com 4 gráficos essenciais que entregam valor gerencial imediato: Velocímetro de OEE (visão executiva por linha), Pareto de Paradas (principal ferramenta de gestão para priorizar ações), Componentes do OEE (diagnóstico de qual pilar está baixo), e Tabela Consolidada (dados detalhados com ordenação/filtros). Implementar filtros dinâmicos por setor/linha/período funcionando em todos os gráficos. Gestores devem conseguir gerar insights em <2 minutos.

### Story 5.1: Criar Barra de Filtros Dinâmicos (Shared Component)

**Como** gestor,
**Eu quero** filtrar dashboards por setor, linha e período de forma persistente,
**Para que** eu visualize dados relevantes para minha análise sem reconfigurar a cada sessão.

#### Acceptance Criteria

1. Componente `<DashboardFilters>` no topo do dashboard (sticky position)
2. Filtro "Setor" (Shadcn Select): opções SPEP, SPPV, Líquidos, CPHD, Todos
3. Filtro "Linha" (Shadcn Select): dropdown dinâmico baseado em setor selecionado (query: `SELECT * FROM linhas WHERE setor_id = ? ORDER BY nome`)
4. Filtro "Período" (Shadcn Select): opções Últimas 24h, Última Semana, Último Mês, Customizado
5. Se "Customizado" selecionado: abrir Shadcn Popover com date range picker (data início + data fim)
6. Botão "Aplicar Filtros" (primário, azul) - dispara query e atualiza todos os gráficos
7. Botão "Limpar Filtros" (secundário, ghost) - reseta para valores padrão
8. State management: Zustand store `useFiltersStore` compartilhado entre componentes de gráficos
9. Persistência: salvar filtros no localStorage (key: `sysoee_dashboard_filters`) - sobrevive a refresh
10. Loading state: skeleton nos gráficos enquanto dados carregam após aplicar filtros
11. Query params na URL: `?setor=SPEP&linha=linha_a&periodo=semana` para compartilhar views específicas

---

### Story 5.2: Implementar Velocímetro de OEE (ECharts Gauge)

**Como** gestor,
**Eu quero** ver OEE consolidado em formato de velocímetro com meta visual,
**Para que** eu identifique rapidamente se linha está acima ou abaixo da meta.

#### Acceptance Criteria

1. Componente `<OEEGauge>` usando biblioteca `echarts-for-react`
2. Query Supabase: `SELECT AVG(oee) as oee_medio FROM oee_agregado WHERE linha_id = ? AND periodo_inicio BETWEEN ? AND ?`
3. Meta OEE: query `SELECT meta_oee FROM linhas WHERE id = ?`
4. Gauge configuração:
   - Min: 0%, Max: 100%
   - Zonas de cor: 0-50% (vermelho), 50-70% (amarelo), 70-100% (verde)
   - Agulha apontando para OEE atual
   - Linha de meta: marcador visual na meta (ex: 75%)
5. Título acima do gauge: "OEE - {nome_linha}" ou "OEE Médio - {nome_setor}" se múltiplas linhas
6. Valor numérico centralizado: "XX.X%" (1 casa decimal)
7. Subtítulo abaixo: "Meta: YY%" (meta da linha)
8. Tooltip ao hover: "OEE: XX.X% | Disponibilidade: AA% | Performance: BB% | Qualidade: CC%"
9. Responsivo: height 300px (mobile), 400px (tablet), 500px (desktop)
10. Animação smooth ao carregar (duration 1000ms, easing cubicOut)

---

### Story 5.3: Implementar Gráfico de Pareto de Paradas

**Como** gestor,
**Eu quero** visualizar principais causas de paradas em ordem decrescente com Pareto,
**Para que** eu priorize ações corretivas nos maiores ofensores (princípio 80/20).

#### Acceptance Criteria

1. Componente `<ParetoChart>` usando Recharts (ComposedChart com barras + linha)
2. Query Supabase:
   ```sql
   SELECT
     bp.grande_parada,
     SUM(a.duracao_minutos) / 60 as horas_totais,
     COUNT(*) as quantidade_ocorrencias
   FROM apontamentos a
   JOIN books_paradas bp ON a.codigo_parada = bp.codigo
   WHERE a.linha_id = ? AND a.timestamp_ocorrencia BETWEEN ? AND ?
   GROUP BY bp.grande_parada
   ORDER BY horas_totais DESC
   LIMIT 10
   ```
3. Cálculo de Pareto: acumulado percentual (linha vermelha) = `(SUM(horas_totais até item) / SUM(horas_totais total)) × 100`
4. Barras verticais azuis: altura = horas_totais
5. Linha vermelha overlay: percentual acumulado (eixo Y direito 0-100%)
6. Eixo X: Grande Parada (truncar labels longos com "...")
7. Eixo Y esquerdo: Horas (0 - max)
8. Eixo Y direito: Percentual acumulado (0% - 100%)
9. Tooltip ao hover: "Parada: {nome} | Horas: XX.Xh (YY% do total) | Ocorrências: ZZ"
10. Drill-down: click em barra → abrir modal listando apontamentos detalhados dessa grande parada (tabela com timestamp, linha, operador, duração)
11. Legend: "Horas de Parada" (barra azul), "% Acumulado" (linha vermelha)
12. Export button (ícone download): exportar dados do gráfico para Excel

---

### Story 5.4: Implementar Gráfico de Componentes do OEE

**Como** gestor,
**Eu quero** comparar Disponibilidade, Performance e Qualidade em barras lado a lado,
**Para que** eu identifique qual pilar do OEE está prejudicando eficiência.

#### Acceptance Criteria

1. Componente `<OEEComponentsChart>` usando Recharts (BarChart com 3 barras agrupadas)
2. Query Supabase: `SELECT periodo_inicio, disponibilidade, performance, qualidade, oee FROM oee_agregado WHERE linha_id = ? ORDER BY periodo_inicio DESC LIMIT 12`
3. Eixo X: Período (últimos 12 dias/semanas/meses conforme filtro)
4. Eixo Y: Percentual (0-100%)
5. Barras agrupadas por período:
   - Disponibilidade (verde escuro)
   - Performance (laranja)
   - Qualidade (amarelo)
6. Linha de meta: horizontal tracejada (ex: 75%) cruzando o gráfico
7. Tooltip ao hover: "Período: {data} | Disponibilidade: XX% | Performance: YY% | Qualidade: ZZ% | OEE: AA%"
8. Legend: checkboxes interativos - clicar em "Disponibilidade" esconde/mostra barras verdes
9. Responsivo: empilhar barras verticalmente em mobile (<640px)
10. Botão toggle "Visualizar por Linha": abre view alternativa com todas as linhas lado a lado (útil para comparar setores)

---

### Story 5.5: Implementar Tabela Consolidada com TanStack Table

**Como** gestor,
**Eu quero** tabela detalhada de OEE com ordenação, filtros e paginação,
**Para que** eu analise dados granulares e exporte para relatórios.

#### Acceptance Criteria

1. Componente `<OEEConsolidatedTable>` usando TanStack Table v8
2. Query Supabase: `SELECT * FROM oee_agregado WHERE {filtros} ORDER BY periodo_inicio DESC`
3. Colunas:
   - Linha (sortable)
   - Setor (sortable)
   - Período (sortable, formato dd/mm/yyyy)
   - Disponibilidade % (sortable, cor verde se >70%, amarelo se 50-70%, vermelho se <50%)
   - Performance % (sortable, mesma lógica de cores)
   - Qualidade % (sortable, mesma lógica de cores)
   - OEE % (sortable, bold, cores dinâmicas)
   - Última atualização (timestamp, formato relativo "há 2 horas")
4. Filtros inline: input de busca por linha (debounced 300ms)
5. Paginação: 10/25/50/100 itens por página (Shadcn Select no footer)
6. Ordenação: click em header alterna asc/desc/none
7. Loading state: skeleton rows durante fetch
8. Empty state: "Nenhum dado encontrado para os filtros selecionados" (Shadcn Empty)
9. Export button: "Exportar para Excel" (biblioteca XLSX) - exporta dados filtrados/ordenados atuais
10. Responsivo: scroll horizontal em mobile, colunas fixas (Linha + OEE sempre visíveis)

---

### Story 5.6: Implementar React Query para Cache Inteligente

**Como** desenvolvedor,
**Eu quero** cache de queries com invalidação inteligente,
**Para que** dashboards carreguem instantaneamente em navegações subsequentes.

#### Acceptance Criteria

1. React Query v5 configurado em `apps/web/src/lib/queryClient.ts`
2. QueryClient config: `{ defaultOptions: { queries: { staleTime: 5 * 60 * 1000, cacheTime: 10 * 60 * 1000 } } }`
3. Hook customizado `useOEEData(filters)`:
   - Query key: `['oee', filters.setor, filters.linha, filters.periodo]`
   - Query function: fetch de `oee_agregado` com filtros
   - Enabled: apenas quando filtros estão válidos
4. Hook `useParetoData(filters)` para dados de Pareto
5. Hook `useComponentsData(filters)` para gráfico de componentes
6. Invalidação manual: botão "Atualizar Dados" (ícone refresh) nos filtros → `queryClient.invalidateQueries(['oee'])`
7. Invalidação automática: após criar novo apontamento → invalida queries relacionadas
8. Loading states: `isLoading`, `isFetching` expostos para UI
9. Error handling: toast de erro se query falhar (Shadcn Toast com retry button)
10. Prefetching: ao hover em filtro de linha → prefetch dados dessa linha

---

### Story 5.7: Criar Layout Responsivo do Dashboard

**Como** usuário mobile,
**Eu quero** dashboard adaptado para tablets e celulares,
**Para que** supervisores acessem dados enquanto circulam pela fábrica.

#### Acceptance Criteria

1. Layout grid responsivo usando Tailwind CSS:
   - Desktop (>1024px): 2 colunas × 4 linhas
   - Tablet (640-1024px): 1 coluna × 8 linhas (gráficos empilhados)
   - Mobile (<640px): 1 coluna, gráficos com scroll horizontal se necessário
2. Header fixo (sticky top): logo, título, filtros (colapsáveis em mobile), badge status, user menu
3. Velocímetro OEE: span 2 colunas em desktop (destaque), full-width em mobile
4. Pareto: grid item com height adaptativo (min 400px)
5. Componentes OEE: grid item com height adaptativo
6. Tabela: full-width, scroll horizontal em mobile
7. Gráficos lazy-loaded: apenas carregam quando entram no viewport (react-intersection-observer)
8. PWA: adicionar botão "Instalar App" no header se PWA não instalado ainda (detectar via `window.matchMedia('(display-mode: standalone)')`)
9. Testes manuais: visualizar dashboard em Chrome DevTools com emulação de iPhone 12, iPad Pro, Desktop 1920×1080
10. Performance: Lighthouse score >90 em mobile

---

**Fim do Epic 5**

Este epic entrega valor gerencial imediato - dashboards são a interface principal do sistema. Pareto é a ferramenta crítica para metodologia "ver e agir".

---

