/**
 * SICFAR OEE - Design System Premium
 * OEE Card - Versão Standalone (Preview)
 * Fonte: Inter | Versão 1.1
 * 
 * TYPE SCALE INTER:
 * text-display   → 32px, semibold (600), tracking-tight (-0.025em)
 * text-h1        → 28px, semibold (600), tracking-tight (-0.025em)
 * text-h2        → 26px, semibold (600), -0.02em
 * text-h3        → 24px, medium (500), -0.02em
 * text-body-lg   → 18px, medium (500), -0.01em
 * text-body      → 15px, normal (400), normal
 * text-body-sm   → 13px, normal (400), normal
 * text-caption   → 12px, normal (400), normal
 * text-micro     → 11px, normal (400), 0.02em
 * text-tiny      → 10px, medium (500), 0.05em, uppercase
 */

import React from 'react'

// Função cn standalone (substitui @/lib/utils)
const cn = (...classes: (string | boolean | undefined)[]) => 
  classes.filter(Boolean).join(' ')

// Estilos inline para tipografia Inter
const typography = {
  display: { fontSize: '32px', fontWeight: 600, letterSpacing: '-0.025em' },
  h1: { fontSize: '28px', fontWeight: 600, letterSpacing: '-0.025em' },
  h2: { fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em' },
  h3: { fontSize: '24px', fontWeight: 500, letterSpacing: '-0.02em' },
  bodyLg: { fontSize: '18px', fontWeight: 500, letterSpacing: '-0.01em' },
  body: { fontSize: '15px', fontWeight: 400, letterSpacing: 'normal' },
  bodySm: { fontSize: '13px', fontWeight: 400, letterSpacing: 'normal' },
  caption: { fontSize: '12px', fontWeight: 400, letterSpacing: 'normal' },
  micro: { fontSize: '11px', fontWeight: 400, letterSpacing: '0.02em' },
  tiny: { fontSize: '10px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' as const },
}

// Cores do Design System
const colors = {
  bgPrimary: '#0a0a0c',
  success: '#34d399',
  warning: '#fbbf24',
  critical: '#f87171',
  blue: '#60a5fa',
  purple: '#a78bfa',
  metricDisponibilidade: 'rgba(96, 165, 250, 0.8)',
  metricPerformance: 'rgba(74, 222, 128, 0.8)',
  metricQualidade: 'rgba(251, 191, 36, 0.8)',
}

interface OEECardProps {
  title: string
  oeeValue: number
  disponibilidade: number
  performance: number
  qualidade: number
  unidadesProduzidas: number
  unidadesPerdas: number
  unidadesBoas: number
}

// Função para determinar a cor do OEE
const getOEEStatus = (value: number) => {
  if (value >= 80) return { stroke: colors.success, glow: 'rgba(52, 211, 153, 0.15)' }
  if (value >= 60) return { stroke: colors.warning, glow: 'rgba(251, 191, 36, 0.15)' }
  return { stroke: colors.critical, glow: 'rgba(248, 113, 113, 0.15)' }
}

// Componente de Gauge Circular
const CircularGauge = ({ value, size = 120 }: { value: number; size?: number }) => {
  const status = getOEEStatus(value)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Glow effect */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 90,
        height: 90,
        borderRadius: '50%',
        background: status.glow,
        filter: 'blur(20px)',
      }} />
      
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={status.stroke}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      
      {/* Center text - text-h2 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <span style={{ ...typography.h2, color: '#fff' }}>
          {value.toFixed(1).replace('.', ',')}
          <span style={{ ...typography.bodySm, fontWeight: 400, color: 'rgba(255,255,255,0.3)', marginLeft: 2 }}>%</span>
        </span>
      </div>
    </div>
  )
}

// Componente de Stat Item
const StatItem = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
    {/* Label - text-caption */}
    <span style={{ ...typography.caption, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      {/* Value - text-body-lg */}
      <span style={{ ...typography.bodyLg, color }}>{value.toLocaleString('pt-BR')}</span>
      {/* Unit - text-micro */}
      <span style={{ ...typography.micro, color: 'rgba(255,255,255,0.3)' }}>un</span>
    </div>
  </div>
)

// Componente de Progress Bar
const MetricBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      {/* Label - text-caption */}
      <span style={{ ...typography.caption, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      {/* Value - text-body-sm + medium */}
      <span style={{ ...typography.bodySm, fontWeight: 500, color: '#fff' }}>
        {value.toFixed(2).replace('.', ',')}%
      </span>
    </div>
    <div style={{
      height: 4,
      background: 'rgba(255,255,255,0.04)',
      borderRadius: 2,
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${value}%`,
        height: '100%',
        background: color,
        borderRadius: 2,
        transition: 'width 0.7s ease-out',
      }} />
    </div>
  </div>
)

// Card Principal
function OEECard({
  title,
  oeeValue,
  disponibilidade,
  performance,
  qualidade,
  unidadesProduzidas,
  unidadesPerdas,
  unidadesBoas,
}: OEECardProps) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      backdropFilter: 'blur(20px)',
      borderRadius: 24,
      padding: 28,
      border: '1px solid rgba(255,255,255,0.06)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Header - text-body-sm */}
      <h3 style={{ ...typography.bodySm, color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 1.5 }}>
        {title}
      </h3>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
        <CircularGauge value={oeeValue} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
          <StatItem label="Produzidas" value={unidadesProduzidas} color="rgba(96,165,250,0.9)" />
          <StatItem label="Aprovadas" value={unidadesBoas} color="rgba(52,211,153,0.9)" />
          <StatItem 
            label="Perdas" 
            value={unidadesPerdas} 
            color={unidadesPerdas > 0 ? 'rgba(248,113,113,0.9)' : 'rgba(255,255,255,0.3)'} 
          />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />

      {/* Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <MetricBar label="Disponibilidade" value={disponibilidade} color={colors.metricDisponibilidade} />
        <MetricBar label="Performance" value={performance} color={colors.metricPerformance} />
        <MetricBar label="Qualidade" value={qualidade} color={colors.metricQualidade} />
      </div>
    </div>
  )
}

// Summary Card
function SummaryCard({ label, value, unit, accentColor }: { label: string; value: string; unit: string; accentColor?: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      borderRadius: 16,
      padding: 24,
      border: '1px solid rgba(255,255,255,0.04)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Label - text-caption */}
      <p style={{ ...typography.caption, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        {/* Value - text-h1 */}
        <span style={{ ...typography.h1, color: accentColor || '#fff' }}>{value}</span>
        {/* Unit - text-body-sm */}
        <span style={{ ...typography.bodySm, color: 'rgba(255,255,255,0.3)' }}>{unit}</span>
      </div>
    </div>
  )
}

// Dashboard Completo
export default function OEEDashboard() {
  const cards = [
    { title: "SPEP 2 - LINHA D - EMBALAGEM - ESTEIRA 8", oeeValue: 84.50, disponibilidade: 84.72, performance: 100.00, qualidade: 99.74, unidadesProduzidas: 3918, unidadesPerdas: 0, unidadesBoas: 3918 },
    { title: "SPEP 3 - LINHA I - ENVASE", oeeValue: 56.53, disponibilidade: 88.06, performance: 64.25, qualidade: 99.92, unidadesProduzidas: 2450, unidadesPerdas: 12, unidadesBoas: 2438 },
    { title: "CPHD - LINHA A", oeeValue: 56.29, disponibilidade: 90.28, performance: 62.36, qualidade: 100.00, unidadesProduzidas: 1876, unidadesPerdas: 0, unidadesBoas: 1876 },
    { title: "SPPV - VIDRO 6 - EMBALAGEM", oeeValue: 53.52, disponibilidade: 77.78, performance: 73.49, qualidade: 93.63, unidadesProduzidas: 5240, unidadesPerdas: 334, unidadesBoas: 4906 },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bgPrimary,
      padding: 48,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Gradient overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(ellipse at top, rgba(96,165,250,0.03) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />
      
      <div style={{ position: 'relative', maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            {/* Breadcrumb - text-tiny */}
            <span style={{ ...typography.tiny, color: 'rgba(255,255,255,0.4)' }}>Farmace</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
            <span style={{ ...typography.tiny, color: 'rgba(255,255,255,0.4)' }}>SICFAR OEE</span>
          </div>
          {/* Title - text-display */}
          <h1 style={{ ...typography.display, color: '#fff', margin: 0 }}>Dashboard de Eficiência</h1>
          {/* Subtitle - text-body */}
          <p style={{ ...typography.body, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
            Monitoramento em tempo real das linhas de produção
          </p>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
          <SummaryCard label="Total Produzido" value="13.484" unit="unidades" />
          <SummaryCard label="Aprovadas" value="13.138" unit="unidades" accentColor={colors.success} />
          <SummaryCard label="Perdas" value="346" unit="unidades" accentColor={colors.warning} />
          <SummaryCard label="OEE Médio" value="62,7" unit="%" accentColor={colors.purple} />
        </div>

        {/* OEE Cards Grid - 4 por linha */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {cards.map((card, i) => <OEECard key={i} {...card} />)}
        </div>
      </div>
    </div>
  )
}
