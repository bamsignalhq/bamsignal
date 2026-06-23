import { INSTITUTIONAL_READINESS_REMEDIATION_PATH } from "../../../utils/institutionalReadinessEngine";
import { navigateToPath } from "../../../constants/routes";
import type { InstitutionalReadinessReport } from "../../../types/institutionalReadiness";

type LaunchDecisionCardProps = {
  report: InstitutionalReadinessReport;
};

export function LaunchDecisionCard({ report }: LaunchDecisionCardProps) {
  const { decision } = report;
  const verdictClass = decision.verdict.replace(/-/g, "_");

  return (
    <section className={`launch-decision-card launch-decision-card--${verdictClass} concierge-consultant-card--glass cc-reveal`}>
      <header className="launch-decision-card__head">
        <h3>Go / No-Go</h3>
        <p>10,000-member institutional scale assessment.</p>
      </header>

      <div className="launch-decision-card__verdict">
        <span className={`launch-decision-badge launch-decision-badge--${verdictClass}`}>
          {decision.label}
        </span>
        <strong>{decision.overallScore}/100</strong>
      </div>

      <p className="launch-decision-card__detail">{decision.detail}</p>

      <div className="launch-decision-card__risks">
        <RiskGroup title="Critical blockers" items={report.criticalBlockers} emptyLabel="None" />
        <RiskGroup title="High risks" items={report.highRisks} emptyLabel="None" />
        <RiskGroup title="Medium risks" items={report.mediumRisks} emptyLabel="None" />
        <RiskGroup title="Resolved risks" items={report.resolvedRisks} emptyLabel="None tracked yet" />
      </div>

      <footer className="launch-decision-card__foot">
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

function RiskGroup({
  title,
  items,
  emptyLabel
}: {
  title: string;
  items: InstitutionalReadinessReport["criticalBlockers"];
  emptyLabel: string;
}) {
  return (
    <div className="launch-decision-card__risk-group">
      <h4>
        {title} ({items.length})
      </h4>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>{emptyLabel}</p>
      )}
    </div>
  );
}
