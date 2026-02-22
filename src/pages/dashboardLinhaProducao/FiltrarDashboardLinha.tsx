import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, ChevronDown, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { OeeTurnoStatus } from '@/types/apontamento-oee'

// ---------------------------------------------------------------------------
// Tipos locais
// ---------------------------------------------------------------------------

type TurnoOpcao = {
  turno_id: number
  codigo: string | null
  turno: string | null
}

type LinhaOpcao = {
  linhaproducao_id: number
  linhaproducao: string | null
}

type ProdutoOpcao = {
  produto_id: number
  referencia: string | null
  descricao: string | null
}

// ---------------------------------------------------------------------------
// Tipo exportado (reutilizado em DashboardLinha.tsx)
// ---------------------------------------------------------------------------

export type FiltrosDashboardLinha = {
  dataInicio: string   // dd/mm/aaaa
  dataFim: string      // dd/mm/aaaa
  linhaIds: string[]
  turnoIds: string[]
  produtoIds: string[]
  statuses: OeeTurnoStatus[]
  lancamento: string
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const STATUS_DISPONIVEIS: OeeTurnoStatus[] = ['Aberto', 'Fechado', 'Cancelado']

export const FILTROS_DASHBOARD_PADRAO: FiltrosDashboardLinha = {
  dataInicio: '',
  dataFim: '',
  linhaIds: [],
  turnoIds: [],
  produtoIds: [],
  statuses: [],
  lancamento: '',
}

// ---------------------------------------------------------------------------
// Utilitários (mesma lógica de OeeTurno.tsx)
// ---------------------------------------------------------------------------

const formatarDataDigitada = (valor: string): string => {
  const texto = valor.trim()
  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (matchIso) {
    return `${matchIso[3]}/${matchIso[2]}/${matchIso[1]}`
  }

  const numeros = texto.replace(/\D/g, '').slice(0, 8)
  if (!numeros) {
    return ''
  }

  const partes: string[] = []
  partes.push(numeros.slice(0, 2))
  if (numeros.length > 2) {
    partes.push(numeros.slice(2, 4))
  }
  if (numeros.length > 4) {
    partes.push(numeros.slice(4, 8))
  }
  return partes.join('/')
}

const parseDataParaDate = (valor: string): Date | undefined => {
  const texto = valor.trim()
  if (!texto) {
    return undefined
  }

  const matchBr = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  const dia = matchBr ? Number(matchBr[1]) : matchIso ? Number(matchIso[3]) : NaN
  const mes = matchBr ? Number(matchBr[2]) : matchIso ? Number(matchIso[2]) : NaN
  const ano = matchBr ? Number(matchBr[3]) : matchIso ? Number(matchIso[1]) : NaN

  if (!Number.isFinite(dia) || !Number.isFinite(mes) || !Number.isFinite(ano)) {
    return undefined
  }

  const data = new Date(ano, mes - 1, dia)
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return undefined
  }

  return data
}

const clonarFiltros = (f: FiltrosDashboardLinha): FiltrosDashboardLinha => ({
  dataInicio: f.dataInicio,
  dataFim: f.dataFim,
  linhaIds: [...f.linhaIds],
  turnoIds: [...f.turnoIds],
  produtoIds: [...f.produtoIds],
  statuses: [...f.statuses],
  lancamento: f.lancamento,
})

const normalizarTexto = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const formatarLabelTurno = (turno: TurnoOpcao): string => {
  const codigo = (turno.codigo || '').trim()
  const nome = (turno.turno || '').trim()

  if (codigo && nome) {
    return `${codigo} – ${nome}`
  }
  return codigo || nome || `Turno ${turno.turno_id}`
}

const formatarLabelProduto = (produto: ProdutoOpcao): string => {
  const ref = (produto.referencia || '').trim()
  const desc = (produto.descricao || '').trim()

  if (ref && desc) {
    return `${ref} – ${desc}`
  }
  return ref || desc || `Produto ${produto.produto_id}`
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FiltrarDashboardLinhaProps {
  aberto: boolean
  onFechar: () => void
  filtrosAplicados: FiltrosDashboardLinha
  onAplicar: (filtros: FiltrosDashboardLinha) => void
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function FiltrarDashboardLinha({
  aberto,
  onFechar,
  filtrosAplicados,
  onAplicar,
}: FiltrarDashboardLinhaProps) {
  // Estado draft (edição local antes de aplicar)
  const [draft, setDraft] = useState<FiltrosDashboardLinha>(() => clonarFiltros(filtrosAplicados))

  // Estados dos dropdowns
  const [menuLinhaAberto, setMenuLinhaAberto] = useState(false)
  const [menuTurnoAberto, setMenuTurnoAberto] = useState(false)
  const [menuProdutoAberto, setMenuProdutoAberto] = useState(false)
  const [menuStatusAberto, setMenuStatusAberto] = useState(false)

  // Campos de busca nos dropdowns
  const [buscaLinha, setBuscaLinha] = useState('')
  const [buscaTurno, setBuscaTurno] = useState('')
  const [buscaProduto, setBuscaProduto] = useState('')

  // Calendários
  const [calendarioInicioAberto, setCalendarioInicioAberto] = useState(false)
  const [calendarioFimAberto, setCalendarioFimAberto] = useState(false)

  // Refs para foco nos campos de busca
  const refBuscaLinha = useRef<HTMLInputElement | null>(null)
  const refBuscaTurno = useRef<HTMLInputElement | null>(null)
  const refBuscaProduto = useRef<HTMLInputElement | null>(null)

  // Sincroniza draft ao abrir o modal
  useEffect(() => {
    if (aberto) {
      setDraft(clonarFiltros(filtrosAplicados))
      setBuscaLinha('')
      setBuscaTurno('')
      setBuscaProduto('')
    }
  }, [aberto, filtrosAplicados])

  // Fecha os menus ao fechar o dialog
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setMenuLinhaAberto(false)
      setMenuTurnoAberto(false)
      setMenuProdutoAberto(false)
      setMenuStatusAberto(false)
      onFechar()
    }
  }

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  const { data: linhasDisponiveis = [] } = useQuery({
    queryKey: ['filtro-dashboard-linhas'],
    queryFn: async (): Promise<LinhaOpcao[]> => {
      const { data, error } = await supabase
        .from('tblinhaproducao')
        .select('linhaproducao_id, linhaproducao')
        .is('deleted_at', null)
        .order('linhaproducao', { ascending: true })

      if (error) throw error
      return (data || []) as LinhaOpcao[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const { data: turnosDisponiveis = [] } = useQuery({
    queryKey: ['filtro-dashboard-turnos'],
    queryFn: async (): Promise<TurnoOpcao[]> => {
      const { data, error } = await supabase
        .from('tbturno')
        .select('turno_id, codigo, turno')
        .eq('deletado', 'N')
        .order('codigo', { ascending: true })

      if (error) throw error
      return (data || []) as TurnoOpcao[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const { data: produtosDisponiveis = [] } = useQuery({
    queryKey: ['filtro-dashboard-produtos'],
    queryFn: async (): Promise<ProdutoOpcao[]> => {
      const { data, error } = await supabase
        .from('tbproduto')
        .select('produto_id, referencia, descricao')
        .eq('deletado', 'N')
        .order('referencia', { ascending: true })

      if (error) throw error
      return (data || []) as ProdutoOpcao[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  // ---------------------------------------------------------------------------
  // Derivados
  // ---------------------------------------------------------------------------

  const dataInicioDate = useMemo(() => parseDataParaDate(draft.dataInicio), [draft.dataInicio])
  const dataFimDate = useMemo(() => parseDataParaDate(draft.dataFim), [draft.dataFim])

  const linhasFiltradas = useMemo(() => {
    const termo = normalizarTexto(buscaLinha.trim())
    if (!termo) return linhasDisponiveis
    return linhasDisponiveis.filter((l) =>
      normalizarTexto(`${l.linhaproducao ?? ''} ${l.linhaproducao_id}`).includes(termo)
    )
  }, [buscaLinha, linhasDisponiveis])

  const turnosFiltrados = useMemo(() => {
    const termo = normalizarTexto(buscaTurno.trim())
    if (!termo) return turnosDisponiveis
    return turnosDisponiveis.filter((t) =>
      normalizarTexto(`${t.codigo ?? ''} ${t.turno ?? ''} ${t.turno_id}`).includes(termo)
    )
  }, [buscaTurno, turnosDisponiveis])

  const produtosFiltrados = useMemo(() => {
    const termo = normalizarTexto(buscaProduto.trim())
    if (!termo) return produtosDisponiveis
    return produtosDisponiveis.filter((p) =>
      normalizarTexto(`${p.referencia ?? ''} ${p.descricao ?? ''} ${p.produto_id}`).includes(termo)
    )
  }, [buscaProduto, produtosDisponiveis])

  const resumoLinhas = useMemo(() => {
    if (draft.linhaIds.length === 0) return 'Todas as linhas'
    if (draft.linhaIds.length === 1) {
      const l = linhasDisponiveis.find((x) => String(x.linhaproducao_id) === draft.linhaIds[0])
      return l?.linhaproducao || `Linha ${draft.linhaIds[0]}`
    }
    return `${draft.linhaIds.length} linhas selecionadas`
  }, [draft.linhaIds, linhasDisponiveis])

  const resumoTurnos = useMemo(() => {
    if (draft.turnoIds.length === 0) return 'Todos os turnos'
    if (draft.turnoIds.length === 1) {
      const t = turnosDisponiveis.find((x) => String(x.turno_id) === draft.turnoIds[0])
      return t ? formatarLabelTurno(t) : `Turno ${draft.turnoIds[0]}`
    }
    return `${draft.turnoIds.length} turnos selecionados`
  }, [draft.turnoIds, turnosDisponiveis])

  const resumoProdutos = useMemo(() => {
    if (draft.produtoIds.length === 0) return 'Todos os produtos'
    if (draft.produtoIds.length === 1) {
      const p = produtosDisponiveis.find((x) => String(x.produto_id) === draft.produtoIds[0])
      return p ? formatarLabelProduto(p) : `Produto ${draft.produtoIds[0]}`
    }
    return `${draft.produtoIds.length} produtos selecionados`
  }, [draft.produtoIds, produtosDisponiveis])

  const resumoStatus = useMemo(() => {
    if (draft.statuses.length === 0) return 'Todos os status'
    if (draft.statuses.length === 1) return draft.statuses[0]
    return `${draft.statuses.length} status selecionados`
  }, [draft.statuses])

  // Contagem de filtros ativos no draft (para badge do botão Aplicar)
  const draftCount = (() => {
    let c = 0
    if (draft.dataInicio) c++
    if (draft.dataFim) c++
    if (draft.linhaIds.length > 0) c++
    if (draft.turnoIds.length > 0) c++
    if (draft.produtoIds.length > 0) c++
    if (draft.statuses.length > 0) c++
    if (draft.lancamento.trim()) c++
    return c
  })()

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleAplicar = () => {
    onAplicar(clonarFiltros(draft))
    onFechar()
  }

  const limparFiltros = () => {
    setDraft(clonarFiltros(FILTROS_DASHBOARD_PADRAO))
    setBuscaLinha('')
    setBuscaTurno('')
    setBuscaProduto('')
    setMenuLinhaAberto(false)
    setMenuTurnoAberto(false)
    setMenuProdutoAberto(false)
    setMenuStatusAberto(false)
  }

  const alternarLinha = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      linhaIds: prev.linhaIds.includes(id)
        ? prev.linhaIds.filter((x) => x !== id)
        : [...prev.linhaIds, id],
    }))
  }

  const alternarTurno = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      turnoIds: prev.turnoIds.includes(id)
        ? prev.turnoIds.filter((x) => x !== id)
        : [...prev.turnoIds, id],
    }))
  }

  const alternarProduto = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      produtoIds: prev.produtoIds.includes(id)
        ? prev.produtoIds.filter((x) => x !== id)
        : [...prev.produtoIds, id],
    }))
  }

  const alternarStatus = (status: OeeTurnoStatus) => {
    setDraft((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((x) => x !== status)
        : [...prev.statuses, status],
    }))
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={aberto} onOpenChange={handleOpenChange}>
      <DialogContent
        hideCloseButton
        className="w-full max-w-[calc(100vw-1rem)] sm:max-w-[680px] md:max-w-[760px] lg:max-w-[820px] max-h-[90dvh] overflow-hidden rounded-2xl border border-slate-200 dark:border-[#444] bg-white dark:bg-[#222] p-0 shadow-[0_25px_60px_rgba(20,27,27,0.12),0_8px_24px_rgba(20,27,27,0.08),0_0_0_1px_rgba(15,23,42,0.05)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="flex max-h-[90dvh] flex-col">
          {/* HEADER */}
          <div className="border-b border-slate-100 dark:border-[#444] px-4 py-4 sm:px-5 sm:py-5 md:px-6 lg:px-7">
            <DialogHeader className="flex flex-row items-center justify-between gap-4 text-left">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path
                      d="M2.25 4.5H15.75M4.5 9H13.5M6.75 13.5H11.25"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <DialogTitle className="text-[1.125rem] font-semibold leading-tight tracking-[-0.02em] text-gray-700 dark:text-white">
                      Filtrar Dashboard
                    </DialogTitle>
                    {draftCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="mt-0.5 border border-brand-primary/20 bg-brand-primary/10 text-xs text-brand-primary"
                      >
                        {draftCount} ativos
                      </Badge>
                    )}
                  </div>
                  <DialogDescription className="text-xs leading-normal tracking-[-0.01em] text-slate-500 dark:text-[#8b8b8b] sm:text-sm">
                    Refine os dados exibidos no dashboard com filtros específicos.
                  </DialogDescription>
                </div>
              </div>
              <DialogClose
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/70 text-muted-foreground backdrop-blur-[2px] transition-all duration-150 ease-out hover:bg-accent/70 hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                title="Fechar filtros"
                aria-label="Fechar filtros"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M7 7L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M17 7L7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </DialogClose>
            </DialogHeader>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 md:px-6 lg:px-7">
            <div className="space-y-4 sm:space-y-5">

              {/* Período */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium leading-none dark:text-white">Período</Label>
                <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="dd/mm/aaaa"
                      className="h-10 w-full min-w-0 rounded-xl border-slate-200 dark:border-[#444] bg-white dark:bg-[#1a1a1a] text-sm text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8b8b8b] focus-visible:ring-2 focus-visible:ring-brand-primary/25"
                      value={draft.dataInicio}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, dataInicio: formatarDataDigitada(e.target.value) }))
                      }
                    />
                    <Popover open={calendarioInicioAberto} onOpenChange={setCalendarioInicioAberto}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          aria-label="Selecionar data inicial"
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dataInicioDate}
                          captionLayout="dropdown"
                          locale={ptBR}
                          onSelect={(date) => {
                            if (date) {
                              setDraft((prev) => ({ ...prev, dataInicio: format(date, 'dd/MM/yyyy') }))
                            }
                            setCalendarioInicioAberto(false)
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <span className="hidden text-xs text-gray-400 dark:text-[#8b8b8b] sm:inline text-center">até</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="dd/mm/aaaa"
                      className="h-10 w-full min-w-0 rounded-xl border-slate-200 dark:border-[#444] bg-white dark:bg-[#1a1a1a] text-sm text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8b8b8b] focus-visible:ring-2 focus-visible:ring-brand-primary/25"
                      value={draft.dataFim}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, dataFim: formatarDataDigitada(e.target.value) }))
                      }
                    />
                    <Popover open={calendarioFimAberto} onOpenChange={setCalendarioFimAberto}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 shrink-0"
                          aria-label="Selecionar data final"
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dataFimDate}
                          captionLayout="dropdown"
                          locale={ptBR}
                          onSelect={(date) => {
                            if (date) {
                              setDraft((prev) => ({ ...prev, dataFim: format(date, 'dd/MM/yyyy') }))
                            }
                            setCalendarioFimAberto(false)
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Lançamento + Status */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
                <div className="flex flex-col gap-2 sm:w-1/2 sm:min-w-0">
                  <Label htmlFor="fdl-lancamento" className="text-sm font-medium leading-none dark:text-white">
                    Lançamento
                  </Label>
                  <Input
                    id="fdl-lancamento"
                    placeholder="Nº Lançamento"
                    className="w-full h-10 rounded-xl border-slate-200 dark:border-[#444] bg-white dark:bg-[#1a1a1a] text-sm text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8b8b8b] focus-visible:ring-2 focus-visible:ring-brand-primary/25"
                    value={draft.lancamento}
                    onChange={(e) => setDraft((prev) => ({ ...prev, lancamento: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:w-1/2 sm:min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-none dark:text-white">Status</p>
                    {draft.statuses.length > 0 && (
                      <span className="whitespace-nowrap text-[11px] font-medium text-brand-primary sm:text-xs">
                        {draft.statuses.length} selecionado{draft.statuses.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <DropdownMenu open={menuStatusAberto} onOpenChange={setMenuStatusAberto}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        id="fdl-status"
                        variant="outline"
                        className="h-10 w-full justify-between rounded-xl border-slate-200 dark:border-[#444] bg-white dark:bg-[#1a1a1a] px-3.5 text-left font-normal text-slate-700 dark:text-white shadow-sm transition-all hover:border-slate-300 dark:hover:border-[#555] hover:bg-slate-50 dark:hover:bg-[#2a2a2a] hover:text-slate-900 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-brand-primary/25"
                      >
                        <span className="truncate">{resumoStatus}</span>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border-slate-200 dark:border-[#444] bg-white dark:bg-[#222] p-0 shadow-lg"
                    >
                      <DropdownMenuCheckboxItem
                        className="min-h-10 rounded-sm px-2 py-2 text-sm data-[state=checked]:bg-brand-primary/10 dark:data-[state=checked]:bg-brand-primary/20 dark:text-white dark:focus:bg-[#333] [&>span]:hidden"
                        checked={draft.statuses.length === 0}
                        onCheckedChange={(checked) => {
                          if (checked) setDraft((prev) => ({ ...prev, statuses: [] }))
                        }}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors ${
                              draft.statuses.length === 0
                                ? 'border-brand-primary bg-brand-primary text-white'
                                : 'border-input bg-background text-transparent'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                          <span>Todos os status</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      {STATUS_DISPONIVEIS.map((status) => {
                        const sel = draft.statuses.includes(status)
                        return (
                          <DropdownMenuCheckboxItem
                            key={status}
                            className="min-h-10 rounded-sm px-2 py-2 text-sm data-[state=checked]:bg-brand-primary/10 dark:data-[state=checked]:bg-brand-primary/20 dark:text-white dark:focus:bg-[#333] [&>span]:hidden"
                            checked={sel}
                            onCheckedChange={() => alternarStatus(status)}
                            onSelect={(e) => e.preventDefault()}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors ${
                                  sel
                                    ? 'border-brand-primary bg-brand-primary text-white'
                                    : 'border-input bg-background text-transparent'
                                }`}
                              >
                                <Check className="h-3 w-3" />
                              </span>
                              <span>{status}</span>
                            </div>
                          </DropdownMenuCheckboxItem>
                        )
                      })}
                      <DropdownMenuSeparator />
                      <div className="flex justify-end p-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-9 w-24 rounded-lg"
                          onClick={() => setMenuStatusAberto(false)}
                        >
                          Fechar
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Linha de Produção */}
              <section className="rounded-xl border border-slate-200 dark:border-[#444] bg-white dark:bg-[#1e1e1e] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-none dark:text-white">Linha de Produção</p>
                  {draft.linhaIds.length > 0 && (
                    <span className="whitespace-nowrap text-[11px] font-medium text-brand-primary sm:text-xs">
                      {draft.linhaIds.length} selecionado{draft.linhaIds.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <DropdownMenu open={menuLinhaAberto} onOpenChange={setMenuLinhaAberto}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        id="fdl-linha"
                        variant="outline"
                        className="h-10 w-full justify-between rounded-xl border-slate-200 dark:border-[#444] bg-white dark:bg-[#1a1a1a] px-3.5 text-left font-normal text-slate-700 dark:text-white shadow-sm transition-all hover:border-slate-300 dark:hover:border-[#555] hover:bg-slate-50 dark:hover:bg-[#2a2a2a] hover:text-slate-900 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-brand-primary/25"
                      >
                        <span className="truncate">{resumoLinhas}</span>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border-slate-200 dark:border-[#444] bg-white dark:bg-[#222] p-0 shadow-lg"
                    >
                      <div className="p-2">
                        <Input
                          ref={refBuscaLinha}
                          placeholder="Buscar linha"
                          className="h-10 rounded-lg border-slate-200 dark:border-[#444] bg-slate-50/50 dark:bg-[#1a1a1a] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8b8b8b]"
                          value={buscaLinha}
                          onChange={(e) => setBuscaLinha(e.target.value)}
                          onKeyDown={(e) => { if (e.key !== 'Escape') e.stopPropagation() }}
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        className="min-h-10 rounded-sm px-2 py-2 text-sm data-[state=checked]:bg-brand-primary/10 dark:data-[state=checked]:bg-brand-primary/20 dark:text-white dark:focus:bg-[#333] [&>span]:hidden"
                        checked={draft.linhaIds.length === 0}
                        onCheckedChange={(checked) => {
                          if (checked) setDraft((prev) => ({ ...prev, linhaIds: [] }))
                        }}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors ${
                              draft.linhaIds.length === 0
                                ? 'border-brand-primary bg-brand-primary text-white'
                                : 'border-input bg-background text-transparent'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                          <span>Todas as linhas</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <div className="max-h-64 overflow-y-auto">
                        {linhasFiltradas.length === 0 ? (
                          <div className="px-2 py-2 text-sm text-muted-foreground dark:text-[#8b8b8b]">
                            Nenhuma linha encontrada.
                          </div>
                        ) : (
                          linhasFiltradas.map((linha) => {
                            const id = String(linha.linhaproducao_id)
                            const sel = draft.linhaIds.includes(id)
                            return (
                              <DropdownMenuCheckboxItem
                                key={linha.linhaproducao_id}
                                className="min-h-10 rounded-sm px-2 py-2 text-sm data-[state=checked]:bg-brand-primary/10 dark:data-[state=checked]:bg-brand-primary/20 dark:text-white dark:focus:bg-[#333] [&>span]:hidden"
                                checked={sel}
                                onCheckedChange={() => alternarLinha(id)}
                                onSelect={(e) => e.preventDefault()}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors ${
                                      sel
                                        ? 'border-brand-primary bg-brand-primary text-white'
                                        : 'border-input bg-background text-transparent'
                                    }`}
                                  >
                                    <Check className="h-3 w-3" />
                                  </span>
                                  <span>{linha.linhaproducao || `Linha ${linha.linhaproducao_id}`}</span>
                                </div>
                              </DropdownMenuCheckboxItem>
                            )
                          })
                        )}
                      </div>
                      <DropdownMenuSeparator />
                      <div className="flex justify-end p-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-9 w-24 rounded-lg"
                          onClick={() => setMenuLinhaAberto(false)}
                        >
                          Fechar
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </section>

              {/* Turno */}
              <section className="rounded-xl border border-slate-200 dark:border-[#444] bg-white dark:bg-[#1e1e1e] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-none dark:text-white">Turnos</p>
                  {draft.turnoIds.length > 0 && (
                    <span className="whitespace-nowrap text-[11px] font-medium text-brand-primary sm:text-xs">
                      {draft.turnoIds.length} selecionado{draft.turnoIds.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <DropdownMenu open={menuTurnoAberto} onOpenChange={setMenuTurnoAberto}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        id="fdl-turno"
                        variant="outline"
                        className="h-10 w-full justify-between rounded-xl border-slate-200 dark:border-[#444] bg-white dark:bg-[#1a1a1a] px-3.5 text-left font-normal text-slate-700 dark:text-white shadow-sm transition-all hover:border-slate-300 dark:hover:border-[#555] hover:bg-slate-50 dark:hover:bg-[#2a2a2a] hover:text-slate-900 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-brand-primary/25"
                      >
                        <span className="truncate">{resumoTurnos}</span>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border-slate-200 dark:border-[#444] bg-white dark:bg-[#222] p-0 shadow-lg"
                    >
                      <div className="p-2">
                        <Input
                          ref={refBuscaTurno}
                          placeholder="Buscar turno"
                          className="h-10 rounded-lg border-slate-200 dark:border-[#444] bg-slate-50/50 dark:bg-[#1a1a1a] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8b8b8b]"
                          value={buscaTurno}
                          onChange={(e) => setBuscaTurno(e.target.value)}
                          onKeyDown={(e) => { if (e.key !== 'Escape') e.stopPropagation() }}
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        className="min-h-10 rounded-sm px-2 py-2 text-sm data-[state=checked]:bg-brand-primary/10 dark:data-[state=checked]:bg-brand-primary/20 dark:text-white dark:focus:bg-[#333] [&>span]:hidden"
                        checked={draft.turnoIds.length === 0}
                        onCheckedChange={(checked) => {
                          if (checked) setDraft((prev) => ({ ...prev, turnoIds: [] }))
                        }}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors ${
                              draft.turnoIds.length === 0
                                ? 'border-brand-primary bg-brand-primary text-white'
                                : 'border-input bg-background text-transparent'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                          <span>Todos os turnos</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <div className="max-h-64 overflow-y-auto">
                        {turnosFiltrados.length === 0 ? (
                          <div className="px-2 py-2 text-sm text-muted-foreground dark:text-[#8b8b8b]">
                            Nenhum turno encontrado.
                          </div>
                        ) : (
                          turnosFiltrados.map((turno) => {
                            const id = String(turno.turno_id)
                            const sel = draft.turnoIds.includes(id)
                            return (
                              <DropdownMenuCheckboxItem
                                key={turno.turno_id}
                                className="min-h-10 rounded-sm px-2 py-2 text-sm data-[state=checked]:bg-brand-primary/10 dark:data-[state=checked]:bg-brand-primary/20 dark:text-white dark:focus:bg-[#333] [&>span]:hidden"
                                checked={sel}
                                onCheckedChange={() => alternarTurno(id)}
                                onSelect={(e) => e.preventDefault()}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors ${
                                      sel
                                        ? 'border-brand-primary bg-brand-primary text-white'
                                        : 'border-input bg-background text-transparent'
                                    }`}
                                  >
                                    <Check className="h-3 w-3" />
                                  </span>
                                  <span>{formatarLabelTurno(turno)}</span>
                                </div>
                              </DropdownMenuCheckboxItem>
                            )
                          })
                        )}
                      </div>
                      <DropdownMenuSeparator />
                      <div className="flex justify-end p-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-9 w-24 rounded-lg"
                          onClick={() => setMenuTurnoAberto(false)}
                        >
                          Fechar
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </section>

              {/* Produto */}
              <section className="rounded-xl border border-slate-200 dark:border-[#444] bg-white dark:bg-[#1e1e1e] p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-none dark:text-white">Produtos</p>
                  {draft.produtoIds.length > 0 && (
                    <span className="whitespace-nowrap text-[11px] font-medium text-brand-primary sm:text-xs">
                      {draft.produtoIds.length} selecionado{draft.produtoIds.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <DropdownMenu open={menuProdutoAberto} onOpenChange={setMenuProdutoAberto}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        id="fdl-produto"
                        variant="outline"
                        className="h-10 w-full justify-between rounded-xl border-slate-200 dark:border-[#444] bg-white dark:bg-[#1a1a1a] px-3.5 text-left font-normal text-slate-700 dark:text-white shadow-sm transition-all hover:border-slate-300 dark:hover:border-[#555] hover:bg-slate-50 dark:hover:bg-[#2a2a2a] hover:text-slate-900 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-brand-primary/25"
                      >
                        <span className="truncate">{resumoProdutos}</span>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border-slate-200 dark:border-[#444] bg-white dark:bg-[#222] p-0 shadow-lg"
                    >
                      <div className="p-2">
                        <Input
                          ref={refBuscaProduto}
                          placeholder="Buscar produto"
                          className="h-10 rounded-lg border-slate-200 dark:border-[#444] bg-slate-50/50 dark:bg-[#1a1a1a] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8b8b8b]"
                          value={buscaProduto}
                          onChange={(e) => setBuscaProduto(e.target.value)}
                          onKeyDown={(e) => { if (e.key !== 'Escape') e.stopPropagation() }}
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        className="min-h-10 rounded-sm px-2 py-2 text-sm data-[state=checked]:bg-brand-primary/10 dark:data-[state=checked]:bg-brand-primary/20 dark:text-white dark:focus:bg-[#333] [&>span]:hidden"
                        checked={draft.produtoIds.length === 0}
                        onCheckedChange={(checked) => {
                          if (checked) setDraft((prev) => ({ ...prev, produtoIds: [] }))
                        }}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors ${
                              draft.produtoIds.length === 0
                                ? 'border-brand-primary bg-brand-primary text-white'
                                : 'border-input bg-background text-transparent'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                          <span>Todos os produtos</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <div className="max-h-64 overflow-y-auto">
                        {produtosFiltrados.length === 0 ? (
                          <div className="px-2 py-2 text-sm text-muted-foreground dark:text-[#8b8b8b]">
                            Nenhum produto encontrado.
                          </div>
                        ) : (
                          produtosFiltrados.map((produto) => {
                            const id = String(produto.produto_id)
                            const sel = draft.produtoIds.includes(id)
                            return (
                              <DropdownMenuCheckboxItem
                                key={produto.produto_id}
                                className="min-h-10 rounded-sm px-2 py-2 text-sm data-[state=checked]:bg-brand-primary/10 dark:data-[state=checked]:bg-brand-primary/20 dark:text-white dark:focus:bg-[#333] [&>span]:hidden"
                                checked={sel}
                                onCheckedChange={() => alternarProduto(id)}
                                onSelect={(e) => e.preventDefault()}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`flex h-4 w-4 items-center justify-center rounded-[3px] border transition-colors ${
                                      sel
                                        ? 'border-brand-primary bg-brand-primary text-white'
                                        : 'border-input bg-background text-transparent'
                                    }`}
                                  >
                                    <Check className="h-3 w-3" />
                                  </span>
                                  <span>{formatarLabelProduto(produto)}</span>
                                </div>
                              </DropdownMenuCheckboxItem>
                            )
                          })
                        )}
                      </div>
                      <DropdownMenuSeparator />
                      <div className="flex justify-end p-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-9 w-24 rounded-lg"
                          onClick={() => setMenuProdutoAberto(false)}
                        >
                          Fechar
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </section>

            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter className="border-t border-slate-100 dark:border-[#444] bg-white/95 dark:bg-[#222]/95 px-4 py-4 sm:px-5 md:px-6 lg:px-7">
            <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="flex min-w-[148px] items-center justify-center gap-2 !bg-white dark:!bg-[#222] !text-brand-primary !border-brand-primary hover:!bg-gray-50 dark:hover:!bg-[#333] hover:!border-brand-primary hover:!text-brand-primary min-h-11 sm:min-h-10 px-4"
                onClick={limparFiltros}
              >
                Limpar Filtros
              </Button>
              <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center sm:gap-2 md:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex min-w-[132px] items-center justify-center gap-2 !bg-white dark:!bg-[#222] !text-brand-primary !border-brand-primary hover:!bg-gray-50 dark:hover:!bg-[#333] hover:!border-brand-primary hover:!text-brand-primary min-h-11 sm:min-h-10 px-4"
                  onClick={onFechar}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex min-w-[168px] items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-11 sm:min-h-10 px-4"
                  onClick={handleAplicar}
                >
                  Aplicar filtros
                  {draftCount > 0 && (
                    <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-md bg-white/20 px-1.5 text-[11px] font-semibold">
                      {draftCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
