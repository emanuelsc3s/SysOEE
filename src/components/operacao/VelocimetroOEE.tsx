/**
 * Componente de Velocímetro OEE
 * Exibe o OEE calculado em tempo real em formato de velocímetro
 */

import { useMemo } from 'react'

interface VelocimetroOEEProps {
  /** Valor do OEE em percentual (0-100) */
  oee: number
  /** Meta de OEE para a linha (opcional) */
  meta?: number
  /** Tamanho do velocímetro em pixels */
  size?: number
}

export function VelocimetroOEE({ oee, meta, size = 200 }: VelocimetroOEEProps) {
  // Calcula a cor baseada no valor do OEE
  const cor = useMemo(() => {
    if (oee >= 85) return '#16A34A' // Verde - Excelente
    if (oee >= 70) return '#62a183' // Verde claro - Bom
    if (oee >= 50) return '#ee8b60' // Laranja - Regular
    return '#DC2626' // Vermelho - Ruim
  }, [oee])

  // Calcula o ângulo do ponteiro (0° = 0%, 180° = 100%)
  const angulo = useMemo(() => {
    const percentual = Math.min(Math.max(oee, 0), 100)
    return -90 + (percentual * 1.8) // -90° a 90° (180° total)
  }, [oee])

  const raio = size / 2
  const centro = raio
  const raioArco = raio * 0.7
  const larguraArco = raio * 0.15

  // Calcula o caminho do arco de fundo (semicírculo)
  const caminhoFundo = useMemo(() => {
    const raioExterno = raioArco + larguraArco / 2
    const raioInterno = raioArco - larguraArco / 2
    
    return `
      M ${centro - raioExterno} ${centro}
      A ${raioExterno} ${raioExterno} 0 0 1 ${centro + raioExterno} ${centro}
      L ${centro + raioInterno} ${centro}
      A ${raioInterno} ${raioInterno} 0 0 0 ${centro - raioInterno} ${centro}
      Z
    `
  }, [centro, raioArco, larguraArco])

  // Calcula o caminho do arco de progresso
  const caminhoProgresso = useMemo(() => {
    const percentual = Math.min(Math.max(oee, 0), 100)
    const anguloFim = -90 + (percentual * 1.8)
    const radianos = (anguloFim * Math.PI) / 180
    
    const raioExterno = raioArco + larguraArco / 2
    const raioInterno = raioArco - larguraArco / 2
    
    const xFimExterno = centro + raioExterno * Math.cos(radianos)
    const yFimExterno = centro + raioExterno * Math.sin(radianos)
    const xFimInterno = centro + raioInterno * Math.cos(radianos)
    const yFimInterno = centro + raioInterno * Math.sin(radianos)
    
    const largeArcFlag = percentual > 50 ? 1 : 0
    
    return `
      M ${centro - raioExterno} ${centro}
      A ${raioExterno} ${raioExterno} 0 ${largeArcFlag} 1 ${xFimExterno} ${yFimExterno}
      L ${xFimInterno} ${yFimInterno}
      A ${raioInterno} ${raioInterno} 0 ${largeArcFlag} 0 ${centro - raioInterno} ${centro}
      Z
    `
  }, [centro, raioArco, larguraArco, oee])

  // Calcula a posição do ponteiro
  const ponteiro = useMemo(() => {
    const radianos = (angulo * Math.PI) / 180
    const comprimento = raioArco - larguraArco
    const xFim = centro + comprimento * Math.cos(radianos)
    const yFim = centro + comprimento * Math.sin(radianos)
    
    return { x: xFim, y: yFim }
  }, [angulo, centro, raioArco, larguraArco])

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
        {/* Arco de fundo (cinza) */}
        <path
          d={caminhoFundo}
          fill="#E5E7EB"
        />
        
        {/* Arco de progresso (colorido) */}
        <path
          d={caminhoProgresso}
          fill={cor}
        />
        
        {/* Marcações de percentual */}
        {[0, 25, 50, 75, 100].map((valor) => {
          const anguloMarca = -90 + (valor * 1.8)
          const radianos = (anguloMarca * Math.PI) / 180
          const raioMarca = raioArco + larguraArco / 2 + 10
          const x = centro + raioMarca * Math.cos(radianos)
          const y = centro + raioMarca * Math.sin(radianos)
          
          return (
            <text
              key={valor}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-600 font-medium"
            >
              {valor}%
            </text>
          )
        })}
        
        {/* Ponteiro */}
        <line
          x1={centro}
          y1={centro}
          x2={ponteiro.x}
          y2={ponteiro.y}
          stroke="#1F2937"
          strokeWidth={3}
          strokeLinecap="round"
        />
        
        {/* Centro do ponteiro */}
        <circle
          cx={centro}
          cy={centro}
          r={6}
          fill="#1F2937"
        />
        
        {/* Valor do OEE */}
        <text
          x={centro}
          y={centro + 30}
          textAnchor="middle"
          className="text-3xl font-bold fill-gray-900"
        >
          {oee.toFixed(2)}%
        </text>
        
        {/* Label OEE */}
        <text
          x={centro}
          y={centro + 50}
          textAnchor="middle"
          className="text-sm fill-gray-600 font-medium"
        >
          OEE Real
        </text>
      </svg>
      
      {/* Meta (se fornecida) */}
      {meta !== undefined && (
        <div className="text-sm text-gray-600">
          Meta: <span className="font-semibold text-gray-900">{meta.toFixed(2)}%</span>
        </div>
      )}
    </div>
  )
}

