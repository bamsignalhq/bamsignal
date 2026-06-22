import { useMemo } from "react";
import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_VENDOR_CATEGORIES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL,
  WEDDING_NETWORK_LABEL,
  WEDDING_NETWORK_PURPOSE_COPY,
  WEDDING_NETWORK_RESERVED_COPY,
  WEDDING_NETWORK_SUBCOPY,
  WEDDING_NETWORK_TITLE
} from "../../../constants/weddingNetwork";
import { getWeddingNetworkBundle } from "../../../utils/WeddingNetworkEngine";
import { VendorCategoryCard } from "./VendorCategoryCard";
import { WeddingPlannerCard } from "./WeddingPlannerCard";

export function WeddingNetworkPage() {
  const bundle = useMemo(() => getWeddingNetworkBundle(), []);

  return (
    <div className="wdn-page">
      <header className="wdn-page__hero institute-glass">
        <p className="bi-page__eyebrow">{WEDDING_NETWORK_LABEL}</p>
        <h1>{WEDDING_NETWORK_TITLE}</h1>
        <p>{WEDDING_NETWORK_SUBCOPY}</p>
        <p className="wdn-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="wdn-page__purpose">{WEDDING_NETWORK_PURPOSE_COPY}</p>
      </header>

      <section className="wdn-page__prepared institute-glass">
        <h2>Prepared categories</h2>
        <p>{bundle.categoryCount} categories — architecture preview, not live yet.</p>
        <ul className="wdn-page__prepared-list">
          {PREPARED_VENDOR_CATEGORIES.map((category) => (
            <li key={category.id}>
              <strong>{category.title}</strong>
              <span>{category.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="wdn-page__section">
        <header className="bi-section-head">
          <h2>Vendor categories</h2>
          <p>Trusted celebration support — prepared, not enabled yet.</p>
        </header>
        <div className="wdn-page__grid">
          {bundle.categories.map((category) => (
            <VendorCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="wdn-page__section">
        <header className="bi-section-head">
          <h2>Wedding planners</h2>
          <p>Reserved planner profiles — dignified coordination, not booking yet.</p>
        </header>
        <div className="wdn-page__grid">
          {bundle.planners.map((planner) => (
            <WeddingPlannerCard key={planner.id} planner={planner} />
          ))}
        </div>
      </section>

      <section className="wdn-page__reserved-note institute-glass">
        <p>{WEDDING_NETWORK_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
