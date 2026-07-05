import { reportReasonLabel } from "../constants/safety";
import type { ReportRecord } from "../types";
import { unblockUser } from "../utils/safetyInteractions";

type BlockedUsersListProps = {
  blockedIds: string[];
  onUnblock: (profileId: string) => void;
};

export function BlockedUsersList({ blockedIds, onUnblock }: BlockedUsersListProps) {
  if (!blockedIds.length) {
    return <p className="community-trust__empty">You have not blocked anyone.</p>;
  }

  return (
    <ul className="community-trust__list">
      {blockedIds.map((id) => (
        <li key={id} className="community-trust__list-item">
          <span>Member {id.slice(0, 8)}</span>
          <button
            type="button"
            className="btn-secondary btn-compact"
            onClick={() => {
              unblockUser(id);
              onUnblock(id);
            }}
          >
            Unblock
          </button>
        </li>
      ))}
    </ul>
  );
}

type MemberReportsListProps = {
  reports: ReportRecord[];
};

export function MemberReportsList({ reports }: MemberReportsListProps) {
  if (!reports.length) {
    return <p className="community-trust__empty">No reports submitted yet.</p>;
  }

  return (
    <ul className="community-trust__list">
      {reports.map((report, index) => (
        <li key={`${report.profileId}-${report.at}-${index}`} className="community-trust__list-item">
          <div>
            <strong>{reportReasonLabel(report.reason)}</strong>
            <p className="community-trust__muted">
              Member {report.profileId.slice(0, 8)} · {new Date(report.at).toLocaleDateString()}
              {report.blocked ? " · Blocked" : ""}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
