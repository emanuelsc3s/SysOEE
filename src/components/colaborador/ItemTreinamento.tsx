/**
 * Componente ItemTreinamento
 * Exibe um treinamento em formato card (mobile) ou linha de tabela (desktop)
 */

import { Treinamento, STATUS_TREINAMENTO_CONFIG, calcularDiasVencimento } from '@/types/colaborador'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, Clock, Award, Download, Info } from 'lucide-react'
import { useState } from 'react'

interface ItemTreinamentoProps {
  treinamento: Treinamento
  /** Modo de exibição: 'card' para mobile, 'table' para desktop */
  modo?: 'card' | 'table'
}

/**
 * Formata data ISO para formato brasileiro
 */
function formatarData(dataISO?: string): string {
  if (!dataISO) return 'N/A'
  
  try {
    const data = new Date(dataISO)
    return data.toLocaleDateString('pt-BR')
  } catch {
    return 'N/A'
  }
}

export default function ItemTreinamento({ treinamento, modo = 'card' }: ItemTreinamentoProps) {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false)
  const config = STATUS_TREINAMENTO_CONFIG[treinamento.status]
  const diasVencimento = calcularDiasVencimento(treinamento.dataValidade)

  /**
   * Abre o certificado em nova aba
   */
  const handleVerCertificado = () => {
    if (treinamento.certificadoUrl) {
      window.open(treinamento.certificadoUrl, '_blank')
    }
  }

  /**
   * Navega para detalhes do PO (placeholder)
   */
  const handleVerDetalhesPO = () => {
    // TODO: Implementar navegação para rota de detalhes do PO
    console.log('Navegar para detalhes do PO:', treinamento.codigoPO)
  }

  // Renderização em modo CARD (mobile)
  if (modo === 'card') {
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          {/* Cabeçalho do Card */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {treinamento.codigoPO}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {treinamento.tituloPO}
              </p>
            </div>
            <Badge className={config.badgeClass}>
              {treinamento.status}
            </Badge>
          </div>

          {/* Informações Principais */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Versão: {treinamento.versao}</span>
            </div>

            {treinamento.dataConclusao && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Concluído em: {formatarData(treinamento.dataConclusao)}</span>
              </div>
            )}

            {treinamento.dataValidade && (
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <span className={diasVencimento.vencido ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                  {diasVencimento.texto}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-muted-foreground">
              <Award className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Carga horária: {treinamento.cargaHoraria}h</span>
            </div>
          </div>

          {/* Botão Ver Mais (colapsa detalhes adicionais) */}
          {!mostrarDetalhes && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-xs"
              onClick={() => setMostrarDetalhes(true)}
            >
              Ver mais detalhes
            </Button>
          )}

          {/* Detalhes Adicionais (colapsável) */}
          {mostrarDetalhes && (
            <div className="mt-3 pt-3 border-t space-y-2">
              {treinamento.dataValidade && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Validade: </span>
                  <span className="font-medium">{formatarData(treinamento.dataValidade)}</span>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={handleVerDetalhesPO}
                >
                  <Info className="h-3.5 w-3.5 mr-1" />
                  Detalhes do PO
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={handleVerCertificado}
                  disabled={!treinamento.certificadoUrl}
                  title={!treinamento.certificadoUrl ? 'Certificado não disponível' : 'Ver certificado'}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Certificado
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setMostrarDetalhes(false)}
              >
                Ver menos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Renderização em modo TABLE (desktop)
  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      {/* Código do PO */}
      <td className="px-4 py-3 text-sm font-medium text-foreground">
        {treinamento.codigoPO}
      </td>

      {/* Título do PO */}
      <td className="px-4 py-3 text-sm text-foreground max-w-xs">
        <div className="truncate" title={treinamento.tituloPO}>
          {treinamento.tituloPO}
        </div>
      </td>

      {/* Versão */}
      <td className="px-4 py-3 text-sm text-muted-foreground text-center">
        {treinamento.versao}
      </td>

      {/* Status */}
      <td className="px-4 py-3 text-sm text-center">
        <Badge className={config.badgeClass}>
          {treinamento.status}
        </Badge>
      </td>

      {/* Data de Conclusão */}
      <td className="px-4 py-3 text-sm text-muted-foreground text-center">
        {formatarData(treinamento.dataConclusao)}
      </td>

      {/* Dias Restantes/Vencidos */}
      <td className="px-4 py-3 text-sm text-center">
        <span className={diasVencimento.vencido ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
          {diasVencimento.texto}
        </span>
      </td>

      {/* Carga Horária */}
      <td className="px-4 py-3 text-sm text-muted-foreground text-center">
        {treinamento.cargaHoraria}h
      </td>

      {/* Ações */}
      <td className="px-4 py-3 text-sm">
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleVerDetalhesPO}
            title="Ver detalhes do PO"
          >
            <Info className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleVerCertificado}
            disabled={!treinamento.certificadoUrl}
            title={!treinamento.certificadoUrl ? 'Certificado não disponível' : 'Ver certificado'}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

