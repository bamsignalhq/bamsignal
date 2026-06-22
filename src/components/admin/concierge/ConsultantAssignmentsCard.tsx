import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../../../constants/signalConcierge";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";

type ConsultantAssignmentsCardProps = {
  members: ConciergeMemberRecord[];
  consultants: { id: string; name: string }[];
  onAssign?: (memberId: string, consultantId: string) => void;
  onTransfer?: (memberId: string, consultantId: string) => void;
  readOnly?: boolean;
};

export function ConsultantAssignmentsCard({
  members,
  consultants,
  onAssign,
  onTransfer,
  readOnly = false
}: ConsultantAssignmentsCardProps) {
  const assigned = members.filter((member) => member.assignedConsultantId);
  const unassigned = members.filter((member) => !member.assignedConsultantId);

  return (
    <section className="concierge-consultant-card concierge-consultant-card--glass cc-reveal consultant-assignments-card">
      <header className="concierge-consultant-card__head">
        <h3>Member Assignments</h3>
        <p>
          {assigned.length} assigned · {unassigned.length} awaiting consultant
        </p>
      </header>
      <ul className="consultant-assignments-card__list">
        {assigned.map((member) => (
          <li key={member.id} className="consultant-assignments-card__row">
            <div>
              <strong>{member.aboutYou.name}</strong>
              <span>
                {member.aboutYou.city} · {SIGNAL_CONCIERGE_STATUS_LABELS[member.status]}
              </span>
              <span className="consultant-assignments-card__consultant">
                {member.assignedConsultantName ?? "Unassigned"}
              </span>
            </div>
            {!readOnly && onTransfer ? (
              <label className="consultant-assignments-card__transfer">
                Journey transition
                <select
                  value={member.assignedConsultantId ?? ""}
                  onChange={(event) => onTransfer(member.id, event.target.value)}
                >
                  {consultants.map((consultant) => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </li>
        ))}
        {unassigned.map((member) => (
          <li key={member.id} className="consultant-assignments-card__row consultant-assignments-card__row--unassigned">
            <div>
              <strong>{member.aboutYou.name}</strong>
              <span>{SIGNAL_CONCIERGE_STATUS_LABELS[member.status]}</span>
            </div>
            {!readOnly && onAssign ? (
              <label className="consultant-assignments-card__transfer">
                Assign
                <select
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value) onAssign(member.id, event.target.value);
                  }}
                >
                  <option value="" disabled>
                    Choose consultant
                  </option>
                  {consultants.map((consultant) => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </li>
        ))}
      </ul>
      {!assigned.length && !unassigned.length ? (
        <p className="concierge-consultant__empty">No members in this portfolio.</p>
      ) : null}
    </section>
  );
}
