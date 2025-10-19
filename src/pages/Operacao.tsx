/**
 * Página Operação - Visualização Kanban de Ordens de Produção
 * Exibe as OPs em andamento organizadas por fase de produção
 */

import { useState, useMemo } from 'react'
import { FaseProducao, Setor, Turno } from '@/types/operacao'
import { mockOPs } from '@/data/mockOPs'
import KanbanColumn from '@/components/operacao/KanbanColumn'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Filter, 
  RefreshCw,
  Factory,
  Users,
  Calendar
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * Todas as fases do Kanban na ordem do processo
 */
const FASES: FaseProducao[] = [
  'Planejado',
  'Parada',
  'Emissão de Dossiê',
  'Pesagem',
  'Preparação',
  'Envase',
  'Embalagem',
  'Concluído'
]

export default function Operacao() {
  const navigate = useNavigate()
  
  // Estados para filtros (futura implementação)
  const [setorFiltro, setSetorFiltro] = useState<Setor | 'Todos'>('Todos')
  const [turnoFiltro, setTurnoFiltro] = useState<Turno | 'Todos'>('Todos')
  const [dataAtual] = useState(new Date().toLocaleDateString('pt-BR'))

  /**
   * Agrupa as OPs por fase
   */
  const opsPorFase = useMemo(() => {
    const grupos: Record<FaseProducao, typeof mockOPs> = {
      'Planejado': [],
      'Parada': [],
      'Emissão de Dossiê': [],
      'Pesagem': [],
      'Preparação': [],
      'Envase': [],
      'Embalagem': [],
      'Concluído': []
    }

    mockOPs.forEach((op) => {
      grupos[op.fase].push(op)
    })

    return grupos
  }, [])

  /**
   * Calcula estatísticas gerais
   */
  const estatisticas = useMemo(() => {
    const totalOPs = mockOPs.length
    const setoresAtivos = new Set(mockOPs.map(op => op.setor)).size
    const turnosAtivos = new Set(mockOPs.map(op => op.turno)).size
    const opsEmProducao = mockOPs.filter(
      op => !['Planejado', 'Parada', 'Concluído'].includes(op.fase)
    ).length

    return {
      totalOPs,
      setoresAtivos,
      turnosAtivos,
      opsEmProducao
    }
  }, [])

  /**
   * Simula atualização dos dados
   */
  const handleRefresh = () => {
    // TODO: Implementar atualização real dos dados
    console.log('Atualizando dados...')
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-4">
          {/* Linha 1: Título e Ações */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/')}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  Operação - Kanban de Produção
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Visualização em tempo real das ordens de produção
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Linha 2: Estatísticas */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Data:</span>
              <span className="font-semibold">{dataAtual}</span>
            </div>

            <div className="h-4 w-px bg-border" />

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5">
                <Factory className="h-3.5 w-3.5" />
                {estatisticas.totalOPs} OPs Totais
              </Badge>
              <Badge variant="outline" className="gap-1.5 bg-primary/10 text-primary border-primary/20">
                <Factory className="h-3.5 w-3.5" />
                {estatisticas.opsEmProducao} Em Produção
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <Factory className="h-3.5 w-3.5" />
                {estatisticas.setoresAtivos} Setores Ativos
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {estatisticas.turnosAtivos} Turnos Ativos
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-[1920px] mx-auto p-4">
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {FASES.map((fase) => (
              <div key={fase} className="w-[320px] flex-shrink-0">
                <KanbanColumn
                  fase={fase}
                  ops={opsPorFase[fase]}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legenda de Cores (opcional) */}
      <div className="max-w-[1920px] mx-auto px-4 pb-6">
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Legenda de Setores
          </h3>
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
              SPEP - Soluções Parenterais Embalagem Plástica
            </Badge>
            <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">
              SPPV - Soluções Parenterais Pequeno Volume
            </Badge>
            <Badge className="bg-teal-100 text-teal-800 border-teal-200">
              Líquidos - Líquidos Orais
            </Badge>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              CPHD - Concentrado Polieletrolítico Hemodiálise
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

