# Componente MapaArmazens

## 📋 Visão Geral

O componente `MapaArmazens` exibe uma visualização interativa de armazéns sobre uma foto aérea, permitindo que usuários cliquem em marcadores para visualizar detalhes de cada armazém. Inclui um **Modo de Calibração** para ajustar visualmente as posições dos marcadores.

## 🎯 Funcionalidades

- **Foto Aérea**: Exibe a imagem `/public/FotoAerea.jpeg` como plano de fundo
- **Marcadores Interativos**: Cada armazém é representado por um ícone de pin clicável
- **Diferenciação Visual**: Armazéns bloqueados aparecem em vermelho, disponíveis em azul
- **Responsivo**: A imagem mantém proporções adequadas em diferentes tamanhos de tela
- **Integração com Modal**: Ao clicar em um marcador, abre o modal de detalhes do armazém
- **🎯 Modo de Calibração**: Interface visual para ajustar posições dos marcadores com drag-and-drop
- **💾 Persistência**: Coordenadas personalizadas salvas no localStorage
- **🔄 Restauração**: Possibilidade de voltar às coordenadas padrão

## 🗺️ Sistema de Coordenadas

### Como Funciona

As coordenadas dos marcadores são definidas em **percentuais relativos à imagem** (0-100):

- **X**: Posição horizontal (0 = esquerda, 100 = direita)
- **Y**: Posição vertical (0 = topo, 100 = base)

### Exemplo

```typescript
{ codigo: '01', x: 15, y: 20 }
// Armazém 01 estará a 15% da esquerda e 20% do topo
```

## 🔧 Como Ajustar as Coordenadas

### ⭐ Método 1: Modo de Calibração Visual (RECOMENDADO)

**Este é o método mais fácil e intuitivo!**

1. Acesse a página `/armazens`
2. Clique na guia "Mapa"
3. Clique no botão **"Calibrar Posições"**
4. **Arraste os marcadores** para as posições corretas na foto aérea
5. As coordenadas são exibidas em tempo real durante o arraste
6. Clique em **"Salvar Posições"** para confirmar
7. Ou clique em **"Cancelar"** para descartar as alterações

**Recursos do Modo de Calibração:**
- ✅ Drag-and-drop intuitivo
- ✅ Feedback visual em tempo real
- ✅ Exibição de coordenadas durante o arraste
- ✅ Validação automática (coordenadas entre 0-100)
- ✅ Persistência automática no localStorage
- ✅ Possibilidade de cancelar antes de salvar
- ✅ Botão "Restaurar Padrões" para voltar ao JSON original

### Método 2: Edição Manual do JSON

1. Abra o arquivo `src/data/coordenadas-armazens.json`
2. Localize o armazém pelo código
3. Ajuste os valores de `x` e `y` (0-100)
4. Salve o arquivo
5. Recarregue a página

```json
{
  "codigo": "01",
  "x": 25,  // 25% da esquerda
  "y": 30,  // 30% do topo
  "descricao": "ALMOXARIFADO CENTRAL"
}
```

### Método 3: Edição Manual do Componente

1. Abra o arquivo `src/components/armazem/MapaArmazens.tsx`
2. Localize a constante `COORDENADAS_PADRAO`
3. Ajuste os valores de `x` e `y` para cada armazém

```typescript
const COORDENADAS_PADRAO: ArmazemCoordenadas[] = [
  { codigo: '01', x: 15, y: 20 },  // Ajuste estes valores
  { codigo: '02', x: 25, y: 20 },
  // ...
]
```

### Método 4: Migração para Banco de Dados (Futuro)

Para facilitar ajustes futuros em produção, recomenda-se migrar as coordenadas para o banco de dados:

```sql
-- Exemplo de estrutura de tabela
CREATE TABLE armazem_coordenadas (
  codigo VARCHAR(2) PRIMARY KEY,
  x DECIMAL(5,2) NOT NULL,
  y DECIMAL(5,2) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📐 Proporção da Imagem

A imagem está configurada com proporção **3:2** (66.67% de altura em relação à largura):

```tsx
<div className="relative w-full" style={{ paddingBottom: '66.67%' }}>
```

**Para ajustar a proporção:**
- 16:9 → `paddingBottom: '56.25%'`
- 4:3 → `paddingBottom: '75%'`
- 1:1 → `paddingBottom: '100%'`

## 🎨 Personalização Visual

### Cores dos Marcadores

```tsx
// Armazém disponível
className="text-primary fill-primary/20"

// Armazém bloqueado
className="text-red-600 fill-red-100"
```

### Tamanho dos Marcadores

```tsx
// Tamanho padrão
<MapPin className="h-8 w-8" />

// Para aumentar/diminuir, ajuste os valores:
<MapPin className="h-10 w-10" />  // Maior
<MapPin className="h-6 w-6" />    // Menor
```

### Efeito Hover

```tsx
className="hover:scale-125 hover:z-10"
// scale-125 = aumenta 25% no hover
// z-10 = traz para frente
```

## 🔄 Integração com ArmazemSaldo

O componente é usado na página `ArmazemSaldo.tsx` dentro da guia "Mapa":

```tsx
<TabsContent value="mapa">
  <MapaArmazens 
    armazens={armazens} 
    onArmazemClick={handleArmazemClick}
  />
</TabsContent>
```

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `armazens` | `Armazem[]` | Lista de armazéns a serem exibidos |
| `onArmazemClick` | `(armazem: Armazem) => void` | Callback ao clicar em um marcador |

## 📱 Responsividade

O componente é totalmente responsivo:

- **Mobile**: Marcadores mantêm tamanho legível
- **Tablet**: Imagem se ajusta ao container
- **Desktop**: Visualização otimizada em telas grandes

## 🎯 Modo de Calibração

### Como Funciona

O Modo de Calibração permite ajustar visualmente as posições dos marcadores através de drag-and-drop.

### Ativação

1. Clique no botão **"Calibrar Posições"**
2. O modo de calibração é ativado
3. Um alerta amarelo aparece indicando o modo ativo
4. Um badge "🎯 Modo de Calibração Ativo" é exibido

### Durante a Calibração

**Feedback Visual:**
- Cursor muda para `crosshair` sobre o mapa
- Marcadores ganham borda amarela (`ring-2 ring-yellow-400`)
- Cursor muda para `move` sobre os marcadores
- Marcador sendo arrastado aumenta de tamanho e pulsa
- Coordenadas são exibidas em tempo real abaixo do marcador

**Interação:**
- **Arrastar**: Clique e segure um marcador, depois arraste
- **Soltar**: Solte o botão do mouse para fixar a nova posição
- **Coordenadas**: Valores X% e Y% são exibidos durante o arraste
- **Validação**: Coordenadas são automaticamente limitadas entre 0-100

### Salvamento

**Salvar Posições:**
1. Clique no botão verde **"Salvar Posições"**
2. Coordenadas são salvas no `localStorage`
3. Toast de confirmação é exibido
4. Modo de calibração é desativado

**Cancelar:**
1. Clique no botão vermelho **"Cancelar"**
2. Todas as alterações são descartadas
3. Coordenadas voltam ao estado anterior

**Restaurar Padrões:**
1. Clique no botão **"Restaurar Padrões"**
2. Coordenadas voltam aos valores do JSON original
3. Dados do localStorage são removidos

## 🚀 Melhorias Futuras

### 1. ✅ Interface de Calibração (IMPLEMENTADO)
~~Criar interface para ajustar coordenadas visualmente~~

### 2. Zoom e Pan
Adicionar capacidade de zoom e navegação na imagem:
```bash
npm install react-zoom-pan-pinch
```

### 3. Tooltip com Informações
Exibir informações ao passar o mouse sobre o marcador:
```tsx
<Tooltip>
  <TooltipTrigger>
    <MapPin />
  </TooltipTrigger>
  <TooltipContent>
    Armazém {codigo} - {descricao}
  </TooltipContent>
</Tooltip>
```

### 3. Filtros no Mapa
Permitir filtrar armazéns visíveis:
- Por status (bloqueado/disponível)
- Por setor
- Por ocupação

### 4. Heatmap de Ocupação
Colorir marcadores baseado no nível de ocupação:
- Verde: < 50% ocupado
- Amarelo: 50-80% ocupado
- Vermelho: > 80% ocupado

### 5. Múltiplas Camadas
Adicionar camadas alternáveis:
- Foto aérea
- Planta baixa
- Mapa esquemático

## 🐛 Troubleshooting

### Marcadores não aparecem
- Verifique se a imagem `/public/FotoAerea.jpeg` existe
- Confirme que as coordenadas estão entre 0-100
- Verifique o console do navegador para erros

### Marcadores em posições erradas
- Ajuste os valores de `x` e `y` em `COORDENADAS_ARMAZENS`
- Considere a proporção da imagem ao calcular posições

### Imagem não carrega
- Confirme que o arquivo está em `/public/FotoAerea.jpeg`
- Verifique permissões do arquivo
- Teste o caminho diretamente no navegador: `http://localhost:8081/FotoAerea.jpeg`

## 📝 Exemplo de Uso Completo

```tsx
import { MapaArmazens } from '@/components/armazem/MapaArmazens'

function MinhaPage() {
  const armazens = [
    { codigo: '01', descricao: 'ALMOXARIFADO CENTRAL', bloqueado: false },
    { codigo: '02', descricao: 'MATERIA PRIMA', bloqueado: false },
    // ...
  ]

  const handleClick = (armazem) => {
    console.log('Armazém clicado:', armazem)
    // Abrir modal, navegar, etc.
  }

  return (
    <MapaArmazens 
      armazens={armazens}
      onArmazemClick={handleClick}
    />
  )
}
```

## 📚 Referências

- [Lucide Icons - MapPin](https://lucide.dev/icons/map-pin)
- [Tailwind CSS - Positioning](https://tailwindcss.com/docs/position)
- [React - Event Handling](https://react.dev/learn/responding-to-events)

