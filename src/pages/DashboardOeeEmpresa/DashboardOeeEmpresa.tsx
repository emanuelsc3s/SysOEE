import { DASHBOARD_OEE_EMPRESA_DATA } from './constants/dashboardOeeEmpresa.data'
import { OeeEmpresaHeader } from './components/OeeEmpresaHeader'
import { OeeHeroSection } from './components/OeeHeroSection'
import { OeeRingCard } from './components/OeeRingCard'
import { OeeKpiTriplet } from './components/OeeKpiTriplet'
import { OeeTimeDistribution } from './components/OeeTimeDistribution'
import { OeeHoursGrid } from './components/OeeHoursGrid'
import { OeeProductionLosses } from './components/OeeProductionLosses'
import { OeeEmpresaFooter } from './components/OeeEmpresaFooter'
import { useTheme } from '@/hooks/useTheme'
import './DashboardOeeEmpresa.css'

export default function DashboardOeeEmpresa() {
  const { theme } = useTheme()
  const data = DASHBOARD_OEE_EMPRESA_DATA

  return (
    <div className="dashboard-oee-empresa-page" data-theme={theme}>
      <div className="wrapper">
        <OeeEmpresaHeader
          rotuloDashboard={data.rotuloDashboard}
          tituloLinha={data.tituloLinha}
          periodo={data.periodo}
        />

        <div className="oee-hero">
          <OeeHeroSection
            percentualOee={data.oeeGlobal.percentual}
            descricao={data.oeeGlobal.descricao}
            indicadores={data.indicadoresHero}
          />
          <OeeRingCard
            arcos={data.ring.arcos}
            legenda={data.ring.legenda}
            percentualCentro={data.oeeGlobal.percentual}
          />
        </div>

        <OeeKpiTriplet kpis={data.kpis} />
        <OeeTimeDistribution segmentos={data.distribuicaoHoras} />
        <OeeHoursGrid horas={data.horasPeriodo} />
        <OeeProductionLosses producao={data.producao} perdas={data.perdas} />

        <OeeEmpresaFooter
          periodo={data.periodo}
          tituloLinha={data.tituloLinha}
          percentualOee={data.oeeGlobal.percentual}
        />
      </div>
    </div>
  )
}
