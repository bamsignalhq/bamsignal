import { HOUSE_INSTITUTE_DATA_PIPELINE_BRAND } from "../../../../constants/houseInstituteDataPipeline";
import type { HousePipelineDataSource } from "../../../../types/houseInstituteDataPipeline";

type ResearchPipelineCardProps = {
  dataSources: HousePipelineDataSource[];
  bridgeSummary: string;
  updatedAt: string;
};

export function ResearchPipelineCard({ dataSources, bridgeSummary, updatedAt }: ResearchPipelineCardProps) {
  const activeSources = dataSources.filter((source) => source.count > 0);

  return (
    <section className="hidp-card institute-glass">
      <header className="hidp-card__head">
        <p className="bi-page__eyebrow">{HOUSE_INSTITUTE_DATA_PIPELINE_BRAND}</p>
        <h2>Research pipeline</h2>
        <p>{bridgeSummary}</p>
        <time className="hidp-card__updated" dateTime={updatedAt}>
          Updated {new Date(updatedAt).toLocaleString()}
        </time>
      </header>
      {activeSources.length === 0 ? (
        <p className="hidp-card__empty">No aggregate data yet — pipeline is ready when journeys begin.</p>
      ) : (
        <ul className="hidp-pipeline-list">
          {dataSources.map((source) => (
            <li key={source.id}>
              <div>
                <strong>{source.label}</strong>
                <span>{source.hint}</span>
              </div>
              <span className="hidp-pipeline-list__count">{source.count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
