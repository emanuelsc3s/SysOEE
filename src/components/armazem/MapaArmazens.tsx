import { useState, useEffect, useRef } from 'react'
import { MapPin, Settings, Save, X, RotateCcw, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import coordenadasData from '@/data/coordenadas-armazens.json'

/**
 * Interface para representar um armazém
 */
interface Armazem {
  codigo: string
  descricao: string
  bloqueado: boolean
}

/**
 * Interface para coordenadas de marcadores no mapa
 * Coordenadas são percentuais relativos à imagem (0-100)
 */
interface ArmazemCoordenadas {
  codigo: string
  x: number // Posição X em percentual (0-100)
  y: number // Posição Y em percentual (0-100)
}

/**
 * Props do componente MapaArmazens
 */
interface MapaArmazensProps {
  armazens: Armazem[]
  onArmazemClick: (armazem: Armazem) => void
}

/**
 * Chave do localStorage para armazenar coordenadas personalizadas
 */
const STORAGE_KEY = 'sysoee_coordenadas_armazens'

/**
 * Coordenadas padrão dos armazéns (do arquivo JSON)
 */
const COORDENADAS_PADRAO: ArmazemCoordenadas[] = coordenadasData.coordenadas.map(item => ({
  codigo: item.codigo,
  x: item.x,
  y: item.y
}))

/**
 * Componente de Mapa de Armazéns
 * Exibe foto aérea com marcadores clicáveis para cada armazém
 * Inclui modo de calibração para ajustar posições dos marcadores
 */
export function MapaArmazens({ armazens, onArmazemClick }: MapaArmazensProps) {
  const { toast } = useToast()
  const containerRef = useRef<HTMLDivElement>(null)

  // Estados principais
  const [modoCalibracao, setModoCalibracao] = useState(false)
  const [coordenadas, setCoordenadas] = useState<ArmazemCoordenadas[]>([])
  const [coordenadasOriginais, setCoordenadasOriginais] = useState<ArmazemCoordenadas[]>([])
  const [marcadorArrastando, setMarcadorArrastando] = useState<string | null>(null)

  /**
   * Carrega coordenadas do localStorage ou usa padrões
   */
  useEffect(() => {
    const coordenadasSalvas = localStorage.getItem(STORAGE_KEY)

    if (coordenadasSalvas) {
      try {
        const parsed = JSON.parse(coordenadasSalvas) as ArmazemCoordenadas[]
        setCoordenadas(parsed)
        setCoordenadasOriginais(parsed)
      } catch (error) {
        console.error('Erro ao carregar coordenadas do localStorage:', error)
        setCoordenadas(COORDENADAS_PADRAO)
        setCoordenadasOriginais(COORDENADAS_PADRAO)
      }
    } else {
      setCoordenadas(COORDENADAS_PADRAO)
      setCoordenadasOriginais(COORDENADAS_PADRAO)
    }
  }, [])

  /**
   * Busca coordenadas de um armazém pelo código
   */
  const obterCoordenadas = (codigo: string): ArmazemCoordenadas | undefined => {
    return coordenadas.find(coord => coord.codigo === codigo)
  }

  /**
   * Ativa o modo de calibração
   */
  const ativarModoCalibracao = () => {
    setCoordenadasOriginais([...coordenadas])
    setModoCalibracao(true)
    toast({
      title: 'Modo de Calibração Ativado',
      description: 'Arraste os marcadores para ajustar suas posições.',
    })
  }

  /**
   * Salva as coordenadas no localStorage
   */
  const salvarPosicoes = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(coordenadas))
      setCoordenadasOriginais([...coordenadas])
      setModoCalibracao(false)
      toast({
        title: 'Posições Salvas',
        description: 'As coordenadas dos marcadores foram salvas com sucesso.',
      })
    } catch (error) {
      console.error('Erro ao salvar coordenadas:', error)
      toast({
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar as coordenadas.',
        variant: 'destructive',
      })
    }
  }

  /**
   * Cancela a calibração e reverte para coordenadas originais
   */
  const cancelarCalibracao = () => {
    setCoordenadas([...coordenadasOriginais])
    setModoCalibracao(false)
    toast({
      title: 'Calibração Cancelada',
      description: 'As alterações foram descartadas.',
    })
  }

  /**
   * Restaura coordenadas padrão do JSON
   */
  const restaurarPadroes = () => {
    setCoordenadas(COORDENADAS_PADRAO)
    setCoordenadasOriginais(COORDENADAS_PADRAO)
    localStorage.removeItem(STORAGE_KEY)
    setModoCalibracao(false)
    toast({
      title: 'Padrões Restaurados',
      description: 'As coordenadas foram restauradas para os valores padrão.',
    })
  }

  /**
   * Inicia o arraste de um marcador
   */
  const iniciarArraste = (codigo: string, e: React.MouseEvent) => {
    if (!modoCalibracao) return
    e.preventDefault()
    e.stopPropagation()
    setMarcadorArrastando(codigo)
  }

  /**
   * Atualiza posição do marcador durante o arraste
   */
  const atualizarArraste = (e: React.MouseEvent) => {
    if (!modoCalibracao || !marcadorArrastando || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Limita coordenadas entre 0 e 100
    const xLimitado = Math.max(0, Math.min(100, x))
    const yLimitado = Math.max(0, Math.min(100, y))

    // Atualiza coordenadas do marcador
    setCoordenadas(prev =>
      prev.map(coord =>
        coord.codigo === marcadorArrastando
          ? { ...coord, x: xLimitado, y: yLimitado }
          : coord
      )
    )
  }

  /**
   * Finaliza o arraste
   */
  const finalizarArraste = () => {
    setMarcadorArrastando(null)
  }

  /**
   * Manipula clique em marcador
   */
  const handleMarcadorClick = (armazem: Armazem, e: React.MouseEvent) => {
    if (modoCalibracao) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onArmazemClick(armazem)
  }

  return (
    <div className="w-full space-y-4">
      {/* Botões de Controle */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        {!modoCalibracao ? (
          <Button
            onClick={ativarModoCalibracao}
            variant="outline"
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Calibrar Posições
          </Button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={salvarPosicoes}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
              Salvar Posições
            </Button>
            <Button
              onClick={cancelarCalibracao}
              variant="destructive"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        )}

        <Button
          onClick={restaurarPadroes}
          variant="outline"
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar Padrões
        </Button>
      </div>

      {/* Alerta de Modo de Calibração */}
      {modoCalibracao && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Modo de Calibração Ativo:</strong> Arraste os marcadores para ajustar suas posições.
            Clique em "Salvar Posições" para confirmar ou "Cancelar" para descartar as alterações.
          </AlertDescription>
        </Alert>
      )}

      {/* Badge de Status */}
      {modoCalibracao && (
        <div className="flex justify-center">
          <Badge variant="default" className="text-sm py-1 px-3">
            🎯 Modo de Calibração Ativo
          </Badge>
        </div>
      )}

      <Card className="overflow-hidden">
        {/* Container do mapa com proporção fixa */}
        <div
          ref={containerRef}
          className={`relative w-full ${modoCalibracao ? 'cursor-crosshair' : ''}`}
          style={{ paddingBottom: '66.67%' }}
          onMouseMove={atualizarArraste}
          onMouseUp={finalizarArraste}
          onMouseLeave={finalizarArraste}
        >
          {/* Imagem de fundo - Foto aérea */}
          <img
            src="/FotoAerea.jpeg"
            alt="Foto aérea da área de armazéns"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />

          {/* Overlay com marcadores */}
          <div className="absolute inset-0">
            {armazens.map((armazem) => {
              const coord = obterCoordenadas(armazem.codigo)

              // Se não houver coordenadas definidas, não renderiza o marcador
              if (!coord) return null

              const estaArrastando = marcadorArrastando === armazem.codigo

              return (
                <div
                  key={armazem.codigo}
                  className={`
                    absolute transform -translate-x-1/2 -translate-y-1/2
                    ${modoCalibracao ? 'cursor-move' : ''}
                    ${estaArrastando ? 'z-50 scale-125' : 'z-10'}
                    ${!modoCalibracao && !armazem.bloqueado ? 'hover:scale-125 hover:z-20' : ''}
                    transition-all duration-200
                  `}
                  style={{
                    left: `${coord.x}%`,
                    top: `${coord.y}%`,
                  }}
                  onMouseDown={(e) => iniciarArraste(armazem.codigo, e)}
                  onClick={(e) => handleMarcadorClick(armazem, e)}
                  title={
                    modoCalibracao
                      ? `Armazém ${armazem.codigo} - Arraste para reposicionar (${coord.x.toFixed(1)}%, ${coord.y.toFixed(1)}%)`
                      : `Armazém ${armazem.codigo} - ${armazem.descricao}${armazem.bloqueado ? ' (BLOQUEADO)' : ''}`
                  }
                >
                  {/* Marcador visual */}
                  <div className="relative">
                    {/* Ícone de pin */}
                    <MapPin
                      className={`
                        h-8 w-8 drop-shadow-lg
                        ${estaArrastando ? 'animate-pulse' : ''}
                        ${armazem.bloqueado
                          ? 'text-red-600 fill-red-100'
                          : 'text-primary fill-primary/20'
                        }
                        ${modoCalibracao ? 'ring-2 ring-yellow-400 rounded-full' : ''}
                      `}
                    />

                    {/* Badge com código do armazém */}
                    <div
                      className={`
                        absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                        text-[10px] font-bold
                        ${armazem.bloqueado ? 'text-red-700' : 'text-white'}
                      `}
                      style={{ marginTop: '-4px' }}
                    >
                      {armazem.codigo}
                    </div>

                    {/* Coordenadas durante arraste */}
                    {modoCalibracao && estaArrastando && (
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <Badge variant="secondary" className="text-xs">
                          X: {coord.x.toFixed(1)}% | Y: {coord.y.toFixed(1)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary fill-primary/20" />
          <span className="text-muted-foreground">Armazém Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-red-600 fill-red-100" />
          <span className="text-muted-foreground">Armazém Bloqueado</span>
        </div>
      </div>

      {/* Instruções */}
      <p className="text-xs text-muted-foreground text-center mt-3">
        {modoCalibracao
          ? 'Arraste os marcadores para ajustar suas posições. As coordenadas são exibidas durante o arraste.'
          : 'Clique em um marcador para visualizar os detalhes do armazém ou em "Calibrar Posições" para ajustar as posições.'
        }
      </p>
    </div>
  )
}

