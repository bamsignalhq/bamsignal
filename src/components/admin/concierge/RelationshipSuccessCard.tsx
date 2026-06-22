import { GROWING_TOGETHER_LABEL } from "../../../constants/relationshipFollowUp";
import type { RelationshipFollowUpRecord } from "../../../types/relationshipFollowUp";
import { archiveRelationshipFollowUp, getFollowUpMemberDisplayName } from "../../../utils/RelationshipFollowUpEngine";

type RelationshipSuccessCardProps = {
  record: RelationshipFollowUpRecord;
  onUpdated: () => void;
};

export function RelationshipSuccessCard({ record, onUpdated }: RelationshipSuccessCardProps) {
  const handleArchive = () => {
    archiveRelationshipFollowUp(record.id);
    onUpdated();
  };

  return (
    <section className="relationship-success concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>{GROWING_TOGETHER_LABEL}</h3>
        <p>Celebrate progress and prepare for Legacy Archive when ready.</p>
      </header>
      <p className="relationship-success__pair">
        {getFollowUpMemberDisplayName(record.memberAId)} & {getFollowUpMemberDisplayName(record.memberBId)}
      </p>
      <p className="relationship-success__intro">Introduction {record.introductionId}</p>
      {record.legacyArchiveReady ? (
        <p className="relationship-success__archived">Journey archived — timeline preserved permanently.</p>
      ) : (
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={handleArchive}
          disabled={record.stage !== "married" && record.stage !== "engaged" && record.stage !== "relationship"}
        >
          Mark ready for Legacy Archive
        </button>
      )}
    </section>
  );
}
