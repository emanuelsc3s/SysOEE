/**
 * Componente TimelineEtapasOP - Timeline vertical de histórico de etapas da OP
 * 
 * Exibe o histórico das etapas anteriores (Preparação, Envase) com:
 * - Nome da etapa
 * - Valores registrados
 * - Data e hora de conclusão
 * - Indicador visual de etapa concluída
 */

import { OrdemProducao } from '@/types/operacao'
import { CheckCircle2, Beaker, Package2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TimelineEtapasOPProps {
  /** OP com dados das etapas anteriores */
  op: OrdemProducao
}

interface EtapaTimeline {
  nome: string
  icone: React.ReactNode
  dataHora?: string
  valores: Array<{
    label: string
    valor: string | number
    unidade: string
  }>
  concluida: boolean
}

/**
 * Formata data ISO 8601 para formato brasileiro
 */
const formatarDataHora = (dataISO?: string): string => {
  if (!dataISO) return '—'
  
  try {
    const data = new Date(dataISO)
    return format(data, "dd/MM/yyyy HH:mm", { locale: ptBR })
  } catch {
    return '—'
  }
}

export default function TimelineEtapasOP({ op }: TimelineEtapasOPProps) {
  // Monta as etapas da timeline
  const etapas: EtapaTimeline[] = [
    {
      nome: 'Preparação',
      icone: <Beaker className="h-5 w-5" />,
      dataHora: op.dataHoraPreparacao,
      concluida: !!op.dataHoraPreparacao,
      valores: [
        {
          label: 'Quantidade Preparada',
          valor: op.quantidadePreparadaMl !== undefined 
            ? op.quantidadePreparadaMl.toLocaleString('pt-BR') 
            : '—',
          unidade: 'ML'
        },
        {
          label: 'Perdas na Preparação',
          valor: op.perdasPreparacaoMl !== undefined 
            ? op.perdasPreparacaoMl.toLocaleString('pt-BR') 
            : '—',
          unidade: 'ML'
        }
      ]
    },
    {
      nome: 'Envase',
      icone: <Package2 className="h-5 w-5" />,
      dataHora: op.dataHoraEnvase,
      concluida: !!op.dataHoraEnvase,
      valores: [
        {
          label: 'Quantidade Envasada',
          valor: op.quantidadeEnvasadaUnidades !== undefined 
            ? op.quantidadeEnvasadaUnidades.toLocaleString('pt-BR') 
            : '—',
          unidade: 'Unidades'
        },
        {
          label: 'Perdas no Envase',
          valor: op.perdasEnvaseUnidades !== undefined 
            ? op.perdasEnvaseUnidades.toLocaleString('pt-BR') 
            : '—',
          unidade: 'Unidades'
        }
      ]
    }
  ]

  // Filtra apenas etapas concluídas
  const etapasConcluidas = etapas.filter(etapa => etapa.concluida)

  // Se não há etapas concluídas, não exibe a timeline
  if (etapasConcluidas.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        <p>Nenhuma etapa anterior concluída</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Título da Timeline */}
      <div className="pb-2 border-b">
        <h3 className="font-semibold text-sm text-foreground">
          Histórico de Etapas
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Etapas anteriores concluídas
        </p>
      </div>

      {/* Timeline */}
      <div className="relative space-y-6">
        {/* Linha vertical conectando as etapas */}
        {etapasConcluidas.length > 1 && (
          <div 
            className="absolute left-[15px] top-8 bottom-8 w-0.5 bg-border"
            aria-hidden="true"
          />
        )}

        {/* Etapas */}
        {etapasConcluidas.map((etapa) => (
          <div key={etapa.nome} className="relative flex gap-4">
            {/* Marcador da etapa */}
            <div className="flex-shrink-0 relative z-10">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>

            {/* Conteúdo da etapa */}
            <div className="flex-1 pb-2">
              {/* Cabeçalho da etapa */}
              <div className="flex items-start gap-2 mb-2">
                <div className="text-green-600 dark:text-green-400 mt-0.5">
                  {etapa.icone}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-foreground">
                    {etapa.nome}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {formatarDataHora(etapa.dataHora)}
                  </p>
                </div>
              </div>

              {/* Valores registrados */}
              <div className="ml-7 space-y-2">
                {etapa.valores.map((valor) => (
                  <div 
                    key={valor.label}
                    className="bg-muted/50 rounded-md px-3 py-2"
                  >
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {valor.label}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {valor.valor} {valor.unidade}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

