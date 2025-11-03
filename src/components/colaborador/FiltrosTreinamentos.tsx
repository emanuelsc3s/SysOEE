/**
 * Componente FiltrosTreinamentos
 * Barra de busca e seletor de ordenação para treinamentos
 */

import { CriterioOrdenacao } from '@/types/colaborador'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, ArrowUpDown } from 'lucide-react'

interface FiltrosTreinamentosProps {
  /** Termo de busca atual */
  busca: string
  /** Callback quando busca muda */
  onBuscaChange: (busca: string) => void
  /** Critério de ordenação atual */
  ordenacao: CriterioOrdenacao
  /** Callback quando ordenação muda */
  onOrdenacaoChange: (ordenacao: CriterioOrdenacao) => void
}

export default function FiltrosTreinamentos({
  busca,
  onBuscaChange,
  ordenacao,
  onOrdenacaoChange,
}: FiltrosTreinamentosProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      {/* Campo de Busca */}
      <div className="flex-1">
        <Label htmlFor="busca-treinamento" className="sr-only">
          Buscar treinamento
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="busca-treinamento"
            type="text"
            placeholder="Buscar por código ou título do PO..."
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Seletor de Ordenação */}
      <div className="w-full sm:w-64">
        <Label htmlFor="ordenacao-treinamento" className="sr-only">
          Ordenar por
        </Label>
        <Select value={ordenacao} onValueChange={(value) => onOrdenacaoChange(value as CriterioOrdenacao)}>
          <SelectTrigger id="ordenacao-treinamento" className="w-full">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vencimento">Proximidade de Vencimento</SelectItem>
            <SelectItem value="titulo">Título (A–Z)</SelectItem>
            <SelectItem value="recentes">Mais Recentes Concluídos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

