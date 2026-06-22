import { useMemo, useState, type FormEvent } from "react";
import {
  ANNIVERSARY_TIMELINE_TITLE,
  CELEBRATING_YOUR_JOURNEY,
  JOURNEY_MILESTONE_DEFINITIONS,
  JOURNEY_MILESTONES_TITLE,
  type JourneyMilestoneId
} from "../../constants/journeyMilestones";
import type { JourneyMilestoneTimeline as JourneyMilestoneTimelineData } from "../../types/journeyMilestone";
import { recordJourneyMilestone } from "../../utils/journeyMilestoneStore";
import { JourneyMilestoneTimeline } from "./JourneyMilestoneTimeline";

type AnniversaryTimelineCardProps = {
  timeline: JourneyMilestoneTimelineData;
  readOnly?: boolean;
  celebrate?: boolean;
  onUpdated?: (timeline: JourneyMilestoneTimelineData) => void;
  recordedBy?: string;
};

export function AnniversaryTimelineCard({
  timeline,
  readOnly = false,
  celebrate = false,
  onUpdated,
  recordedBy
}: AnniversaryTimelineCardProps) {
  const [localTimeline, setLocalTimeline] = useState(timeline);
  const milestones = localTimeline.milestones;

  const recordedIds = useMemo(() => new Set(milestones.map((item) => item.id)), [milestones]);

  const handleRecord = (milestoneId: JourneyMilestoneId, milestoneAt: string, note?: string) => {
    const updated = recordJourneyMilestone(timeline.journeyId, {
      milestoneId,
      milestoneAt: new Date(milestoneAt).toISOString(),
      note,
      recordedBy
    });
    setLocalTimeline(updated);
    onUpdated?.(updated);
  };

  return (
    <section
      className={`anniversary-timeline-card concierge-consultant-card concierge-consultant-card--glass cc-reveal${
        celebrate ? " anniversary-timeline-card--celebrate" : ""
      }`}
    >
      <header className="anniversary-timeline-card__head">
        <p className="anniversary-timeline-card__eyebrow">{JOURNEY_MILESTONES_TITLE}</p>
        <h3>{celebrate ? CELEBRATING_YOUR_JOURNEY : ANNIVERSARY_TIMELINE_TITLE}</h3>
        <p className="anniversary-timeline-card__lede">
          {celebrate
            ? "Every chapter of your relationship — honored and preserved forever."
            : "Permanent relationship milestones — never removed from the Journey Archive."}
        </p>
      </header>

      <JourneyMilestoneTimeline milestones={milestones} celebrate={celebrate} />

      {!readOnly ? (
        <RelationshipMilestoneAdminForm
          recordedIds={recordedIds}
          onRecord={handleRecord}
          existingNotes={milestones}
        />
      ) : null}
    </section>
  );
}

type RelationshipMilestoneAdminFormProps = {
  recordedIds: Set<JourneyMilestoneId>;
  existingNotes: JourneyMilestoneTimelineData["milestones"];
  onRecord: (milestoneId: JourneyMilestoneId, milestoneAt: string, note?: string) => void;
};

function RelationshipMilestoneAdminForm({
  recordedIds,
  existingNotes,
  onRecord
}: RelationshipMilestoneAdminFormProps) {
  const [milestoneId, setMilestoneId] = useState<JourneyMilestoneId>("engaged");
  const [milestoneDate, setMilestoneDate] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!milestoneDate) return;
    onRecord(milestoneId, milestoneDate, note.trim() || undefined);
    setNote("");
  };

  const existingNote = existingNotes.find((item) => item.id === milestoneId)?.note ?? "";

  return (
    <form className="relationship-milestone-admin" onSubmit={handleSubmit}>
      <h4>Record milestone</h4>
      <p>Add engagement date, wedding date, or anniversary notes — milestones are permanent.</p>
      <div className="relationship-milestone-admin__grid">
        <label>
          Milestone
          <select
            value={milestoneId}
            onChange={(event) => setMilestoneId(event.target.value as JourneyMilestoneId)}
          >
            {JOURNEY_MILESTONE_DEFINITIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.emoji} {item.label}
                {recordedIds.has(item.id) ? " ✓" : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            value={milestoneDate}
            onChange={(event) => setMilestoneDate(event.target.value)}
            required
          />
        </label>
        <label className="relationship-milestone-admin__note">
          Anniversary note
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={existingNote || "Optional note for this milestone"}
            rows={2}
          />
        </label>
      </div>
      <button type="submit" className="concierge-consultant-btn concierge-consultant-btn--primary">
        Save milestone
      </button>
    </form>
  );
}
