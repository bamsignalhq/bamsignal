import type { RelationshipFollowUpRecord } from "../../../types/relationshipFollowUp";
import { addRelationshipCelebration } from "../../../utils/RelationshipFollowUpEngine";

type RelationshipAnniversaryCardProps = {
  record: RelationshipFollowUpRecord;
  onUpdated: () => void;
};

export function RelationshipAnniversaryCard({ record, onUpdated }: RelationshipAnniversaryCardProps) {
  const anniversaryMilestones = record.milestones.filter((item) =>
    ["first-anniversary", "five-years", "ten-years"].includes(item.milestoneId)
  );

  const handleCelebrate = () => {
    addRelationshipCelebration(record.id, "anniversary", "Anniversary recognized with warmth.");
    onUpdated();
  };

  return (
    <section className="relationship-anniversary concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>Anniversary</h3>
        <p>Celebrating Your Journey — annually and at key milestones.</p>
      </header>
      {anniversaryMilestones.length ? (
        <ul className="relationship-anniversary__list">
          {anniversaryMilestones.map((item) => (
            <li key={item.id}>
              <strong>{item.milestoneId.replace(/-/g, " ")}</strong>
              <time dateTime={item.milestoneAt}>{new Date(item.milestoneAt).toLocaleDateString()}</time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="concierge-consultant__empty">No anniversary milestones recorded yet.</p>
      )}
      <button type="button" className="concierge-consultant-btn" onClick={handleCelebrate}>
        Record anniversary celebration
      </button>
    </section>
  );
}
