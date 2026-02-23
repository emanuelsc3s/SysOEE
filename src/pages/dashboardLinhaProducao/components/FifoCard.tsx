export function FifoCard() {
  return (
    <div className="card card-fifo">
      <h2>ÚLTIMOS LOTES</h2>
      <div className="fifo-list">
        <div className="fifo-item"><span className="f-num">1</span><div className="f-info">123456 | 001<br /><b>PRODUTO 1</b></div><div className="f-val">329.5h</div></div>
        <div className="fifo-item"><span className="f-num">2</span><div className="f-info">234567 | 002<br /><b>PRODUTO 2</b></div><div className="f-val">185.5h</div></div>
        <div className="fifo-item"><span className="f-num">3</span><div className="f-info">345678 | 003<br /><b>PRODUTO 3</b></div><div className="f-val">89.5h</div></div>
      </div>
    </div>
  );
}
