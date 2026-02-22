export function StatusCard() {
  return (
    <div className="card card-status">
      <h2>STATUS</h2>
      <div className="status-content">
        <div className="s-block">
          <div className="s-highlight blue-text">01 - PRODUCING</div>
          <div className="s-small">Started 02/08/2022 13:35:37</div>
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
