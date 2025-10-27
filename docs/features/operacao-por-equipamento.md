# Funcionalidade: Operação Por Equipamento

## Visão Geral

Implementação completa da visualização "Por Equipamento" no módulo de Operação, apresentando as linhas de produção organizadas em 4 etapas operacionais em formato kanban.

## Estrutura Implementada

### 1. Tipos de Dados (`src/types/equipamento.ts`)

Define as estruturas de dados para equipamentos e status operacionais:

- **StatusEquipamento**: 4 estados possíveis
  - `Disponível`: Linhas prontas para iniciar produção
  - `Não Disponível`: Linhas indisponíveis para operação
  - `Paradas`: Linhas que estão paradas
  - `Em Produção`: Linhas atualmente produzindo

- **Equipamento**: Interface completa com:
  - Identificação (id, nome, setor)
  - Status operacional
  - Dados da OP em execução (quando aplicável)
  - Métricas de produção (progresso, quantidades)
  - Informações contextuais (turno, operador, motivos)
  - Tempo na etapa atual

### 2. Dados Mock (`src/data/mockEquipamentos.ts`)

Geração de dados mock para as **37 linhas de produção** do MVP:

- **SPEP**: 20 linhas (10 envase + 10 embalagem)
- **SPPV**: 10 linhas (5 envase + 5 embalagem)
- **Líquidos**: 5 linhas (3 envase + 2 embalagem)
- **CPHD**: 2 linhas

**Distribuição de Status** (aproximada):
- 40% Em Produção
- 30% Disponível
- 20% Paradas
- 10% Não Disponível

### 3. Componentes

#### EquipamentoCard (`src/components/operacao/EquipamentoCard.tsx`)

Card individual de equipamento com:

**Elementos Visuais:**
- Borda lateral colorida por status
- Ícone de status
- Badge de setor
- Badge de turno (quando aplicável)
- Tempo na etapa atual

**Informações por Status:**

**Em Produção:**
- Número da OP
- Produto e lote
- Progresso (%)
- Quantidades (produzida/teórica)
- Barra de progresso visual
- Operador responsável

**Paradas:**
- Motivo da parada
- OP (se houver)
- Operador

**Não Disponível:**
- Motivo da indisponibilidade

**Disponível:**
- Indicação de prontidão

**Responsividade:**
- Classes `tab-prod:` para otimização em tablets de produção (1000x400px)
- Redução de espaçamentos e tamanhos de fonte
- Manutenção de legibilidade

#### KanbanColumnEquipamento (`src/components/operacao/KanbanColumnEquipamento.tsx`)

Coluna do kanban representando uma etapa operacional:

**Características:**
- Cabeçalho com ícone, nome do status e contador
- Cores diferenciadas por status
- Lista de cards de equipamentos
- Scroll vertical automático
- Mensagem quando vazio

**Cores por Status:**
- Disponível: Azul
- Não Disponível: Vermelho
- Paradas: Laranja
- Em Produção: Verde

### 4. Página Principal (`src/pages/OperacaoPorEquipamento.tsx`)

Página completa de visualização por equipamento:

**Funcionalidades:**
- Header fixo com título e ações
- Estatísticas em tempo real:
  - Total de linhas
  - Linhas em produção
  - Linhas disponíveis
  - Linhas paradas
  - Linhas indisponíveis
- Layout kanban com 4 colunas
- Scroll horizontal com botões de navegação
- Botão de atualização
- Botão de filtros (preparado para implementação futura)
- Navegação de volta para Home

**Otimizações:**
- Scroll horizontal suave
- Botões de navegação aparecem apenas quando necessário
- Largura das colunas otimizada para diferentes resoluções
- Responsividade para tablets de produção

## Integração com Sistema

### Rotas Adicionadas (`src/App.tsx`)

```typescript
<Route path="/operacao-equipamento" element={<OperacaoPorEquipamento />} />
```

### Navegação Atualizada (`src/pages/Home.tsx`)

- Função `handleSelecionarEquipamento` agora navega para `/operacao-equipamento`
- Removido alerta de "em desenvolvimento"

### Modal de Seleção (`src/components/operacao/ModalSelecaoOperacao.tsx`)

- Card "Por Equipamento" agora com cor `primary` (verde)
- Badge alterado de "Em Desenvolvimento" para "Disponível"

## Fluxo de Uso

1. Usuário acessa a Home
2. Clica no card "Operação"
3. Modal de seleção é exibido com 2 opções:
   - **Por Ordem de Produção** (kanban de OPs)
   - **Por Equipamento** (kanban de equipamentos) ← NOVO
4. Ao selecionar "Por Equipamento":
   - Navega para `/operacao-equipamento`
   - Visualiza as 37 linhas organizadas em 4 colunas
   - Pode filtrar por setor (futuro)
   - Pode atualizar dados em tempo real

## Consistência Visual

A implementação mantém total consistência com o design system existente:

- Mesma paleta de cores
- Mesmos componentes UI (shadcn/ui)
- Mesma estrutura de layout
- Mesmas classes de responsividade (`tab-prod:`)
- Mesmo padrão de badges e ícones
- Mesma estrutura de header e navegação

## Dados Exibidos

### Informações Comuns (todos os status)
- Nome da linha
- Setor
- Tempo na etapa atual
- Turno (quando aplicável)

### Informações Específicas

**Em Produção:**
- OP em execução
- Produto e lote
- Progresso (%)
- Quantidade produzida / teórica
- Operador

**Paradas:**
- Motivo da parada
- OP (se houver)
- Operador

**Não Disponível:**
- Motivo da indisponibilidade

**Disponível:**
- Indicação de prontidão para produção

## Próximos Passos (Futuro)

### Funcionalidades Planejadas

1. **Filtros:**
   - Por setor (SPEP, SPPV, Líquidos, CPHD)
   - Por turno
   - Por tipo de linha (envase/embalagem)

2. **Integração com API:**
   - Substituir dados mock por dados reais do Supabase
   - Atualização em tempo real via subscriptions
   - Sincronização com CLPs

3. **Interatividade:**
   - Clique no card para ver detalhes do equipamento
   - Drag-and-drop para mudar status (com validações)
   - Histórico de mudanças de status

4. **Métricas Adicionais:**
   - OEE da linha
   - MTBF/MTTR
   - Histórico de paradas
   - Gráficos de tendência

5. **Notificações:**
   - Alertas de paradas não planejadas
   - Notificações de metas não atingidas
   - Avisos de manutenção preventiva

## Arquivos Criados/Modificados

### Novos Arquivos
- `src/types/equipamento.ts`
- `src/data/mockEquipamentos.ts`
- `src/components/operacao/EquipamentoCard.tsx`
- `src/components/operacao/KanbanColumnEquipamento.tsx`
- `src/pages/OperacaoPorEquipamento.tsx`
- `docs/features/operacao-por-equipamento.md`

### Arquivos Modificados
- `src/App.tsx` (adicionada rota)
- `src/pages/Home.tsx` (atualizada navegação)
- `src/components/operacao/ModalSelecaoOperacao.tsx` (atualizado badge)

## Validação

✅ Sem erros de TypeScript
✅ Sem erros de importação
✅ Consistência visual mantida
✅ Responsividade implementada
✅ Navegação funcionando
✅ Dados mock realistas
✅ Documentação completa

## Observações Técnicas

- Utiliza mesma estrutura de kanban da página de OPs
- Reutiliza componentes UI existentes
- Segue padrões de código do projeto
- Comentários em português
- Código limpo e bem documentado
- Preparado para integração futura com backend

