import { INSTITUTIONAL_READINESS_REMEDIATION_PATH } from "../../../utils/institutionalReadinessEngine";
import { navigateToPath } from "../../../constants/routes";
import type { InstitutionalReadinessVerificationBundle } from "../../../types/institutionalReadiness";

type LaunchRecommendationCardProps = {
  bundle: InstitutionalReadinessVerificationBundle;
};

export function LaunchRecommendationCard({ bundle }: LaunchRecommendationCardProps) {
  const { recommendation } = bundle;
  const verdictClass = recommendation.verdict.replace(/-/g, "_");

  return (
    <section
      className={`readiness-verification-card launch-recommendation-card launch-recommendation-card--${verdictClass} concierge-consultant-card--glass cc-reveal`}
    >
      <header className="readiness-verification-card__head">
        <h3>GO / NO GO</h3>
        <p>Automatic recommendation — GO, GO WITH CONDITIONS, or NO GO.</p>
      </header>

      <div className="launch-recommendation-card__verdict">
        <span className={`launch-recommendation-badge launch-recommendation-badge--${verdictClass}`}>
          {recommendation.label}
        </span>
        <strong>{recommendation.institutionReadinessScore}/100</strong>
      </div>

      <p className="launch-recommendation-card__detail">{recommendation.detail}</p>

      {bundle.recommendedActions.length ? (
        <div className="launch-recommendation-card__actions-list">
          <h4>Recommended actions</h4>
          <ul>
            {bundle.recommendedActions.map((action) => (
              <li key={action.id}>
                <strong>{action.title}</strong>
                <span>{action.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <footer className="readiness-verification-card__foot">
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => navigateToPath(INSTITUTIONAL_READINESS_REMEDIATION_PATH)}
        >
          Open remediation board
        </button>
      </footer>
    </section>
  );
}
