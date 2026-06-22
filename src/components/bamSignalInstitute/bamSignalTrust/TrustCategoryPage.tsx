import type { TrustCategoryViewModel } from "../../../utils/bamSignalTrustLogic";
import { TrustedProfessionalCard } from "./TrustedProfessionalCard";
import { TrustTimelinePage } from "./TrustTimelinePage";

type TrustCategoryPageProps = {
  category: TrustCategoryViewModel;
};

export function TrustCategoryPage({ category }: TrustCategoryPageProps) {
  return (
    <section className="bst-category-page">
      <header className="bst-category-page__head bi-section-head">
        <h2>{category.title}</h2>
        <p>{category.description}</p>
      </header>

      <div className="bst-category-page__grid">
        <TrustedProfessionalCard professional={category.professional} />
      </div>

      <TrustTimelinePage title={category.title} entries={category.timeline} />
    </section>
  );
}
