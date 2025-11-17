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
import { Badge } from '@/components/ui/badge'
import { Search, X, ChevronRight } from 'lucide-react'

interface ParadaGeral {
  Coluna_1: null | string
  Natureza: string | null
  Classe: string | null
  'Grande Parada': string | null
  Apontamento: string | null
  Descrição: string | null
  Coluna_8: null | string
  Coluna_9: null | string
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
}

export function ModalBuscaParadas({
  aberto,
  onFechar,
  onSelecionarParada,
  paradasGerais,
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
        parada.Natureza?.toLowerCase().includes(termo) ||
        parada.Classe?.toLowerCase().includes(termo) ||
        parada['Grande Parada']?.toLowerCase().includes(termo) ||
        parada.Apontamento?.toLowerCase().includes(termo) ||
        parada.Descrição?.toLowerCase().includes(termo)
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

  // Função para determinar a variante do badge baseado na natureza
  const getBadgeVariant = (natureza: string | null): 'success' | 'warning' | 'default' => {
    if (!natureza) return 'default'
    if (natureza.toLowerCase().includes('planejada')) return 'success'
    if (natureza.toLowerCase().includes('não planejada')) return 'warning'
    return 'default'
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
              placeholder="Digite para buscar por natureza, classe, grande parada, apontamento ou descrição..."
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
            {paradasFiltradas.length} parada(s) encontrada(s)
          </p>
        </div>

        {/* Lista de Paradas */}
        <div className="h-[calc(85vh-280px)] overflow-y-auto px-6">
          <div className="space-y-2 py-4">
            {paradasFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma parada encontrada</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Tente ajustar os termos de busca
                </p>
              </div>
            ) : (
              paradasFiltradas.map((parada, index) => (
                <button
                  key={index}
                  onClick={() => handleSelecionarParada(parada)}
                  className="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Linha 1: Natureza (Badge) e Classe */}
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        {parada.Natureza && (
                          <Badge variant={getBadgeVariant(parada.Natureza)}>
                            {parada.Natureza}
                          </Badge>
                        )}
                        {parada.Classe && (
                          <>
                            {parada.Natureza && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            <span className="font-medium text-foreground">{parada.Classe}</span>
                          </>
                        )}
                      </div>

                      {/* Linha 2: Grande Parada e Apontamento */}
                      <div className="flex items-center gap-2">
                        {parada['Grande Parada'] && (
                          <>
                            <span className="text-base font-semibold">{parada['Grande Parada']}</span>
                            {parada.Apontamento && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          </>
                        )}
                        {parada.Apontamento && (
                          <span className="text-base font-bold text-primary">{parada.Apontamento}</span>
                        )}
                      </div>

                      {/* Linha 3: Descrição */}
                      {parada.Descrição && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {parada.Descrição}
                        </p>
                      )}
                    </div>

                    {/* Ícone de seleção */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))
            )}
          </div>
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

