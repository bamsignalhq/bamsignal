import type { InstitutionHealthSnapshot } from "../../../types/executiveDashboard";

type InstitutionHealthCardProps = {
  snapshot: InstitutionHealthSnapshot;
};

export function InstitutionHealthCard({ snapshot }: InstitutionHealthCardProps) {
  return (
    <section className="institution-health-card concierge-consultant-card--glass cc-reveal">
      <header className="institution-health-card__head">
        <h3>Institution Health</h3>
        <p>High-level institutional readiness — not operational detail.</p>
      </header>

      <div className="institution-health-card__score">
        <strong>{snapshot.score}</strong>
        <span>{snapshot.label}</span>
      </div>

      <ul className="institution-health-card__highlights">
        {snapshot.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
