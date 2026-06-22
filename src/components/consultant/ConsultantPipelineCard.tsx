import type { ConsultantCrmPipelineStage } from "../../types/consultantCrm";

type ConsultantPipelineCardProps = {
  stages: ConsultantCrmPipelineStage[];
  onStageSelect?: (stageId: string) => void;
};

export function ConsultantPipelineCard({ stages, onStageSelect }: ConsultantPipelineCardProps) {
  return (
    <section className="consultant-crm-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Pipeline</h3>
        <p>Relationship stages across your portfolio</p>
      </header>
      {stages.length === 0 ? (
        <p className="concierge-consultant__empty">No pipeline data yet.</p>
      ) : (
        <ul className="consultant-crm-pipeline">
          {stages.map((stage) => (
            <li key={stage.id}>
              <button
                type="button"
                className="consultant-crm-pipeline__stage"
                onClick={() => onStageSelect?.(stage.id)}
              >
                <span className="consultant-crm-pipeline__count">{stage.count}</span>
                <span className="consultant-crm-pipeline__copy">
                  <strong>{stage.label}</strong>
                  <small>{stage.hint}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
