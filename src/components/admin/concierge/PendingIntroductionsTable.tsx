import {
  INTRODUCTION_OUTCOME_LABELS,
  INTRODUCTION_STATUS_LABELS
} from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import { getMemberDisplayName } from "../../../utils/IntroductionEngine";

type PendingIntroductionsTableProps = {
  records: IntroductionRecord[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
};

export function PendingIntroductionsTable({
  records,
  selectedId,
  onSelect
}: PendingIntroductionsTableProps) {
  if (!records.length) {
    return <p className="concierge-consultant__empty">No pending introductions.</p>;
  }

  return (
    <div className="introduction-pending-table">
      <table>
        <thead>
          <tr>
            <th>Members</th>
            <th>Status</th>
            <th>Consent</th>
            <th>Follow-up</th>
            <th>Outcome</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              className={selectedId === record.id ? "introduction-pending-table__row--active" : ""}
            >
              <td>
                <button type="button" className="introduction-pending-table__link" onClick={() => onSelect(record.id)}>
                  {getMemberDisplayName(record.memberAId)} & {getMemberDisplayName(record.memberBId)}
                </button>
              </td>
              <td>{INTRODUCTION_STATUS_LABELS[record.status]}</td>
              <td>
                {record.memberAApproved === true ? "A ✓" : "A …"} ·{" "}
                {record.memberBApproved === true ? "B ✓" : "B …"}
              </td>
              <td>
                {record.followUpDate
                  ? new Date(record.followUpDate).toLocaleDateString()
                  : "—"}
              </td>
              <td>{record.outcome ? INTRODUCTION_OUTCOME_LABELS[record.outcome] : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
