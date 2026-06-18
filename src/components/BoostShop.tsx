import type { BoostProduct } from "../constants/boosts";
import { boostNeedsMemberCity, shopBoostDescription } from "../constants/boosts";
import { MONETIZATION_COPY } from "../constants/copy";

type BoostShopProps = {
  products: BoostProduct[];
  onPurchase: (product: BoostProduct) => void;
  loading?: boolean;
  memberCity?: string;
};

export function BoostShop({ products, onPurchase, loading, memberCity = "" }: BoostShopProps) {
  const cityLabel = memberCity.trim() || "your city";

  return (
    <section className="boost-shop boost-shop--compact">
      <div className="boost-shop__head">
        <h3>One-time boosts</h3>
        <p className="boost-shop__sub">Get extra visibility without a subscription.</p>
      </div>
      <div className="boost-shop__grid">
        {products.map((product) => {
          const needsCity = boostNeedsMemberCity(product.id);
          const cityReady = Boolean(memberCity?.trim());
          const disabled = loading || (needsCity && !cityReady);
          return (
            <article key={product.id} className="boost-card boost-card--compact">
              <div className="boost-card__row">
                <div className="boost-card__copy">
                  <h4>{product.name}</h4>
                  <p className="boost-card__desc">{shopBoostDescription(product, cityLabel)}</p>
                </div>
                <p className="boost-card__price">{product.priceLabel}</p>
              </div>
              {needsCity && !cityReady ? (
                <p className="boost-card__hint">Set your city in Edit Profile first.</p>
              ) : null}
              <button
                type="button"
                className="btn-secondary btn-sm btn-full boost-card__cta"
                disabled={disabled}
                onClick={() => onPurchase(product)}
              >
                {loading ? MONETIZATION_COPY.checkoutLoading : product.cta}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
