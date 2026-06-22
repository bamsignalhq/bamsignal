import { useMemo, useState } from "react";
import {
  CELEBRATING_PROGRESS_LABEL,
  COUPLE_HAPPINESS_FUTURE_CAPABILITIES,
  COUPLE_HAPPINESS_MANUAL_COPY,
  COUPLE_HAPPINESS_NOTE_EXAMPLES,
  COUPLE_HAPPINESS_NOTES_SUBCOPY,
  COUPLE_HAPPINESS_NOTES_TITLE,
  COUPLE_HAPPINESS_PRIVACY_COPY,
  COUPLE_HAPPINESS_RESERVED_COPY,
  JOURNEY_MEMORIES_LABEL,
  RELATIONSHIP_NOTES_LABEL
} from "../../../constants/coupleHappinessNotes";
import {
  addCoupleHappinessNote,
  getCoupleHappinessMemory,
  getCoupleHappinessNotes
} from "../../../utils/CoupleHappinessNotesEngine";
import { HappinessTimeline } from "./HappinessTimeline";
import { RelationshipMemoryCard } from "./RelationshipMemoryCard";

type CoupleHappinessCardProps = {
  journeyId: string;
  recordedBy?: string;
  onUpdated?: () => void;
};

export function CoupleHappinessCard({ journeyId, recordedBy, onUpdated }: CoupleHappinessCardProps) {
  const [body, setBody] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const notes = useMemo(() => {
    void refreshKey;
    return getCoupleHappinessNotes(journeyId);
  }, [journeyId, refreshKey]);

  const latestMemory = useMemo(() => {
    void refreshKey;
    return getCoupleHappinessMemory(journeyId);
  }, [journeyId, refreshKey]);

  const handleSubmit = () => {
    if (!body.trim()) return;
    addCoupleHappinessNote({ journeyId, body: body.trim(), recordedBy });
    setBody("");
    setRefreshKey((value) => value + 1);
    onUpdated?.();
  };

  return (
    <div className="couple-happiness-notes">
      <section className="couple-happiness-card concierge-consultant-card--glass">
        <header className="concierge-consultant-card__head">
          <h3>{COUPLE_HAPPINESS_NOTES_TITLE}</h3>
          <p>{COUPLE_HAPPINESS_NOTES_SUBCOPY}</p>
        </header>

        <p className="couple-happiness-card__labels">
          {RELATIONSHIP_NOTES_LABEL} · {JOURNEY_MEMORIES_LABEL} · {CELEBRATING_PROGRESS_LABEL}
        </p>

        <p className="couple-happiness-card__privacy">{COUPLE_HAPPINESS_PRIVACY_COPY}</p>
        <p className="couple-happiness-card__manual">{COUPLE_HAPPINESS_MANUAL_COPY}</p>

        <div className="concierge-private-notes__examples">
          {COUPLE_HAPPINESS_NOTE_EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              className="concierge-private-notes__chip"
              onClick={() => setBody(example)}
            >
              {example}
            </button>
          ))}
        </div>

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Relationship notes — warm, private, and never public…"
          rows={3}
          className="couple-happiness-card__input"
        />

        <button
          type="button"
          className="concierge-consultant-btn concierge-consultant-btn--primary"
          onClick={handleSubmit}
          disabled={!body.trim()}
        >
          Save relationship note
        </button>

        <div className="couple-happiness-card__future">
          <h4>Future ready</h4>
          <ul>
            {COUPLE_HAPPINESS_FUTURE_CAPABILITIES.map((capability) => (
              <li key={capability.id}>
                <strong>{capability.label}</strong>
                <span>{capability.description}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="couple-happiness-card__reserved">{COUPLE_HAPPINESS_RESERVED_COPY}</p>
      </section>

      <RelationshipMemoryCard memory={latestMemory} />

      <section className="couple-happiness-timeline-card concierge-consultant-card--glass cc-reveal">
        <header className="concierge-consultant-card__head">
          <h3>{RELATIONSHIP_NOTES_LABEL}</h3>
          <p>{JOURNEY_MEMORIES_LABEL}</p>
        </header>
        <HappinessTimeline notes={notes} />
      </section>
    </div>
  );
}
