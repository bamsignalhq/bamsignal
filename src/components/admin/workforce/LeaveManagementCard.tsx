import { WORKFORCE_LEAVE_TYPE_LABELS } from "../../../constants/workforceManagement";
import type { LeaveRequestRecord } from "../../../types/workforceManagement";

type LeaveManagementCardProps = {
  leaveRequests: LeaveRequestRecord[];
  profileNames: Record<string, string>;
};

export function LeaveManagementCard({ leaveRequests, profileNames }: LeaveManagementCardProps) {
  return (
    <section className="workforce-card leave-management-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Leave management</h3>
        <p>Approved leave automatically reduces consultant capacity.</p>
      </header>
      {leaveRequests.length === 0 ? (
        <p className="concierge-consultant__empty">No leave requests on record.</p>
      ) : (
        <ul className="leave-management-card__list">
          {leaveRequests.map((leave) => (
            <li key={leave.id}>
              <div>
                <strong>{profileNames[leave.profileId] ?? leave.profileId}</strong>
                <span>{WORKFORCE_LEAVE_TYPE_LABELS[leave.leaveType]}</span>
              </div>
              <p>
                {new Date(leave.startsAt).toLocaleDateString()} –{" "}
                {new Date(leave.endsAt).toLocaleDateString()}
              </p>
              <span className={`workforce-pill workforce-pill--${leave.status}`}>{leave.status}</span>
              <span className="leave-management-card__reduction">
                Capacity reduction: {Math.round(leave.capacityReduction * 100)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
