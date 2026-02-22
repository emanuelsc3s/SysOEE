export type MiniCardProdutivo = {
  id: string;
  titulo: string;
  valor: string;
  detalhe: string;
  variante: 'blue' | 'red' | 'orange' | 'gray';
};

type VelocidadeCardProps = {
  miniCards: MiniCardProdutivo[];
  statusTexto?: string;
};

const MAPA_CLASSES_VARIANTE: Record<MiniCardProdutivo['variante'], string> = {
  blue: 'blue',
  red: 'red',
  orange: 'orange',
  gray: 'gray',
};

export function VelocidadeCard({ miniCards, statusTexto }: VelocidadeCardProps) {
  return (
    <div className="card card-velocidade">
      <h2>
        Dados Produtivos
        {statusTexto ? <span className="subtitle subtitle-right">{statusTexto}</span> : null}
      </h2>

      <div className="vel-mini-grid">
        {miniCards.map((card) => {
          const classeVariante = MAPA_CLASSES_VARIANTE[card.variante];

          return (
            <article
              key={card.id}
              className={`vel-mini-card vel-mini-card--${classeVariante}`}
              title={`${card.titulo}: ${card.valor} (${card.detalhe})`}
            >
              <span className={`vel-mini-accent ${classeVariante}-fill`} aria-hidden="true" />
              <div className="vel-mini-title">{card.titulo}</div>
              <div className={`vel-mini-value ${classeVariante}-text`}>{card.valor}</div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
