export type ParetoCardItem = {
  parada: string;
  quantidade: number;
  tempoParadaHoras: string;
  percentual: number;
  percentualAcumulado: number;
};

type ParetoCardProps = {
  itens: ParetoCardItem[];
  statusTexto?: string;
  mensagemVazia?: string;
};

const formatadorPercentual = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const limitarPercentual = (valor: number): number => {
  if (!Number.isFinite(valor)) {
    return 0;
  }

  return Math.min(Math.max(valor, 0), 100);
};

export function ParetoCard({ itens, statusTexto, mensagemVazia }: ParetoCardProps) {
  return (
    <div className="card card-pareto">
      <h2>
        PARADAS
        {statusTexto ? <span className="subtitle subtitle-right">{statusTexto}</span> : null}
      </h2>

      {itens.length === 0 ? (
        <div className="pareto-empty">{mensagemVazia || 'Sem paradas grandes no período.'}</div>
      ) : (
        <div className="pareto-list">
          {itens.map((item, indice) => {
            const percentualBarra = limitarPercentual(item.percentual);
            const percentualFormatado = formatadorPercentual.format(limitarPercentual(item.percentual));
            const horasFormatadas = (item.tempoParadaHoras || '').trim() || '0:00';
            const parada = (item.parada || '').trim() || 'Parada não informada';

            return (
              <div
                key={`${parada}-${indice}`}
                className="pareto-item"
                title={`${parada}: ${horasFormatadas}h (${percentualFormatado}%)`}
              >
                <div
                  className="p-label"
                  style={{
                    background: `linear-gradient(90deg, var(--p-label-bg) ${percentualBarra}%, transparent ${percentualBarra}%)`,
                  }}
                >
                  {parada.toLocaleUpperCase('pt-BR')}
                </div>
                <div className="p-val1">{horasFormatadas}</div>
                <div className="p-val2">{percentualFormatado}%</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
