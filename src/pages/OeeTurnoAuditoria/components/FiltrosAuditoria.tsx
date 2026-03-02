import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { FiltrosAuditoria, UsuarioAuditoria } from '../types/turnoLog.types'
import { FILTROS_AUDITORIA_PADRAO } from '../types/turnoLog.types'

interface FiltrosAuditoriaProps {
  filtros: FiltrosAuditoria
  buscaInput: string
  onBuscaChange: (valor: string) => void
  onFiltroChange: (campo: keyof FiltrosAuditoria, valor: string) => void
  onLimpar: () => void
  operacoesDisponiveis: string[]
  tabelasDisponiveis: string[]
  usuariosDisponiveis: UsuarioAuditoria[]
}

function tabelaSemPrefixo(tabela: string): string {
  return tabela.replace(/^tboee_/, '')
}

function filtrosAtivos(filtros: FiltrosAuditoria, buscaInput: string): boolean {
  return (
    buscaInput !== FILTROS_AUDITORIA_PADRAO.busca ||
    filtros.operacao !== FILTROS_AUDITORIA_PADRAO.operacao ||
    filtros.tabela !== FILTROS_AUDITORIA_PADRAO.tabela ||
    filtros.dataInicio !== FILTROS_AUDITORIA_PADRAO.dataInicio ||
    filtros.dataFim !== FILTROS_AUDITORIA_PADRAO.dataFim ||
    filtros.createdBy !== FILTROS_AUDITORIA_PADRAO.createdBy
  )
}

export function FiltrosAuditoriaBar({
  filtros,
  buscaInput,
  onBuscaChange,
  onFiltroChange,
  onLimpar,
  operacoesDisponiveis,
  tabelasDisponiveis,
  usuariosDisponiveis,
}: FiltrosAuditoriaProps) {
  const temFiltrosAtivos = filtrosAtivos(filtros, buscaInput)

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Busca textual */}
        <div className="flex-1 min-w-[220px] space-y-1">
          <Label className="text-xs text-muted-foreground">Busca</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Pesquisar em log ou tabela..."
              value={buscaInput}
              onChange={(e) => onBuscaChange(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* Operação */}
        <div className="min-w-[160px] space-y-1">
          <Label className="text-xs text-muted-foreground">Operação</Label>
          <Select
            value={filtros.operacao || '__todos__'}
            onValueChange={(v) => onFiltroChange('operacao', v === '__todos__' ? '' : v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__todos__">Todos</SelectItem>
              {operacoesDisponiveis.map((op) => (
                <SelectItem key={op} value={op}>
                  {op}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <div className="min-w-[160px] space-y-1">
          <Label className="text-xs text-muted-foreground">Tabela</Label>
          <Select
            value={filtros.tabela || '__todos__'}
            onValueChange={(v) => onFiltroChange('tabela', v === '__todos__' ? '' : v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__todos__">Todos</SelectItem>
              {tabelasDisponiveis.map((tab) => (
                <SelectItem key={tab} value={tab}>
                  {tabelaSemPrefixo(tab)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Responsável */}
        <div className="min-w-[180px] space-y-1">
          <Label className="text-xs text-muted-foreground">Responsável</Label>
          <Select
            value={filtros.createdBy || '__todos__'}
            onValueChange={(v) => onFiltroChange('createdBy', v === '__todos__' ? '' : v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__todos__">Todos</SelectItem>
              {usuariosDisponiveis.map((u) => (
                <SelectItem key={u.user_id} value={u.user_id}>
                  {u.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data início */}
        <div className="min-w-[150px] space-y-1">
          <Label className="text-xs text-muted-foreground">Data início</Label>
          <Input
            type="date"
            value={filtros.dataInicio}
            onChange={(e) => onFiltroChange('dataInicio', e.target.value)}
            className="h-9"
          />
        </div>

        {/* Data fim */}
        <div className="min-w-[150px] space-y-1">
          <Label className="text-xs text-muted-foreground">Data fim</Label>
          <Input
            type="date"
            value={filtros.dataFim}
            onChange={(e) => onFiltroChange('dataFim', e.target.value)}
            className="h-9"
          />
        </div>

        {/* Limpar filtros */}
        {temFiltrosAtivos && (
          <div className="space-y-1">
            <Label className="text-xs text-transparent select-none">ação</Label>
            <Button variant="outline" size="sm" onClick={onLimpar} className="h-9 gap-1.5">
              <X className="h-3.5 w-3.5" />
              Limpar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
