import { useState } from "react";
import {
  RELATIONSHIP_CHECK_IN_RHYTHMS,
  RELATIONSHIP_CHECK_IN_TYPES,
  type RelationshipCheckInRhythm,
  type RelationshipCheckInType,
  type RelationshipFollowUpOutcome
} from "../../../constants/relationshipFollowUp";
import type { RelationshipFollowUpRecord } from "../../../types/relationshipFollowUp";
import { recordRelationshipCheckIn } from "../../../utils/RelationshipFollowUpEngine";

type RelationshipCheckInCardProps = {
  record: RelationshipFollowUpRecord;
  onUpdated: () => void;
};

export function RelationshipCheckInCard({ record, onUpdated }: RelationshipCheckInCardProps) {
  const [rhythm, setRhythm] = useState<RelationshipCheckInRhythm>(record.nextCheckInRhythm ?? "7-days");
  const [checkInType, setCheckInType] = useState<RelationshipCheckInType>("general-happiness");
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState<RelationshipFollowUpOutcome>("positive-progress");

  const handleSubmit = () => {
    if (!notes.trim()) return;
    recordRelationshipCheckIn(record.id, { rhythm, checkInType, notes: notes.trim(), outcome });
    setNotes("");
    onUpdated();
  };

  return (
    <section className="relationship-checkin concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>Check-in rhythm</h3>
        <p>Warm, private progress reviews — never intrusive.</p>
      </header>
      {record.nextCheckInAt ? (
        <p className="relationship-checkin__next">
          Next check-in: {new Date(record.nextCheckInAt).toLocaleDateString()}
        </p>
      ) : null}
      <div className="relationship-checkin__form">
        <label>
          Rhythm
          <select value={rhythm} onChange={(e) => setRhythm(e.target.value as RelationshipCheckInRhythm)}>
            {RELATIONSHIP_CHECK_IN_RHYTHMS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <label>
          Check-in type
          <select value={checkInType} onChange={(e) => setCheckInType(e.target.value as RelationshipCheckInType)}>
            {RELATIONSHIP_CHECK_IN_TYPES.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <label>
          Outcome
          <select value={outcome} onChange={(e) => setOutcome(e.target.value as RelationshipFollowUpOutcome)}>
            <option value="positive-progress">Positive Progress</option>
            <option value="needs-more-time">Needs More Time</option>
            <option value="family-concerns">Family Concerns</option>
            <option value="distance-challenges">Distance Challenges</option>
            <option value="communication-issues">Communication Issues</option>
          </select>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How is the journey progressing?"
          rows={3}
        />
        <button type="button" className="concierge-consultant-btn" onClick={handleSubmit} disabled={!notes.trim()}>
          Record check-in
        </button>
      </div>
      {record.checkIns.length ? (
        <ul className="relationship-checkin__list">
          {record.checkIns.map((entry) => (
            <li key={entry.id}>
              <strong>{RELATIONSHIP_CHECK_IN_TYPES.find((t) => t.id === entry.checkInType)?.label}</strong>
              <p>{entry.notes}</p>
              <time dateTime={entry.at}>{new Date(entry.at).toLocaleDateString()}</time>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
