# Hooks Customizados - Padrões e Implementação

## 1. useLicitacoes

Hook para gerenciar operações CRUD de licitações.

### Estrutura

```typescript
// src/hooks/useLicitacoes.ts

import { useState } from 'react'
import { supabase, handleSupabaseError, getUserIdFromTbusuario } from '@/lib/supabase'
import { LicitacaoFormData } from '@/types/licitacao-type'
import { toast } from '@/hooks/use-toast'

export function useLicitacoes() {
  const [loading, setLoading] = useState(false)
  const [licitacoes, setLicitacoes] = useState<LicitacaoFormData[]>([])

  return {
    loading,
    licitacoes,
    fetchLicitacoes,
    fetchLicitacao,
    saveLicitacao,
    deleteLicitacao
  }
}
```

### Métodos Implementados

#### fetchLicitacoes - Buscar Lista com Filtros

```typescript
const fetchLicitacoes = async (filters?: {
  licitacao_id?: number
  data_ini?: string
  data_fim?: string
  origem?: string
  modalidade?: string
  status?: string
  cliente_id?: number
  orgao_id?: number
  search_term?: string
  page?: number
  itemsPerPage?: number
}) => {
  try {
    setLoading(true)
    
    // Construir SQL com filtros
    let sqlQuery = `
      SELECT c.nome as CLIENTE, l.* 
      FROM tblicitacao l
      LEFT JOIN tbcliente c ON c.cliente_id = l.cliente_id
      WHERE l.deletado = 'N'
    `

    // Aplicar filtros opcionais
    if (filters?.licitacao_id) {
      sqlQuery += ` AND l.licitacao_id = ${filters.licitacao_id}`
    }

    if (filters?.search_term) {
      const searchTerm = filters.search_term.trim().replace(/'/g, "''")
      sqlQuery += ` AND (`
      sqlQuery += `l.licitacao_id::text ILIKE '%${searchTerm}%'`
      sqlQuery += ` OR c.nome ILIKE '%${searchTerm}%'`
      sqlQuery += ` OR l.modalidade_numero ILIKE '%${searchTerm}%'`
      sqlQuery += `)`
    }

    sqlQuery += ` ORDER BY l.licitacao_id DESC`

    // Aplicar paginação
    if (filters?.page && filters?.itemsPerPage) {
      const offset = (filters.page - 1) * filters.itemsPerPage
      sqlQuery += ` LIMIT ${filters.itemsPerPage} OFFSET ${offset}`
    }

    // Executar query
    const { data, error } = await supabase.rpc('execute_sql_query', {
      sql_query: sqlQuery
    })

    if (error) throw error

    // Mapear dados
    const mappedData = data.map(item => ({
      id: item.licitacao_id.toString(),
      dataAbertura: item.data || '',
      // ... outros campos
    }))

    setLicitacoes(mappedData)
    return { data: mappedData, count: mappedData.length }
  } catch (error) {
    const errorMessage = handleSupabaseError(error)
    toast({
      title: "Erro ao buscar licitações",
      description: errorMessage,
      variant: "destructive"
    })
    return { data: [], count: 0 }
  } finally {
    setLoading(false)
  }
}
```

#### fetchLicitacao - Buscar Registro Único

```typescript
const fetchLicitacao = async (id: string) => {
  try {
    setLoading(true)
    
    const sqlQuery = `
      SELECT 
        c.nome cliente,
        o.nome orgao,
        l.* 
      FROM tblicitacao l
      LEFT JOIN tbcliente c ON c.cliente_id = l.cliente_id
      LEFT JOIN tbcliente o ON o.cliente_id = l.orgao_id
      WHERE l.deletado = 'N' AND l.licitacao_id = ${parseInt(id)}
    `
    
    const { data, error } = await supabase.rpc('execute_sql_query', {
      sql_query: sqlQuery
    })
    
    if (error) throw error
    
    if (!data || data.length === 0) {
      throw new Error('Licitação não encontrada')
    }
    
    const licitacaoData = data[0]
    
    return {
      dataAbertura: licitacaoData.data || '',
      horaAbertura: licitacaoData.hora || '',
      orgaoLicitante: licitacaoData.orgao || '',
      orgaoId: licitacaoData.orgao_id,
      cliente: licitacaoData.cliente || '',
      clienteId: licitacaoData.cliente_id,
      // ... outros campos
    }
  } catch (error) {
    const errorMessage = handleSupabaseError(error)
    toast({
      title: "Erro ao buscar licitação",
      description: errorMessage,
      variant: "destructive"
    })
    throw error
  } finally {
    setLoading(false)
  }
}
```

#### saveLicitacao - Inserir ou Atualizar

```typescript
const saveLicitacao = async (licitacaoData: LicitacaoFormData) => {
  try {
    setLoading(true)
    
    // Obter ID do usuário para auditoria
    const usuarioId = await getUserIdFromTbusuario()
    if (!usuarioId) {
      throw new Error('Usuário não encontrado na tabela de usuários')
    }
    
    // Preparar dados para o banco
    const dbData = {
      data: licitacaoData.dataAbertura || null,
      hora: licitacaoData.horaAbertura?.substring(0, 5) || null,
      origem: licitacaoData.origem?.substring(0, 50) || "",
      status: licitacaoData.status?.substring(0, 30) || "",
      orgao_id: licitacaoData.orgaoId ? parseInt(String(licitacaoData.orgaoId)) : null,
      cliente_id: licitacaoData.clienteId ? parseInt(String(licitacaoData.clienteId)) : null,
      // ... outros campos
      deletado: 'N',
      data_inc: licitacaoData.id ? undefined : new Date().toISOString(),
      usuario_i: licitacaoData.id ? undefined : usuarioId,
      data_alt: licitacaoData.id ? new Date().toISOString() : undefined,
      usuario_a: licitacaoData.id ? usuarioId : undefined,
      sync: 'N'
    }
    
    if (licitacaoData.id) {
      // Atualizar
      const { data, error } = await supabase
        .from('tblicitacao')
        .update(dbData)
        .eq('licitacao_id', parseInt(licitacaoData.id))
        .select()
      
      if (error) throw error
      
      toast({
        title: "Sucesso",
        description: "Licitação atualizada com sucesso",
        variant: "default"
      })
      
      return data[0] as { licitacao_id: number }
    } else {
      // Inserir
      const { data, error } = await supabase
        .from('tblicitacao')
        .insert(dbData)
        .select()
      
      if (error) throw error
      
      toast({
        title: "Sucesso",
        description: "Licitação cadastrada com sucesso",
        variant: "default"
      })
      
      return data[0] as { licitacao_id: number }
    }
  } catch (error) {
    const errorMessage = handleSupabaseError(error)
    toast({
      title: "Erro ao salvar licitação",
      description: errorMessage,
      variant: "destructive"
    })
    throw error
  } finally {
    setLoading(false)
  }
}
```

#### deleteLicitacao - Soft Delete

```typescript
const deleteLicitacao = async (id: string) => {
  try {
    setLoading(true)
    
    const usuarioId = await getUserIdFromTbusuario()
    if (!usuarioId) {
      throw new Error('Usuário não encontrado na tabela de usuários')
    }
    
    const { error } = await supabase
      .from('tblicitacao')
      .update({
        deletado: 'S',
        data_del: new Date().toISOString(),
        usuario_d: usuarioId
      })
      .eq('licitacao_id', parseInt(id))
    
    if (error) throw error
    
    toast({
      title: "Sucesso",
      description: "Licitação excluída com sucesso",
      variant: "default"
    })
  } catch (error) {
    const errorMessage = handleSupabaseError(error)
    toast({
      title: "Erro ao excluir licitação",
      description: errorMessage,
      variant: "destructive"
    })
    throw error
  } finally {
    setLoading(false)
  }
}
```

## 2. useProdutosLicitacao

Hook para gerenciar produtos de uma licitação.

### Estrutura

```typescript
// src/hooks/useProdutosLicitacao.ts

export function useProdutosLicitacao() {
  const [loading, setLoading] = useState(false)
  const [produtos, setProdutos] = useState<ProdutoFormData[]>([])

  return {
    loading,
    produtos,
    fetchProdutos,
    saveProduto,
    deleteProduto,
    uploadImagem
  }
}
```

### Métodos Principais

#### fetchProdutos

```typescript
const fetchProdutos = async (licitacaoId: string) => {
  try {
    setLoading(true)
    
    const sqlQuery = `
      SELECT
        p.descricao as produto,
        c.razao_social as concorrente,
        i.*
      FROM tblicitacao_item i
      LEFT JOIN tbproduto p ON p.produto_id = i.produto_id
      LEFT JOIN tbconcorrente c ON c.concorrente_id = i.concorrente_id
      WHERE i.deletado = 'N' AND i.licitacao_id = ${parseInt(licitacaoId)}
    `

    const { data, error } = await supabase.rpc('execute_sql_query', {
      sql_query: sqlQuery
    })

    if (error) throw error

    const produtosMapeados = data.map((item: any) => ({
      id: item.litem_id.toString(),
      nome: item.produto || 'Produto não encontrado',
      quantidade: parseFloat(item.quantidade) || 0,
      // ... outros campos
    }))

    setProdutos(produtosMapeados)
    return produtosMapeados
  } catch (error) {
    const errorMessage = handleSupabaseError(error)
    toast({
      title: "Erro ao buscar produtos",
      description: errorMessage,
      variant: "destructive"
    })
    return []
  } finally {
    setLoading(false)
  }
}
```

## 3. Padrão de Uso dos Hooks

```typescript
// No componente
const { loading, fetchLicitacao, saveLicitacao, deleteLicitacao } = useLicitacoes()
const { loading: loadingProdutos, fetchProdutos, saveProduto } = useProdutosLicitacao()

// Carregar dados
useEffect(() => {
  if (id) {
    loadData()
  }
}, [id])

const loadData = async () => {
  try {
    const licitacaoData = await fetchLicitacao(id!)
    setFormData(licitacaoData)
    
    const produtosData = await fetchProdutos(id!)
    setProdutos(produtosData)
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
}
```

