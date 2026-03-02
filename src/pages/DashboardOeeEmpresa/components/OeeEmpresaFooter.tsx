import type { PeriodoOeeEmpresa } from '../types'

type OeeEmpresaFooterProps = {
  periodo: PeriodoOeeEmpresa
  tituloLinha: string
  percentualOee: number
}

const formatarPercentual = (valor: number): string =>
  valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export function OeeEmpresaFooter({
  periodo,
  tituloLinha,
  percentualOee,
}: OeeEmpresaFooterProps) {
  return (
    <div className="oee-empresa-footer">
      <div className="footer-line">
        Período: {periodo.inicio} — {periodo.fim} &nbsp;·&nbsp; Linha: {tituloLinha} &nbsp;·&nbsp; OEE
        Global: {formatarPercentual(percentualOee)}%
      </div>
    </div>
  )
}
