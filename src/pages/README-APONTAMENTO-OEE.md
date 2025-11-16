# Página de Apontamento de OEE

## 📋 Visão Geral

Página para apontamento de OEE (Overall Equipment Effectiveness) com cálculo em tempo real dos componentes de Disponibilidade, Performance e Qualidade. Permite registro de produção, perdas, retrabalho e paradas de linha.

## 🎯 Funcionalidades

### 1. Cabeçalho do Apontamento
- **Turno**: Seleção entre 1º e 2º turno
- **Linha de Produção**: Seleção entre as 37 linhas dos 4 setores (SPEP, SPPV, Líquidos, CPHD)
- **Ordem de Produção**: Campo para número da OP
- **Lote**: Campo para identificação do lote
- **Produto SKU**: Seleção do produto com velocidade nominal

### 2. Velocímetro OEE em Tempo Real
- Exibe o OEE calculado em formato de velocímetro
- Mostra a meta de OEE da linha selecionada
- Atualiza automaticamente conforme dados são inseridos
- Cores dinâmicas baseadas no valor:
  - Verde (≥85%): Excelente
  - Verde claro (≥70%): Bom
  - Laranja (≥50%): Regular
  - Vermelho (<50%): Ruim

### 3. Componentes do OEE (Barras)
- Disponibilidade (azul)
- Performance/Produtividade (verde)
- Qualidade (roxo)
- Linha de meta em 85%

### 4. Apontamento de Produção
- Quantidade produzida (unidades)
- Tempo de operação (horas)
- Tempo disponível (horas)
- Data do apontamento
- Hora de início e fim

### 5. Apontamento de Qualidade

#### Perdas (Refugo e Desvios)
- Unidades rejeitadas
- Motivo da rejeição
- Observações

#### Retrabalho
- Unidades em retrabalho
- Tempo de retrabalho (horas)
- Motivo do retrabalho
- Observações

### 6. Cálculo de OEE em Tempo Real
Baseado nas fórmulas documentadas em `docs/project/05-Metodologia-Calculo.md`:

```
OEE (%) = Disponibilidade × Performance × Qualidade

Onde:
- Disponibilidade = (Tempo de Operação / Tempo Disponível) × 100
- Performance = (Tempo Operacional Líquido / Tempo de Operação) × 100
- Qualidade = Qualidade_Unidades × Qualidade_Retrabalho
```

## 🗄️ Armazenamento de Dados

### localStorage (Fase Atual)
Todos os dados são armazenados em localStorage para validação de UI/UX:

- **sysoee_apontamentos_producao**: Apontamentos de produção
- **sysoee_apontamentos_perdas**: Apontamentos de perdas
- **sysoee_apontamentos_retrabalho**: Apontamentos de retrabalho

### Estrutura de Dados

#### Apontamento de Produção
```typescript
{
  id: string
  turno: '1º Turno' | '2º Turno'
  linha: string
  setor: 'SPEP' | 'SPPV' | 'Líquidos' | 'CPHD'
  ordemProducao: string
  lote: string
  sku: string
  produto: string
  velocidadeNominal: number
  quantidadeProduzida: number
  tempoOperacao: number
  tempoDisponivel: number
  dataApontamento: string
  horaInicio: string
  horaFim: string | null
  criadoPor: number
  criadoPorNome: string
  created_at: string
  updated_at: string
}
```

## 🎨 Design System

Segue as diretrizes de `docs/design/estilizacao-CRUD.md`:

- **Espaçamento**: space-y-6 para containers, space-y-4 para formulários
- **Grid**: Responsivo com grid-cols-1 md:grid-cols-2
- **Cores**: Uso de cores semânticas e brand colors
- **Componentes**: Shadcn/UI (Card, Input, Select, Button, etc.)

## 📊 Componentes Visuais

### VelocimetroOEE
Componente SVG customizado que exibe:
- Arco de fundo (cinza)
- Arco de progresso (colorido baseado no valor)
- Ponteiro dinâmico
- Marcações de percentual (0%, 25%, 50%, 75%, 100%)
- Valor do OEE em destaque
- Meta da linha (se fornecida)

### ComponentesOEE
Barras horizontais que exibem:
- Disponibilidade (azul)
- Produtividade/Performance (verde)
- Qualidade (roxo)
- Linha de meta em 85%

## 🔄 Fluxo de Uso

1. **Preencher Cabeçalho**
   - Selecionar turno, linha, OP, lote e SKU
   - Velocímetro aparece (OEE = 0%)

2. **Salvar Apontamento de Produção**
   - Preencher quantidade, tempos e horários
   - Clicar em "Salvar Apontamento de Produção"
   - OEE é calculado automaticamente

3. **Registrar Perdas (Opcional)**
   - Preencher unidades rejeitadas e motivo
   - Clicar em "Salvar Perdas"
   - OEE é recalculado

4. **Registrar Retrabalho (Opcional)**
   - Preencher unidades, tempo e motivo
   - Clicar em "Salvar Retrabalho"
   - OEE é recalculado

5. **Visualizar Componentes**
   - Disponibilidade, Performance e Qualidade são exibidos
   - Tempo Operacional Líquido e Tempo Valioso são calculados

## 🔐 Princípios ALCOA+

- **Atribuível**: Todos os registros incluem ID do usuário e nome
- **Contemporâneo**: Timestamp automático em created_at
- **Original**: Dados não podem ser editados (apenas novos registros)
- **Exato**: Validações de campos obrigatórios
- **Completo**: Todos os campos relevantes são capturados

## 🚀 Próximos Passos

1. **Integração com Supabase**
   - Migrar de localStorage para banco de dados real
   - Implementar autenticação de usuários

2. **Apontamento de Paradas**
   - Adicionar seção para registro de paradas
   - Hierarquia de 5 níveis (Classe → Grande Parada → Apontamento → Grupo → Detalhamento)

3. **Validação e Testes**
   - Testes de usabilidade com operadores
   - Validação técnica com consultor Rafael Gusmão

## 📁 Arquivos Relacionados

- `src/pages/ApontamentoOEE.tsx`: Página principal
- `src/components/operacao/VelocimetroOEE.tsx`: Componente de velocímetro
- `src/components/operacao/ComponentesOEE.tsx`: Componente de barras
- `src/services/localStorage/apontamento-oee.storage.ts`: Serviço de armazenamento
- `src/types/apontamento-oee.ts`: Tipos TypeScript
- `src/data/mockLinhas.ts`: Dados das 37 linhas de produção
- `src/data/mockSKUs.ts`: Dados de produtos/SKUs

