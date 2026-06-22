import type { HousePipelineLegacyResearch } from "../../../../types/houseInstituteDataPipeline";

type LegacyResearchCardProps = {
  legacyResearch: HousePipelineLegacyResearch;
};

export function LegacyResearchCard({ legacyResearch }: LegacyResearchCardProps) {
  return (
    <section className="hidp-legacy-card institute-glass">
      <header className="hidp-card__head">
        <h2>Legacy research</h2>
        <p>{legacyResearch.narrative}</p>
      </header>
      <dl className="hidp-legacy-card__metrics">
        <div>
          <dt>Legacy families</dt>
          <dd>{legacyResearch.legacyFamilies}</dd>
        </div>
        <div>
          <dt>Success stories</dt>
          <dd>{legacyResearch.successStories}</dd>
        </div>
        <div>
          <dt>Marriages</dt>
          <dd>{legacyResearch.marriages}</dd>
        </div>
      </dl>
      {legacyResearch.rows.length > 0 ? (
        <ul className="hidp-legacy-card__list">
          {legacyResearch.rows.map((row) => (
            <li key={row.id}>
              <span>{row.label}</span>
              <strong>{row.count}</strong>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
