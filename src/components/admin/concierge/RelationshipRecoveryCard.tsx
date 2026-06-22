import { useState } from "react";
import { RELATIONSHIP_RECOVERY_REASONS, type RelationshipRecoveryReason } from "../../../constants/relationshipFollowUp";
import type { RelationshipFollowUpRecord } from "../../../types/relationshipFollowUp";
import { addRelationshipRecoveryNote } from "../../../utils/RelationshipFollowUpEngine";

type RelationshipRecoveryCardProps = {
  record: RelationshipFollowUpRecord;
  onUpdated: () => void;
};

export function RelationshipRecoveryCard({ record, onUpdated }: RelationshipRecoveryCardProps) {
  const [reason, setReason] = useState<RelationshipRecoveryReason>("communication-challenges");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!notes.trim()) return;
    addRelationshipRecoveryNote(record.id, reason, notes.trim());
    setNotes("");
    onUpdated();
  };

  return (
    <section className="relationship-recovery concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>Relationship recovery</h3>
        <p>Supportive notes — no blame language.</p>
      </header>
      <div className="relationship-recovery__form">
        <label>
          Focus area
          <select value={reason} onChange={(e) => setReason(e.target.value as RelationshipRecoveryReason)}>
            {RELATIONSHIP_RECOVERY_REASONS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What support does this journey need?"
          rows={3}
        />
        <button type="button" className="concierge-consultant-btn" onClick={handleSubmit} disabled={!notes.trim()}>
          Save recovery note
        </button>
      </div>
      {record.recoveryNotes.length ? (
        <ul className="relationship-recovery__list">
          {record.recoveryNotes.map((entry) => (
            <li key={entry.id}>
              <strong>{RELATIONSHIP_RECOVERY_REASONS.find((r) => r.id === entry.reason)?.label}</strong>
              <p>{entry.notes}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
