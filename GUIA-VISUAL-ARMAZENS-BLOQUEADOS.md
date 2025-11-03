# Guia Visual - Armazéns Bloqueados vs Ativos

**Data**: 03 de Novembro de 2025  
**Versão**: 1.1.0

## 📊 Comparação Visual

### Armazém Ativo (Exemplo: Armazém 01 - ALMOXARIFADO CENTRAL)

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌──┐                                       │
│  │01│  Armazém 01                           │ ← Círculo azul com código
│  └──┘                                       │
│                                             │
│  ALMOXARIFADO CENTRAL                       │ ← Texto preto
│                                             │
│─────────────────────────────────────────────│ ← Barra azul
└─────────────────────────────────────────────┘

Características:
- Borda: Transparente (hover: azul claro)
- Fundo: Branco
- Círculo: Azul claro (bg-primary/10)
- Código: Azul (text-primary)
- Textos: Preto/cinza
- Barra inferior: Azul (bg-primary)
- Cursor: pointer
- Hover: Scale 1.02 + shadow-md
```

### Armazém Bloqueado (Exemplo: Armazém 46 - SPEP LISVET)

```
┌─────────────────────────────────────────────┐
│                        ┌──────────────────┐ │
│  ┌──┐                 │🔒 BLOQUEADO      │ │ ← Badge vermelho
│  │🔒│  Armazém 46     └──────────────────┘ │
│  └──┘                                       │ ← Círculo vermelho com cadeado
│                                             │
│  SPEP LISVET                                │ ← Texto vermelho
│                                             │
│═════════════════════════════════════════════│ ← Barra vermelha
└─────────────────────────────────────────────┘

Características:
- Borda: Vermelha sólida (border-red-500)
- Fundo: Vermelho claro (bg-red-50/50)
- Círculo: Vermelho claro (bg-red-100)
- Ícone: Cadeado vermelho (text-red-700)
- Textos: Vermelho escuro
- Barra inferior: Vermelha (bg-red-500)
- Cursor: not-allowed
- Hover: Sem scale, shadow reduzida
```

## 🎨 Elementos Visuais Detalhados

### 1. Badge de Bloqueio

**Posição**: Canto superior direito do card

```tsx
<Badge variant="destructive" className="absolute top-2 right-2">
  <Lock className="h-3 w-3 mr-1" />
  BLOQUEADO
</Badge>
```

**Aparência**:
- Fundo: Vermelho (bg-destructive)
- Texto: Branco (text-destructive-foreground)
- Ícone: Cadeado 3x3
- Tamanho: text-xs
- Posição: Absoluta

### 2. Círculo do Código

#### Armazém Ativo
```tsx
<div className="bg-primary/10 text-primary">
  01
</div>
```

#### Armazém Bloqueado
```tsx
<div className="bg-red-100 text-red-700">
  <Lock className="h-4 w-4" />
</div>
```

### 3. Borda do Card

#### Armazém Ativo
```tsx
className="border-transparent hover:border-primary/20"
```

#### Armazém Bloqueado
```tsx
className="border-red-500"
```

### 4. Fundo do Card

#### Armazém Ativo
```tsx
className="bg-card"  // Branco
```

#### Armazém Bloqueado
```tsx
className="bg-red-50/50"  // Vermelho claro com transparência
```

### 5. Barra Inferior

#### Armazém Ativo
```tsx
<div className="bg-primary h-1.5" />
```

#### Armazém Bloqueado
```tsx
<div className="bg-red-500 h-1.5" />
```

## 🔍 Lista Completa de Armazéns Bloqueados

### 1. Armazém 46 - SPEP LISVET
- **Categoria**: Lisvet
- **Setor**: SPEP
- **Motivo**: Bloqueio operacional

### 2. Armazém 49 - LISVET RETEM
- **Categoria**: Lisvet
- **Setor**: Retenção
- **Motivo**: Bloqueio operacional

### 3. Armazém 56 - ANALISES LISVET
- **Categoria**: Lisvet
- **Setor**: Análises
- **Motivo**: Bloqueio operacional

### 4. Armazém 58 - PERDAS LISVET
- **Categoria**: Lisvet
- **Setor**: Perdas
- **Motivo**: Bloqueio operacional

### 5. Armazém 60 - TEMP2
- **Categoria**: Temporário
- **Setor**: Geral
- **Motivo**: Armazém temporário

### 6. Armazém 89 - ERRADO
- **Categoria**: Especial
- **Setor**: Geral
- **Motivo**: Armazém de erro

### 7. Armazém 96 - RETIFICACAO FISCAL
- **Categoria**: Especial
- **Setor**: Fiscal
- **Motivo**: Uso específico fiscal

## 🎯 Comportamento Interativo

### Ao Clicar em Armazém Ativo
```
1. Cursor: pointer
2. Ação: Navegar para detalhes (futuro)
3. Log: "Armazém selecionado: {dados}"
```

### Ao Clicar em Armazém Bloqueado
```
1. Cursor: not-allowed
2. Ação: Exibir alerta
3. Mensagem: "O armazém XX - DESCRIÇÃO está bloqueado e não pode ser acessado."
4. Log: "Armazém bloqueado: {dados}"
```

### Navegação por Teclado

#### Tab
- Foco passa por todos os cards (ativos e bloqueados)
- Foco visível em ambos os tipos

#### Enter/Space em Armazém Ativo
- Navega para detalhes (futuro)

#### Enter/Space em Armazém Bloqueado
- Exibe mensagem de bloqueio

## 📱 Responsividade

### Mobile (< 640px)
```
┌─────────────────┐
│ Armazém Ativo   │
└─────────────────┘
┌─────────────────┐
│ Armazém Bloq.   │
│ 🔒 BLOQUEADO    │
└─────────────────┘
```
- 1 coluna
- Badge visível
- Todos os elementos mantidos

### Tablet (640px - 1024px)
```
┌──────────┐ ┌──────────┐
│ Ativo    │ │ Bloq.    │
│          │ │ 🔒 BLOQ. │
└──────────┘ └──────────┘
```
- 2-3 colunas
- Layout otimizado

### Desktop (> 1024px)
```
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│Ativo│ │Bloq.│ │Ativo│ │Bloq.│
│     │ │🔒   │ │     │ │🔒   │
└─────┘ └─────┘ └─────┘ └─────┘
```
- 4 colunas
- Visualização completa

## ♿ Acessibilidade

### ARIA Labels

#### Armazém Ativo
```tsx
aria-label="Armazém 01 - ALMOXARIFADO CENTRAL"
```

#### Armazém Bloqueado
```tsx
aria-label="Armazém 46 - SPEP LISVET - Bloqueado"
aria-disabled="true"
```

### Indicadores Não Visuais

1. **Texto "BLOQUEADO"**: Lido por screen readers
2. **ARIA disabled**: Indica estado desabilitado
3. **Cursor diferenciado**: Feedback visual
4. **Mensagem ao clicar**: Feedback textual

### Contraste de Cores (WCAG AA)

#### Armazém Ativo
- ✅ Azul sobre branco: Contraste adequado
- ✅ Texto preto sobre branco: Alto contraste

#### Armazém Bloqueado
- ✅ Vermelho sobre branco: Contraste adequado
- ✅ Texto vermelho escuro sobre fundo claro: Legível
- ✅ Badge vermelho: Alto contraste

## 🧪 Como Testar

### 1. Visualizar Armazéns Bloqueados
```bash
npm run dev
# Acesse: http://localhost:5173/armazens
# Procure pelos armazéns: 46, 49, 56, 58, 60, 89, 96
```

### 2. Testar Busca
```
Digite "LISVET" → Verá 4 armazéns bloqueados (46, 49, 56, 58)
Digite "60" → Verá armazém TEMP2 bloqueado
Digite "89" → Verá armazém ERRADO bloqueado
Digite "96" → Verá armazém RETIFICACAO FISCAL bloqueado
```

### 3. Testar Clique
```
Clique em armazém ativo → Log no console
Clique em armazém bloqueado → Alerta exibido
```

### 4. Testar Teclado
```
Tab → Navega entre cards
Enter/Space em bloqueado → Alerta exibido
```

### 5. Verificar localStorage
```javascript
const armazens = JSON.parse(localStorage.getItem('sysoee_armazens'))
const bloqueados = armazens.filter(a => a.bloqueado)
console.log('Armazéns bloqueados:', bloqueados)
// Deve retornar 7 armazéns
```

## 📊 Estatísticas Visuais

### Distribuição por Status
```
Total: 47 armazéns
├── Ativos: 40 (85%) ████████████████████████████████████████
└── Bloqueados: 7 (15%) ███████
```

### Distribuição de Bloqueados por Categoria
```
Lisvet: 4 (57%) ████████████████████████
Temporários: 1 (14%) ███████
Especiais: 2 (29%) ██████████████
```

## 🎨 Paleta de Cores

### Armazéns Ativos (Azul)
```css
--primary: hsl(211.8947 94.0594% 39.6078%)
--primary-foreground: hsl(0 0% 98%)
--primary/10: hsla(211.8947 94.0594% 39.6078% / 0.1)
--primary/20: hsla(211.8947 94.0594% 39.6078% / 0.2)
```

### Armazéns Bloqueados (Vermelho)
```css
--destructive: hsl(0 84.2% 60.2%)
--destructive-foreground: hsl(0 0% 98%)
--red-50: hsl(0 85.7% 97.3%)
--red-100: hsl(0 93.3% 94.1%)
--red-500: hsl(0 84.2% 60.2%)
--red-700: hsl(0 70% 50%)
--red-900: hsl(0 62.8% 30.6%)
```

## 🔄 Comparação Lado a Lado

| Característica | Armazém Ativo | Armazém Bloqueado |
|----------------|---------------|-------------------|
| **Borda** | Transparente | Vermelha sólida |
| **Fundo** | Branco | Vermelho claro |
| **Círculo** | Azul claro | Vermelho claro |
| **Conteúdo Círculo** | Código numérico | Ícone cadeado |
| **Cor Código** | Azul | Vermelho |
| **Cor Textos** | Preto/Cinza | Vermelho escuro |
| **Barra Inferior** | Azul | Vermelha |
| **Badge** | Nenhum | "BLOQUEADO" vermelho |
| **Cursor** | pointer | not-allowed |
| **Hover Scale** | 1.02 | 1.0 (sem scale) |
| **Hover Shadow** | md | sm |
| **Clique** | Navega | Alerta |

## 📝 Notas de Implementação

### Código Condicional
```tsx
{armazem.bloqueado ? (
  // Renderização para bloqueado
) : (
  // Renderização para ativo
)}
```

### Classes Dinâmicas
```tsx
className={`
  ${armazem.bloqueado 
    ? 'border-red-500 bg-red-50/50 cursor-not-allowed' 
    : 'hover:border-primary/20 cursor-pointer'
  }
`}
```

### Renderização Condicional
```tsx
{armazem.bloqueado && (
  <Badge variant="destructive">
    <Lock /> BLOQUEADO
  </Badge>
)}
```

## 🚀 Melhorias Futuras

### 1. Toast em vez de Alert
```tsx
import { useToast } from '@/components/ui/use-toast'

const { toast } = useToast()

toast({
  variant: "destructive",
  title: "Armazém Bloqueado",
  description: `O armazém ${armazem.codigo} está bloqueado.`
})
```

### 2. Tooltip com Motivo
```tsx
<Tooltip>
  <TooltipTrigger>
    <Badge>BLOQUEADO</Badge>
  </TooltipTrigger>
  <TooltipContent>
    Motivo: Armazém em manutenção
  </TooltipContent>
</Tooltip>
```

### 3. Filtro por Status
```tsx
<Select>
  <SelectItem value="todos">Todos</SelectItem>
  <SelectItem value="ativos">Ativos</SelectItem>
  <SelectItem value="bloqueados">Bloqueados</SelectItem>
</Select>
```

---

**Desenvolvido para**: Sistema OEE SicFar  
**Projeto**: SysOEE  
**Módulo**: Gestão de Armazéns  
**Feature**: Indicadores Visuais de Bloqueio

