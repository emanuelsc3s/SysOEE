export function TimelineFooter() {
  return (
    <footer className="footer-timeline">
      <div className="timeline-labels">
        <div className="t-block" style={{ width: '30%' }}>
          <div className="t-l1">LOTE 120392</div>
          <div className="t-l2 green-text">PRODUTO 001</div>
          <div className="t-r1">PRODUZIDO</div>
          <div className="t-r2">100.000</div>
        </div>
        <div className="t-block" style={{ width: '25%' }}>
          <div className="t-l1">LOTE 3019304</div>
          <div className="t-l2 green-text">PRODUTO 002</div>
          <div className="t-r1">PRODUZIDO</div>
          <div className="t-r2">210.000</div>
        </div>
        <div className="t-block" style={{ width: '20%' }}>
          <div className="t-l1">LOTE 1797983</div>
          <div className="t-l2 green-text">PRODUTO 003</div>
          <div className="t-r1">PRODUZIDO</div>
          <div className="t-r2">62.345</div>
        </div>
        <div className="t-block" style={{ width: '15%' }}>
          <div className="t-l1">LOTE...</div>
          <div className="t-l2 green-text">PRODUTO 0...</div>
          <div className="t-r1">PROD...</div>
          <div className="t-r2">24...</div>
        </div>
      </div>
      <div className="timeline-track">
        <div className="tl-segment green-fill" style={{ width: '15%' }}></div>
        <div className="tl-segment red-fill" style={{ width: '8%' }}></div>
        <div className="tl-segment green-fill" style={{ width: '22%' }}></div>
        <div className="tl-segment red-fill" style={{ width: '5%' }}></div>
        <div className="tl-segment green-fill" style={{ width: '15%' }}></div>
        <div className="tl-segment blue-fill" style={{ width: '3%' }}></div>
        <div className="tl-segment green-fill" style={{ width: '20%' }}></div>
        <div className="tl-segment blue-fill" style={{ width: '2%' }}></div>
        <div className="tl-segment red-fill" style={{ width: '5%' }}></div>
        <div className="tl-segment green-fill" style={{ width: '5%' }}></div>
      </div>
      <div className="timeline-times">
        <span>15:24</span><span>16:00</span><span>17:00</span><span>18:00</span><span>19:00</span><span>20:00</span><span>21:00</span><span>22:00</span><span>23:00</span><span>0:00</span><span>1:00</span><span>2:00</span><span>3:00</span><span>4:00</span><span>5:00</span><span>6:00</span><span>7:00</span><span>8:00</span><span>9:00</span><span>10:00</span><span>11:00</span><span>12:00</span><span>13:00</span><span>14:00</span><span>15:24</span>
      </div>
      <div className="timeline-legend">
        <div className="lg-item"><span className="lg-dot green-fill"></span> PRODUZINDO</div>
        <div className="lg-item"><span className="lg-dot red-fill"></span> PARADA</div>
        <div className="lg-item"><span className="lg-dot blue-fill"></span> SETUP</div>
        <div className="lg-item"><span className="lg-dot yellow-fill"></span> MANUTENÇÃO</div>
        <div className="lg-item"><span className="lg-dot gray-fill"></span> INDISPONÍVEL</div>
        <div className="lg-item"><span className="lg-dot white-fill"></span> SEM APONTAMENTO</div>
      </div>
    </footer>
  );
}
