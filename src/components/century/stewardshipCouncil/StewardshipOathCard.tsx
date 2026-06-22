import type { StewardshipOathCardViewModel } from "../../../types/stewardshipCouncil";

type StewardshipOathCardProps = {
  oath: StewardshipOathCardViewModel;
};

export function StewardshipOathCard({ oath }: StewardshipOathCardProps) {
  return (
    <section className="stc-oath-card institute-glass">
      <header className="stc-card__head">
        <h2>Stewardship oath</h2>
        <p>{oath.oathCopy}</p>
      </header>
      <ul className="stc-oath-card__list">
        {oath.principles.map((principle) => (
          <li key={principle.id}>
            <strong>{principle.title}</strong>
            <span>{principle.description}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
