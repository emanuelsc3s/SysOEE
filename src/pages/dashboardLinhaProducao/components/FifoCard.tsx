export type FifoCardItem = {
  lote: string;
  produto: string;
  produtoId?: string | null;
  quantidadeProduzida: number;
};

type FifoCardProps = {
  itens: FifoCardItem[];
  statusTexto?: string;
  mensagemVazia?: string;
};

const formatadorQuantidade = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatarQuantidade = (valor: number): string => {
  const quantidade = Number.isFinite(valor) ? Math.max(0, valor) : 0;
  return `${formatadorQuantidade.format(quantidade)} un`;
};

export function FifoCard({ itens, statusTexto, mensagemVazia }: FifoCardProps) {
  return (
    <div className="card card-fifo">
      <h2>
        ÚLTIMOS LOTES
        {statusTexto ? <span className="subtitle subtitle-right">{statusTexto}</span> : null}
      </h2>

      {itens.length === 0 ? (
        <div className="pareto-empty">{mensagemVazia || 'Sem lotes no período.'}</div>
      ) : (
        <div className="fifo-list">
          {itens.map((item, indice) => {
            const lote = (item.lote || '').trim() || 'Lote não informado';
            const produto = (item.produto || '').trim() || 'Produto não informado';
            const quantidadeFormatada = formatarQuantidade(item.quantidadeProduzida);

            return (
              <div
                key={`${lote}-${produto}-${indice}`}
                className="fifo-item"
                title={`${lote} · ${produto} · ${quantidadeFormatada}`}
              >
                <span className="f-num">{indice + 1}</span>
                <div className="f-info">
                  <span className="f-produto">{produto.toLocaleUpperCase('pt-BR')}</span>
                  <b>{lote}</b>
                </div>
                <div className="f-val">{quantidadeFormatada}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
