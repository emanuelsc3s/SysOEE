# Página Operação Detalhe OP - Guia de Uso

## 🎯 Objetivo

A página **Operação Detalhe OP** exibe informações completas de uma Ordem de Produção específica, permitindo visualizar todos os detalhes da OP e acessar rapidamente as principais ações operacionais através de botões fixos no rodapé.

## 🚀 Como Acessar

### Opção 1: Clicando em um Card de OP no Kanban
1. Acesse a página de Operação (`/operacao`)
2. Clique em qualquer card de OP no Kanban
3. Você será redirecionado para a página de detalhes da OP selecionada

### Opção 2: URL Direta
```
http://localhost:8080/operacao/{numeroOP}
```
Exemplo: `http://localhost:8080/operacao/136592`

## 📊 Estrutura da Página

### Header (Topo Fixo)

#### Elementos do Header:
- **Botão Voltar** (←) - Retorna para a página de Operação (Kanban)
- **Título** - "OP {número}" com subtítulo "Detalhes da Ordem de Produção"
- **Badges** - Setor e Turno da OP

### Conteúdo Principal

#### 1. Card de Informações da OP
Exibe as informações principais da Ordem de Produção:

**Informações Básicas:**
- **Data de Emissão**: Data em que a OP foi emitida
- **Lote**: Número do lote de produção
- **Linha de Produção**: Equipamento/linha onde a OP está sendo executada
- **Horas em Operação**: Total de horas que a OP está em operação
- **Produto**: Descrição completa do produto
- **SKU**: Código do produto
- **Fase Atual**: Badge destacado mostrando em qual fase do Kanban a OP está

**Cores das Fases:**
- 🔵 **Planejado**: Cinza
- 🔵 **Emissão de Dossiê**: Azul
- 🔵 **Pesagem**: Ciano
- 🟡 **Preparação**: Amarelo
- 🟠 **Envase**: Laranja
- 🟣 **Embalagem**: Roxo
- 🟢 **Concluído**: Verde

#### 2. Cards de Quantidades e Progresso

**Quantidade Teórica:**
- Quantidade planejada para produção
- Exibida em destaque com cor primária

**Produzido:**
- Quantidade já produzida
- Ícone de check verde
- Barra de progresso visual mostrando percentual de conclusão
- Cor verde para indicar produção

**Perdas:**
- Quantidade de perdas registradas
- Se houver perdas (> 0):
  - Ícone de alerta vermelho
  - Texto em vermelho
  - Borda do card em vermelho
- Se não houver perdas:
  - Texto em cinza claro

#### 3. Card de Informações Regulatórias (Opcional)
Exibido apenas se a OP possuir essas informações:
- **Dossiê**: Número do dossiê de produção
- **Registro ANVISA**: Número de registro na ANVISA
- **GTIN**: Código de barras GTIN do produto

### Rodapé Fixo com Botões de Ação

O rodapé contém 6 botões de ação principais, organizados em grid responsivo:

#### 1. 📋 Apontamento
- **Função**: Registrar apontamentos de produção
- **Ícone**: ClipboardList
- **Status**: Placeholder (a ser implementado)

#### 2. 📉 Perdas
- **Função**: Registrar perdas de material/produto
- **Ícone**: TrendingDown
- **Status**: Placeholder (a ser implementado)

#### 3. ⏸️ Parada
- **Função**: Registrar paradas de linha
- **Ícone**: Pause
- **Status**: Placeholder (a ser implementado)

#### 4. ❓ Suporte
- **Função**: Solicitar suporte técnico
- **Ícone**: HelpCircle
- **Status**: Placeholder (a ser implementado)

#### 5. 📦 Insumos
- **Função**: Gerenciar insumos da OP
- **Ícone**: PackageOpen
- **Status**: Placeholder (a ser implementado)

#### 6. 📄 Documentos
- **Função**: Acessar documentos relacionados à OP e Linha
- **Ícone**: FileStack
- **Status**: Placeholder (a ser implementado)

## 🎨 Design e Responsividade

A página foi desenvolvida com abordagem **mobile-first**, garantindo excelente experiência em todos os dispositivos.

### 📱 Mobile (< 640px)
- **Header**: Layout vertical, botão voltar menor (36px), badges empilhadas
- **Cards de Informações**: 1 coluna, ícones 16px, textos reduzidos
- **Cards de Quantidades**: 1 coluna empilhada
- **Botões de Ação**: Grid 2 colunas (3 linhas), altura 64px, ícones 20px, texto 10px
- **Espaçamentos**: `px-3 py-3`, gaps reduzidos
- **Padding Bottom**: `pb-32` (128px) para acomodar rodapé fixo

### 📱 Tablet (640px - 767px)
- **Header**: Layout horizontal, badges lado a lado
- **Cards de Informações**: 2 colunas
- **Cards de Quantidades**: 2 colunas
- **Botões de Ação**: Grid 3 colunas (2 linhas), altura 72px, ícones 24px, texto 12px
- **Espaçamentos**: `px-4 py-4`, gaps intermediários
- **Padding Bottom**: `pb-28` (112px)

### 💻 Desktop (≥ 768px)
- **Header**: Layout completo horizontal
- **Cards de Informações**: 2 colunas com espaçamento maior
- **Cards de Quantidades**: 3 colunas
- **Botões de Ação**: Grid 6 colunas (1 linha), altura 80px, ícones 24px, texto 12px
- **Espaçamentos**: `px-4 py-6`, gaps padrão
- **Padding Bottom**: `pb-24` (96px)

### 🏭 Tablet de Produção (≥ 1000px - breakpoint `tab-prod:`)
Otimizado para tablets industriais usados no chão de fábrica:
- **Elementos compactos**: Ícones e textos menores para maximizar espaço
- **Botões de ação**: Altura 56px, ícones 16px, texto 9px
- **Espaçamentos reduzidos**: `px-2 py-2`, gaps mínimos
- **Cards**: Padding interno reduzido (`px-3 py-3`)
- **Tipografia**: Textos em `text-xs` ou `text-[9px]` para densidade de informação

### 🎨 Cores dos Setores
- **SPEP**: Azul (`bg-blue-500`)
- **SPPV**: Verde (`bg-green-500`)
- **Líquidos**: Roxo (`bg-purple-500`)
- **CPHD**: Laranja (`bg-orange-500`)

### 🎨 Cores dos Turnos
- **1º Turno**: Âmbar (`bg-amber-500`)
- **2º Turno**: Índigo (`bg-indigo-500`)
- **3º Turno**: Violeta (`bg-violet-500`)
- **Administrativo**: Cinza (`bg-slate-500`)

### 📐 Breakpoints Tailwind Utilizados
```css
/* Mobile-first (padrão) */
< 640px   - Estilos base (mobile)

/* Breakpoints progressivos */
sm:  640px  - Tablets pequenos
md:  768px  - Tablets e desktops pequenos
lg:  1024px - Desktops
xl:  1280px - Desktops grandes

/* Breakpoint customizado do projeto */
tab-prod: 1000px - Tablets de produção (chão de fábrica)
```

## 🔄 Fluxo de Navegação

```
Home → Operação (Kanban) → [Clique em OP] → Operação Detalhe OP
                                                      ↓
                                            [Botões de Ação]
                                                      ↓
                                    [Funcionalidades Futuras]
```

## ⚠️ Tratamento de Erros

### OP Não Encontrada
Se a OP não existir no localStorage:
- Exibe ícone de alerta
- Mensagem: "OP Não Encontrada"
- Informa o número da OP buscada
- Botão para voltar à página de Operação

### Estado de Carregamento
Enquanto busca a OP:
- Exibe spinner de carregamento
- Mensagem: "Carregando detalhes da OP..."

## 🔧 Implementação Técnica

### Arquivos Criados/Modificados

1. **`src/pages/OperacaoDetalheOP.tsx`** (NOVO)
   - Componente principal da página de detalhes
   - Carrega OP do localStorage
   - Exibe todas as informações da OP
   - Implementa botões de ação (placeholders)

2. **`src/App.tsx`** (MODIFICADO)
   - Adicionada rota: `/operacao/:numeroOP`
   - Importado componente `OperacaoDetalheOP`

3. **`src/components/operacao/OPCard.tsx`** (MODIFICADO)
   - Adicionado `onClick` para navegação
   - Importado `useNavigate` do React Router
   - Card agora é clicável (exceto área de drag)

### Tipos Utilizados
- `OrdemProducao` de `@/types/operacao`
- `FaseProducao` de `@/types/operacao`

### Componentes UI Reutilizados
- `Button` - Botões de ação e navegação
- `Badge` - Setor, turno e fase
- `Card`, `CardHeader`, `CardTitle`, `CardContent` - Estrutura de cards
- Ícones do `lucide-react`

## 📝 Próximos Passos

### Funcionalidades a Implementar

1. **Apontamento**
   - Criar página/modal de apontamento de produção
   - Integrar com backend para salvar apontamentos
   - Validações ALCOA+

2. **Perdas**
   - Criar página/modal de registro de perdas
   - Categorização de tipos de perdas
   - Integração com cálculo de OEE

3. **Parada**
   - Criar página/modal de registro de paradas
   - Seleção de código de parada do Book
   - Registro contemporâneo (timestamp automático)

4. **Suporte**
   - Sistema de chamados/tickets
   - Notificações para equipe de suporte
   - Histórico de chamados

5. **Insumos**
   - Listagem de insumos da OP
   - Controle de estoque
   - Integração com TOTVS

6. **Documentos**
   - Repositório de documentos da OP
   - Documentos da linha de produção
   - Procedimentos operacionais padrão (POPs)
   - Registros de lote

### Melhorias Futuras

- [ ] Adicionar gráfico de progresso em tempo real
- [ ] Histórico de movimentações da OP no Kanban
- [ ] Timeline de eventos da OP
- [ ] Integração com dados reais (substituir localStorage)
- [ ] Notificações push para alertas
- [ ] Exportação de relatório da OP em PDF
- [ ] Comparação com OPs similares
- [ ] Previsão de conclusão baseada em histórico

## 🐛 Troubleshooting

### Problema: OP não é encontrada
**Solução**: Verifique se a OP existe no localStorage (`sysoee_operacao_ops`)

### Problema: Navegação não funciona ao clicar no card
**Solução**: Verifique se não está clicando na área de drag (ícone de grip)

### Problema: Botões de ação não fazem nada
**Solução**: Os botões são placeholders. Implementação futura necessária.

## 📚 Referências

- [Documentação React Router](https://reactrouter.com/)
- [Shadcn/UI Components](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- Especificações do projeto em `docs/project/`

