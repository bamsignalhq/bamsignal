import {
  CONCIERGE_TRANSFER_SUBCOPY,
  CONCIERGE_TRANSFER_TITLE
} from "../../../constants/conciergeMemberOwnership";
import { CONCIERGE_COMMUNICATION_POLICY_COPY } from "../../../constants/conciergeConsultantCommunication";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { getMemberStewardId, getMemberStewardName } from "../../../utils/conciergeMemberStewardship";

type ConsultantTransferCardProps = {
  member: ConciergeMemberRecord;
  consultants: { id: string; name: string; status?: string }[];
  onTransfer?: (consultantId: string) => void;
  readOnly?: boolean;
};

export function ConsultantTransferCard({
  member,
  consultants,
  onTransfer,
  readOnly = false
}: ConsultantTransferCardProps) {
  const currentId = getMemberStewardId(member);
  const currentName = getMemberStewardName(member);
  const activeConsultants = consultants.filter(
    (consultant) => consultant.status !== "inactive" && consultant.status !== "frozen"
  );

  return (
    <section className="consultant-transfer-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{CONCIERGE_TRANSFER_TITLE}</h3>
        <p>{CONCIERGE_TRANSFER_SUBCOPY}</p>
      </header>
      <div className="consultant-transfer-card__current">
        <span>Current steward</span>
        <strong>{currentName ?? "Awaiting assignment"}</strong>
      </div>
      {!readOnly && onTransfer ? (
        <label className="consultant-transfer-card__select">
          Transition to consultant
          <select
            value={currentId ?? ""}
            onChange={(event) => {
              const nextId = event.target.value;
              if (nextId && nextId !== currentId) onTransfer(nextId);
            }}
          >
            <option value="" disabled>
              Select consultant
            </option>
            {activeConsultants.map((consultant) => (
              <option key={consultant.id} value={consultant.id}>
                {consultant.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <ul className="consultant-transfer-card__inherits">
        <li>Journey history</li>
        <li>Private notes</li>
        <li>Consultant summary</li>
        <li>Introductions</li>
        <li>Communication records</li>
        <li>Meeting history</li>
        <li>Follow-up tasks</li>
        <li>Relationship updates</li>
      </ul>
      <p className="consultant-transfer-card__policy">{CONCIERGE_COMMUNICATION_POLICY_COPY}</p>
    </section>
  );
}
