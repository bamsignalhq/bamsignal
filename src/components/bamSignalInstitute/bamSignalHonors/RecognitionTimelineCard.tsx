import {
  BAMSIGNAL_HONORS_FORBIDDEN_COPY,
  RECOGNITION_TIMELINE_LABEL
} from "../../../constants/bamSignalHonors";
import type { RecognitionTimelineViewModel } from "../../../utils/bamSignalHonorsLogic";

type RecognitionTimelineCardProps = {
  timeline: RecognitionTimelineViewModel;
};

export function RecognitionTimelineCard({ timeline }: RecognitionTimelineCardProps) {
  const sorted = [...timeline.entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <article className="bshn-timeline-card institute-glass">
      <header className="bshn-timeline-card__head">
        <h3>{timeline.title}</h3>
        <span className="bshn-timeline-card__badge">{RECOGNITION_TIMELINE_LABEL}</span>
      </header>
      <p className="bshn-timeline-card__legacy">{timeline.celebratingLegacyLabel}</p>
      <p className="bshn-timeline-card__category">{timeline.categoryTitle}</p>
      <p className="bshn-timeline-card__summary">{timeline.summary}</p>

      {sorted.length ? (
        <ol className="bshn-timeline-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="bshn-timeline-card__item">
              <span className="bshn-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="bshn-timeline-card__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="bshn-timeline-card__empty">Recognition timeline reserved — not live yet.</p>
      )}

      <p className="bshn-timeline-card__forbidden">
        Not {BAMSIGNAL_HONORS_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="bshn-timeline-card__status">{timeline.statusLabel}</p>
    </article>
  );
}
