/**
 * Página OperacaoDetalheOP - Detalhes de uma Ordem de Produção
 * Exibe informações completas da OP selecionada e botões de ação
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { OrdemProducao } from '@/types/operacao'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Calendar,
  Package,
  Factory,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ClipboardList,
  HelpCircle,
  Pause,
  PackageOpen,
  FileStack
} from 'lucide-react'

/**
 * Chave para armazenamento no localStorage (mesma usada na página Operacao.tsx)
 */
const STORAGE_KEY = 'sysoee_operacao_ops'

/**
 * Carrega OP do localStorage
 */
function carregarOP(numeroOP: string): OrdemProducao | null {
  try {
    const dadosSalvos = localStorage.getItem(STORAGE_KEY)
    if (dadosSalvos) {
      const ops: OrdemProducao[] = JSON.parse(dadosSalvos)
      return ops.find(op => op.op === numeroOP) || null
    }
  } catch (error) {
    console.error('❌ Erro ao carregar OP do localStorage:', error)
  }
  return null
}

/**
 * Formata número com separador de milhares
 */
function formatarNumero(num: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0
  }).format(num)
}

/**
 * Calcula percentual de progresso
 */
function calcularProgresso(quantidadeEmbaladaUnidades: number, teorico: number): number {
  if (teorico === 0) return 0
  return Math.min(Math.round((quantidadeEmbaladaUnidades / teorico) * 100), 100)
}

/**
 * Retorna cor do badge de setor
 */
function getCorSetor(setor: string): string {
  const cores: Record<string, string> = {
    'SPEP': 'bg-blue-500 text-white',
    'SPPV': 'bg-green-500 text-white',
    'Líquidos': 'bg-purple-500 text-white',
    'CPHD': 'bg-orange-500 text-white'
  }
  return cores[setor] || 'bg-gray-500 text-white'
}

/**
 * Retorna cor do badge de turno
 */
function getCorTurno(turno: string): string {
  const cores: Record<string, string> = {
    '1º Turno': 'bg-amber-500 text-white',
    '2º Turno': 'bg-indigo-500 text-white',
    '3º Turno': 'bg-violet-500 text-white',
    'Administrativo': 'bg-slate-500 text-white'
  }
  return cores[turno] || 'bg-gray-500 text-white'
}

/**
 * Retorna cor da badge de fase
 */
function getCorFase(fase: string): string {
  const cores: Record<string, string> = {
    'Planejado': 'bg-slate-500 text-white',
    'Emissão de Dossiê': 'bg-blue-500 text-white',
    'Pesagem': 'bg-cyan-500 text-white',
    'Preparação': 'bg-yellow-500 text-white',
    'Envase': 'bg-orange-500 text-white',
    'Embalagem': 'bg-purple-500 text-white',
    'Concluído': 'bg-green-500 text-white'
  }
  return cores[fase] || 'bg-gray-500 text-white'
}

export default function OperacaoDetalheOP() {
  const navigate = useNavigate()
  const { numeroOP } = useParams<{ numeroOP: string }>()
  const [op, setOP] = useState<OrdemProducao | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (numeroOP) {
      const opEncontrada = carregarOP(numeroOP)
      setOP(opEncontrada)
      setCarregando(false)
    }
  }, [numeroOP])

  // Handlers dos botões de ação (placeholder - serão implementados futuramente)
  const handleApontamento = () => {
    console.log('Apontamento clicado para OP:', numeroOP)
    // TODO: Implementar navegação para tela de apontamento
  }

  const handlePerdas = () => {
    console.log('Perdas clicado para OP:', numeroOP)
    // TODO: Implementar navegação para tela de perdas
  }

  const handleParada = () => {
    console.log('Parada clicado para OP:', numeroOP)
    // TODO: Implementar navegação para tela de parada
  }

  const handleSuporte = () => {
    console.log('Suporte clicado para OP:', numeroOP)
    // TODO: Implementar navegação para tela de suporte
  }

  const handleInsumos = () => {
    console.log('Insumos clicado para OP:', numeroOP)
    // TODO: Implementar navegação para tela de insumos
  }

  const handleDocumentos = () => {
    console.log('Documentos clicado para OP:', numeroOP)
    // TODO: Implementar navegação para tela de documentos
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-muted-foreground">Carregando detalhes da OP...</p>
        </div>
      </div>
    )
  }

  if (!op) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-destructive mx-auto mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">OP Não Encontrada</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            A Ordem de Produção <strong>{numeroOP}</strong> não foi encontrada no sistema.
          </p>
          <Button onClick={() => navigate('/operacao')} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Operação
          </Button>
        </div>
      </div>
    )
  }

  const progresso = calcularProgresso(op.quantidadeEmbaladaUnidades, op.quantidadeTeorica)
  const temPerdas = op.perdas > 0

  return (
    <div className="min-h-screen bg-muted pb-32 sm:pb-28 md:pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 tab-prod:px-2 tab-prod:py-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3 tab-prod:gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/operacao')}
                className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 tab-prod:h-8 tab-prod:w-8"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 tab-prod:h-4 tab-prod:w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-primary sm:text-xl md:text-2xl tab-prod:text-lg">
                  OP {op.op}
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm tab-prod:text-xs tab-prod:mt-0">
                  Detalhes da Ordem de Produção
                </p>
              </div>
            </div>
            <div className="flex gap-1.5 sm:gap-2 tab-prod:gap-1">
              <Badge className={`${getCorSetor(op.setor)} text-xs sm:text-sm tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0`}>
                {op.setor}
              </Badge>
              <Badge className={`${getCorTurno(op.turno)} text-xs sm:text-sm tab-prod:text-xs tab-prod:px-1.5 tab-prod:py-0`}>
                {op.turno}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-5 md:py-6 tab-prod:px-2 tab-prod:py-3">
        {/* Card de Informações Principais */}
        <Card className="mb-4 sm:mb-5 md:mb-6 tab-prod:mb-3">
          <CardHeader className="pb-3 sm:pb-4 tab-prod:pb-2 tab-prod:px-3 tab-prod:pt-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base sm:text-lg md:text-xl tab-prod:text-base">Informações da OP</CardTitle>
              <Badge className={`${getCorFase(op.fase)} text-sm sm:text-base px-3 py-0.5 sm:px-4 sm:py-1 tab-prod:text-xs tab-prod:px-2 tab-prod:py-0.5`}>
                {op.fase}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5 md:space-y-6 tab-prod:space-y-3 tab-prod:px-3 tab-prod:pb-3">
            {/* Grid de Informações Básicas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 tab-prod:gap-2">
              {/* Data de Emissão */}
              <div className="flex items-center gap-2 sm:gap-3 tab-prod:gap-2">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg tab-prod:p-1.5">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary tab-prod:h-4 tab-prod:w-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground tab-prod:text-xs">Data de Emissão</p>
                  <p className="font-semibold text-sm sm:text-base tab-prod:text-sm">{op.dataEmissao}</p>
                </div>
              </div>

              {/* Lote */}
              <div className="flex items-center gap-2 sm:gap-3 tab-prod:gap-2">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg tab-prod:p-1.5">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary tab-prod:h-4 tab-prod:w-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground tab-prod:text-xs">Lote</p>
                  <p className="font-semibold text-sm sm:text-base tab-prod:text-sm">{op.lote}</p>
                </div>
              </div>

              {/* Equipamento/Linha */}
              <div className="flex items-center gap-2 sm:gap-3 tab-prod:gap-2">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg tab-prod:p-1.5">
                  <Factory className="h-4 w-4 sm:h-5 sm:w-5 text-primary tab-prod:h-4 tab-prod:w-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground tab-prod:text-xs">Linha de Produção</p>
                  <p className="font-semibold text-sm sm:text-base tab-prod:text-sm">{op.equipamento}</p>
                </div>
              </div>

              {/* Horas em Operação */}
              <div className="flex items-center gap-2 sm:gap-3 tab-prod:gap-2">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg tab-prod:p-1.5">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary tab-prod:h-4 tab-prod:w-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground tab-prod:text-xs">Horas em Operação</p>
                  <p className="font-semibold text-sm sm:text-base tab-prod:text-sm">{op.horas}</p>
                </div>
              </div>
            </div>

            {/* Produto */}
            <div className="pt-3 sm:pt-4 border-t border-border tab-prod:pt-2">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 tab-prod:text-xs tab-prod:mb-0.5">Produto</p>
              <p className="font-semibold text-base sm:text-lg tab-prod:text-sm tab-prod:leading-tight">{op.produto}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 tab-prod:text-xs tab-prod:mt-0.5">SKU: {op.sku}</p>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Quantidades e Progresso */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6 tab-prod:gap-2 tab-prod:mb-3">
          {/* Quantidade Teórica */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3 tab-prod:pb-2 tab-prod:px-3 tab-prod:pt-3">
              <CardTitle className="text-xs sm:text-sm text-muted-foreground tab-prod:text-xs">Quantidade Teórica</CardTitle>
            </CardHeader>
            <CardContent className="tab-prod:px-3 tab-prod:pb-3">
              <p className="text-2xl sm:text-3xl font-bold text-primary tab-prod:text-xl">{formatarNumero(op.quantidadeTeorica)}</p>
            </CardContent>
          </Card>

          {/* Produzido */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3 tab-prod:pb-2 tab-prod:px-3 tab-prod:pt-3">
              <CardTitle className="text-xs sm:text-sm text-muted-foreground tab-prod:text-xs">Produzido</CardTitle>
            </CardHeader>
            <CardContent className="tab-prod:px-3 tab-prod:pb-3">
              <div className="flex items-center gap-1.5 sm:gap-2 tab-prod:gap-1.5">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 tab-prod:h-5 tab-prod:w-5" />
                <p className="text-2xl sm:text-3xl font-bold text-green-600 tab-prod:text-xl">{formatarNumero(op.quantidadeEmbaladaUnidades)}</p>
              </div>
              <div className="mt-1.5 sm:mt-2 tab-prod:mt-1.5">
                <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1 tab-prod:text-[10px] tab-prod:mb-0.5">
                  <span>Progresso</span>
                  <span>{progresso}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 tab-prod:h-1.5">
                  <div
                    className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all tab-prod:h-1.5"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Perdas */}
          <Card className={temPerdas ? 'border-destructive' : ''}>
            <CardHeader className="pb-2 sm:pb-3 tab-prod:pb-2 tab-prod:px-3 tab-prod:pt-3">
              <CardTitle className="text-xs sm:text-sm text-muted-foreground tab-prod:text-xs">Perdas</CardTitle>
            </CardHeader>
            <CardContent className="tab-prod:px-3 tab-prod:pb-3">
              <div className="flex items-center gap-1.5 sm:gap-2 tab-prod:gap-1.5">
                {temPerdas && <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive tab-prod:h-5 tab-prod:w-5" />}
                <p className={`text-2xl sm:text-3xl font-bold tab-prod:text-xl ${temPerdas ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {formatarNumero(op.perdas)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações Adicionais (se disponíveis) */}
        {(op.dossie || op.anvisa || op.gtin) && (
          <Card>
            <CardHeader className="tab-prod:px-3 tab-prod:pt-3 tab-prod:pb-2">
              <CardTitle className="text-base sm:text-lg tab-prod:text-base">Informações Regulatórias</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 tab-prod:gap-2 tab-prod:px-3 tab-prod:pb-3">
              {op.dossie && (
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground tab-prod:text-xs">Dossiê</p>
                  <p className="font-semibold text-sm sm:text-base tab-prod:text-sm">{op.dossie}</p>
                </div>
              )}
              {op.anvisa && (
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground tab-prod:text-xs">Registro ANVISA</p>
                  <p className="font-semibold text-sm sm:text-base tab-prod:text-sm">{op.anvisa}</p>
                </div>
              )}
              {op.gtin && (
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground tab-prod:text-xs">GTIN</p>
                  <p className="font-semibold text-sm sm:text-base tab-prod:text-sm">{op.gtin}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rodapé Fixo com Botões de Ação */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-30">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 tab-prod:px-2 tab-prod:py-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 tab-prod:gap-1.5">
            {/* Botão Apontamento */}
            <Button
              onClick={handleApontamento}
              className="flex flex-col items-center justify-center h-16 sm:h-18 md:h-20 gap-0.5 sm:gap-1 tab-prod:h-14 tab-prod:gap-0.5"
              variant="outline"
            >
              <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 tab-prod:h-4 tab-prod:w-4" />
              <span className="text-[10px] sm:text-xs tab-prod:text-[9px]">Apontamento</span>
            </Button>

            {/* Botão Perdas */}
            <Button
              onClick={handlePerdas}
              className="flex flex-col items-center justify-center h-16 sm:h-18 md:h-20 gap-0.5 sm:gap-1 tab-prod:h-14 tab-prod:gap-0.5"
              variant="outline"
            >
              <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 tab-prod:h-4 tab-prod:w-4" />
              <span className="text-[10px] sm:text-xs tab-prod:text-[9px]">Perdas</span>
            </Button>

            {/* Botão Parada */}
            <Button
              onClick={handleParada}
              className="flex flex-col items-center justify-center h-16 sm:h-18 md:h-20 gap-0.5 sm:gap-1 tab-prod:h-14 tab-prod:gap-0.5"
              variant="outline"
            >
              <Pause className="h-5 w-5 sm:h-6 sm:w-6 tab-prod:h-4 tab-prod:w-4" />
              <span className="text-[10px] sm:text-xs tab-prod:text-[9px]">Parada</span>
            </Button>

            {/* Botão Suporte */}
            <Button
              onClick={handleSuporte}
              className="flex flex-col items-center justify-center h-16 sm:h-18 md:h-20 gap-0.5 sm:gap-1 tab-prod:h-14 tab-prod:gap-0.5"
              variant="outline"
            >
              <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 tab-prod:h-4 tab-prod:w-4" />
              <span className="text-[10px] sm:text-xs tab-prod:text-[9px]">Suporte</span>
            </Button>

            {/* Botão Insumos */}
            <Button
              onClick={handleInsumos}
              className="flex flex-col items-center justify-center h-16 sm:h-18 md:h-20 gap-0.5 sm:gap-1 tab-prod:h-14 tab-prod:gap-0.5"
              variant="outline"
            >
              <PackageOpen className="h-5 w-5 sm:h-6 sm:w-6 tab-prod:h-4 tab-prod:w-4" />
              <span className="text-[10px] sm:text-xs tab-prod:text-[9px]">Insumos</span>
            </Button>

            {/* Botão Documentos */}
            <Button
              onClick={handleDocumentos}
              className="flex flex-col items-center justify-center h-16 sm:h-18 md:h-20 gap-0.5 sm:gap-1 tab-prod:h-14 tab-prod:gap-0.5"
              variant="outline"
            >
              <FileStack className="h-5 w-5 sm:h-6 sm:w-6 tab-prod:h-4 tab-prod:w-4" />
              <span className="text-[10px] sm:text-xs tab-prod:text-[9px]">Documentos</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

