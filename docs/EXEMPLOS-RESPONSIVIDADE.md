# Exemplos de Responsividade - Sistema OEE

Este documento fornece exemplos práticos de como usar os breakpoints customizados e media queries para criar interfaces responsivas otimizadas para tablets, especialmente o Samsung Galaxy Tab A7 Lite.

---

## 📱 Breakpoints Disponíveis

```typescript
screens: {
  'xs': '475px',    // Smartphones grandes
  'sm': '640px',    // Tablets pequenos (portrait)
  'md': '768px',    // Tablets médios
  'tab': '800px',   // Samsung Galaxy Tab A7 Lite (landscape) ⭐ NOVO
  'lg': '1024px',   // Tablets grandes / Laptops pequenos
  'xl': '1280px',   // Desktops
  '2xl': '1536px',  // Desktops grandes
}
```

---

## 🎨 Exemplos de Uso

### 1. Grid Responsivo de Cards

```tsx
// Exemplo: Grid de módulos de navegação
<div className="grid grid-cols-1 sm:grid-cols-2 tab:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
  {items.map((item) => (
    <Card key={item.id}>
      {/* Conteúdo do card */}
    </Card>
  ))}
</div>
```

**Comportamento**:
- **Mobile (< 640px)**: 1 coluna
- **Tablet pequeno (640px-799px)**: 2 colunas
- **Galaxy Tab A7 Lite (800px-1023px)**: 3 colunas ⭐
- **Desktop (1024px-1279px)**: 4 colunas
- **Desktop grande (≥ 1280px)**: 5 colunas

---

### 2. Tipografia Responsiva

```tsx
// Exemplo: Título principal
<h1 className="text-2xl md:text-3xl tab:text-4xl lg:text-5xl font-bold">
  Sistema OEE
</h1>

// Exemplo: Subtítulo
<p className="text-sm tab:text-base lg:text-lg text-muted-foreground">
  Monitoramento de eficiência operacional
</p>

// Exemplo: Texto de corpo
<p className="text-xs tab:text-sm lg:text-base">
  Conteúdo detalhado do sistema
</p>
```

**Tamanhos de Fonte**:
| Classe | Mobile | Tablet (tab) | Desktop (lg) |
|--------|--------|--------------|--------------|
| `text-2xl` → `tab:text-4xl` | 24px | 36px | 36px |
| `text-sm` → `tab:text-base` | 14px | 16px | 16px |
| `text-xs` → `tab:text-sm` | 12px | 14px | 14px |

---

### 3. Espaçamento Responsivo

```tsx
// Exemplo: Padding de container
<main className="px-4 py-6 md:px-6 md:py-10 tab:px-8 tab:py-12">
  {/* Conteúdo */}
</main>

// Exemplo: Margens entre seções
<section className="mb-6 tab:mb-8 lg:mb-10">
  {/* Conteúdo da seção */}
</section>

// Exemplo: Espaçamento entre elementos
<div className="space-y-4 tab:space-y-6 lg:space-y-8">
  {/* Elementos com espaçamento vertical */}
</div>
```

**Valores de Espaçamento**:
| Classe | Mobile | Tablet (tab) | Desktop (lg) |
|--------|--------|--------------|--------------|
| `px-4` → `tab:px-8` | 16px | 32px | 32px |
| `py-6` → `tab:py-12` | 24px | 48px | 48px |
| `mb-6` → `tab:mb-8` | 24px | 32px | 40px |

---

### 4. Tamanhos de Elementos Interativos

```tsx
// Exemplo: Botões com tamanho mínimo de toque
<button className="min-h-[44px] min-w-[44px] tab:min-h-[48px] tab:min-w-[48px] lg:min-h-[56px] lg:min-w-[56px]">
  Clique Aqui
</button>

// Exemplo: Ícones
<Icon className="w-4 h-4 tab:w-5 tab:h-5 lg:w-6 lg:h-6" />

// Exemplo: Avatar
<Avatar className="h-10 w-10 tab:h-12 tab:w-12 lg:h-14 lg:w-14">
  {/* Conteúdo do avatar */}
</Avatar>
```

**Tamanhos Recomendados para Toque**:
- **Mobile**: 44×44px (mínimo Apple HIG)
- **Tablet**: 48×48px (recomendado Material Design)
- **Desktop**: 56×56px (ideal para precisão de mouse)

---

### 5. Layout Flexível

```tsx
// Exemplo: Flex direction responsivo
<div className="flex flex-col tab:flex-row gap-4">
  <div className="flex-1">Coluna 1</div>
  <div className="flex-1">Coluna 2</div>
</div>

// Exemplo: Alinhamento responsivo
<div className="flex flex-col tab:flex-row items-start tab:items-center justify-between">
  <h2>Título</h2>
  <button>Ação</button>
</div>
```

**Comportamento**:
- **Mobile**: Layout vertical (coluna)
- **Tablet (≥ 800px)**: Layout horizontal (linha)

---

### 6. Visibilidade Condicional

```tsx
// Exemplo: Ocultar em mobile, mostrar em tablet
<div className="hidden tab:block">
  Visível apenas em tablets e desktops
</div>

// Exemplo: Mostrar apenas em mobile
<div className="block tab:hidden">
  Visível apenas em mobile
</div>

// Exemplo: Diferentes componentes por tamanho
<>
  {/* Mobile */}
  <MobileMenu className="tab:hidden" />
  
  {/* Tablet e Desktop */}
  <DesktopMenu className="hidden tab:flex" />
</>
```

---

### 7. Tabelas Responsivas

```tsx
// Exemplo: Tabela que vira cards em mobile
<div className="tab:hidden">
  {/* Cards para mobile */}
  {data.map((item) => (
    <Card key={item.id}>
      <CardHeader>{item.title}</CardHeader>
      <CardContent>{item.content}</CardContent>
    </Card>
  ))}
</div>

<div className="hidden tab:block">
  {/* Tabela para tablet e desktop */}
  <table className="w-full">
    <thead>
      <tr>
        <th>Coluna 1</th>
        <th>Coluna 2</th>
        <th>Coluna 3</th>
      </tr>
    </thead>
    <tbody>
      {data.map((item) => (
        <tr key={item.id}>
          <td>{item.col1}</td>
          <td>{item.col2}</td>
          <td>{item.col3}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

### 8. Gráficos OEE Responsivos

```tsx
// Exemplo: Gráfico com altura responsiva
<div className="h-[300px] tab:h-[400px] lg:h-[500px]">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      {/* Configuração do gráfico */}
    </BarChart>
  </ResponsiveContainer>
</div>

// Exemplo: Grid de gráficos
<div className="grid grid-cols-1 tab:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>
    <CardHeader>Disponibilidade</CardHeader>
    <CardContent>
      {/* Gráfico de Disponibilidade */}
    </CardContent>
  </Card>
  <Card>
    <CardHeader>Performance</CardHeader>
    <CardContent>
      {/* Gráfico de Performance */}
    </CardContent>
  </Card>
  <Card>
    <CardHeader>Qualidade</CardHeader>
    <CardContent>
      {/* Gráfico de Qualidade */}
    </CardContent>
  </Card>
</div>
```

---

### 9. Formulários Responsivos

```tsx
// Exemplo: Formulário de apontamento de paradas
<form className="space-y-4 tab:space-y-6">
  {/* Linha com 1 campo em mobile, 2 em tablet */}
  <div className="grid grid-cols-1 tab:grid-cols-2 gap-4">
    <div>
      <label className="text-sm tab:text-base">Linha de Produção</label>
      <select className="w-full min-h-[44px] tab:min-h-[48px]">
        <option>SPEP - Linha A</option>
        <option>SPEP - Linha B</option>
      </select>
    </div>
    <div>
      <label className="text-sm tab:text-base">Turno</label>
      <select className="w-full min-h-[44px] tab:min-h-[48px]">
        <option>1º Turno (06:00-14:00)</option>
        <option>2º Turno (14:00-22:00)</option>
      </select>
    </div>
  </div>

  {/* Campo de texto com altura mínima */}
  <div>
    <label className="text-sm tab:text-base">Descrição da Parada</label>
    <textarea 
      className="w-full min-h-[88px] tab:min-h-[120px] p-3 tab:p-4"
      placeholder="Descreva o motivo da parada..."
    />
  </div>

  {/* Botões responsivos */}
  <div className="flex flex-col tab:flex-row gap-3 tab:gap-4">
    <button 
      type="submit"
      className="flex-1 min-h-[44px] tab:min-h-[48px] bg-primary text-white"
    >
      Registrar Parada
    </button>
    <button 
      type="button"
      className="flex-1 min-h-[44px] tab:min-h-[48px] bg-secondary"
    >
      Cancelar
    </button>
  </div>
</form>
```

---

### 10. Dashboard OEE Responsivo

```tsx
// Exemplo: Dashboard completo
<div className="space-y-6 tab:space-y-8">
  {/* Cabeçalho com filtros */}
  <div className="flex flex-col tab:flex-row gap-4 tab:items-center tab:justify-between">
    <h1 className="text-2xl tab:text-3xl lg:text-4xl font-bold">
      Dashboard OEE
    </h1>
    <div className="flex flex-col sm:flex-row gap-3">
      <select className="min-h-[44px] tab:min-h-[48px]">
        <option>Última Semana</option>
        <option>Último Mês</option>
      </select>
      <select className="min-h-[44px] tab:min-h-[48px]">
        <option>Todas as Linhas</option>
        <option>SPEP</option>
      </select>
    </div>
  </div>

  {/* Cards de métricas principais */}
  <div className="grid grid-cols-1 sm:grid-cols-2 tab:grid-cols-4 gap-4 tab:gap-6">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm tab:text-base">OEE Geral</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl tab:text-4xl font-bold text-primary">
          78.5%
        </div>
      </CardContent>
    </Card>
    {/* Mais cards... */}
  </div>

  {/* Gráficos principais */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle className="text-lg tab:text-xl">
          Componentes do OEE
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] tab:h-[400px]">
          {/* Gráfico de barras */}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="text-lg tab:text-xl">
          Pareto de Paradas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] tab:h-[400px]">
          {/* Gráfico de Pareto */}
        </div>
      </CardContent>
    </Card>
  </div>
</div>
```

---

## 🎯 Checklist de Responsividade

Ao criar novos componentes, verifique:

- [ ] **Tipografia**: Tamanhos de fonte ajustados para `tab` breakpoint
- [ ] **Espaçamento**: Padding e margins otimizados para tablets
- [ ] **Grid/Flex**: Layout adapta-se corretamente em 800px
- [ ] **Elementos de toque**: Tamanho mínimo de 44px (mobile) e 48px (tablet)
- [ ] **Imagens**: Responsivas com `w-full` ou tamanhos específicos
- [ ] **Gráficos**: Altura ajustada para diferentes tamanhos de tela
- [ ] **Formulários**: Campos com altura mínima adequada
- [ ] **Navegação**: Menu adapta-se entre mobile e tablet
- [ ] **Tabelas**: Transformam-se em cards em mobile se necessário
- [ ] **Visibilidade**: Elementos ocultos/mostrados conforme necessário

---

## 🧪 Como Testar

### Chrome DevTools

1. Abra DevTools (F12)
2. Ative "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Configure:
   - **Width**: 800px (Galaxy Tab A7 Lite landscape)
   - **Height**: 670px
   - **DPR**: 2

### Breakpoints para Testar

Teste sua interface nestes tamanhos:

| Tamanho | Largura | Dispositivo Simulado |
|---------|---------|----------------------|
| Mobile | 375px | iPhone SE |
| Mobile grande | 475px | iPhone 12 Pro |
| Tablet pequeno | 640px | iPad Mini (portrait) |
| **Galaxy Tab A7 Lite** | **800px** | **Samsung Galaxy Tab A7 Lite (landscape)** ⭐ |
| Tablet grande | 1024px | iPad Pro (portrait) |
| Desktop | 1280px | Laptop |

---

**Documento criado em**: 2025-10-19  
**Última atualização**: 2025-10-19  
**Versão**: 1.0  
**Autor**: Sistema OEE - Equipe de Desenvolvimento

