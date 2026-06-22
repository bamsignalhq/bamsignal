import { useMemo } from "react";
import {
  BAMSIGNAL_TRUST_EXPERTS_COPY,
  BAMSIGNAL_TRUST_GUIDANCE_COPY,
  BAMSIGNAL_TRUST_HERO_COPY,
  BAMSIGNAL_TRUST_LABEL,
  BAMSIGNAL_TRUST_PURPOSE_COPY,
  BAMSIGNAL_TRUST_RESERVED_COPY,
  BAMSIGNAL_TRUST_SUBCOPY,
  BAMSIGNAL_TRUST_SUPPORT_COPY,
  BAMSIGNAL_TRUST_TITLE,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_TRUST_CATEGORIES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/bamSignalTrust";
import { getBamSignalTrustBundle } from "../../../utils/BamSignalTrustEngine";
import { TrustCategoryPage } from "./TrustCategoryPage";

export function BamSignalTrustPage() {
  const bundle = useMemo(() => getBamSignalTrustBundle(), []);

  return (
    <div className="bst-page">
      <header className="bst-page__hero institute-glass">
        <p className="bi-page__eyebrow">{BAMSIGNAL_TRUST_LABEL}</p>
        <h1>{BAMSIGNAL_TRUST_TITLE}</h1>
        <p>{BAMSIGNAL_TRUST_HERO_COPY}</p>
        <p>{BAMSIGNAL_TRUST_SUBCOPY}</p>
        <p className="bst-page__labels">
          {BAMSIGNAL_TRUST_GUIDANCE_COPY} · {BAMSIGNAL_TRUST_SUPPORT_COPY} ·{" "}
          {BAMSIGNAL_TRUST_EXPERTS_COPY} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="bst-page__purpose">{BAMSIGNAL_TRUST_PURPOSE_COPY}</p>
      </header>

      <section className="bst-page__prepared institute-glass">
        <h2>Prepared categories</h2>
        <p>{bundle.categoryCount} categories — architecture preview, not live yet.</p>
        <ul className="bst-page__prepared-list">
          {PREPARED_TRUST_CATEGORIES.map((category) => (
            <li key={category.id}>
              <strong>{category.title}</strong>
              <span>{category.description}</span>
            </li>
          ))}
        </ul>
      </section>

      {bundle.categories.map((category) => (
        <TrustCategoryPage key={category.id} category={category} />
      ))}

      <section className="bst-page__reserved-note institute-glass">
        <p>{BAMSIGNAL_TRUST_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
