import type { OperatingPrincipleCardViewModel } from "../../../types/houseOperatingSystem";

type OperatingPrinciplesCardProps = {
  principles: OperatingPrincipleCardViewModel[];
};

export function OperatingPrinciplesCard({ principles }: OperatingPrinciplesCardProps) {
  return (
    <section className="hos-principles-card institute-glass">
      <header className="hos-card__head">
        <h2>Operating principles</h2>
        <p>House OS principles — families and trust first, always institution over platform.</p>
      </header>
      <ul className="hos-principles-card__list">
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
