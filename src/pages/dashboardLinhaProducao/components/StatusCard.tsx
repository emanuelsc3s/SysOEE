type StatusCardProps = {
  status?: string | null;
  criadoEm?: string | null;
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

export function StatusCard({ status, criadoEm }: StatusCardProps) {
  const statusExibicao =
    typeof status === 'string' && status.trim().length > 0 ? status.trim() : 'SEM STATUS';
  const criadoEmExibicao = formatarDataHoraPtBr(criadoEm);

  return (
    <div className="card card-status">
      <h2>STATUS</h2>
      <div className="status-content">
        <div className="s-block">
          <div className="s-highlight blue-text">{statusExibicao}</div>
          <div className="s-small">Em: {criadoEmExibicao}</div>
          <div className="s-timer blue-text">00:01:11</div>
        </div>
        <div className="s-block">
          <div className="s-light-label">Produto</div>
          <div className="s-highlight blue-text">PRODUTO 001</div>
          <div className="s-small s-batch">Lote: <span className="white">123456</span></div>
          <div className="s-small SKU_Status">SKU: <span className="white">000001</span></div>
        </div>
      </div>
    </div>
  );
}
