import { RELATIONSHIP_MILESTONES, type RelationshipMilestoneId } from "../../../constants/relationshipFollowUp";
import type { RelationshipFollowUpRecord } from "../../../types/relationshipFollowUp";
import { addRelationshipMilestone } from "../../../utils/RelationshipFollowUpEngine";

type RelationshipMilestoneCardProps = {
  record: RelationshipFollowUpRecord;
  onUpdated: () => void;
};

export function RelationshipMilestoneCard({ record, onUpdated }: RelationshipMilestoneCardProps) {
  const handleRecord = (milestoneId: RelationshipMilestoneId) => {
    addRelationshipMilestone(record.id, milestoneId, new Date().toISOString());
    onUpdated();
  };

  return (
    <section className="relationship-milestone concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>Milestones</h3>
        <p>Progress markers — preserved permanently.</p>
      </header>
      <div className="relationship-milestone__grid">
        {RELATIONSHIP_MILESTONES.map((milestone) => {
          const recorded = record.milestones.some((item) => item.milestoneId === milestone.id);
          return (
            <button
              key={milestone.id}
              type="button"
              className={`relationship-milestone__chip${recorded ? " is-recorded" : ""}`}
              onClick={() => handleRecord(milestone.id)}
              disabled={recorded}
            >
              {milestone.label}
            </button>
          );
        })}
      </div>
      {record.milestones.length ? (
        <ul className="relationship-milestone__list">
          {record.milestones.map((item) => (
            <li key={item.id}>
              <strong>{RELATIONSHIP_MILESTONES.find((m) => m.id === item.milestoneId)?.label}</strong>
              <time dateTime={item.milestoneAt}>{new Date(item.milestoneAt).toLocaleDateString()}</time>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
