/**
 * Modal de Busca de Paradas
 * Permite buscar e selecionar paradas da hierarquia de 5 níveis
 * Otimizado para formato widescreen 16:9
 */

import { useState, useMemo } from 'react'
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
import { Search, X } from 'lucide-react'

export interface ParadaGeral {
  codigo: string
  componente: string
  classe: string
  natureza: string
  parada: string
  descricao: string
}

interface ModalBuscaParadasProps {
  /** Controla se o modal está aberto */
  aberto: boolean
  /** Callback chamado quando o modal é fechado */
  onFechar: () => void
  /** Callback chamado quando uma parada é selecionada */
  onSelecionarParada: (parada: ParadaGeral) => void
  /** Dados de paradas gerais */
  paradasGerais: ParadaGeral[]
  /** Indica carregamento dos dados */
  carregando?: boolean
  /** Mensagem de erro ao carregar paradas */
  erro?: string | null
}

export function ModalBuscaParadas({
  aberto,
  onFechar,
  onSelecionarParada,
  paradasGerais,
  carregando = false,
  erro = null,
}: ModalBuscaParadasProps) {
  const [termoBusca, setTermoBusca] = useState('')

  // Filtrar paradas com base no termo de busca
  const paradasFiltradas = useMemo(() => {
    if (!termoBusca.trim()) {
      return paradasGerais
    }

    const termo = termoBusca.toLowerCase()
    return paradasGerais.filter((parada) => {
      return (
        parada.codigo?.toLowerCase().includes(termo) ||
        parada.componente?.toLowerCase().includes(termo) ||
        parada.natureza?.toLowerCase().includes(termo) ||
        parada.classe?.toLowerCase().includes(termo) ||
        parada.parada?.toLowerCase().includes(termo) ||
        parada.descricao?.toLowerCase().includes(termo)
      )
    })
  }, [termoBusca, paradasGerais])

  const handleSelecionarParada = (parada: ParadaGeral) => {
    onSelecionarParada(parada)
    setTermoBusca('')
    onFechar()
  }

  const handleFechar = () => {
    setTermoBusca('')
    onFechar()
  }

  return (
    <Dialog open={aberto} onOpenChange={handleFechar}>
      <DialogContent className="max-w-[90vw] w-[1200px] max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Buscar Tipo de Parada
          </DialogTitle>
          <DialogDescription className="text-base">
            Pesquise e selecione uma parada da hierarquia completa
          </DialogDescription>
        </DialogHeader>

        {/* Campo de Busca */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Digite para buscar por código, componente, natureza, classe, parada ou descrição..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
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
          <p className="text-sm text-muted-foreground mt-2">
            {carregando ? 'Carregando paradas...' : `${paradasFiltradas.length} parada(s) encontrada(s)`}
          </p>
        </div>

        {/* Lista de Paradas em Grid */}
        <div className="h-[calc(85vh-280px)] overflow-y-auto px-6">
          {erro ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{erro}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente novamente em alguns instantes
              </p>
            </div>
          ) : carregando ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando tipos de parada...</p>
            </div>
          ) : paradasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma parada encontrada</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente ajustar os termos de busca
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4">
              {paradasFiltradas.map((parada, index) => (
                <button
                  key={index}
                  onClick={() => handleSelecionarParada(parada)}
                  className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all group min-h-[140px]"
                >
                  {/* Código em Destaque */}
                  <div className="text-5xl font-bold text-primary mb-3 group-hover:scale-110 transition-transform">
                    {parada.codigo}
                  </div>

                  {/* Parada */}
                  <div className="text-sm font-medium text-center text-foreground line-clamp-2">
                    {parada.parada}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="border-t bg-background px-6 py-4">
          <Button type="button" variant="outline" onClick={handleFechar}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
