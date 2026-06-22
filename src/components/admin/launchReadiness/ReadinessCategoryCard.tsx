import { LAUNCH_READINESS_STATUS_LABELS } from "../../../constants/launchReadiness";
import { navigateToPath } from "../../../constants/routes";
import type { LaunchReadinessCategory } from "../../../types/launchReadiness";

type ReadinessCategoryCardProps = {
  categories: LaunchReadinessCategory[];
};

export function ReadinessCategoryCard({ categories }: ReadinessCategoryCardProps) {
  return (
    <section className="readiness-category-card concierge-consultant-card--glass cc-reveal">
      <header className="readiness-category-card__head">
        <h3>Readiness categories</h3>
        <p>{categories.length} institutional areas assessed — audit only, no operational actions.</p>
      </header>

      <div className="readiness-category-card__list">
        {categories.map((category) => (
          <article
            key={category.id}
            className={`readiness-category-card__row readiness-category-card__row--${category.status}`}
          >
            <div>
              <strong>{category.label}</strong>
              <p>{category.summary}</p>
              <small>{category.completionPercent}% complete · {category.issueCount} issue(s)</small>
            </div>
            <div className="readiness-category-card__actions">
              <span className={`launch-readiness-badge launch-readiness-badge--${category.status}`}>
                {LAUNCH_READINESS_STATUS_LABELS[category.status]}
              </span>
              {category.auditPath ? (
                <button
                  type="button"
                  className="concierge-consultant-btn"
                  onClick={() => navigateToPath(category.auditPath!)}
                >
                  View audit
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
