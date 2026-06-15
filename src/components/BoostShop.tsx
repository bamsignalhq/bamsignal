import type { BoostProduct } from "../constants/boosts";

const CITY_BOOST_IDS = new Set<BoostProduct["id"]>(["city-spotlight", "city-boost"]);

type BoostShopProps = {
  products: BoostProduct[];
  onPurchase: (product: BoostProduct) => void;
  loading?: boolean;
  memberCity?: string;
};

export function BoostShop({ products, onPurchase, loading, memberCity }: BoostShopProps) {
  return (
    <section className="boost-shop">
      <div className="boost-shop__head">
        <h3>One-time boosts</h3>
        <p className="boost-shop__sub">Stack visibility without a subscription.</p>
      </div>
      <div className="boost-shop__grid">
        {products.map((product) => {
          const needsCity = CITY_BOOST_IDS.has(product.id);
          const cityReady = Boolean(memberCity?.trim());
          return (
            <article key={product.id} className="card boost-card">
              <h4>{product.name}</h4>
              <p className="boost-card__price">{product.priceLabel}</p>
              <p className="boost-card__desc">{product.description}</p>
              {needsCity && cityReady ? (
                <p className="boost-card__city">Shows in {memberCity}</p>
              ) : null}
              {needsCity && !cityReady ? (
                <p className="boost-card__city boost-card__city--warn">Set your city in Edit Profile first</p>
              ) : null}
              <button
                type="button"
                className="btn-secondary btn-full"
                disabled={loading || (needsCity && !cityReady)}
                onClick={() => onPurchase(product)}
              >
                {product.cta}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
