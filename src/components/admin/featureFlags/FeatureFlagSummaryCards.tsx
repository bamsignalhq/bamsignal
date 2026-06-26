import type { FeatureFlagPlatformBundle } from "../../../types/featureFlagPlatform";

type FeatureFlagSummaryCardsProps = {
  summary: FeatureFlagPlatformBundle["summary"];
  environment: string;
};

export function FeatureFlagSummaryCards({ summary, environment }: FeatureFlagSummaryCardsProps) {
  return (
    <section className="feature-flag-summary" aria-label="Feature flag summary">
      <article className="feature-flag-summary__card concierge-consultant-card--glass">
        <span className="feature-flag-summary__label">Total flags</span>
        <strong>{summary.total}</strong>
      </article>
      <article className="feature-flag-summary__card concierge-consultant-card--glass">
        <span className="feature-flag-summary__label">Enabled</span>
        <strong>{summary.enabled}</strong>
      </article>
      <article className="feature-flag-summary__card concierge-consultant-card--glass">
        <span className="feature-flag-summary__label">Active rollouts</span>
        <strong>{summary.active}</strong>
      </article>
      <article className="feature-flag-summary__card concierge-consultant-card--glass">
        <span className="feature-flag-summary__label">Environment</span>
        <strong>{environment}</strong>
      </article>
    </section>
  );
}
