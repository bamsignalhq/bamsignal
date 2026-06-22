import type { StewardshipPrincipleCardViewModel } from "../../../types/governanceFramework";

type StewardshipPrinciplesCardProps = {
  principles: StewardshipPrincipleCardViewModel[];
};

export function StewardshipPrinciplesCard({ principles }: StewardshipPrinciplesCardProps) {
  return (
    <section className="govf-principles-card institute-glass">
      <header className="govf-card__head">
        <h2>Core principles</h2>
        <p>Stewardship principles that anchor institutional governance — documented, not enforced.</p>
      </header>
      <ul className="govf-principles-card__list">
        {principles.map((principle) => (
          <li key={principle.id}>
            <div>
              <strong>{principle.title}</strong>
              <span>{principle.description}</span>
            </div>
            <small>{principle.statusLabel}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
