import type { BoostProduct } from "../constants/boosts";

type BoostShopProps = {
  products: BoostProduct[];
  onPurchase: (product: BoostProduct) => void;
  loading?: boolean;
};

export function BoostShop({ products, onPurchase, loading }: BoostShopProps) {
  return (
    <section className="boost-shop">
      <div className="boost-shop__head">
        <h3>One-time boosts</h3>
        <p className="boost-shop__sub">Stack visibility without a subscription. Admin can adjust prices anytime.</p>
      </div>
      <div className="boost-shop__grid">
        {products.map((product) => (
          <article key={product.id} className="card boost-card">
            <h4>{product.name}</h4>
            <p className="boost-card__price">{product.priceLabel}</p>
            <p className="boost-card__desc">{product.description}</p>
            <button
              type="button"
              className="btn-secondary btn-full"
              disabled={loading}
              onClick={() => onPurchase(product)}
            >
              {product.cta}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
