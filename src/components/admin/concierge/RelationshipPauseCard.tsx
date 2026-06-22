import { useState } from "react";
import type { RelationshipFollowUpRecord } from "../../../types/relationshipFollowUp";
import { pauseRelationshipFollowUp, resumeRelationshipFollowUp } from "../../../utils/RelationshipFollowUpEngine";

type RelationshipPauseCardProps = {
  record: RelationshipFollowUpRecord;
  onUpdated: () => void;
};

export function RelationshipPauseCard({ record, onUpdated }: RelationshipPauseCardProps) {
  const [pauseNotes, setPauseNotes] = useState(record.pauseNotes ?? "");

  const handlePause = () => {
    pauseRelationshipFollowUp(record.id, pauseNotes.trim() || undefined);
    onUpdated();
  };

  const handleResume = () => {
    resumeRelationshipFollowUp(record.id, "still-talking");
    onUpdated();
  };

  return (
    <section className="relationship-pause concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>Pause support</h3>
        <p>Pause or resume the journey — timeline preserved.</p>
      </header>
      {record.paused ? (
        <div className="relationship-pause__status">
          <p>Journey paused since {record.pausedAt ? new Date(record.pausedAt).toLocaleDateString() : "—"}</p>
          {record.pauseNotes ? <p className="relationship-pause__notes">{record.pauseNotes}</p> : null}
          <button type="button" className="concierge-consultant-btn" onClick={handleResume}>
            Resume journey
          </button>
        </div>
      ) : (
        <div className="relationship-pause__form">
          <textarea
            value={pauseNotes}
            onChange={(e) => setPauseNotes(e.target.value)}
            placeholder="Private pause notes (optional)"
            rows={2}
          />
          <button type="button" className="concierge-consultant-btn" onClick={handlePause}>
            Pause journey
          </button>
        </div>
      )}
    </section>
  );
}
