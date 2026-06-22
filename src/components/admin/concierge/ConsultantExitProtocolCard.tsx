import { useState } from "react";
import {
  CONSULTANT_EXIT_PROTOCOL_SUBCOPY,
  CONSULTANT_EXIT_PROTOCOL_TITLE,
  CONSULTANT_EXIT_WORKFLOW_STEPS,
  JOURNEY_PRESERVED_ASSETS
} from "../../../constants/conciergeJourneyContinuity";
import type { ConciergeConsultantRecord } from "../../../types/conciergeConsultantDirectory";

type ConsultantExitProtocolCardProps = {
  consultant: ConciergeConsultantRecord;
  memberCount: number;
  consultants: { id: string; name: string }[];
  onExecute?: (input: { reason: string; successorConsultantId?: string }) => void;
};

export function ConsultantExitProtocolCard({
  consultant,
  memberCount,
  consultants,
  onExecute
}: ConsultantExitProtocolCardProps) {
  const [reason, setReason] = useState("");
  const [successorId, setSuccessorId] = useState("");
  const successors = consultants.filter((c) => c.id !== consultant.id);

  return (
    <section className="consultant-exit-protocol concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{CONSULTANT_EXIT_PROTOCOL_TITLE}</h3>
        <p>{CONSULTANT_EXIT_PROTOCOL_SUBCOPY}</p>
      </header>
      <div className="consultant-exit-protocol__status">
        <div>
          <span>Consultant</span>
          <strong>{consultant.name}</strong>
        </div>
        <div>
          <span>Active journeys</span>
          <strong>{memberCount}</strong>
        </div>
        <div>
          <span>Portfolio</span>
          <strong>{consultant.portfolioFrozen ? "Frozen" : "Active"}</strong>
        </div>
      </div>
      <ol className="consultant-exit-protocol__workflow">
        {CONSULTANT_EXIT_WORKFLOW_STEPS.map((step) => (
          <li key={step.id}>{step.label}</li>
        ))}
      </ol>
      <ul className="consultant-exit-protocol__preserved">
        {JOURNEY_PRESERVED_ASSETS.map((asset) => (
          <li key={asset}>{asset}</li>
        ))}
      </ul>
      {onExecute ? (
        <div className="consultant-exit-protocol__form">
          <label>
            Reason
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Consultant resigns — continuity protocol"
            />
          </label>
          <label>
            Successor steward (optional — transitions all journeys)
            <select value={successorId} onChange={(event) => setSuccessorId(event.target.value)}>
              <option value="">Admin review first</option>
              {successors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() =>
              onExecute({
                reason: reason.trim() || "Consultant exit — continuity protocol",
                successorConsultantId: successorId || undefined
              })
            }
          >
            Begin exit protocol
          </button>
        </div>
      ) : null}
    </section>
  );
}
