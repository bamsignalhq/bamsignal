import type { CouncilResponsibilityCardViewModel } from "../../../types/stewardshipCouncil";

type CouncilResponsibilitiesCardProps = {
  responsibilities: CouncilResponsibilityCardViewModel[];
};

export function CouncilResponsibilitiesCard({ responsibilities }: CouncilResponsibilitiesCardProps) {
  return (
    <section className="stc-responsibilities-card institute-glass">
      <header className="stc-card__head">
        <h2>Council responsibilities</h2>
        <p>Role responsibilities documented — architecture only, not workflows or authority.</p>
      </header>
      <ul className="stc-responsibilities-card__list">
        {responsibilities.map((responsibility) => (
          <li key={responsibility.id}>
            <header>
              <div>
                <strong>{responsibility.title}</strong>
                <span className="stc-responsibilities-card__role">{responsibility.roleTitle}</span>
              </div>
            </header>
            <p>{responsibility.description}</p>
            <small>{responsibility.statusLabel}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
