import { GROWING_TOGETHER_LABEL } from "../../../../constants/legacyFamilies";
import type { LegacyFamiliesViewModel } from "../../../../utils/legacyFamiliesLogic";

type FamilyGrowthCardProps = {
  family: LegacyFamiliesViewModel;
};

export function FamilyGrowthCard({ family }: FamilyGrowthCardProps) {
  const history = [...family.growthHistory].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );

  return (
    <section className="family-growth-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{GROWING_TOGETHER_LABEL}</h3>
        <p>Family growth recorded — children count only, never names.</p>
      </header>

      {history.length ? (
        <ol className="family-growth-card__list">
          {history.map((entry, index) => (
            <li key={`${entry.at}-${index}`} className="family-growth-card__item">
              <span className="family-growth-card__dot" aria-hidden />
              <div>
                <strong>{entry.childrenCount} children</strong>
                <p className="family-growth-card__country">{entry.currentCountry}</p>
                <time dateTime={entry.at}>{new Date(entry.at).toLocaleDateString()}</time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="concierge-consultant__empty">No family growth recorded yet.</p>
      )}
    </section>
  );
}
