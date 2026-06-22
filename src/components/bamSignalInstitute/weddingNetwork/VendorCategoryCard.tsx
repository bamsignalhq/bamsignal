import { VENDOR_CATEGORY_LABEL, WEDDING_NETWORK_LABEL } from "../../../constants/weddingNetwork";
import type { VendorCategoryViewModel } from "../../../utils/weddingNetworkLogic";

type VendorCategoryCardProps = {
  category: VendorCategoryViewModel;
};

export function VendorCategoryCard({ category }: VendorCategoryCardProps) {
  return (
    <article className="wdn-category-card institute-glass">
      <header className="wdn-category-card__head">
        <h3>{category.title}</h3>
        <span className="wdn-category-card__badge">{VENDOR_CATEGORY_LABEL}</span>
      </header>

      <p className="wdn-category-card__labels">{WEDDING_NETWORK_LABEL} — dignified celebration support.</p>
      <p className="wdn-category-card__description">{category.description}</p>
      <p className="wdn-category-card__status">{category.statusLabel}</p>
    </article>
  );
}
