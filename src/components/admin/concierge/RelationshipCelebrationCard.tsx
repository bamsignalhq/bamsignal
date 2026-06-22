import {
  CELEBRATING_JOURNEY_LABEL,
  RELATIONSHIP_CELEBRATION_KINDS,
  type RelationshipCelebrationKind
} from "../../../constants/relationshipFollowUp";
import type { RelationshipFollowUpRecord } from "../../../types/relationshipFollowUp";
import { addRelationshipCelebration } from "../../../utils/RelationshipFollowUpEngine";

type RelationshipCelebrationCardProps = {
  record: RelationshipFollowUpRecord;
  onUpdated: () => void;
};

export function RelationshipCelebrationCard({ record, onUpdated }: RelationshipCelebrationCardProps) {
  const handleCelebrate = (kind: RelationshipCelebrationKind) => {
    addRelationshipCelebration(record.id, kind);
    onUpdated();
  };

  return (
    <section className="relationship-celebration concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>{CELEBRATING_JOURNEY_LABEL}</h3>
        <p>Warm recognition of meaningful progress.</p>
      </header>
      <div className="relationship-celebration__grid">
        {RELATIONSHIP_CELEBRATION_KINDS.map((kind) => (
          <button
            key={kind.id}
            type="button"
            className="relationship-celebration__chip"
            onClick={() => handleCelebrate(kind.id)}
          >
            {kind.label}
          </button>
        ))}
      </div>
      {record.celebrations.length ? (
        <ul className="relationship-celebration__list">
          {record.celebrations.map((entry) => (
            <li key={entry.id}>
              <strong>{RELATIONSHIP_CELEBRATION_KINDS.find((k) => k.id === entry.kind)?.label}</strong>
              <time dateTime={entry.at}>{new Date(entry.at).toLocaleDateString()}</time>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
