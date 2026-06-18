import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { BoostProduct } from "../../constants/boosts";
import { boostNeedsMemberCity, shopBoostDescription } from "../../constants/boosts";
import { MONETIZATION_COPY } from "../../constants/copy";
import { fetchBoostProducts } from "../../services/boosts";

type ProfileBoostSheetProps = {
  open: boolean;
  onClose: () => void;
  onPurchase: (product: BoostProduct) => void;
  loading?: boolean;
  memberCity?: string;
};

export function ProfileBoostSheet({
  open,
  onClose,
  onPurchase,
  loading,
  memberCity = ""
}: ProfileBoostSheetProps) {
  const [products, setProducts] = useState<BoostProduct[]>([]);

  useEffect(() => {
    if (!open) return;
    void fetchBoostProducts().then(setProducts);
  }, [open]);

  if (!open) return null;

  return (
    <div className="profile-boost-sheet" role="dialog" aria-modal="true" aria-labelledby="profile-boost-title">
      <button type="button" className="profile-boost-sheet__backdrop" onClick={loading ? undefined : onClose} aria-label="Close" />
      <div className="profile-boost-sheet__panel">
        <header className="profile-boost-sheet__head">
          <div>
            <h2 id="profile-boost-title">Extra Visibility</h2>
            <p className="profile-boost-sheet__subtitle">Get noticed a little more without a subscription.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close" disabled={loading}>
            <X size={20} />
          </button>
        </header>

        <div className="profile-boost-sheet__cards">
          {products.map((product) => {
            const needsCity = boostNeedsMemberCity(product.id);
            const cityReady = Boolean(memberCity.trim());
            const disabled = loading || (needsCity && !cityReady);

            return (
              <article key={product.id} className="profile-boost-card">
                <div className="profile-boost-card__top">
                  <h3>{product.name}</h3>
                  <span className="profile-boost-card__price">{product.priceLabel}</span>
                </div>
                <p className="profile-boost-card__desc">{shopBoostDescription(product)}</p>
                {needsCity && !cityReady ? (
                  <p className="profile-boost-card__hint">Set your city in Edit Profile first.</p>
                ) : null}
                <button
                  type="button"
                  className="btn-secondary btn-sm profile-boost-card__cta"
                  disabled={disabled}
                  onClick={() => onPurchase(product)}
                >
                  {loading ? MONETIZATION_COPY.checkoutLoading : product.cta}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
