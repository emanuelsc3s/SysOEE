/**
 * Componente de Componentes do OEE
 * Exibe Disponibilidade, Performance e Qualidade em formato de barras horizontais
 */

interface ComponentesOEEProps {
  /** Disponibilidade em percentual (0-100) */
  disponibilidade: number
  /** Performance em percentual (0-100) */
  performance: number
  /** Qualidade em percentual (0-100) */
  qualidade: number
}

export function ComponentesOEE({ disponibilidade, performance, qualidade }: ComponentesOEEProps) {
  const componentes = [
    {
      label: 'Disponibilidade',
      valor: disponibilidade,
      cor: '#3B82F6', // Azul
      bgCor: '#DBEAFE'
    },
    {
      label: 'Produtividade',
      valor: performance,
      cor: '#62a183', // Verde (brand secondary)
      bgCor: '#D1FAE5'
    },
    {
      label: 'Qualidade',
      valor: qualidade,
      cor: '#8B5CF6', // Roxo
      bgCor: '#EDE9FE'
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">OEE Real</h3>
      
      {componentes.map((componente) => (
        <div key={componente.label} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {componente.label}
            </span>
            <span className="text-sm font-bold text-gray-900">
              {componente.valor.toFixed(2)}%
            </span>
          </div>
          
          <div className="relative w-full h-8 rounded-md overflow-hidden" style={{ backgroundColor: componente.bgCor }}>
            <div
              className="absolute top-0 left-0 h-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(Math.max(componente.valor, 0), 100)}%`,
                backgroundColor: componente.cor
              }}
            />
            
            {/* Linha de meta (85%) */}
            <div
              className="absolute top-0 h-full w-0.5 bg-gray-900 opacity-30"
              style={{ left: '85%' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

