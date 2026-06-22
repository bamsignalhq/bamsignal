import {
  RELATIONSHIP_FOLLOW_UP_OUTCOME_LABELS,
  type RelationshipFollowUpOutcome
} from "../../../constants/relationshipFollowUp";
import type { RelationshipFollowUpRecord } from "../../../types/relationshipFollowUp";
import { setRelationshipFollowUpOutcome } from "../../../utils/RelationshipFollowUpEngine";

type RelationshipOutcomeCardProps = {
  record: RelationshipFollowUpRecord;
  onUpdated: () => void;
};

export function RelationshipOutcomeCard({ record, onUpdated }: RelationshipOutcomeCardProps) {
  const handleOutcome = (outcome: RelationshipFollowUpOutcome) => {
    setRelationshipFollowUpOutcome(record.id, outcome);
    onUpdated();
  };

  return (
    <section className="relationship-outcome concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>Journey outcome</h3>
        <p>Record where this relationship journey stands.</p>
      </header>
      {record.outcome ? (
        <p className="relationship-outcome__current">
          Current: <strong>{RELATIONSHIP_FOLLOW_UP_OUTCOME_LABELS[record.outcome]}</strong>
        </p>
      ) : null}
      <div className="relationship-outcome__grid">
        {(Object.entries(RELATIONSHIP_FOLLOW_UP_OUTCOME_LABELS) as [RelationshipFollowUpOutcome, string][]).map(
          ([id, label]) => (
            <button
              key={id}
              type="button"
              className={`relationship-outcome__chip${record.outcome === id ? " is-active" : ""}`}
              onClick={() => handleOutcome(id)}
            >
              {label}
            </button>
          )
        )}
      </div>
    </section>
  );
}
