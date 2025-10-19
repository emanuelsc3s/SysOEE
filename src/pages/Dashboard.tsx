/**
 * Página Dashboard - Visualização de OEE e gráficos principais
 * Placeholder para implementação futura
 */
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-4">Dashboard</h1>
        <div className="bg-card rounded-lg p-6 border border-border">
          <p className="text-muted-foreground">
            Página em desenvolvimento. Aqui serão exibidos os 8 gráficos obrigatórios:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Velocímetro de OEE</li>
            <li>Pareto de Paradas</li>
            <li>Componentes do OEE</li>
            <li>Tabela Consolidada</li>
            <li>Rosca Planejadas vs Não Planejadas</li>
            <li>Resumo de Horas Totais</li>
            <li>Histórico de Tendências</li>
            <li>MTBF e MTTR</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

