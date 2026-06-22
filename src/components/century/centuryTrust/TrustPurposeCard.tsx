import type { TrustPurposeCardViewModel } from "../../../types/centuryTrust";

type TrustPurposeCardProps = {
  purpose: TrustPurposeCardViewModel;
};

export function TrustPurposeCard({ purpose }: TrustPurposeCardProps) {
  return (
    <section className="ctrust-purpose-card institute-glass">
      <header className="ctrust-card__head">
        <h2>{purpose.purposeLabel}</h2>
        <p>{purpose.narrative}</p>
      </header>
      <ul className="ctrust-purpose-card__themes">
        {purpose.themes.map((theme) => (
          <li key={theme}>{theme}</li>
        ))}
      </ul>
    </section>
  );
}
