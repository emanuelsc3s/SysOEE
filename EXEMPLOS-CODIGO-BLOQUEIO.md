# Exemplos de Código - Armazéns Bloqueados

**Data**: 03 de Novembro de 2025  
**Versão**: 1.1.0

## 📋 Índice

1. [Interface TypeScript](#interface-typescript)
2. [Dados dos Armazéns](#dados-dos-armazéns)
3. [Renderização do Card](#renderização-do-card)
4. [Lógica de Clique](#lógica-de-clique)
5. [Estilização Condicional](#estilização-condicional)
6. [Acessibilidade](#acessibilidade)
7. [Melhorias Futuras](#melhorias-futuras)

---

## Interface TypeScript

### Antes (v1.0.0)
```typescript
interface Armazem {
  codigo: string
  descricao: string
}
```

### Depois (v1.1.0)
```typescript
interface Armazem {
  codigo: string
  descricao: string
  bloqueado: boolean  // NOVO
}
```

---

## Dados dos Armazéns

### Exemplo de Armazém Ativo
```typescript
{ 
  codigo: '01', 
  descricao: 'ALMOXARIFADO CENTRAL', 
  bloqueado: false 
}
```

### Exemplo de Armazém Bloqueado
```typescript
{ 
  codigo: '46', 
  descricao: 'SPEP LISVET', 
  bloqueado: true 
}
```

### Lista Completa com Bloqueios
```typescript
const ARMAZENS_DATA: Armazem[] = [
  { codigo: '01', descricao: 'ALMOXARIFADO CENTRAL', bloqueado: false },
  { codigo: '02', descricao: 'MATERIA PRIMA', bloqueado: false },
  // ... outros armazéns ativos
  { codigo: '46', descricao: 'SPEP LISVET', bloqueado: true },
  { codigo: '49', descricao: 'LISVET RETEM', bloqueado: true },
  { codigo: '56', descricao: 'ANALISES LISVET', bloqueado: true },
  { codigo: '58', descricao: 'PERDAS LISVET', bloqueado: true },
  { codigo: '60', descricao: 'TEMP2', bloqueado: true },
  { codigo: '89', descricao: 'ERRADO', bloqueado: true },
  { codigo: '96', descricao: 'RETIFICACAO FISCAL', bloqueado: true },
  // ... outros armazéns ativos
]
```

---

## Renderização do Card

### Card Completo com Bloqueio
```tsx
<Card
  key={armazem.codigo}
  className={`
    transition-all duration-300 relative
    ${armazem.bloqueado 
      ? 'cursor-not-allowed border-red-500 bg-red-50/50 hover:shadow-sm' 
      : 'cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-primary/20'
    }
  `}
  onClick={() => handleArmazemClick(armazem)}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleArmazemClick(armazem)
    }
  }}
  aria-label={`Armazém ${armazem.codigo} - ${armazem.descricao}${armazem.bloqueado ? ' - Bloqueado' : ''}`}
  aria-disabled={armazem.bloqueado}
>
  {/* Badge de Bloqueado */}
  {armazem.bloqueado && (
    <Badge 
      variant="destructive" 
      className="absolute top-2 right-2 text-xs font-semibold"
    >
      <Lock className="h-3 w-3 mr-1" />
      BLOQUEADO
    </Badge>
  )}

  <CardHeader className="pb-3">
    <CardTitle className="flex items-center gap-2 text-base">
      {/* Círculo do Código */}
      <div 
        className={`
          flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm
          ${armazem.bloqueado 
            ? 'bg-red-100 text-red-700' 
            : 'bg-primary/10 text-primary'
          }
        `}
      >
        {armazem.bloqueado && <Lock className="h-4 w-4" />}
        {!armazem.bloqueado && armazem.codigo}
      </div>
      
      {/* Label do Armazém */}
      <span 
        className={`
          text-sm font-semibold
          ${armazem.bloqueado ? 'text-red-700' : 'text-muted-foreground'}
        `}
      >
        Armazém {armazem.codigo}
      </span>
    </CardTitle>
  </CardHeader>

  <CardContent>
    {/* Descrição */}
    <p 
      className={`
        text-sm font-medium leading-tight
        ${armazem.bloqueado ? 'text-red-900/70' : 'text-foreground'}
      `}
    >
      {armazem.descricao}
    </p>
  </CardContent>

  {/* Barra inferior */}
  <div 
    className={`
      absolute bottom-0 left-0 w-full h-1.5
      ${armazem.bloqueado ? 'bg-red-500' : 'bg-primary'}
    `}
  />
</Card>
```

---

## Lógica de Clique

### Handler de Clique com Verificação de Bloqueio
```typescript
const handleArmazemClick = (armazem: Armazem) => {
  // Verificar se está bloqueado
  if (armazem.bloqueado) {
    console.log('Armazém bloqueado:', armazem)
    
    // Exibir mensagem de bloqueio
    alert(
      `O armazém ${armazem.codigo} - ${armazem.descricao} está bloqueado e não pode ser acessado.`
    )
    return
  }
  
  // Processar clique normal
  console.log('Armazém selecionado:', armazem)
  // TODO: Implementar navegação para página de detalhes
}
```

### Versão com Toast (Futuro)
```typescript
import { useToast } from '@/components/ui/use-toast'

const { toast } = useToast()

const handleArmazemClick = (armazem: Armazem) => {
  if (armazem.bloqueado) {
    toast({
      variant: "destructive",
      title: "Armazém Bloqueado",
      description: `O armazém ${armazem.codigo} - ${armazem.descricao} está bloqueado e não pode ser acessado.`,
      duration: 3000,
    })
    return
  }
  
  // Processar clique normal
  navigate(`/armazens/${armazem.codigo}`)
}
```

---

## Estilização Condicional

### Classes do Card
```tsx
className={`
  transition-all duration-300 relative
  ${armazem.bloqueado 
    ? 'cursor-not-allowed border-red-500 bg-red-50/50 hover:shadow-sm' 
    : 'cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-primary/20'
  }
`}
```

### Classes do Círculo do Código
```tsx
className={`
  flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm
  ${armazem.bloqueado 
    ? 'bg-red-100 text-red-700' 
    : 'bg-primary/10 text-primary'
  }
`}
```

### Classes do Label
```tsx
className={`
  text-sm font-semibold
  ${armazem.bloqueado ? 'text-red-700' : 'text-muted-foreground'}
`}
```

### Classes da Descrição
```tsx
className={`
  text-sm font-medium leading-tight
  ${armazem.bloqueado ? 'text-red-900/70' : 'text-foreground'}
`}
```

### Classes da Barra Inferior
```tsx
className={`
  absolute bottom-0 left-0 w-full h-1.5
  ${armazem.bloqueado ? 'bg-red-500' : 'bg-primary'}
`}
```

---

## Acessibilidade

### ARIA Labels
```tsx
aria-label={`Armazém ${armazem.codigo} - ${armazem.descricao}${armazem.bloqueado ? ' - Bloqueado' : ''}`}
```

**Exemplos**:
- Ativo: `"Armazém 01 - ALMOXARIFADO CENTRAL"`
- Bloqueado: `"Armazém 46 - SPEP LISVET - Bloqueado"`

### ARIA Disabled
```tsx
aria-disabled={armazem.bloqueado}
```

### Navegação por Teclado
```tsx
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleArmazemClick(armazem)
  }
}}
```

---

## Melhorias Futuras

### 1. Tooltip com Motivo do Bloqueio
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

{armazem.bloqueado && (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="destructive" className="absolute top-2 right-2">
          <Lock className="h-3 w-3 mr-1" />
          BLOQUEADO
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Motivo: {armazem.motivoBloqueio || 'Armazém em manutenção'}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)}
```

### 2. Filtro por Status
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const [statusFiltro, setStatusFiltro] = useState<'todos' | 'ativos' | 'bloqueados'>('todos')

// Filtrar por status
const armazensPorStatus = armazensFiltrados.filter(armazem => {
  if (statusFiltro === 'ativos') return !armazem.bloqueado
  if (statusFiltro === 'bloqueados') return armazem.bloqueado
  return true
})

// Componente de filtro
<Select value={statusFiltro} onValueChange={setStatusFiltro}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Filtrar por status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="todos">Todos</SelectItem>
    <SelectItem value="ativos">Ativos</SelectItem>
    <SelectItem value="bloqueados">Bloqueados</SelectItem>
  </SelectContent>
</Select>
```

### 3. Interface Estendida com Motivo
```typescript
interface Armazem {
  codigo: string
  descricao: string
  bloqueado: boolean
  motivoBloqueio?: string  // NOVO
  dataBloqueio?: Date      // NOVO
  bloqueadoPor?: string    // NOVO
}
```

### 4. Gestão de Bloqueio (Admin)
```tsx
const handleToggleBloqueio = async (armazem: Armazem) => {
  // Verificar permissão de admin
  if (!isAdmin) {
    toast({
      variant: "destructive",
      title: "Sem Permissão",
      description: "Apenas administradores podem bloquear/desbloquear armazéns."
    })
    return
  }

  // Atualizar no backend
  const { error } = await supabase
    .from('armazens')
    .update({ 
      bloqueado: !armazem.bloqueado,
      data_bloqueio: new Date(),
      bloqueado_por: user.id
    })
    .eq('codigo', armazem.codigo)

  if (error) {
    toast({
      variant: "destructive",
      title: "Erro",
      description: "Não foi possível atualizar o status do armazém."
    })
    return
  }

  // Atualizar estado local
  setArmazens(prev => 
    prev.map(a => 
      a.codigo === armazem.codigo 
        ? { ...a, bloqueado: !a.bloqueado }
        : a
    )
  )

  toast({
    title: "Sucesso",
    description: `Armazém ${armazem.bloqueado ? 'desbloqueado' : 'bloqueado'} com sucesso.`
  })
}
```

### 5. Histórico de Bloqueios
```tsx
interface HistoricoBloqueio {
  id: string
  armazem_codigo: string
  acao: 'bloqueado' | 'desbloqueado'
  motivo: string
  usuario_id: string
  usuario_nome: string
  data: Date
}

const HistoricoBloqueios = ({ armazemCodigo }: { armazemCodigo: string }) => {
  const [historico, setHistorico] = useState<HistoricoBloqueio[]>([])

  useEffect(() => {
    const fetchHistorico = async () => {
      const { data } = await supabase
        .from('historico_bloqueios')
        .select('*')
        .eq('armazem_codigo', armazemCodigo)
        .order('data', { ascending: false })
      
      setHistorico(data || [])
    }

    fetchHistorico()
  }, [armazemCodigo])

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Histórico de Bloqueios</h3>
      {historico.map(item => (
        <div key={item.id} className="border-l-2 border-primary pl-4 py-2">
          <p className="text-sm font-medium">
            {item.acao === 'bloqueado' ? '🔒 Bloqueado' : '🔓 Desbloqueado'}
          </p>
          <p className="text-xs text-muted-foreground">
            Por: {item.usuario_nome} em {new Date(item.data).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Motivo: {item.motivo}
          </p>
        </div>
      ))}
    </div>
  )
}
```

---

## 🔍 Utilitários

### Verificar se Armazém está Bloqueado
```typescript
const isArmazemBloqueado = (codigo: string): boolean => {
  const armazem = armazens.find(a => a.codigo === codigo)
  return armazem?.bloqueado || false
}
```

### Contar Armazéns por Status
```typescript
const contarPorStatus = () => {
  const ativos = armazens.filter(a => !a.bloqueado).length
  const bloqueados = armazens.filter(a => a.bloqueado).length
  
  return { ativos, bloqueados, total: armazens.length }
}
```

### Filtrar Armazéns Bloqueados
```typescript
const armazensBloqueados = armazens.filter(a => a.bloqueado)
const armazensAtivos = armazens.filter(a => !a.bloqueado)
```

---

**Desenvolvido para**: Sistema OEE SicFar  
**Projeto**: SysOEE  
**Módulo**: Gestão de Armazéns  
**Feature**: Indicadores de Status Bloqueado

