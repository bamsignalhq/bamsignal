import { useMemo } from "react";
import {
  FAITH_NETWORK_DIVERSITY_COPY,
  FAITH_NETWORK_LABEL,
  FAITH_NETWORK_PURPOSE_COPY,
  FAITH_NETWORK_RESERVED_COPY,
  FAITH_NETWORK_RESPECT_COPY,
  FAITH_NETWORK_SUBCOPY,
  FAITH_NETWORK_TITLE,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_FAITH_CATEGORIES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/faithNetwork";
import { getFaithNetworkBundle } from "../../../utils/FaithNetworkEngine";
import { FaithCategoryCard } from "./FaithCategoryCard";
import { FaithLeaderCard } from "./FaithLeaderCard";

export function FaithNetworkPage() {
  const bundle = useMemo(() => getFaithNetworkBundle(), []);

  return (
    <div className="fnw-page">
      <header className="fnw-page__hero institute-glass">
        <p className="bi-page__eyebrow">{FAITH_NETWORK_LABEL}</p>
        <h1>{FAITH_NETWORK_TITLE}</h1>
        <p>{FAITH_NETWORK_SUBCOPY}</p>
        <p className="fnw-page__labels">
          {FAITH_NETWORK_DIVERSITY_COPY} · {FAITH_NETWORK_RESPECT_COPY} · {LEARNING_LABEL} ·{" "}
          {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="fnw-page__purpose">{FAITH_NETWORK_PURPOSE_COPY}</p>
      </header>

      <section className="fnw-page__prepared institute-glass">
        <h2>Prepared categories</h2>
        <p>{bundle.categoryCount} categories — architecture preview, equal respect, not live yet.</p>
        <ul className="fnw-page__prepared-list">
          {PREPARED_FAITH_CATEGORIES.map((category) => (
            <li key={category.id}>
              <strong>{category.title}</strong>
              <span>{category.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="fnw-page__section">
        <header className="bi-section-head">
          <h2>Faith categories</h2>
          <p>{FAITH_NETWORK_DIVERSITY_COPY} — prepared, not enabled yet.</p>
        </header>
        <div className="fnw-page__grid">
          {bundle.categories.map((category) => (
            <FaithCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="fnw-page__section">
        <header className="bi-section-head">
          <h2>Faith leaders</h2>
          <p>{FAITH_NETWORK_RESPECT_COPY} — reserved profiles, no ranking.</p>
        </header>
        <div className="fnw-page__grid">
          {bundle.leaders.map((leader) => (
            <FaithLeaderCard key={leader.id} leader={leader} />
          ))}
        </div>
      </section>

      <section className="fnw-page__reserved-note institute-glass">
        <p>{FAITH_NETWORK_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
