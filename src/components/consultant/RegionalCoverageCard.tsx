import type { RegionalCoverageRow } from "../../types/regionalConsultantTeams";

type RegionalCoverageCardProps = {
  regionLabel: string;
  coverage: RegionalCoverageRow[];
};

export function RegionalCoverageCard({ regionLabel, coverage }: RegionalCoverageCardProps) {
  return (
    <section className="regional-coverage-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{regionLabel} Coverage</h3>
        <p>Where members in this region are based — routing context for consultants.</p>
      </header>
      {coverage.length === 0 ? (
        <p className="concierge-consultant__empty">No member coverage data in this region yet.</p>
      ) : (
        <ul className="regional-coverage-card__list">
          {coverage.map((row) => (
            <li key={row.id}>
              <strong>{row.label}</strong>
              <span>{row.memberCount} member{row.memberCount === 1 ? "" : "s"}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
