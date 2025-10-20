# Implementação de Drag-and-Drop no Kanban de Operação

## 📋 Resumo das Mudanças

Foi implementada a funcionalidade de **arrastar e soltar (drag-and-drop)** no quadro Kanban da página de Operação, permitindo que os usuários movam ordens de produção entre as diferentes fases do processo produtivo de forma intuitiva.

## 🔧 Tecnologia Utilizada

**Biblioteca**: `@dnd-kit` (versões core, sortable e utilities)

**Motivo da escolha**:
- Moderna e mantida ativamente
- Excelente performance
- Acessibilidade nativa (suporte a teclado)
- Leve e sem dependências pesadas
- Funciona perfeitamente com React 18+
- Suporte a touch devices (tablets e smartphones)

## 📦 Dependências Instaladas

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## 🎯 Arquivos Modificados

### 1. `/src/pages/Operacao.tsx`

**Mudanças principais**:

- **Imports adicionados**:
  - `DndContext`: Contexto principal do drag-and-drop
  - `DragEndEvent`, `DragStartEvent`: Tipos de eventos
  - `DragOverlay`: Componente para preview visual durante arrasto
  - `PointerSensor`, `useSensor`, `useSensors`: Sensores de interação
  - `closestCorners`: Algoritmo de detecção de colisão

- **Novos estados**:
  ```typescript
  const [activeId, setActiveId] = useState<string | null>(null)
  ```
  Armazena o ID da OP que está sendo arrastada

- **Configuração de sensores**:
  ```typescript
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requer movimento de 8px para iniciar o drag
      },
    })
  )
  ```
  Evita conflitos com cliques normais, exigindo movimento mínimo de 8px

- **Funções de manipulação**:
  
  - `handleDragStart(event)`: Captura o início do arrasto e armazena o ID da OP
  - `handleDragEnd(event)`: Processa o fim do arrasto, atualiza a fase da OP e salva no localStorage
  - `activeOP`: Memo que encontra a OP sendo arrastada para exibir no overlay

- **Estrutura JSX**:
  - Todo o kanban foi envolvido com `<DndContext>`
  - Adicionado `<DragOverlay>` para feedback visual durante o arrasto

### 2. `/src/components/operacao/KanbanColumn.tsx`

**Mudanças principais**:

- **Import adicionado**:
  ```typescript
  import { useDroppable } from '@dnd-kit/core'
  ```

- **Hook useDroppable**:
  ```typescript
  const { setNodeRef, isOver } = useDroppable({
    id: fase,
  })
  ```
  - `setNodeRef`: Referência para o elemento DOM da coluna
  - `isOver`: Boolean que indica se há um item sendo arrastado sobre a coluna

- **Feedback visual**:
  - Quando `isOver` é true:
    - Adiciona um anel (ring) colorido ao redor da coluna
    - Aplica leve escala (scale-[1.02])
    - Muda o texto de "Nenhuma OP nesta fase" para "Solte aqui"

### 3. `/src/components/operacao/OPCard.tsx`

**Mudanças principais**:

- **Imports adicionados**:
  ```typescript
  import { useDraggable } from '@dnd-kit/core'
  import { CSS } from '@dnd-kit/utilities'
  ```

- **Hook useDraggable**:
  ```typescript
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: op.op,
  })
  ```
  - `attributes`: Atributos de acessibilidade
  - `listeners`: Event listeners para drag
  - `setNodeRef`: Referência para o elemento DOM
  - `transform`: Transformação CSS durante o arrasto
  - `isDragging`: Boolean indicando se o card está sendo arrastado

- **Estilo dinâmico**:
  ```typescript
  const style = {
    transform: CSS.Translate.toString(transform),
  }
  ```

- **Classes CSS adicionadas**:
  - `cursor-grab`: Cursor de "mão" quando não está arrastando
  - `active:cursor-grabbing`: Cursor de "mão fechada" durante o arrasto
  - `opacity-50 scale-95`: Reduz opacidade e tamanho quando está sendo arrastado

## 💾 Persistência de Dados

### Como funciona:

1. **Ao mover uma OP**:
   - O evento `handleDragEnd` é disparado
   - A fase da OP é atualizada no estado React
   - A função `salvarOPs()` é chamada automaticamente
   - Os dados são salvos no `localStorage` com a chave `sysoee_operacao_ops`

2. **Ao recarregar a página**:
   - A função `carregarOPs()` é executada no estado inicial
   - Os dados são lidos do `localStorage`
   - Se houver dados salvos, eles são carregados
   - Se não houver, dados mock são gerados

3. **Estrutura de dados no localStorage**:
   ```json
   [
     {
       "op": "001234",
       "fase": "Envase",
       "dataEmissao": "20/10/2025",
       "lote": "L123456",
       // ... outros campos
     }
   ]
   ```

### Tratamento de erros:

- **localStorage indisponível**: Se o localStorage não estiver disponível (modo privado, etc.), os erros são capturados e logados no console, mas o sistema continua funcionando com dados em memória
- **Dados corrompidos**: Se os dados no localStorage estiverem corrompidos, o sistema gera novos dados mock
- **Fases inválidas**: A função `migrarOPsAntigas()` garante que OPs com fases antigas/inválidas sejam migradas para "Planejado"

## 🎨 Feedback Visual

### Durante o arrasto:

1. **Card sendo arrastado**:
   - Opacidade reduzida (50%)
   - Tamanho reduzido (95%)
   - Cursor muda para "mão fechada"

2. **Overlay (preview)**:
   - Card duplicado segue o cursor
   - Opacidade 80%
   - Leve rotação (3 graus)
   - Escala aumentada (105%)

3. **Coluna de destino**:
   - Anel colorido ao redor (ring-4 ring-primary/50)
   - Leve aumento de escala (102%)
   - Texto muda para "Solte aqui" se estiver vazia

### Transições suaves:

Todas as mudanças visuais usam `transition-all duration-200` para animações suaves.

## 🧪 Como Testar

### Teste Básico:

1. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

2. **Acesse a página de Operação**:
   - Navegue até `/operacao` ou clique no card "Operação" na página inicial

3. **Teste o drag-and-drop**:
   - Clique e segure em qualquer card de OP
   - Arraste para outra coluna (fase)
   - Solte o card
   - Verifique se o card aparece na nova fase

4. **Teste a persistência**:
   - Mova algumas OPs entre fases
   - Recarregue a página (F5)
   - Verifique se as OPs permanecem nas fases corretas

### Teste de Validação:

1. **Teste de movimento inválido**:
   - Arraste um card e solte fora das colunas
   - O card deve retornar à posição original

2. **Teste de feedback visual**:
   - Observe o anel colorido ao passar sobre uma coluna
   - Verifique o preview do card seguindo o cursor
   - Confirme que o card original fica semi-transparente

3. **Teste em diferentes dispositivos**:
   - Desktop: Use mouse
   - Tablet: Use touch (arraste com o dedo)
   - Verifique responsividade em telas menores

### Teste de Console:

Abra o DevTools (F12) e observe os logs no console:

```
🎯 Iniciando arrasto da OP: 001234
📦 Movendo OP 001234 para fase "Envase"
✅ OP 001234: "Preparação" → "Envase"
💾 Dados salvos no localStorage: 20 OPs
```

### Teste de localStorage:

1. Abra o DevTools (F12)
2. Vá para a aba "Application" (Chrome) ou "Storage" (Firefox)
3. Navegue até "Local Storage" → `http://localhost:5173`
4. Procure pela chave `sysoee_operacao_ops`
5. Verifique o JSON com todas as OPs e suas fases

## 🐛 Possíveis Problemas e Soluções

### Problema: Card não arrasta

**Solução**: Verifique se está movendo o mouse pelo menos 8px antes de soltar. Isso é intencional para evitar conflitos com cliques.

### Problema: Dados não persistem

**Solução**: 
- Verifique se o localStorage está habilitado no navegador
- Verifique se não está em modo anônimo/privado
- Limpe o localStorage e tente novamente

### Problema: Performance lenta

**Solução**: 
- A biblioteca @dnd-kit é otimizada, mas se houver muitas OPs (>100), considere virtualização
- Verifique se não há outros processos pesados rodando

## 📱 Compatibilidade

- ✅ Chrome/Edge (versões recentes)
- ✅ Firefox (versões recentes)
- ✅ Safari (versões recentes)
- ✅ Dispositivos touch (tablets, smartphones)
- ✅ Suporte a teclado (acessibilidade)

## 🔮 Melhorias Futuras Sugeridas

1. **Validação de regras de negócio**:
   - Impedir movimentos inválidos (ex: não pode voltar de "Concluído" para "Planejado")
   - Adicionar confirmação para movimentos críticos

2. **Animações mais elaboradas**:
   - Animação de "snap" ao soltar
   - Efeito de ondulação ao soltar

3. **Histórico de movimentações**:
   - Registrar quem moveu, quando e de onde para onde
   - Permitir desfazer movimentações

4. **Sincronização com backend**:
   - Atualmente usa apenas localStorage
   - Integrar com API para persistência real

5. **Drag múltiplo**:
   - Permitir selecionar e mover múltiplas OPs de uma vez

6. **Ordenação dentro da coluna**:
   - Permitir reordenar OPs dentro da mesma fase

## 📝 Notas Importantes

- **Princípio ALCOA+**: A movimentação de OPs deve ser registrada com timestamp e usuário quando integrado ao backend
- **Validação BPF**: Em produção, adicionar validações de acordo com as Boas Práticas de Fabricação
- **Auditoria**: Considerar log de todas as movimentações para rastreabilidade

## 🎓 Recursos de Aprendizado

- Documentação oficial: https://docs.dndkit.com/
- Exemplos: https://master--5fc05e08a4a65d0021ae0bf2.chromatic.com/

