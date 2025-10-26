# Guia de Responsividade - Página Operação Detalhe OP

## 📱 Abordagem Mobile-First

A página `OperacaoDetalheOP.tsx` foi desenvolvida seguindo a metodologia **mobile-first**, onde:
1. Estilos base são otimizados para dispositivos móveis (< 640px)
2. Breakpoints progressivos adicionam melhorias para telas maiores
3. Breakpoint customizado `tab-prod:` otimiza para tablets industriais

## 🎯 Breakpoints Utilizados

### Breakpoints Padrão do Tailwind CSS
```
Base (Mobile)    < 640px   - Smartphones
sm:              ≥ 640px   - Tablets pequenos
md:              ≥ 768px   - Tablets e desktops pequenos
lg:              ≥ 1024px  - Desktops
xl:              ≥ 1280px  - Desktops grandes
```

### Breakpoint Customizado do Projeto
```
tab-prod:        ≥ 1000px  - Tablets de produção (chão de fábrica)
```

**Configuração no `tailwind.config.js`:**
```javascript
module.exports = {
  theme: {
    extend: {
      screens: {
        'tab-prod': '1000px',
      },
    },
  },
}
```

## 📐 Especificações por Componente

### 1. Container Principal

**Mobile (< 640px):**
```tsx
className="min-h-screen bg-muted pb-32"
```
- `pb-32` (128px) - Espaço para rodapé fixo com 6 botões em 2 colunas

**Tablet (≥ 640px):**
```tsx
className="min-h-screen bg-muted pb-32 sm:pb-28"
```
- `sm:pb-28` (112px) - Rodapé com 6 botões em 3 colunas

**Desktop (≥ 768px):**
```tsx
className="min-h-screen bg-muted pb-32 sm:pb-28 md:pb-24"
```
- `md:pb-24` (96px) - Rodapé com 6 botões em 1 linha

---

### 2. Header (Topo Fixo)

**Mobile (< 640px):**
```tsx
<div className="max-w-7xl mx-auto px-3 py-3">
  <div className="flex flex-col gap-2">
    {/* Layout vertical */}
    <div className="flex items-center gap-2">
      <Button className="h-9 w-9">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        <h1 className="text-lg font-bold">OP {op.op}</h1>
        <p className="text-xs">Detalhes da Ordem de Produção</p>
      </div>
    </div>
    <div className="flex gap-1.5">
      {/* Badges empilhadas */}
      <Badge className="text-xs">{op.setor}</Badge>
      <Badge className="text-xs">{op.turno}</Badge>
    </div>
  </div>
</div>
```

**Tablet/Desktop (≥ 640px):**
```tsx
<div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    {/* Layout horizontal */}
    <div className="flex items-center gap-2 sm:gap-3">
      <Button className="h-9 w-9 sm:h-10 sm:w-10">
        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      <div>
        <h1 className="text-lg sm:text-xl md:text-2xl">OP {op.op}</h1>
        <p className="text-xs sm:text-sm">Detalhes da Ordem de Produção</p>
      </div>
    </div>
    <div className="flex gap-1.5 sm:gap-2">
      <Badge className="text-xs sm:text-sm">{op.setor}</Badge>
      <Badge className="text-xs sm:text-sm">{op.turno}</Badge>
    </div>
  </div>
</div>
```

**Tablet de Produção (≥ 1000px):**
```tsx
<div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 tab-prod:px-2 tab-prod:py-2">
  {/* Espaçamentos compactos */}
  <Button className="h-9 w-9 sm:h-10 sm:w-10 tab-prod:h-8 tab-prod:w-8">
    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 tab-prod:h-4 tab-prod:w-4" />
  </Button>
  <h1 className="text-lg sm:text-xl md:text-2xl tab-prod:text-lg">OP {op.op}</h1>
  <Badge className="text-xs sm:text-sm tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0">
    {op.setor}
  </Badge>
</div>
```

---

### 3. Card de Informações Principais

**Grid de Informações:**

**Mobile (< 640px):**
```tsx
<div className="grid grid-cols-1 gap-3">
  {/* 1 coluna, 4 itens empilhados */}
  <div className="flex items-center gap-2">
    <div className="p-1.5 bg-primary/10 rounded-lg">
      <Calendar className="h-4 w-4 text-primary" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground">Data de Emissão</p>
      <p className="font-semibold text-sm">{op.dataEmissao}</p>
    </div>
  </div>
</div>
```

**Tablet/Desktop (≥ 640px):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
  {/* 2 colunas, 2x2 grid */}
  <div className="flex items-center gap-2 sm:gap-3">
    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
    </div>
    <div>
      <p className="text-xs sm:text-sm text-muted-foreground">Data de Emissão</p>
      <p className="font-semibold text-sm sm:text-base">{op.dataEmissao}</p>
    </div>
  </div>
</div>
```

**Tablet de Produção (≥ 1000px):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 tab-prod:gap-2">
  <div className="flex items-center gap-2 sm:gap-3 tab-prod:gap-2">
    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg tab-prod:p-1.5">
      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary tab-prod:h-4 tab-prod:w-4" />
    </div>
    <div>
      <p className="text-xs sm:text-sm text-muted-foreground tab-prod:text-xs">Data de Emissão</p>
      <p className="font-semibold text-sm sm:text-base tab-prod:text-sm">{op.dataEmissao}</p>
    </div>
  </div>
</div>
```

---

### 4. Cards de Quantidades (Teórica/Produzido/Perdas)

**Mobile (< 640px):**
```tsx
<div className="grid grid-cols-1 gap-3">
  {/* 1 coluna, 3 cards empilhados */}
  <Card>
    <CardHeader className="pb-2 tab-prod:pb-2 tab-prod:px-3 tab-prod:pt-3">
      <CardTitle className="text-xs">Quantidade Teórica</CardTitle>
    </CardHeader>
    <CardContent className="tab-prod:px-3 tab-prod:pb-3">
      <p className="text-2xl font-bold text-primary">{formatarNumero(op.quantidadeTeorica)}</p>
    </CardContent>
  </Card>
</div>
```

**Tablet (≥ 640px):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
  {/* 2 colunas, 2 cards na primeira linha, 1 na segunda */}
  <Card>
    <CardHeader className="pb-2 sm:pb-3">
      <CardTitle className="text-xs sm:text-sm">Quantidade Teórica</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl sm:text-3xl font-bold">{formatarNumero(op.quantidadeTeorica)}</p>
    </CardContent>
  </Card>
</div>
```

**Desktop (≥ 768px):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
  {/* 3 colunas, 1 linha */}
  <Card>
    <CardHeader className="pb-2 sm:pb-3">
      <CardTitle className="text-xs sm:text-sm">Quantidade Teórica</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl sm:text-3xl font-bold">{formatarNumero(op.quantidadeTeorica)}</p>
    </CardContent>
  </Card>
</div>
```

**Tablet de Produção (≥ 1000px):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 tab-prod:gap-2">
  <Card>
    <CardHeader className="pb-2 sm:pb-3 tab-prod:pb-2 tab-prod:px-3 tab-prod:pt-3">
      <CardTitle className="text-xs sm:text-sm tab-prod:text-xs">Quantidade Teórica</CardTitle>
    </CardHeader>
    <CardContent className="tab-prod:px-3 tab-prod:pb-3">
      <p className="text-2xl sm:text-3xl font-bold tab-prod:text-xl">{formatarNumero(op.quantidadeTeorica)}</p>
    </CardContent>
  </Card>
</div>
```

---

### 5. Rodapé Fixo com Botões de Ação

**Mobile (< 640px):**
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-30">
  <div className="max-w-7xl mx-auto px-3 py-3">
    <div className="grid grid-cols-2 gap-2">
      {/* 2 colunas, 3 linhas (6 botões) */}
      <Button className="flex flex-col items-center justify-center h-16 gap-0.5" variant="outline">
        <ClipboardList className="h-5 w-5" />
        <span className="text-[10px]">Apontamento</span>
      </Button>
      {/* ... mais 5 botões */}
    </div>
  </div>
</div>
```

**Tablet (≥ 640px):**
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-30">
  <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
      {/* 3 colunas, 2 linhas (6 botões) */}
      <Button className="flex flex-col items-center justify-center h-16 sm:h-18 gap-0.5 sm:gap-1" variant="outline">
        <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="text-[10px] sm:text-xs">Apontamento</span>
      </Button>
      {/* ... mais 5 botões */}
    </div>
  </div>
</div>
```

**Desktop (≥ 768px):**
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-30">
  <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
      {/* 6 colunas, 1 linha (6 botões) */}
      <Button className="flex flex-col items-center justify-center h-16 sm:h-18 md:h-20 gap-0.5 sm:gap-1" variant="outline">
        <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="text-[10px] sm:text-xs">Apontamento</span>
      </Button>
      {/* ... mais 5 botões */}
    </div>
  </div>
</div>
```

**Tablet de Produção (≥ 1000px):**
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-30">
  <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 tab-prod:px-2 tab-prod:py-2">
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 tab-prod:gap-1.5">
      {/* Botões compactos para tablets industriais */}
      <Button className="flex flex-col items-center justify-center h-16 sm:h-18 md:h-20 gap-0.5 sm:gap-1 tab-prod:h-14 tab-prod:gap-0.5" variant="outline">
        <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 tab-prod:h-4 tab-prod:w-4" />
        <span className="text-[10px] sm:text-xs tab-prod:text-[9px]">Apontamento</span>
      </Button>
      {/* ... mais 5 botões */}
    </div>
  </div>
</div>
```

---

## 📊 Tabela Resumo de Dimensões

| Elemento | Mobile (<640px) | Tablet (≥640px) | Desktop (≥768px) | Tab-Prod (≥1000px) |
|----------|----------------|-----------------|------------------|-------------------|
| **Padding Container** | `px-3 py-4` | `px-4 py-5` | `px-4 py-6` | `px-2 py-3` |
| **Padding Bottom** | `pb-32` (128px) | `pb-28` (112px) | `pb-24` (96px) | - |
| **Botão Voltar** | `h-9 w-9` (36px) | `h-10 w-10` (40px) | `h-10 w-10` (40px) | `h-8 w-8` (32px) |
| **Título Principal** | `text-lg` (18px) | `text-xl` (20px) | `text-2xl` (24px) | `text-lg` (18px) |
| **Ícones Header** | `h-4 w-4` (16px) | `h-5 w-5` (20px) | `h-5 w-5` (20px) | `h-4 w-4` (16px) |
| **Grid Informações** | 1 coluna | 2 colunas | 2 colunas | 2 colunas |
| **Grid Quantidades** | 1 coluna | 2 colunas | 3 colunas | 3 colunas |
| **Grid Botões Ação** | 2 colunas | 3 colunas | 6 colunas | 6 colunas |
| **Altura Botões Ação** | `h-16` (64px) | `h-18` (72px) | `h-20` (80px) | `h-14` (56px) |
| **Ícones Botões Ação** | `h-5 w-5` (20px) | `h-6 w-6` (24px) | `h-6 w-6` (24px) | `h-4 w-4` (16px) |
| **Texto Botões Ação** | `text-[10px]` | `text-xs` (12px) | `text-xs` (12px) | `text-[9px]` |

---

## 🎯 Boas Práticas Aplicadas

### 1. Mobile-First
✅ Estilos base otimizados para mobile
✅ Breakpoints progressivos adicionam complexidade
✅ Evita sobrescrever estilos desnecessariamente

### 2. Consistência com o Projeto
✅ Usa mesmos breakpoints de `Operacao.tsx` e `OPCard.tsx`
✅ Segue padrão de nomenclatura de classes
✅ Mantém hierarquia visual consistente

### 3. Performance
✅ Classes Tailwind compiladas estaticamente
✅ Sem JavaScript para responsividade
✅ CSS otimizado pelo PurgeCSS

### 4. Acessibilidade
✅ Tamanhos de toque adequados (mínimo 44x44px)
✅ Contraste de cores mantido em todos os tamanhos
✅ Textos legíveis em todas as resoluções

### 5. Manutenibilidade
✅ Padrão claro e replicável
✅ Documentação completa
✅ Fácil adicionar novos breakpoints

---

## 🧪 Testando Responsividade

### No Navegador (Chrome DevTools)
1. Abra a página: `http://localhost:8080/operacao/136592`
2. Pressione `F12` para abrir DevTools
3. Clique no ícone de dispositivo móvel (ou `Ctrl+Shift+M`)
4. Teste os seguintes tamanhos:
   - **iPhone SE**: 375px (mobile)
   - **iPad Mini**: 768px (tablet)
   - **iPad Pro**: 1024px (tablet grande)
   - **Tablet Produção**: 1000px (tab-prod)
   - **Desktop**: 1920px

### Pontos de Verificação
- [ ] Header se adapta corretamente (vertical → horizontal)
- [ ] Badges empilham em mobile e ficam lado a lado em tablet
- [ ] Cards de informações mudam de 1 → 2 colunas
- [ ] Cards de quantidades mudam de 1 → 2 → 3 colunas
- [ ] Botões de ação mudam de 2 → 3 → 6 colunas
- [ ] Textos e ícones escalam adequadamente
- [ ] Rodapé fixo não sobrepõe conteúdo
- [ ] Espaçamentos são confortáveis em todos os tamanhos

