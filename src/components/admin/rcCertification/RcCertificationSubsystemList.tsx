import type { RcCertificationSubsystemScore } from "../../../types/rcCertification";

type RcCertificationSubsystemListProps = {
  subsystems: RcCertificationSubsystemScore[];
};

export function RcCertificationSubsystemList({ subsystems }: RcCertificationSubsystemListProps) {
  return (
    <section className="institutional-card rc-certification-subsystems-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Subsystem scores</h3>
        <p>Aggregated certification snapshots across the platform.</p>
      </header>
      <ul className="institutional-card__fixes">
        {subsystems.map((item) => (
          <li key={item.id}>
            <strong>{item.label}</strong> — {item.score}% · {item.status} ·{" "}
            {item.passed ? "PASS" : "FAIL"}
            <span className="performance-center-card__detail">{item.summary}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
