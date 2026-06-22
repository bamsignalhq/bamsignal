import { TRUST_SCORE_LABEL } from "../../../constants/trustScoreInstitute";
import type { TrustTimelineCardViewModel } from "../../../utils/trustScoreInstituteLogic";

type TrustTimelineCardProps = {
  timeline: TrustTimelineCardViewModel;
};

export function TrustTimelineCard({ timeline }: TrustTimelineCardProps) {
  const sorted = [...timeline.entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="tscr-timeline-card institute-glass">
      <header className="tscr-timeline-card__head">
        <h3>{TRUST_SCORE_LABEL}</h3>
        <p>{timeline.levelTitle}</p>
      </header>

      {sorted.length ? (
        <ol className="tscr-timeline-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="tscr-timeline-card__item">
              <span className="tscr-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="tscr-timeline-card__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="tscr-timeline-card__empty">
          Trust timelines will appear as professionals earn standing over time.
        </p>
      )}

      <p className="tscr-timeline-card__status">{timeline.statusLabel}</p>
    </section>
  );
}
