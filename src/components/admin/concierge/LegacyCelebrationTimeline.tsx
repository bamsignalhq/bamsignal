import {
  CELEBRATIONS_LABEL,
  JOURNEY_MEMORIES_LABEL,
  LEGACY_CELEBRATION_ARCHITECTURE_SEED,
  surpriseEventLabel,
  type LegacyCelebrationTimelineEntry
} from "../../../constants/surpriseAndDelight";

type LegacyCelebrationTimelineProps = {
  entries?: LegacyCelebrationTimelineEntry[];
  showArchitecturePreview?: boolean;
};

export function LegacyCelebrationTimeline({
  entries,
  showArchitecturePreview = false
}: LegacyCelebrationTimelineProps) {
  const timelineEntries =
    entries ?? (showArchitecturePreview ? LEGACY_CELEBRATION_ARCHITECTURE_SEED : []);

  const sorted = [...timelineEntries].sort(
    (a, b) => new Date(a.milestoneAt).getTime() - new Date(b.milestoneAt).getTime()
  );

  if (!sorted.length) {
    return (
      <p className="concierge-consultant__empty legacy-celebration-timeline__empty">
        Legacy celebrations will appear here as journeys progress.
      </p>
    );
  }

  return (
    <ol className="legacy-celebration-timeline">
      {sorted.map((entry) => (
        <li key={entry.id} className="legacy-celebration-timeline__item">
          <span className="legacy-celebration-timeline__dot" aria-hidden />
          <div>
            <div className="legacy-celebration-timeline__row">
              <strong>{entry.label || surpriseEventLabel(entry.eventId)}</strong>
              <span className="legacy-celebration-timeline__status">{entry.status}</span>
            </div>
            {entry.note ? <p className="legacy-celebration-timeline__note">{entry.note}</p> : null}
            <time dateTime={entry.milestoneAt}>
              {new Date(entry.milestoneAt).toLocaleDateString()}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
