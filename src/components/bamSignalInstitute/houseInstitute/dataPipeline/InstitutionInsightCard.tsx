import type { HousePipelineInstitutionInsight } from "../../../../types/houseInstituteDataPipeline";

type InstitutionInsightCardProps = {
  insights: HousePipelineInstitutionInsight[];
  title?: string;
  description?: string;
};

export function InstitutionInsightCard({
  insights,
  title = "Institution insights",
  description = "Anonymous bridge from Journey Intelligence to House Institute research."
}: InstitutionInsightCardProps) {
  return (
    <section className="hidp-insight-card institute-glass">
      <header className="hidp-card__head">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <ul className="hidp-insight-card__list">
        {insights.map((insight) => (
          <li key={insight.id}>
            <strong>{insight.title}</strong>
            <p>{insight.summary}</p>
            {insight.metricLabel && typeof insight.metricCount === "number" ? (
              <dl className="hidp-insight-card__metric">
                <dt>{insight.metricLabel}</dt>
                <dd>{insight.metricCount}</dd>
              </dl>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
