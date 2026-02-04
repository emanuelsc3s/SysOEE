/**
 * DashboardOEE - Página principal do Dashboard de Eficiência
 * SICFAR OEE - Design System Premium
 */

import { OEECard, SummaryCard } from './components'
import { useDashboardOEE } from './hooks'
import { OEE_COLORS } from './constants/oee-theme'

export default function DashboardOEE() {
  const { cards, totals, isLoading } = useDashboardOEE()

  // Formata números para exibição (pt-BR com separador de milhar)
  const formatNumber = (num: number) => num.toLocaleString('pt-BR')
  const formatOEE = (num: number) => num.toFixed(1).replace('.', ',')

  return (
    <div
      className="min-h-screen p-12 font-sans"
      style={{ background: OEE_COLORS.bgPrimary }}
    >
      {/* Overlay de gradiente sutil */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(96,165,250,0.03) 0%, transparent 50%)',
        }}
      />

      <div className="relative max-w-[1400px] mx-auto">
        {/* Header */}
        <header className="mb-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-4 mb-2">
            <span className="text-[10px] font-medium tracking-[0.05em] uppercase text-white/40">
              Farmace
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-[10px] font-medium tracking-[0.05em] uppercase text-white/40">
              SICFAR OEE
            </span>
          </div>

          {/* Título */}
          <h1 className="text-[32px] font-semibold tracking-tight text-white">
            Dashboard de Eficiência
          </h1>

          {/* Subtítulo */}
          <p className="text-[15px] text-white/40 mt-2">
            Monitoramento em tempo real das linhas de produção
          </p>
        </header>

        {/* Cards de resumo */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <SummaryCard
            label="Total Produzido"
            value={formatNumber(totals.totalProduzido)}
            unit="unidades"
          />
          <SummaryCard
            label="Aprovadas"
            value={formatNumber(totals.totalAprovadas)}
            unit="unidades"
            accentColor="success"
          />
          <SummaryCard
            label="Perdas"
            value={formatNumber(totals.totalPerdas)}
            unit="unidades"
            accentColor="warning"
          />
          <SummaryCard
            label="OEE Médio"
            value={formatOEE(totals.oeeMedia)}
            unit="%"
            accentColor="purple"
          />
        </div>

        {/* Grid de cards OEE */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-white/40">Carregando...</div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-5">
            {cards.map((card, index) => (
              <OEECard key={index} {...card} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
