/**
 * Página Dashboard - Visualização de OEE e cards por linha
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, Filter, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { AppHeader } from '@/components/layout/AppHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

type TurnoOption = {
  turno_id: number
  codigo: string
  turno: string | null
  hora_inicio: string | null
  hora_fim: string | null
}

type LinhaOption = {
  linhaproducao_id: number
  linhaproducao: string | null
}

type ProdutoOption = {
  produto_id: number
  referencia: string | null
  descricao: string | null
}

type OeeLinhaRow = {
  linhaproducao_id: number
  linhaproducao: string | null
  disponibilidade: number
  performance: number
  qualidade: number
  oee: number
}

type OeeLinhaRpc = {
  linhaproducao_id: number | string | null
  linhaproducao: string | null
  disponibilidade: number | string | null
  performance: number | string | null
  qualidade: number | string | null
  oee: number | string | null
}

const TEMPO_DISPONIVEL_PADRAO = 12

const formatarPercentual = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const parseNumero = (valor: unknown): number => {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : 0
  }

  if (valor === null || valor === undefined) {
    return 0
  }

  if (typeof valor === 'string') {
    const limpo = valor.trim().replace('%', '').replace(/\s+/g, '')
    if (!limpo) {
      return 0
    }

    if (limpo.includes(',') && limpo.includes('.')) {
      const normalizado = limpo.replace(/\./g, '').replace(',', '.')
      const parsed = Number.parseFloat(normalizado)
      return Number.isFinite(parsed) ? parsed : 0
    }

    if (limpo.includes(',')) {
      const parsed = Number.parseFloat(limpo.replace(',', '.'))
      return Number.isFinite(parsed) ? parsed : 0
    }

    const parsed = Number.parseFloat(limpo)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const parsed = Number(valor)
  return Number.isFinite(parsed) ? parsed : 0
}

const parseHoraParaMinutos = (hora?: string | null): number | null => {
  if (!hora) return null
  const [h, m] = hora.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return null
  }
  return h * 60 + m
}

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

const converterDataParaIso = (valor: string): string | null => {
  const texto = valor.trim()
  if (!texto) {
    return null
  }

  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (matchIso) {
    return texto
  }

  const matchBr = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!matchBr) {
    return null
  }

  const dia = Number(matchBr[1])
  const mes = Number(matchBr[2])
  const ano = Number(matchBr[3])
  const data = new Date(ano, mes - 1, dia)

  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return null
  }

  return `${matchBr[3]}-${matchBr[2]}-${matchBr[1]}`
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

const obterTurnoAtualId = (turnos: TurnoOption[]): number | null => {
  const agora = new Date()
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes()

  for (const turno of turnos) {
    const inicio = parseHoraParaMinutos(turno.hora_inicio)
    const fim = parseHoraParaMinutos(turno.hora_fim)
    if (inicio === null || fim === null) {
      continue
    }

    if (inicio <= fim) {
      if (minutosAgora >= inicio && minutosAgora < fim) {
        return turno.turno_id
      }
    } else {
      if (minutosAgora >= inicio || minutosAgora < fim) {
        return turno.turno_id
      }
    }
  }

  return null
}

/**
 * Retorna uma cor em gradiente baseada no percentual do indicador.
 * Implementa gradiente de vermelho (valores baixos) até azul (valores próximos a 100%)
 *
 * Escala de cores:
 * - 0-50%: Vermelho (#DC2626 a #F97316)
 * - 50-75%: Laranja/Amarelo (#F97316 a #EAB308)
 * - 75-90%: Verde/Azul claro (#10B981 a #3B82F6)
 * - 90-100%: Azul (#3B82F6 a #1E40AF)
 *
 * @param percentage - Percentual do indicador (0-100)
 * @returns Cor em formato hexadecimal
 */
const getColorByPercentage = (percentage: number): string => {
  // Garantir que o percentual está entre 0 e 100
  const percent = Math.max(0, Math.min(100, percentage))

  // Definir pontos de cor (RGB)
  const colorStops = [
    { percent: 0, color: { r: 220, g: 38, b: 38 } },    // Vermelho escuro #DC2626
    { percent: 25, color: { r: 239, g: 68, b: 68 } },   // Vermelho #EF4444
    { percent: 50, color: { r: 249, g: 115, b: 22 } },  // Laranja #F97316
    { percent: 65, color: { r: 234, g: 179, b: 8 } },   // Amarelo #EAB308
    { percent: 75, color: { r: 34, g: 197, b: 94 } },   // Verde #22C55E
    { percent: 85, color: { r: 16, g: 185, b: 129 } },  // Verde-azulado #10B981
    { percent: 90, color: { r: 59, g: 130, b: 246 } },  // Azul claro #3B82F6
    { percent: 95, color: { r: 37, g: 99, b: 235 } },   // Azul #2563EB
    { percent: 100, color: { r: 30, g: 64, b: 175 } }   // Azul escuro #1E40AF
  ]

  // Encontrar os dois pontos de cor mais próximos
  let lowerStop = colorStops[0]
  let upperStop = colorStops[colorStops.length - 1]

  for (let i = 0; i < colorStops.length - 1; i++) {
    if (percent >= colorStops[i].percent && percent <= colorStops[i + 1].percent) {
      lowerStop = colorStops[i]
      upperStop = colorStops[i + 1]
      break
    }
  }

  // Calcular a interpolação entre os dois pontos
  const range = upperStop.percent - lowerStop.percent
  const rangePercent = range === 0 ? 0 : (percent - lowerStop.percent) / range

  // Interpolar RGB
  const r = Math.round(lowerStop.color.r + (upperStop.color.r - lowerStop.color.r) * rangePercent)
  const g = Math.round(lowerStop.color.g + (upperStop.color.g - lowerStop.color.g) * rangePercent)
  const b = Math.round(lowerStop.color.b + (upperStop.color.b - lowerStop.color.b) * rangePercent)

  // Converter para hexadecimal
  const toHex = (value: number) => {
    const hex = value.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()

  const hoje = useMemo(() => format(new Date(), 'dd/MM/yyyy'), [])

  const [linhas, setLinhas] = useState<LinhaOption[]>([])
  const [produtos, setProdutos] = useState<ProdutoOption[]>([])
  const [turnos, setTurnos] = useState<TurnoOption[]>([])
  const [listasCarregadas, setListasCarregadas] = useState(false)

  const [filtros, setFiltros] = useState({
    linhaId: 'todas',
    produtoId: 'todos',
    turnoId: 'todos',
    dataInicio: hoje,
    dataFim: hoje
  })

  const [carregandoListas, setCarregandoListas] = useState(true)
  const [carregandoDados, setCarregandoDados] = useState(false)
  const [erroDados, setErroDados] = useState<string | null>(null)
  const [dadosOee, setDadosOee] = useState<OeeLinhaRow[]>([])
  const [calendarioInicioAberto, setCalendarioInicioAberto] = useState(false)
  const [calendarioFimAberto, setCalendarioFimAberto] = useState(false)

  const carregarLinhas = useCallback(async () => {
    const { data, error } = await supabase
      .from('tblinhaproducao')
      .select('linhaproducao_id, linhaproducao, bloqueado, deleted_at')
      .is('deleted_at', null)
      .or('bloqueado.eq.Não,bloqueado.is.null')
      .order('linhaproducao', { ascending: true })

    if (error) {
      throw error
    }

    setLinhas((data || []) as LinhaOption[])
  }, [])

  const carregarProdutos = useCallback(async () => {
    const { data, error } = await supabase
      .from('tbproduto')
      .select('produto_id, referencia, descricao')
      .eq('deletado', 'N')
      .order('referencia', { ascending: true })

    if (error) {
      throw error
    }

    setProdutos((data || []) as ProdutoOption[])
  }, [])

  const carregarTurnos = useCallback(async () => {
    const { data, error } = await supabase
      .from('tbturno')
      .select('turno_id, codigo, turno, hora_inicio, hora_fim')
      .eq('deletado', 'N')
      .order('codigo', { ascending: true })

    if (error) {
      throw error
    }

    const turnosCarregados = (data || []) as TurnoOption[]
    setTurnos(turnosCarregados)

    const turnoAtualId = obterTurnoAtualId(turnosCarregados)
    if (turnoAtualId) {
      setFiltros((prev) => {
        if (prev.turnoId !== 'todos') {
          return prev
        }
        return {
          ...prev,
          turnoId: String(turnoAtualId)
        }
      })
    }
  }, [])

  useEffect(() => {
    const carregarListas = async () => {
      try {
        setCarregandoListas(true)
        await Promise.all([carregarLinhas(), carregarProdutos(), carregarTurnos()])
        setListasCarregadas(true)
      } catch (error) {
        console.error('❌ Erro ao carregar filtros do dashboard:', error)
        toast({
          title: 'Erro ao carregar filtros',
          description: 'Não foi possível carregar linhas, turnos ou produtos.',
          variant: 'destructive'
        })
      } finally {
        setCarregandoListas(false)
      }
    }

    carregarListas()
  }, [carregarLinhas, carregarProdutos, carregarTurnos, toast])

  const parametrosRpc = useMemo(() => {
    const linhaId = filtros.linhaId === 'todas' ? null : Number(filtros.linhaId)
    const produtoId = filtros.produtoId === 'todos' ? null : Number(filtros.produtoId)
    const turnoId = filtros.turnoId === 'todos' ? null : Number(filtros.turnoId)
    const dataInicioIso = converterDataParaIso(filtros.dataInicio)
    const dataFimIso = converterDataParaIso(filtros.dataFim)

    return {
      p_data_inicio: dataInicioIso,
      p_data_fim: dataFimIso,
      p_turno_id: Number.isFinite(turnoId) ? turnoId : null,
      p_produto_id: Number.isFinite(produtoId) ? produtoId : null,
      p_linhaproducao_id: Number.isFinite(linhaId) ? linhaId : null,
      p_tempo_disponivel_padrao: TEMPO_DISPONIVEL_PADRAO
    }
  }, [filtros])

  const dataInicioSelecionada = useMemo(() => parseDataParaDate(filtros.dataInicio), [filtros.dataInicio])
  const dataFimSelecionada = useMemo(() => parseDataParaDate(filtros.dataFim), [filtros.dataFim])

  const carregarDadosOee = useCallback(async () => {
    if (!parametrosRpc.p_data_inicio || !parametrosRpc.p_data_fim) {
      return
    }

    if (parametrosRpc.p_data_inicio > parametrosRpc.p_data_fim) {
      setErroDados('A data inicial não pode ser maior que a data final.')
      setDadosOee([])
      return
    }

    try {
      setCarregandoDados(true)
      setErroDados(null)

      const { data, error } = await supabase.rpc('fn_calcular_oee_dashboard', parametrosRpc)

      if (error) {
        throw error
      }

      const dadosMapeados = (data || [])
        .map((linha: OeeLinhaRpc) => ({
          linhaproducao_id: Number(linha.linhaproducao_id),
          linhaproducao: linha.linhaproducao,
          disponibilidade: parseNumero(linha.disponibilidade),
          performance: parseNumero(linha.performance),
          qualidade: parseNumero(linha.qualidade),
          oee: parseNumero(linha.oee)
        }))
        .sort((a: OeeLinhaRow, b: OeeLinhaRow) => {
          if (b.oee !== a.oee) {
            return b.oee - a.oee
          }
          return (a.linhaproducao || '').localeCompare(b.linhaproducao || '', 'pt-BR', { sensitivity: 'base' })
        })

      setDadosOee(dadosMapeados)
    } catch (error) {
      console.error('❌ Erro ao buscar OEE no dashboard:', error)
      setErroDados('Não foi possível carregar o OEE para os filtros selecionados.')
      setDadosOee([])
    } finally {
      setCarregandoDados(false)
    }
  }, [parametrosRpc])

  useEffect(() => {
    if (!listasCarregadas) {
      return
    }
    carregarDadosOee()
  }, [carregarDadosOee, listasCarregadas])

  const atualizarFiltro = (campo: keyof typeof filtros, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
  }

  return (
    <div className="min-h-screen bg-muted">
      <AppHeader
        title="SysOEE - Dashboard"
        userName={user?.usuario || 'Usuário'}
        userRole={user?.perfil || 'Operador'}
        onLogout={signOut}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Filter className="h-5 w-5 text-primary" />
              Filtros do Dashboard
            </CardTitle>
            <CardDescription>
              Ajuste os filtros para recalcular automaticamente os cards de OEE.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {carregandoListas ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="filtro-linha">Linha de Produção</Label>
                  <Select value={filtros.linhaId} onValueChange={(value) => atualizarFiltro('linhaId', value)}>
                    <SelectTrigger id="filtro-linha">
                      <SelectValue placeholder="Todas as linhas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      {linhas.map((linha) => (
                        <SelectItem key={linha.linhaproducao_id} value={String(linha.linhaproducao_id)}>
                          {linha.linhaproducao || `Linha ${linha.linhaproducao_id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filtro-produto">Produto SKU</Label>
                  <Select value={filtros.produtoId} onValueChange={(value) => atualizarFiltro('produtoId', value)}>
                    <SelectTrigger id="filtro-produto">
                      <SelectValue placeholder="Todos os produtos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {produtos.map((produto) => (
                        <SelectItem key={produto.produto_id} value={String(produto.produto_id)}>
                          {(produto.referencia || 'SKU')} - {produto.descricao || 'Sem descrição'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filtro-turno">Turno</Label>
                  <Select value={filtros.turnoId} onValueChange={(value) => atualizarFiltro('turnoId', value)}>
                    <SelectTrigger id="filtro-turno">
                      <SelectValue placeholder="Todos os turnos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {turnos.map((turno) => (
                        <SelectItem key={turno.turno_id} value={String(turno.turno_id)}>
                          {turno.codigo} - {turno.turno || 'Turno'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Período</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/aaaa"
                        value={filtros.dataInicio}
                        onChange={(e) => atualizarFiltro('dataInicio', formatarDataDigitada(e.target.value))}
                      />
                      <Popover open={calendarioInicioAberto} onOpenChange={setCalendarioInicioAberto}>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="icon" aria-label="Selecionar data inicial">
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dataInicioSelecionada}
                            captionLayout="dropdown"
                            locale={ptBR}
                            onSelect={(date) => {
                              if (date) {
                                atualizarFiltro('dataInicio', format(date, 'dd/MM/yyyy'))
                              }
                              setCalendarioInicioAberto(false)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/aaaa"
                        value={filtros.dataFim}
                        onChange={(e) => atualizarFiltro('dataFim', formatarDataDigitada(e.target.value))}
                      />
                      <Popover open={calendarioFimAberto} onOpenChange={setCalendarioFimAberto}>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="icon" aria-label="Selecionar data final">
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dataFimSelecionada}
                            captionLayout="dropdown"
                            locale={ptBR}
                            onSelect={(date) => {
                              if (date) {
                                atualizarFiltro('dataFim', format(date, 'dd/MM/yyyy'))
                              }
                              setCalendarioFimAberto(false)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {erroDados && (
          <Card className="border border-destructive/40">
            <CardContent className="flex items-center gap-2 text-sm text-destructive py-4">
              {erroDados}
            </CardContent>
          </Card>
        )}

        {carregandoDados ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={`skeleton-${index}`}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : dadosOee.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Nenhum dado encontrado para os filtros selecionados.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dadosOee.map((linha) => (
              <Card key={linha.linhaproducao_id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{linha.linhaproducao || 'Linha sem nome'}</CardTitle>
                  <CardDescription>
                    OEE total: {formatarPercentual(linha.oee)}%
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                  {/* Velocímetro SVG inline com cores dinâmicas */}
                  <div className="relative flex-shrink-0">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                      {/* Círculo de fundo */}
                      <circle
                        className="stroke-gray-200 dark:stroke-gray-700"
                        cx="60"
                        cy="60"
                        fill="none"
                        r="54"
                        strokeWidth="12"
                      />
                      {/* Círculo de progresso com cor dinâmica */}
                      <circle
                        cx="60"
                        cy="60"
                        fill="none"
                        r="54"
                        strokeDasharray="339.292"
                        strokeDashoffset={339.292 - (339.292 * linha.oee) / 100}
                        strokeLinecap="round"
                        strokeWidth="12"
                        stroke={getColorByPercentage(linha.oee)}
                        style={{ transition: 'stroke 0.3s ease-in-out' }}
                      />
                      {/* Destaque visual do gap até a meta (65%) - exibido apenas quando OEE < 65% */}
                      {linha.oee < 65 && (
                        <circle
                          cx="60"
                          cy="60"
                          fill="none"
                          r="54"
                          strokeDasharray="339.292"
                          strokeDashoffset={339.292 - (339.292 * 65) / 100}
                          strokeLinecap="round"
                          strokeWidth="12"
                          stroke="#EAB308"
                          opacity="0.25"
                          style={{ transition: 'opacity 0.3s ease-in-out' }}
                        />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="font-bold text-2xl text-foreground">
                        {formatarPercentual(linha.oee)}%
                      </span>
                    </div>
                  </div>

                  {/* Barras de componentes com cores dinâmicas */}
                  <div className="w-full space-y-4">
                    {/* Disponibilidade */}
                    <div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="font-semibold text-base">{formatarPercentual(linha.disponibilidade)}%</span>
                        <span className="text-muted-foreground">Disponibilidade</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full transition-all duration-300 ease-in-out"
                          style={{
                            width: `${Math.max(0, Math.min(100, linha.disponibilidade))}%`,
                            backgroundColor: getColorByPercentage(linha.disponibilidade)
                          }}
                        />
                      </div>
                    </div>

                    {/* Performance */}
                    <div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="font-semibold text-base">{formatarPercentual(linha.performance)}%</span>
                        <span className="text-muted-foreground">Performance</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full transition-all duration-300 ease-in-out"
                          style={{
                            width: `${Math.max(0, Math.min(100, linha.performance))}%`,
                            backgroundColor: getColorByPercentage(linha.performance)
                          }}
                        />
                      </div>
                    </div>

                    {/* Qualidade */}
                    <div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="font-semibold text-base">{formatarPercentual(linha.qualidade)}%</span>
                        <span className="text-muted-foreground">Qualidade</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full transition-all duration-300 ease-in-out"
                          style={{
                            width: `${Math.max(0, Math.min(100, linha.qualidade))}%`,
                            backgroundColor: getColorByPercentage(linha.qualidade)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          {carregandoDados ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Atualizando indicadores...
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={carregarDadosOee}>
                Atualizar indicadores
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

