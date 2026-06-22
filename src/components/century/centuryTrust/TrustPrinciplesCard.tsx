import type { TrustPrincipleCardViewModel } from "../../../types/centuryTrust";

type TrustPrinciplesCardProps = {
  principles: TrustPrincipleCardViewModel[];
};

export function TrustPrinciplesCard({ principles }: TrustPrinciplesCardProps) {
  return (
    <section className="ctrust-principles-card institute-glass">
      <header className="ctrust-card__head">
        <h2>Trust principles</h2>
        <p>100-year thinking through future family protection — documented, not enforced.</p>
      </header>
      <ul className="ctrust-principles-card__list">
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
