const CLASSES_TIMELINE_SUPORTADAS = new Set([
  'green-fill',
  'red-fill',
  'yellow-fill',
  'gray-fill',
  'white-fill',
]);

const formatadorQuantidadeTimeline = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

export type TimelineFooterSegmento = {
  inicio: string;
  fim: string;
  inicioHora: string;
  fimHora: string;
  duracaoMinutos: number;
  larguraPct: number;
  statusTimeline: string;
  classeCss: string;
  oeeturnoId: string | null;
  produto: string;
};

export type TimelineFooterLote = {
  lote: string;
  produto: string;
  produzido: number;
  inicio: string;
  fim: string;
  inicioHora: string;
  fimHora: string;
  duracaoMinutos: number;
  larguraPct: number;
};

type TimelineFooterProps = {
  timelineTimes?: string[];
  segmentos?: TimelineFooterSegmento[];
  lotes?: TimelineFooterLote[];
  statusTexto?: string;
  mensagemVazia?: string;
};

const limitarPercentual = (valor: number): number =>
  Number.isFinite(valor) ? Math.min(Math.max(valor, 0), 100) : 0;

const obterClasseSegmento = (classeCss?: string): string =>
  classeCss && CLASSES_TIMELINE_SUPORTADAS.has(classeCss) ? classeCss : 'white-fill';

const normalizarRotuloLote = (lote: string): string => {
  const valor = lote.trim();
  if (!valor) {
    return 'LOTE N/I';
  }

  const valorMaiusculo = valor.toLocaleUpperCase('pt-BR');
  return valorMaiusculo.startsWith('LOTE ') ? valorMaiusculo : `LOTE ${valorMaiusculo}`;
};

const truncarTexto = (valor: string, maximo: number): string => {
  const texto = valor.trim();
  if (texto.length <= maximo) {
    return texto;
  }

  return `${texto.slice(0, Math.max(maximo - 3, 1))}...`;
};

const resolverTextoPlaceholder = (
  statusTexto?: string,
  mensagemVazia?: string,
): { lote: string; produto: string; detalhe: string } => {
  const detalhe =
    mensagemVazia && mensagemVazia.trim().length > 0
      ? mensagemVazia.trim().toLocaleUpperCase('pt-BR')
      : 'AGUARDANDO DADOS';

  if (statusTexto && statusTexto.trim().length > 0) {
    return {
      lote: statusTexto.trim().toLocaleUpperCase('pt-BR'),
      produto: 'TIMELINE',
      detalhe,
    };
  }

  if (mensagemVazia && mensagemVazia.trim().length > 0) {
    return {
      lote: 'SEM DADOS',
      produto: 'TIMELINE',
      detalhe,
    };
  }

  return {
    lote: 'SEM DADOS',
    produto: 'TIMELINE',
    detalhe: 'AGUARDANDO DADOS',
  };
};

export function TimelineFooter({
  timelineTimes = [],
  segmentos = [],
  lotes = [],
  statusTexto,
  mensagemVazia,
}: TimelineFooterProps) {
  const possuiDados = segmentos.length > 0 || lotes.length > 0;
  const placeholder = resolverTextoPlaceholder(statusTexto, mensagemVazia);
  const lotesRenderizados =
    lotes.length > 0
      ? lotes
      : [
          {
            lote: placeholder.lote,
            produto: placeholder.produto,
            produzido: 0,
            inicio: '',
            fim: '',
            inicioHora: '',
            fimHora: '',
            duracaoMinutos: 0,
            larguraPct: 100,
          } satisfies TimelineFooterLote,
        ];
  const segmentosRenderizados =
    segmentos.length > 0
      ? segmentos
      : [
          {
            inicio: '',
            fim: '',
            inicioHora: '',
            fimHora: '',
            duracaoMinutos: 0,
            larguraPct: 100,
            statusTimeline: 'SEM_APONTAMENTO',
            classeCss: 'white-fill',
            oeeturnoId: null,
            produto: '',
          } satisfies TimelineFooterSegmento,
        ];

  return (
    <footer className="footer-timeline">
      <div className="timeline-labels">
        {lotesRenderizados.map((lote, indice) => {
          const larguraPct = limitarPercentual(lote.larguraPct);
          const mostrarConteudo = larguraPct >= 5;
          const mostrarDireita = larguraPct >= 12;
          const loteLabel = normalizarRotuloLote(lote.lote);
          const produtoLabel = lote.produto?.trim() || 'Produto não informado';
          const maxCharsBase =
            larguraPct >= 30 ? 28 : larguraPct >= 20 ? 18 : larguraPct >= 12 ? 12 : 8;
          const produzidoTexto =
            lote.produzido > 0 ? formatadorQuantidadeTimeline.format(lote.produzido) : placeholder.detalhe;

          return (
            <div
              key={`${lote.lote}-${lote.produto}-${lote.inicio}-${indice}`}
              className="t-block"
              style={{ width: `${larguraPct}%` }}
              title={`${loteLabel} | ${produtoLabel} | Produzido: ${formatadorQuantidadeTimeline.format(
                lote.produzido,
              )}${lote.inicioHora && lote.fimHora ? ` | ${lote.inicioHora} - ${lote.fimHora}` : ''}`}
            >
              {mostrarConteudo ? (
                <>
                  <div className="t-l1">{truncarTexto(loteLabel, maxCharsBase)}</div>
                  <div className="t-l2 green-text">{produtoLabel}</div>
                  {mostrarDireita ? (
                    <>
                      <div className="t-r1">PRODUZIDO</div>
                      <div className="t-r2">{truncarTexto(produzidoTexto, maxCharsBase)}</div>
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="timeline-track">
        {segmentosRenderizados.map((segmento, indice) => {
          const larguraPct = limitarPercentual(segmento.larguraPct);
          const classeCss = obterClasseSegmento(segmento.classeCss);

          return (
            <div
              key={`${segmento.inicio}-${segmento.fim}-${indice}`}
              className={`tl-segment ${classeCss}`}
              style={{ width: `${larguraPct}%` }}
              title={
                possuiDados
                  ? `${segmento.statusTimeline} | ${segmento.inicioHora} - ${segmento.fimHora}${
                      segmento.produto ? ` | ${segmento.produto}` : ''
                    }${segmento.oeeturnoId ? ` | Lançamento ${segmento.oeeturnoId}` : ''}`
                  : placeholder.detalhe
              }
            />
          );
        })}
      </div>

      <div className="timeline-times">
        {timelineTimes.length > 0 ? (
          timelineTimes.map((hora, indice) => <span key={`${hora}-${indice}`}>{hora}</span>)
        ) : (
          <span>{possuiDados ? '' : placeholder.detalhe}</span>
        )}
      </div>

      <div className="timeline-legend">
        <div className="lg-item">
          <span className="lg-dot green-fill"></span> PRODUZINDO
        </div>
        <div className="lg-item">
          <span className="lg-dot red-fill"></span> PARADA
        </div>
        <div className="lg-item">
          <span className="lg-dot yellow-fill"></span> MANUTENÇÃO
        </div>
        <div className="lg-item">
          <span className="lg-dot gray-fill"></span> PARADA ESTRATÉGICA
        </div>
        <div className="lg-item">
          <span className="lg-dot white-fill"></span> SEM APONTAMENTO
        </div>
      </div>
    </footer>
  );
}
