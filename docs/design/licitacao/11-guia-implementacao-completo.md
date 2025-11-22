# Guia de Implementação Completo - Replicar em Outros CRUDs

## Passo a Passo para Criar um Novo CRUD

### Passo 1: Definir Tipos TypeScript

#### 1.1 Criar arquivo de tipos

```typescript
// src/types/[entidade]-type.ts

export interface [Entidade]FormData {
  id?: string;
  // Campos do formulário
  nome: string;
  descricao: string;
  status: string;
  // ... outros campos
}
```

#### 1.2 Mapear campos do banco

```typescript
// Documentar mapeamento entre formulário e banco
// Formulário -> Banco
// nome -> descricao
// status -> status_registro
```

### Passo 2: Criar Hook Customizado

#### 2.1 Estrutura básica

```typescript
// src/hooks/use[Entidade].ts

import { useState } from 'react'
import { supabase, handleSupabaseError, getUserIdFromTbusuario } from '@/lib/supabase'
import { [Entidade]FormData } from '@/types/[entidade]-type'
import { toast } from '@/hooks/use-toast'

export function use[Entidade]() {
  const [loading, setLoading] = useState(false)
  const [registros, setRegistros] = useState<[Entidade]FormData[]>([])

  // Buscar lista
  const fetchRegistros = async (filters?: any) => {
    try {
      setLoading(true)
      
      const sqlQuery = `
        SELECT * FROM tb[entidade]
        WHERE deletado = 'N'
        ORDER BY [campo]_id DESC
      `
      
      const { data, error } = await supabase.rpc('execute_sql_query', {
        sql_query: sqlQuery
      })
      
      if (error) throw error
      
      const mapped = data.map(item => ({
        id: item.[campo]_id.toString(),
        // ... mapear campos
      }))
      
      setRegistros(mapped)
      return { data: mapped, count: mapped.length }
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: "Erro ao buscar registros",
        description: errorMessage,
        variant: "destructive"
      })
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }

  // Buscar um registro
  const fetchRegistro = async (id: string) => {
    try {
      setLoading(true)
      
      const sqlQuery = `
        SELECT * FROM tb[entidade]
        WHERE deletado = 'N' AND [campo]_id = ${parseInt(id)}
      `
      
      const { data, error } = await supabase.rpc('execute_sql_query', {
        sql_query: sqlQuery
      })
      
      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error('Registro não encontrado')
      }
      
      return {
        // Mapear campos do banco para o formulário
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: "Erro ao buscar registro",
        description: errorMessage,
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Salvar (inserir ou atualizar)
  const saveRegistro = async (formData: [Entidade]FormData) => {
    try {
      setLoading(true)
      
      const usuarioId = await getUserIdFromTbusuario()
      if (!usuarioId) {
        throw new Error('Usuário não encontrado')
      }
      
      const dbData = {
        // Mapear campos do formulário para o banco
        deletado: 'N',
        data_inc: formData.id ? undefined : new Date().toISOString(),
        usuario_i: formData.id ? undefined : usuarioId,
        data_alt: formData.id ? new Date().toISOString() : undefined,
        usuario_a: formData.id ? usuarioId : undefined,
        sync: 'N'
      }
      
      if (formData.id) {
        // Atualizar
        const { data, error } = await supabase
          .from('tb[entidade]')
          .update(dbData)
          .eq('[campo]_id', parseInt(formData.id))
          .select()
        
        if (error) throw error
        
        toast({
          title: "Sucesso",
          description: "Registro atualizado com sucesso",
          variant: "default"
        })
        
        return data[0]
      } else {
        // Inserir
        const { data, error } = await supabase
          .from('tb[entidade]')
          .insert(dbData)
          .select()
        
        if (error) throw error
        
        toast({
          title: "Sucesso",
          description: "Registro cadastrado com sucesso",
          variant: "default"
        })
        
        return data[0]
      }
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: "Erro ao salvar registro",
        description: errorMessage,
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Excluir (soft delete)
  const deleteRegistro = async (id: string) => {
    try {
      setLoading(true)
      
      const usuarioId = await getUserIdFromTbusuario()
      if (!usuarioId) {
        throw new Error('Usuário não encontrado')
      }
      
      const { error } = await supabase
        .from('tb[entidade]')
        .update({
          deletado: 'S',
          data_del: new Date().toISOString(),
          usuario_d: usuarioId
        })
        .eq('[campo]_id', parseInt(id))
      
      if (error) throw error
      
      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso",
        variant: "default"
      })
    } catch (error) {
      const errorMessage = handleSupabaseError(error)
      toast({
        title: "Erro ao excluir registro",
        description: errorMessage,
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    registros,
    fetchRegistros,
    fetchRegistro,
    saveRegistro,
    deleteRegistro
  }
}
```

### Passo 3: Criar Componente de Cadastro

#### 3.1 Estrutura básica do componente

```typescript
// src/pages/[Entidade]Cad.tsx

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { use[Entidade] } from '@/hooks/use[Entidade]'
import { [Entidade]FormData } from '@/types/[entidade]-type'
import { ArrowLeft, Save, Trash } from 'lucide-react'

export default function [Entidade]Cad() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loading, fetchRegistro, saveRegistro, deleteRegistro } = use[Entidade]()

  // Estado do formulário
  const [formData, setFormData] = useState<[Entidade]FormData>({
    nome: '',
    descricao: '',
    status: '',
    // ... outros campos com valores iniciais
  })

  // Estados de UI
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Carregar dados ao montar (modo edição)
  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    try {
      const data = await fetchRegistro(id!)
      setFormData(data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      navigate('/[entidade]')
    }
  }

  // Salvar
  const handleSave = async () => {
    try {
      // Validações
      if (!formData.nome.trim()) {
        toast({
          variant: "destructive",
          title: "Validação",
          description: "O nome é obrigatório",
        })
        return
      }

      // Salvar
      await saveRegistro(formData)
      navigate('/[entidade]')
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  // Excluir
  const handleDelete = async () => {
    try {
      if (id) {
        await deleteRegistro(id)
        navigate('/[entidade]')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/[entidade]')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {id ? 'Editar' : 'Novo'} [Entidade]
            </h1>
            <p className="text-sm text-gray-500">
              {id ? `Editando registro #${id}` : 'Cadastrar novo registro'}
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          {id && (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          )}
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>
            Preencha os dados do registro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Campos do formulário */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>

          {/* Mais campos... */}
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      {/* ... */}
    </div>
  )
}
```

### Passo 4: Configurar Rotas

```typescript
// src/main.tsx ou router config

import [Entidade]Cad from '@/pages/[Entidade]Cad'

// Adicionar rotas
{
  path: '/[entidade]/nova',
  element: <[Entidade]Cad />
},
{
  path: '/[entidade]/:id',
  element: <[Entidade]Cad />
}
```

### Passo 5: Configurar Supabase

#### 5.1 Criar tabela no banco

```sql
CREATE TABLE tb[entidade] (
  [campo]_id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  status VARCHAR(30),
  deletado CHAR(1) DEFAULT 'N',
  data_inc TIMESTAMP DEFAULT NOW(),
  usuario_i INTEGER,
  data_alt TIMESTAMP,
  usuario_a INTEGER,
  data_del TIMESTAMP,
  usuario_d INTEGER,
  sync CHAR(1) DEFAULT 'N'
);
```

#### 5.2 Criar função RPC (se necessário)

```sql
-- Já existe execute_sql_query no projeto
-- Usar para queries customizadas
```

### Passo 6: Checklist de Implementação

- [ ] Tipos TypeScript criados
- [ ] Hook customizado implementado
- [ ] Componente de cadastro criado
- [ ] Rotas configuradas
- [ ] Tabela criada no Supabase
- [ ] Soft delete implementado
- [ ] Validações adicionadas
- [ ] Toast notifications configuradas
- [ ] Loading states implementados
- [ ] Responsividade testada
- [ ] Auditoria (usuario_i, usuario_a, usuario_d) funcionando

