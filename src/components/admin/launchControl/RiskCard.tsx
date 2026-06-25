import {
  LAUNCH_READINESS_DOMAIN_LABELS,
  LAUNCH_RISK_SEVERITY_LABELS
} from "../../../constants/launchControlCenter";
import type { LaunchRiskRecord } from "../../../types/launchControlCenter";

type RiskCardProps = {
  risks: LaunchRiskRecord[];
};

export function RiskCard({ risks }: RiskCardProps) {
  const sorted = [...risks].sort(
    (left, right) => new Date(right.openedAt).getTime() - new Date(left.openedAt).getTime()
  );

  return (
    <section className="launch-control-card risk-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-control-card__head">
        <h3>Risks</h3>
        <p>Open and resolved launch risks with mitigation notes.</p>
      </header>
      {sorted.length ? (
        <ul className="launch-control-card__list">
          {sorted.map((risk) => (
            <li key={risk.id}>
              <div className="launch-control-card__row">
                <strong>{risk.riskRef}</strong>
                <span className={`risk-severity risk-severity--${risk.severity}`}>
                  {LAUNCH_RISK_SEVERITY_LABELS[risk.severity]}
                </span>
              </div>
              <p>{risk.title}</p>
              <div className="launch-control-card__meta">
                <span>{LAUNCH_READINESS_DOMAIN_LABELS[risk.domainId]}</span>
                <span>{risk.status}</span>
              </div>
              {risk.mitigation ? <p className="risk-card__mitigation">{risk.mitigation}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="launch-control-card__empty">No risks in this section.</p>
      )}
    </section>
  );
}
