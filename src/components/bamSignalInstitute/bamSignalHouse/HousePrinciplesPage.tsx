import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  BAMSIGNAL_HOUSE_GOOD_COPY,
  HOUSE_PRINCIPLE_LABEL
} from "../../../constants/bamSignalHouse";
import type { HousePrincipleViewModel } from "../../../utils/bamSignalHouseLogic";

type HousePrinciplesPageProps = {
  principles: HousePrincipleViewModel[];
};

export function HousePrinciplesPage({ principles }: HousePrinciplesPageProps) {
  return (
    <section className="bsho-page__section">
      <header className="bi-section-head">
        <h2>House principles</h2>
        <p>
          Use: {BAMSIGNAL_HOUSE_GOOD_COPY.join(", ")}. Avoid:{" "}
          {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
        </p>
      </header>
      <div className="bsho-page__grid">
        {principles.map((principle) => (
          <article key={principle.id} className="bsho-principle-card institute-glass">
            <header className="bsho-principle-card__head">
              <h3>{principle.title}</h3>
              <span className="bsho-principle-card__badge">{HOUSE_PRINCIPLE_LABEL}</span>
            </header>
            <p className="bsho-principle-card__description">{principle.description}</p>
            <p className="bsho-principle-card__forbidden">
              Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
            </p>
            <p className="bsho-principle-card__status">{principle.statusLabel}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
