import type { PeriodoOeeEmpresa } from '../types'

type OeeEmpresaHeaderProps = {
  rotuloDashboard: string
  tituloLinha: string
  periodo: PeriodoOeeEmpresa
}

export function OeeEmpresaHeader({
  rotuloDashboard,
  tituloLinha,
  periodo,
}: OeeEmpresaHeaderProps) {
  return (
    <header>
      <div className="brand">
        <div className="brand-label">{rotuloDashboard}</div>
        <div className="brand-title">{tituloLinha}</div>
      </div>
      <div className="period-badge">
        <div className="dot" />
        <span>
          <strong>{periodo.inicio}</strong> &nbsp;→&nbsp; <strong>{periodo.fim}</strong>
        </span>
      </div>
    </header>
  )
}
