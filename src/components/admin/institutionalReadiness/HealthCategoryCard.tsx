import { HEALTH_STATUS_LABELS } from "../../../constants/institutionalReadiness";
import { navigateToPath } from "../../../constants/routes";
import type { HealthCategory } from "../../../types/institutionalReadiness";

type HealthCategoryCardProps = {
  sections: HealthCategory[];
};

export function HealthCategoryCard({ sections }: HealthCategoryCardProps) {
  return (
    <section className="health-category-card concierge-consultant-card--glass cc-reveal">
      <header className="health-category-card__head">
        <h3>Health categories</h3>
        <p>Eight institutional audit domains — Route through Launch Readiness.</p>
      </header>

      <div className="health-category-card__list">
        {sections.map((section) => (
          <article
            key={section.id}
            className={`health-category-card__row health-category-card__row--${section.status}`}
          >
            <div>
              <h4>{section.label}</h4>
              <p>{section.summary}</p>
              <small>
                Score {section.score}/100 · {section.issueCount} issue(s)
              </small>
            </div>
            <div className="health-category-card__actions">
              <span className={`health-status-badge health-status-badge--${section.status}`}>
                {HEALTH_STATUS_LABELS[section.status]}
              </span>
              {section.auditPath ? (
                <button
                  type="button"
                  className="concierge-consultant-btn concierge-consultant-btn--ghost"
                  onClick={() => navigateToPath(section.auditPath!)}
                >
                  Open audit
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
