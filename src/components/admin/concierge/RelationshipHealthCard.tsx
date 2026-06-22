import {
  RELATIONSHIP_HEALTH_LEVELS,
  RELATIONSHIP_HEALTH_TITLE,
  type RelationshipHealthLevel
} from "../../../constants/relationshipFollowUp";
import type { RelationshipFollowUpRecord } from "../../../types/relationshipFollowUp";
import { setRelationshipHealth } from "../../../utils/RelationshipFollowUpEngine";

type RelationshipHealthCardProps = {
  record: RelationshipFollowUpRecord;
  onUpdated: () => void;
};

export function RelationshipHealthCard({ record, onUpdated }: RelationshipHealthCardProps) {
  const handleSelect = (level: RelationshipHealthLevel) => {
    setRelationshipHealth(record.id, level);
    onUpdated();
  };

  return (
    <section className="relationship-health concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>{RELATIONSHIP_HEALTH_TITLE}</h3>
        <p>Manual consultant assessment — never percentages.</p>
      </header>
      <div className="relationship-health__grid">
        {RELATIONSHIP_HEALTH_LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            className={`relationship-health__badge relationship-health__badge--${level.id}${
              record.healthLevel === level.id ? " is-active" : ""
            }`}
            onClick={() => handleSelect(level.id)}
          >
            {level.label}
          </button>
        ))}
      </div>
    </section>
  );
}
