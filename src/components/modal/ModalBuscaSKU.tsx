/**
 * Modal de Busca de Produto SKU
 * Permite buscar e selecionar produtos SKU do arquivo produtos-sku.json
 * Segue padrão de modais de busca do projeto (ModalBuscaTurno, ModalBuscaParadas)
 */

import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, Loader2, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Interface para dados do JSON produtos-sku.json
interface ProdutoSKUJSON {
  codigo: string
  produto: string
  bloqueado: boolean
  anvisa: string | null
  gtin: string | null
}

// Interface para estrutura completa do JSON
interface ProdutosSKUData {
  metadata: {
    total_produtos: number
    data_criacao: string
    fonte: string
    descricao: string
  }
  produtos: ProdutoSKUJSON[]
}

// Interface para retorno ao componente pai
export interface SKUSelecionado {
  codigo: string
  descricao: string
  anvisa: string | null
  gtin: string | null
}

// Props do modal
interface ModalBuscaSKUProps {
  /** Controla se o modal está aberto */
  aberto: boolean
  /** Callback chamado quando o modal é fechado */
  onFechar: () => void
  /** Callback chamado quando um SKU é selecionado */
  onSelecionarSKU: (sku: SKUSelecionado) => void
}

// Tipo para filtro de status bloqueado
type FiltroBloqueado = 'todos' | 'sim' | 'nao'

export function ModalBuscaSKU({
  aberto,
  onFechar,
  onSelecionarSKU,
}: ModalBuscaSKUProps) {
  const [termoBusca, setTermoBusca] = useState('')
  const [filtroBloqueado, setFiltroBloqueado] = useState<FiltroBloqueado>('todos')
  const [produtos, setProdutos] = useState<ProdutoSKUJSON[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Carregar produtos ao abrir o modal
  useEffect(() => {
    if (aberto) {
      carregarProdutos()
    }
  }, [aberto])

  // Função para carregar produtos do JSON
  const carregarProdutos = async () => {
    setLoading(true)
    setErro(null)

    try {
      console.log('Carregando produtos SKU do arquivo JSON...')
      const response = await fetch('/data/produtos-sku.json')

      if (!response.ok) {
        throw new Error(`Erro ao carregar arquivo: ${response.status}`)
      }

      const data: ProdutosSKUData = await response.json()
      console.log(`Produtos carregados: ${data.produtos.length}`)
      setProdutos(data.produtos)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setErro('Erro ao carregar produtos. Verifique se o arquivo existe.')
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }

  // Filtrar produtos com base no termo de busca e status bloqueado
  const produtosFiltrados = useMemo(() => {
    let resultado = produtos

    // Filtrar por status bloqueado
    if (filtroBloqueado === 'sim') {
      resultado = resultado.filter(p => p.bloqueado === true)
    } else if (filtroBloqueado === 'nao') {
      resultado = resultado.filter(p => p.bloqueado === false)
    }

    // Filtrar por termo de busca
    if (termoBusca.trim()) {
      const termo = termoBusca.toLowerCase()
      resultado = resultado.filter(p =>
        p.codigo.toLowerCase().includes(termo) ||
        p.produto.toLowerCase().includes(termo) ||
        (p.anvisa && p.anvisa.toLowerCase().includes(termo)) ||
        (p.gtin && p.gtin.toLowerCase().includes(termo))
      )
    }

    return resultado
  }, [produtos, termoBusca, filtroBloqueado])

  // Seleciona um SKU e fecha o modal
  const handleSelecionarSKU = (produto: ProdutoSKUJSON) => {
    const skuSelecionado: SKUSelecionado = {
      codigo: produto.codigo,
      descricao: produto.produto,
      anvisa: produto.anvisa,
      gtin: produto.gtin,
    }
    onSelecionarSKU(skuSelecionado)
    handleFechar()
  }

  // Fecha o modal e limpa os filtros
  const handleFechar = () => {
    setTermoBusca('')
    setFiltroBloqueado('todos')
    onFechar()
  }

  return (
    <Dialog open={aberto} onOpenChange={handleFechar}>
      <DialogContent className="max-w-[95vw] w-[1100px] max-h-[85vh] p-0 flex flex-col gap-0 min-h-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Buscar Produto SKU
          </DialogTitle>
          <DialogDescription className="text-base">
            Pesquise e selecione um produto do catálogo
          </DialogDescription>
        </DialogHeader>

        {/* Campo de Busca e Filtros */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex gap-4 items-end">
            {/* Campo de busca por texto */}
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Digite código, descrição, ANVISA ou GTIN..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="pl-10 pr-10 h-11 text-base"
                  autoFocus
                />
                {termoBusca && (
                  <button
                    onClick={() => setTermoBusca('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtro de status bloqueado */}
            <div className="w-48">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Bloqueado
              </label>
              <Select
                value={filtroBloqueado}
                onValueChange={(value: FiltroBloqueado) => setFiltroBloqueado(value)}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="nao">Não (Ativos)</SelectItem>
                  <SelectItem value="sim">Sim (Bloqueados)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-3">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando produtos...
              </span>
            ) : erro ? (
              <span className="text-red-500">{erro}</span>
            ) : (
              `${produtosFiltrados.length} produto(s) encontrado(s) de ${produtos.length} total`
            )}
          </p>
        </div>

        {/* Tabela de Produtos */}
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : erro ? (
            <div className="text-center py-12">
              <p className="text-red-500">{erro}</p>
              <Button
                variant="outline"
                onClick={carregarProdutos}
                className="mt-4"
              >
                Tentar novamente
              </Button>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum produto encontrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente ajustar os filtros ou termo de busca
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[12%]">Código</TableHead>
                  <TableHead className="w-[35%]">Descrição</TableHead>
                  <TableHead className="w-[10%] text-center">Status</TableHead>
                  <TableHead className="w-[15%]">ANVISA</TableHead>
                  <TableHead className="w-[15%]">GTIN</TableHead>
                  <TableHead className="w-[13%] text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.map((produto, index) => (
                  <TableRow
                    key={`${produto.codigo}-${index}`}
                    className={`hover:bg-muted/50 cursor-pointer ${
                      produto.bloqueado ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleSelecionarSKU(produto)}
                  >
                    <TableCell className="font-mono font-medium">
                      {produto.codigo}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate" title={produto.produto}>
                      {produto.produto}
                    </TableCell>
                    <TableCell className="text-center">
                      {produto.bloqueado ? (
                        <Badge variant="destructive" className="text-xs">
                          Bloqueado
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs bg-green-600">
                          Ativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {produto.anvisa || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {produto.gtin || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelecionarSKU(produto)
                        }}
                      >
                        Selecionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Rodapé com botão de cancelar */}
        <DialogFooter className="border-t bg-background px-6 py-4 w-full">
          <Button variant="outline" onClick={handleFechar}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
