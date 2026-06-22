import { HOUSE_INSTITUTE_DATA_PIPELINE_BRAND } from "../../../constants/houseInstituteDataPipeline";
import type { HouseInstituteDataPipelineBundle } from "../../../types/houseInstituteDataPipeline";

type HouseInstitutePipelineBridgeCardProps = {
  pipeline: HouseInstituteDataPipelineBundle;
};

export function HouseInstitutePipelineBridgeCard({ pipeline }: HouseInstitutePipelineBridgeCardProps) {
  const activeSources = pipeline.dataSources.filter((source) => source.count > 0).slice(0, 6);
  const topInsights = pipeline.institutionInsights.slice(0, 3);

  return (
    <section className="hidp-bridge-card journey-intelligence-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{HOUSE_INSTITUTE_DATA_PIPELINE_BRAND}</h3>
        <p>{pipeline.bridgeSummary}</p>
      </header>
      {activeSources.length === 0 ? (
        <p className="concierge-consultant__empty">Pipeline ready — awaiting journey aggregates.</p>
      ) : (
        <>
          <ul className="hidp-bridge-card__sources">
            {activeSources.map((source) => (
              <li key={source.id}>
                <span>{source.label}</span>
                <strong>{source.count}</strong>
              </li>
            ))}
          </ul>
          <ul className="hidp-bridge-card__insights">
            {topInsights.map((insight) => (
              <li key={insight.id}>
                <strong>{insight.title}</strong>
                <span>{insight.summary}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
