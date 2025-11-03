# Página ArmazemSaldo - Documentação

**Data de Criação**: 03 de Novembro de 2025
**Última Atualização**: 03 de Novembro de 2025
**Status**: ✅ Implementado
**Versão**: 1.1.0

## 📋 Visão Geral

A página **ArmazemSaldo** exibe uma lista completa de armazéns de estoque em um grid responsivo de cards. Cada card representa um armazém individual com seu código, descrição e **status de bloqueio** (quando aplicável).

## 🎯 Funcionalidades Implementadas

### ✅ Grid Responsivo de Cards
- Layout mobile-first com breakpoints adaptativos
- Grid responsivo: 1 coluna (mobile) → 2 colunas (sm) → 3 colunas (md) → 4 colunas (lg)
- Cards com hover effects e transições suaves
- Acessibilidade completa (ARIA labels, navegação por teclado)

### ✅ Indicadores Visuais de Status Bloqueado (NOVO v1.1.0)
- **7 armazéns bloqueados**: 46, 49, 56, 58, 60, 89, 96
- **Elementos visuais de bloqueio**:
  - Badge "BLOQUEADO" em vermelho no canto superior direito
  - Ícone de cadeado (Lock) no badge e no círculo do código
  - Borda vermelha no card (`border-red-500`)
  - Fundo levemente avermelhado (`bg-red-50/50`)
  - Barra inferior vermelha em vez de azul
  - Texto em tons de vermelho
  - Cursor `not-allowed` em vez de `pointer`
- **Comportamento ao clicar**: Exibe alerta informando que o armazém está bloqueado
- **Acessibilidade**: ARIA label indica status bloqueado, não depende apenas da cor

### ✅ Armazenamento em localStorage
- Dados salvos automaticamente no localStorage do navegador
- Chave de armazenamento: `sysoee_armazens`
- Formato JSON estruturado para fácil manipulação
- Carregamento automático ao inicializar a página
- **Propriedade `bloqueado`** incluída no modelo de dados

### ✅ Sistema de Busca/Filtro
- Busca em tempo real por código ou descrição
- Filtro case-insensitive
- Contador de resultados dinâmico
- Mensagem quando não há resultados

### ✅ Navegação
- Botão de voltar para Home
- Header fixo com gradiente (padrão do projeto)
- Navegação por teclado nos cards (Enter/Space)

## 📊 Dados dos Armazéns

Total de **47 armazéns** cadastrados:

| Código | Descrição |
|--------|-----------|
| 01 | ALMOXARIFADO CENTRAL |
| 02 | MATERIA PRIMA |
| 03 | EMBALAGEM |
| 04 | REJEITADOS |
| 05 | SPPV |
| 06 | SPEP 01 |
| 07 | LIQUIDOS |
| 08 | CPHD |
| 09 | PLASTICO |
| 10 | SPEP 03 |
| 11 | SPEP 02 |
| 12 | TEMP |
| 13 | A VENCER \| VENCIDOS |
| 14 | EXPEDICAO PA |
| 15 | EXPEDICAO PA FRACAO |
| 16 | AMOSTRAS ANALISE |
| 17 | SERVICOS |
| 18 | PERDAS |
| 19 | RETEM |
| 20 | DEVOLUCAO |
| 21 | DESENVOLVIMENTO |
| 22 | ALMOXARIFADO 22 |
| 23 | AMOSTRAGEM |
| 27 | SPP EXTRUSAO |
| 30 | IMPRESSOS |
| 31 | ARM SPEP 01 MP |
| 32 | ARM SPEP 02 MP |
| 33 | ARM SPEP 03 |
| 34 | ARM CPHD |
| 35 | ARM SPPV |
| 36 | ARM SPEP 02 EM |
| 37 | ARM LIQUIDOS |
| 38 | ARM SPEP 01,02 TAMPA |
| 39 | ARM PLASTICO |
| 40 | ARM SPEP 01 EM |
| 44 | EXPEDICAO LISVET |
| 45 | SPPV LISVET |
| 46 | SPEP LISVET |
| 49 | LISVET RETEM |
| 56 | ANALISES LISVET |
| 58 | PERDAS LISVET |
| 60 | TEMP2 |
| 89 | ERRADO |
| 96 | RETIFICACAO FISCAL |
| 97 | MATERIAL DE CONSUMO |
| 98 | QUARENTENA |
| 99 | PRODUTO ENVASADO |

## 🎨 Design System

### Componentes Utilizados
- **Card** (`@/components/ui/card`): Container dos armazéns
- **Button** (`@/components/ui/button`): Botão de voltar
- **Input** (`@/components/ui/input`): Campo de busca
- **Badge** (`@/components/ui/badge`): Indicador de bloqueio (variante `destructive`)
- **Ícones Lucide**: `ArrowLeft`, `Package`, `Search`, `Lock`

### Padrões de Estilo
- **Cores**: Variáveis CSS do projeto (primary, muted, foreground)
- **Tipografia**: Sistema de fontes Inter
- **Espaçamento**: Classes Tailwind utilitárias
- **Transições**: `duration-300` para hover effects
- **Sombras**: `shadow-sm` → `shadow-md` no hover

### Responsividade

#### Mobile (< 640px)
- Grid de 1 coluna
- Header compacto
- Busca em largura total

#### Tablet (640px - 1024px)
- Grid de 2-3 colunas
- Header expandido
- Espaçamento aumentado

#### Desktop (> 1024px)
- Grid de 4 colunas
- Layout otimizado
- Ícone decorativo no header

## 🔧 Estrutura Técnica

### Interface TypeScript
```typescript
interface Armazem {
  codigo: string
  descricao: string
  bloqueado: boolean  // NOVO v1.1.0
}
```

### Estados do Componente
- `armazens`: Lista completa de armazéns
- `filtro`: Texto de busca atual
- `armazensFiltrados`: Lista filtrada para exibição

### Hooks Utilizados
- `useState`: Gerenciamento de estado local
- `useEffect`: Carregamento inicial e filtro
- `useNavigate`: Navegação entre páginas

## 📱 Acessibilidade

### Recursos Implementados
- ✅ ARIA labels em todos os elementos interativos
- ✅ Navegação por teclado (Tab, Enter, Space)
- ✅ Roles semânticos (`role="button"`)
- ✅ Labels descritivos para screen readers
- ✅ Contraste adequado de cores
- ✅ Foco visível em elementos interativos

### Testes de Acessibilidade
- Navegação por teclado: ✅ Funcional
- Screen reader: ✅ Compatível
- Contraste de cores: ✅ WCAG AA

## 🚀 Funcionalidades Futuras

### Planejadas para Próximas Versões
1. **Detalhes do Armazém**
   - Página de detalhes com saldo atual
   - Histórico de movimentações
   - Produtos armazenados

2. **Filtros Avançados**
   - Filtro por tipo de armazém
   - Filtro por setor
   - Ordenação customizada

3. **Integração com Backend**
   - Sincronização com Supabase
   - Dados em tempo real
   - Atualização automática de saldos

4. **Relatórios**
   - Exportação de dados (PDF, Excel)
   - Gráficos de ocupação
   - Análise de movimentações

5. **Gestão de Armazéns**
   - Adicionar/editar/remover armazéns
   - Configuração de capacidades
   - Alertas de estoque

## 🔗 Roteamento

### Rota Atual
```
/armazens → ArmazemSaldo
```

### Rotas Futuras Planejadas
```
/armazens/:codigo → Detalhes do Armazém
/armazens/:codigo/movimentacoes → Histórico de Movimentações
/armazens/:codigo/produtos → Produtos no Armazém
```

## 📝 Notas de Implementação

### localStorage
- **Chave**: `sysoee_armazens`
- **Formato**: JSON array de objetos `Armazem`
- **Inicialização**: Automática na primeira carga
- **Persistência**: Dados mantidos entre sessões

### Performance
- Filtro otimizado com `useEffect`
- Renderização condicional de mensagens
- Grid virtualizado (futuro) para grandes volumes

### Tratamento de Erros
- Try/catch no carregamento do localStorage
- Fallback para dados padrão em caso de erro
- Logs de erro no console para debug

## 🧪 Testes Sugeridos

### Testes Manuais
1. ✅ Navegação para `/armazens`
2. ✅ Carregamento inicial dos dados
3. ✅ Busca por código (ex: "01")
4. ✅ Busca por descrição (ex: "SPEP")
5. ✅ Busca sem resultados
6. ✅ Limpeza do filtro
7. ✅ Clique em card de armazém
8. ✅ Navegação por teclado
9. ✅ Botão voltar para Home
10. ✅ Responsividade em diferentes telas

### Testes Automatizados (Futuro)
- Teste de renderização de cards
- Teste de filtro de busca
- Teste de localStorage
- Teste de navegação
- Teste de acessibilidade

## 📚 Referências

### Documentação do Projeto
- `docs/ui-architecture.md`: Arquitetura de UI
- `docs/design/home-design-system.md`: Sistema de design
- `docs/IMPLEMENTACAO-HOME.md`: Padrões de implementação

### Componentes Relacionados
- `src/components/ui/card.tsx`: Componente Card
- `src/components/ui/button.tsx`: Componente Button
- `src/components/ui/input.tsx`: Componente Input
- `src/components/navigation/NavigationCard.tsx`: Referência de card navegável

## ✅ Checklist de Implementação

- [x] Criar página `ArmazemSaldo.tsx`
- [x] Implementar grid responsivo
- [x] Adicionar sistema de busca/filtro
- [x] Implementar localStorage
- [x] Adicionar rota no `App.tsx`
- [x] Implementar acessibilidade
- [x] Adicionar navegação (voltar)
- [x] Criar documentação
- [x] Testar responsividade
- [x] Validar TypeScript (sem erros)

## 🎉 Conclusão

A página **ArmazemSaldo** foi implementada com sucesso seguindo todos os requisitos especificados e os padrões do projeto SysOEE. A implementação está pronta para uso e pode ser expandida com funcionalidades adicionais conforme necessário.

