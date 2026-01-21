/**
 * Modal de Busca de Linha de Produção
 * Permite buscar e selecionar linhas de produção da tabela tblinhaproducao
 * Segue padrão de modais de busca do projeto (ModalBuscaTurno, ModalBuscaSKU)
 */

import { useState, useMemo, useEffect, useCallback } from 'react'
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
import { Search, X, Loader2, Factory, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buscarLinhasProducao } from '@/services/api/linhaproducao.api'
import { LinhaProducao } from '@/types/linhaproducao'

/**
 * Dados da linha de produção selecionada retornados ao componente pai
 */
export interface LinhaProducaoSelecionada {
  linhaproducao_id: number
  linhaproducao: string
  departamento_id: number | null
  departamento: string | null
  tipo: string | null
  ativo: string | null
}

interface ModalBuscaLinhaProducaoProps {
  /** Controla se o modal está aberto */
  aberto: boolean
  /** Callback chamado quando o modal é fechado */
  onFechar: () => void
  /** Callback chamado quando uma linha é selecionada */
  onSelecionarLinha: (linha: LinhaProducaoSelecionada) => void
  /** Filtrar por departamento (opcional) */
  departamentoId?: number
  /** Filtrar por tipo (opcional) */
  tipoFiltro?: string
}

// Tipo para filtro de status
type FiltroStatus = 'todos' | 'ativos' | 'inativos'

export function ModalBuscaLinhaProducao({
  aberto,
  onFechar,
  onSelecionarLinha,
  departamentoId,
  tipoFiltro,
}: ModalBuscaLinhaProducaoProps) {
  const [termoBusca, setTermoBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos')
  const [linhas, setLinhas] = useState<LinhaProducao[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  /**
   * Carrega linhas de produção do Supabase
   */
  const carregarLinhas = useCallback(async () => {
    try {
      console.log('🔍 ModalBuscaLinhaProducao: Carregando linhas...')
      setLoading(true)
      setErro(null)

      const response = await buscarLinhasProducao({
        searchTerm: '',
        page: 1,
        itemsPerPage: 500, // Buscar todas para filtragem local
        filtroStatus: filtroStatus,
        departamentoId,
        tipo: tipoFiltro,
      })

      console.log('✅ ModalBuscaLinhaProducao: Linhas carregadas:', response.total)
      setLinhas(response.data)
    } catch (error) {
      console.error('❌ ModalBuscaLinhaProducao: Erro ao carregar linhas:', error)
      setErro('Erro ao carregar linhas de produção. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [filtroStatus, departamentoId, tipoFiltro])

  // Carregar linhas ao abrir o modal ou mudar filtro de status
  useEffect(() => {
    if (aberto) {
      carregarLinhas()
    }
  }, [aberto, carregarLinhas])

  // Filtrar linhas com base no termo de busca
  const linhasFiltradas = useMemo(() => {
    if (!termoBusca.trim()) {
      return linhas
    }

    const termo = termoBusca.toLowerCase()
    return linhas.filter((linha) => {
      return (
        linha.linhaproducao?.toLowerCase().includes(termo) ||
        linha.departamento?.toLowerCase().includes(termo) ||
        linha.tipo?.toLowerCase().includes(termo)
      )
    })
  }, [termoBusca, linhas])

  /**
   * Seleciona uma linha e fecha o modal
   */
  const handleSelecionarLinha = (linha: LinhaProducao) => {
    const linhaSelecionada: LinhaProducaoSelecionada = {
      linhaproducao_id: linha.linhaproducao_id,
      linhaproducao: linha.linhaproducao || '',
      departamento_id: linha.departamento_id,
      departamento: linha.departamento || null,
      tipo: linha.tipo,
      ativo: linha.ativo,
    }
    onSelecionarLinha(linhaSelecionada)
    handleFechar()
  }

  /**
   * Fecha o modal e limpa os filtros
   */
  const handleFechar = () => {
    setTermoBusca('')
    setFiltroStatus('todos')
    onFechar()
  }

  /**
   * Retorna a cor do badge de acordo com o tipo da linha
   */
  const getCorTipo = (
    tipo: string | null,
  ):
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'embalagem'
    | 'envaseEmbalagem' => {
    const tipoNormalizado = tipo?.toLowerCase().replace(/\s+/g, '') || ''
    switch (tipoNormalizado) {
      case 'envase':
        return 'default'
      case 'embalagem':
        return 'embalagem'
      case 'envase+embalagem':
        return 'envaseEmbalagem'
      default:
        return 'outline'
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={handleFechar}>
      <DialogContent className="max-w-[95vw] w-[1100px] max-h-[85vh] p-0 flex flex-col gap-0 min-h-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Factory className="h-6 w-6 text-primary" />
            Buscar Linha de Produção
          </DialogTitle>
          <DialogDescription className="text-base">
            Pesquise e selecione uma linha de produção
          </DialogDescription>
        </DialogHeader>

        {/* Campo de Busca e Filtros */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 md:gap-3 w-full md:flex-1 min-w-0">
              {/* Campo de busca por texto */}
              <div className="flex-1 min-w-0">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Digite nome da linha, departamento ou tipo..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className={`pl-10 py-2 w-full border border-gray-200 rounded-md text-sm${termoBusca ? ' pr-10' : ''}`}
                    autoFocus
                  />
                  {termoBusca && (
                    <button
                      onClick={() => setTermoBusca('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filtro de status */}
              <div className="w-full sm:w-48">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Status
                </label>
                <Select
                  value={filtroStatus}
                  onValueChange={(value: FiltroStatus) => setFiltroStatus(value)}
                >
                <SelectTrigger className="h-9 border-gray-200 rounded-md text-sm">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativos">Sim (Ativos)</SelectItem>
                    <SelectItem value="inativos">Não (Inativos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:shrink-0 md:self-end">
              <Button
                variant="outline"
                onClick={carregarLinhas}
                disabled={loading}
                className="flex items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-10 px-4"
                title="Atualizar lista"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando linhas...
              </span>
            ) : erro ? (
              <span className="text-red-500">{erro}</span>
            ) : (
              `${linhasFiltradas.length} linha(s) encontrada(s) de ${linhas.length} total`
            )}
          </p>
        </div>

        {/* Tabela de Linhas de Produção */}
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
                onClick={carregarLinhas}
                className="mt-4"
              >
                Tentar novamente
              </Button>
            </div>
          ) : linhasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma linha encontrada</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente ajustar os filtros ou termo de busca
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[8%]">Código</TableHead>
                  <TableHead className="w-[10%] text-center">Status</TableHead>
                  <TableHead className="w-[32%]">Linha de Produção</TableHead>
                  <TableHead className="w-[25%]">Departamento</TableHead>
                  <TableHead className="w-[15%] text-center">Tipo</TableHead>
                  <TableHead className="w-[10%] text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linhasFiltradas.map((linha) => (
                  <TableRow
                    key={linha.linhaproducao_id}
                    className={`hover:bg-muted/50 cursor-pointer ${
                      linha.ativo === 'N' ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleSelecionarLinha(linha)}
                  >
                    <TableCell className="font-mono font-medium">
                      {linha.linhaproducao_id}
                    </TableCell>
                    <TableCell className="text-center">
                      {linha.ativo === 'N' ? (
                        <Badge variant="destructive" className="text-xs">
                          Inativo
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs bg-green-600">
                          Ativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate" title={linha.linhaproducao || '--'}>
                      {linha.linhaproducao || '--'}
                    </TableCell>
                    <TableCell>
                      {linha.departamento || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                      {linha.tipo ? (
                        <Badge variant={getCorTipo(linha.tipo)} className="text-xs">
                          {linha.tipo}
                        </Badge>
                      ) : (
                        '--'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelecionarLinha(linha)
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
