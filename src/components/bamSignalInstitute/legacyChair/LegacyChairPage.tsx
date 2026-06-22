import { useMemo } from "react";
import {
  FUTURE_READY_LEGACY_CHAIR_CAPABILITIES,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  LEGACY_CHAIR_FUTURE_READY_COPY,
  LEGACY_CHAIR_LABEL,
  LEGACY_CHAIR_PURPOSE_COPY,
  LEGACY_CHAIR_RESERVED_COPY,
  LEGACY_CHAIR_SUBCOPY,
  LEGACY_CHAIR_TITLE,
  PREPARED_CHAIR_CATEGORIES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/legacyChair";
import { getLegacyChairBundle } from "../../../utils/LegacyChairEngine";
import { ChairCategoryCard } from "./ChairCategoryCard";
import { ResearchLeadershipCard } from "./ResearchLeadershipCard";

export function LegacyChairPage() {
  const bundle = useMemo(() => getLegacyChairBundle(), []);

  return (
    <div className="lgch-page">
      <header className="lgch-page__hero institute-glass">
        <p className="bi-page__eyebrow">{LEGACY_CHAIR_LABEL}</p>
        <h1>{LEGACY_CHAIR_TITLE}</h1>
        <p>{LEGACY_CHAIR_SUBCOPY}</p>
        <p className="lgch-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="lgch-page__purpose">{LEGACY_CHAIR_PURPOSE_COPY}</p>
      </header>

      <section className="lgch-page__prepared institute-glass">
        <h2>Prepared chairs</h2>
        <p>{bundle.categoryCount} chair categories — academic leadership reserved, not appointed yet.</p>
        <ul className="lgch-page__prepared-list">
          {PREPARED_CHAIR_CATEGORIES.map((category) => (
            <li key={category.id}>
              <strong>{category.title}</strong>
              <span>{category.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lgch-page__section">
        <header className="bi-section-head">
          <h2>Chair categories</h2>
          <p>Future academic and institutional leadership — prepared, not enabled yet.</p>
        </header>
        <div className="lgch-page__grid">
          {bundle.categories.map((category) => (
            <ChairCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="lgch-page__section">
        <header className="bi-section-head">
          <h2>Research leadership</h2>
          <p>Institutional scholarship roles — architecture preview, not live appointments.</p>
        </header>
        <div className="lgch-page__grid">
          {bundle.leadership.map((item) => (
            <ResearchLeadershipCard key={item.id} leadership={item} />
          ))}
        </div>
      </section>

      <section className="lgch-page__future-ready institute-glass">
        <h2>Future-ready capabilities</h2>
        <p>{LEGACY_CHAIR_FUTURE_READY_COPY}</p>
        <ul className="lgch-page__prepared-list">
          {FUTURE_READY_LEGACY_CHAIR_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.title}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lgch-page__reserved-note institute-glass">
        <p>{LEGACY_CHAIR_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
