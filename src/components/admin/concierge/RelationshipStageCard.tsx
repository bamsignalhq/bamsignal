import { RELATIONSHIP_STAGE_LABELS, type RelationshipStage } from "../../../constants/relationshipFollowUp";
import type { RelationshipFollowUpRecord } from "../../../types/relationshipFollowUp";

type RelationshipStageCardProps = {
  record: RelationshipFollowUpRecord;
  onAdvance: (stage: RelationshipStage) => void;
};

const STAGES: RelationshipStage[] = [
  "still-talking",
  "getting-to-know",
  "exclusive",
  "relationship",
  "engaged",
  "married"
];

export function RelationshipStageCard({ record, onAdvance }: RelationshipStageCardProps) {
  return (
    <section className="relationship-stage concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>Journey stage</h3>
        <p>Current: <strong>{RELATIONSHIP_STAGE_LABELS[record.stage]}</strong></p>
      </header>
      <div className="relationship-stage__grid">
        {STAGES.map((stage) => (
          <button
            key={stage}
            type="button"
            className={`relationship-stage__chip${record.stage === stage ? " is-active" : ""}`}
            onClick={() => onAdvance(stage)}
            disabled={record.paused}
          >
            {RELATIONSHIP_STAGE_LABELS[stage]}
          </button>
        ))}
      </div>
    </section>
  );
}
