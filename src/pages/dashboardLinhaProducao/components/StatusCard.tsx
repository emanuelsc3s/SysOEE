type StatusCardProps = {
  status?: string | null;
  criadoEm?: string | null;
  produto?: string | null;
  lote?: string | null;
};

const formatarDataHoraPtBr = (valor?: string | null): string => {
  if (typeof valor !== 'string' || valor.trim().length === 0) {
    return '--';
  }

  const texto = valor.trim();
  const data = new Date(texto);

  if (!Number.isFinite(data.getTime())) {
    return texto;
  }

  const dataFormatada = data.toLocaleDateString('pt-BR');
  const horaFormatada = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return `${dataFormatada} ${horaFormatada}`;
};

export function StatusCard({ status, criadoEm, produto, lote }: StatusCardProps) {
  const statusExibicao =
    typeof status === 'string' && status.trim().length > 0 ? status.trim() : 'SEM STATUS';
  const criadoEmExibicao = formatarDataHoraPtBr(criadoEm);
  const produtoExibicao =
    typeof produto === 'string' && produto.trim().length > 0 ? produto.trim() : 'PRODUTO N/I';
  const loteExibicao =
    typeof lote === 'string' && lote.trim().length > 0 ? lote.trim() : '--';

  return (
    <div className="card card-status">
      <h2>STATUS</h2>
      <div className="status-content">
        <div className="s-block">
          <div className="s-highlight blue-text">{statusExibicao}</div>
          <div className="s-small">Em: {criadoEmExibicao}</div>
        </div>
        <div className="s-block">
          <div className="s-light-label">Produto</div>
          <div className="s-highlight s-highlight-product blue-text">{produtoExibicao}</div>
          <div className="s-light-label">Lote</div>
          <div className="s-highlight blue-text">{loteExibicao}</div>
        </div>
      </div>
    </div>
  );
}
