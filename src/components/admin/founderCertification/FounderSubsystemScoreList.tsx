import type { FounderSubsystemScore } from "../../../types/founderCertification";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type FounderSubsystemScoreListProps = {
  scores: FounderSubsystemScore[];
};

export function FounderSubsystemScoreList({ scores }: FounderSubsystemScoreListProps) {
  return (
    <section className="institutional-card founder-subsystem-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Subsystem scores</h3>
        <p>QA through remote config — every launch domain.</p>
      </header>
      <ul className="institutional-card__list">
        {scores.map((item) => (
          <li key={item.id}>
            <div className="institutional-card__row">
              <strong>{item.label}</strong>
              <span>{item.score}%</span>
              <InstitutionalStatusBadge
                status={
                  item.status === "healthy"
                    ? "consistent"
                    : item.status === "warning"
                      ? "review"
                      : "inconsistent"
                }
              />
            </div>
            <p>
              {item.source} · {item.summary}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
