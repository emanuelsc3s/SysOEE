# Integração com Backend

## 🔌 Visão Geral

A integração com o backend é feita através de **hooks customizados** que encapsulam toda a lógica de comunicação com o Supabase, mapeamento de dados e tratamento de erros.

---

## 🎣 Hook Customizado: useTurnos

### Localização

```
src/hooks/useTurnos.ts
```

### Interface Pública

```typescript
export function useTurnos() {
  return {
    loading: boolean,
    turnos: TurnoFormData[],
    fetchTurnos: (filters?: FetchTurnosFilters) => Promise<{ data: TurnoFormData[], count: number }>,
    fetchTurno: (id: string) => Promise<TurnoFormData>,
    saveTurno: (formData: TurnoFormData) => Promise<any>,
    deleteTurno: (id: string) => Promise<void>
  }
}
```

### Uso na Página

```typescript
import { useTurnos } from '@/hooks/useTurnos'

export default function Turnos() {
  const { fetchTurnos, deleteTurno } = useTurnos()
  
  // Usar com React Query
  const { data } = useQuery({
    queryKey: ['turnos', ...],
    queryFn: async () => {
      const result = await fetchTurnos({ codigo: '...' })
      return result
    }
  })
}
```

---

## 📊 Estrutura de Dados

### Tipos TypeScript

#### TurnoFormData (UI)

```typescript
export interface TurnoFormData {
  id?: string                // ID do turno (string para compatibilidade com formulário)
  codigo: string             // Código do turno (obrigatório)
  turno: string              // Nome/descrição do turno
  horaInicio: string         // Hora de início (formato HH:MM)
  horaFim: string            // Hora de fim (formato HH:MM)
  metaOee: number            // Meta de OEE (percentual)
  deletado?: 'N' | 'S'       // Flag de exclusão lógica
  
  // Campos de auditoria (somente leitura)
  createdAt?: string
  createdBy?: number
  updatedAt?: string
  updatedBy?: number
  deletedAt?: string
  deletedBy?: number
}
```

#### TurnoDB (Banco de Dados)

```typescript
export interface TurnoDB {
  turno_id: number
  codigo: string
  turno: string | null
  hora_inicio: string | null  // time without time zone
  hora_fim: string | null     // time without time zone
  deletado: string | null
  created_at: string | null
  created_by: number | null
  updated_at: string | null
  updated_by: number | null
  deleted_at: string | null
  deleted_by: number | null
  meta_oee: number | null
}
```

### Mapeamento de Dados

#### DB → UI (mapDbToForm)

```typescript
const mapDbToForm = (dbTurno: TurnoDB): TurnoFormData => {
  return {
    id: dbTurno.turno_id.toString(),
    codigo: dbTurno.codigo,
    turno: dbTurno.turno || '',
    horaInicio: dbTurno.hora_inicio || '',
    horaFim: dbTurno.hora_fim || '',
    metaOee: dbTurno.meta_oee || 85.0,
    deletado: (dbTurno.deletado as 'N' | 'S') || 'N',
    createdAt: dbTurno.created_at || undefined,
    createdBy: dbTurno.created_by || undefined,
    updatedAt: dbTurno.updated_at || undefined,
    updatedBy: dbTurno.updated_by || undefined,
    deletedAt: dbTurno.deleted_at || undefined,
    deletedBy: dbTurno.deleted_by || undefined,
  }
}
```

**Por quê?**
- ✅ Converte `turno_id` (number) para `id` (string)
- ✅ Garante valores padrão para campos opcionais
- ✅ Normaliza nomenclatura (snake_case → camelCase)

#### UI → DB (mapFormToDb)

```typescript
const mapFormToDb = (formData: TurnoFormData): Partial<TurnoDB> => {
  const dbData: Partial<TurnoDB> = {
    codigo: formData.codigo,
    turno: formData.turno || null,
    hora_inicio: formData.horaInicio || null,
    hora_fim: formData.horaFim || null,
    meta_oee: formData.metaOee || null,
    deletado: formData.deletado || 'N',
  }
  
  return dbData
}
```

**Por quê?**
- ✅ Converte strings vazias para `null` (padrão SQL)
- ✅ Normaliza nomenclatura (camelCase → snake_case)
- ✅ Remove campos de auditoria (gerenciados automaticamente)

---

## 🔍 Operações CRUD

### 1. Buscar Lista (fetchTurnos)

```typescript
const fetchTurnos = async (filters?: FetchTurnosFilters) => {
  try {
    setLoading(true)
    
    let query = supabaseAdmin
      .from('tbturno')
      .select('*')
      .eq('deletado', 'N')
      .order('codigo', { ascending: true })
    
    // Aplicar filtros se fornecidos
    if (filters?.codigo) {
      query = query.ilike('codigo', `%${filters.codigo}%`)
    }
    if (filters?.turno) {
      query = query.ilike('turno', `%${filters.turno}%`)
    }
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    const turnosMapeados = (data || []).map(mapDbToForm)
    setTurnos(turnosMapeados)
    
    return {
      data: turnosMapeados,
      count: count || turnosMapeados.length
    }
  } catch (error) {
    const errorMessage = handleSupabaseError(error)
    toast({
      title: 'Erro ao buscar turnos',
      description: errorMessage,
      variant: 'destructive'
    })
    return { data: [], count: 0 }
  } finally {
    setLoading(false)
  }
}
```

**Características:**
- ✅ Filtro automático por `deletado = 'N'` (soft delete)
- ✅ Ordenação por código
- ✅ Filtros opcionais (ILIKE para case-insensitive)
- ✅ Mapeamento automático DB → UI
- ✅ Tratamento de erros com toast

### 2. Buscar Um (fetchTurno)

```typescript
const fetchTurno = async (id: string): Promise<TurnoFormData> => {
  try {
    setLoading(true)
    
    const { data, error } = await supabaseAdmin
      .from('tbturno')
      .select('*')
      .eq('turno_id', parseInt(id))
      .eq('deletado', 'N')
      .single()
    
    if (error) throw error
    if (!data) {
      throw new Error('Turno não encontrado')
    }
    
    return mapDbToForm(data)
  } catch (error) {
    const errorMessage = handleSupabaseError(error)
    toast({
      title: 'Erro ao buscar turno',
      description: errorMessage,
      variant: 'destructive'
    })
    throw error
  } finally {
    setLoading(false)
  }
}
```

**Características:**
- ✅ Usa `.single()` para garantir um único resultado
- ✅ Valida existência do registro
- ✅ Lança erro se não encontrado (para tratamento no componente)

### 3. Salvar (saveTurno)

```typescript
const saveTurno = async (formData: TurnoFormData) => {
  try {
    setLoading(true)
    
    const usuarioId = await getUserIdFromTbusuario()
    if (!usuarioId) {
      throw new Error('Usuário não encontrado')
    }
    
    const dbData = mapFormToDb(formData)
    
    if (formData.id) {
      // Atualizar
      const updateData = {
        ...dbData,
        updated_at: new Date().toISOString(),
        updated_by: usuarioId
      }
      
      const { data, error } = await supabaseAdmin
        .from('tbturno')
        .update(updateData)
        .eq('turno_id', parseInt(formData.id))
        .select()
        .single()
      
      if (error) throw error
      
      toast({
        title: 'Sucesso',
        description: 'Turno atualizado com sucesso',
        variant: 'default'
      })
      
      return data
    } else {
      // Inserir
      const insertData = {
        ...dbData,
        created_at: new Date().toISOString(),
        created_by: usuarioId
      }
      
      const { data, error } = await supabaseAdmin
        .from('tbturno')
        .insert(insertData)
        .select()
        .single()
      
      if (error) throw error
      
      toast({
        title: 'Sucesso',
        description: 'Turno cadastrado com sucesso',
        variant: 'default'
      })
      
      return data
    }
  } catch (error) {
    const errorMessage = handleSupabaseError(error)
    toast({
      title: 'Erro ao salvar turno',
      description: errorMessage,
      variant: 'destructive'
    })
    throw error
  } finally {
    setLoading(false)
  }
}
```

**Características:**
- ✅ Detecta automaticamente INSERT vs UPDATE (baseado em `formData.id`)
- ✅ Preenche campos de auditoria automaticamente
- ✅ Retorna registro criado/atualizado
- ✅ Toast de sucesso/erro

### 4. Excluir (deleteTurno)

```typescript
const deleteTurno = async (id: string) => {
  try {
    setLoading(true)
    
    const usuarioId = await getUserIdFromTbusuario()
    if (!usuarioId) {
      throw new Error('Usuário não encontrado')
    }
    
    const { error } = await supabaseAdmin
      .from('tbturno')
      .update({
        deletado: 'S',
        deleted_at: new Date().toISOString(),
        deleted_by: usuarioId
      })
      .eq('turno_id', parseInt(id))
    
    if (error) throw error
    
    toast({
      title: 'Sucesso',
      description: 'Turno excluído com sucesso',
      variant: 'default'
    })
  } catch (error) {
    const errorMessage = handleSupabaseError(error)
    toast({
      title: 'Erro ao excluir turno',
      description: errorMessage,
      variant: 'destructive'
    })
    throw error
  } finally {
    setLoading(false)
  }
}
```

**Características:**
- ✅ **Soft delete** (não remove do banco)
- ✅ Marca `deletado = 'S'`
- ✅ Registra data e usuário da exclusão
- ✅ Permite auditoria e recuperação

---

## 🔐 Tratamento de Erros do Supabase

### Função handleSupabaseError

```typescript
const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    // Erros conhecidos do Supabase
    if (error.message.includes('duplicate key')) {
      return 'Já existe um registro com este código.'
    }
    if (error.message.includes('foreign key')) {
      return 'Este registro está sendo usado em outro local e não pode ser excluído.'
    }
    if (error.message.includes('not found')) {
      return 'Registro não encontrado.'
    }

    return error.message
  }

  return 'Erro desconhecido ao processar a solicitação.'
}
```

**Uso:**
```typescript
try {
  await supabaseAdmin.from('tbturno').insert(data)
} catch (error) {
  const errorMessage = handleSupabaseError(error)
  toast({
    title: 'Erro ao salvar turno',
    description: errorMessage,
    variant: 'destructive'
  })
}
```

---

## 🔄 Fluxo de Dados Completo

### Diagrama de Fluxo

```mermaid
graph TD
    A[Componente Turnos] -->|fetchTurnos| B[useTurnos Hook]
    B -->|SELECT| C[Supabase]
    C -->|TurnoDB[]| B
    B -->|mapDbToForm| D[TurnoFormData[]]
    D --> A

    A -->|saveTurno| B
    B -->|mapFormToDb| E[Partial TurnoDB]
    E -->|INSERT/UPDATE| C
    C -->|TurnoDB| B
    B -->|mapDbToForm| F[TurnoFormData]
    F --> A

    A -->|deleteTurno| B
    B -->|UPDATE deletado='S'| C
    C -->|Success| B
    B --> A
```

### Exemplo Completo de Ciclo CRUD

#### 1. Listar Turnos

```typescript
// Componente
const { data } = useQuery({
  queryKey: ['turnos'],
  queryFn: async () => {
    const result = await fetchTurnos()
    return result
  }
})

// Hook
const fetchTurnos = async () => {
  const { data, error } = await supabaseAdmin
    .from('tbturno')
    .select('*')
    .eq('deletado', 'N')
    .order('codigo', { ascending: true })

  if (error) throw error

  return {
    data: (data || []).map(mapDbToForm),
    count: data?.length || 0
  }
}

// Resultado
// [
//   { id: '1', codigo: 'T1', turno: 'Manhã', ... },
//   { id: '2', codigo: 'T2', turno: 'Tarde', ... }
// ]
```

#### 2. Criar Turno

```typescript
// Componente
const handleSalvar = async (formData: TurnoFormData) => {
  await saveTurno(formData)
  await refetch()  // Recarrega lista
  navigate('/turnos')
}

// Hook
const saveTurno = async (formData: TurnoFormData) => {
  const usuarioId = await getUserIdFromTbusuario()
  const dbData = mapFormToDb(formData)

  const insertData = {
    ...dbData,
    created_at: new Date().toISOString(),
    created_by: usuarioId
  }

  const { data, error } = await supabaseAdmin
    .from('tbturno')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error

  toast({
    title: 'Sucesso',
    description: 'Turno cadastrado com sucesso'
  })

  return data
}
```

#### 3. Atualizar Turno

```typescript
// Componente
const handleSalvar = async (formData: TurnoFormData) => {
  await saveTurno(formData)
  await refetch()
  navigate('/turnos')
}

// Hook (mesma função saveTurno, detecta ID)
const saveTurno = async (formData: TurnoFormData) => {
  const usuarioId = await getUserIdFromTbusuario()
  const dbData = mapFormToDb(formData)

  if (formData.id) {
    // UPDATE
    const updateData = {
      ...dbData,
      updated_at: new Date().toISOString(),
      updated_by: usuarioId
    }

    const { data, error } = await supabaseAdmin
      .from('tbturno')
      .update(updateData)
      .eq('turno_id', parseInt(formData.id))
      .select()
      .single()

    if (error) throw error

    toast({
      title: 'Sucesso',
      description: 'Turno atualizado com sucesso'
    })

    return data
  }

  // ... INSERT (código anterior)
}
```

#### 4. Excluir Turno

```typescript
// Componente
const handleExcluirConfirm = async () => {
  if (turnoToDelete?.id) {
    await deleteTurno(turnoToDelete.id)
    setIsDeleteDialogOpen(false)
    setTurnoToDelete(null)
    await refetch()
  }
}

// Hook
const deleteTurno = async (id: string) => {
  const usuarioId = await getUserIdFromTbusuario()

  const { error } = await supabaseAdmin
    .from('tbturno')
    .update({
      deletado: 'S',
      deleted_at: new Date().toISOString(),
      deleted_by: usuarioId
    })
    .eq('turno_id', parseInt(id))

  if (error) throw error

  toast({
    title: 'Sucesso',
    description: 'Turno excluído com sucesso'
  })
}
```

---

## 🧪 Testes de Integração

### Exemplo de Teste com Mock

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useTurnos } from '@/hooks/useTurnos'

// Mock do Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [
              { turno_id: 1, codigo: 'T1', turno: 'Manhã', ... }
            ],
            error: null
          }))
        }))
      }))
    }))
  }
}))

describe('useTurnos', () => {
  it('deve buscar turnos com sucesso', async () => {
    const { result } = renderHook(() => useTurnos())

    const data = await result.current.fetchTurnos()

    expect(data.data).toHaveLength(1)
    expect(data.data[0].codigo).toBe('T1')
  })
})
```

---

## 📚 Referências

### Documentação Supabase

- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Documentação React Query

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Query Keys](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)

---

**Próximo:** [Boas Práticas →](./06-boas-praticas.md)

