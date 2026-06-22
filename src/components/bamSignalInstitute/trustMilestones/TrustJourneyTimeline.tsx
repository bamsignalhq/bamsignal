import { TRUST_JOURNEY_LABEL, TRUST_MILESTONES_LABEL } from "../../../constants/trustMilestones";
import type { TrustJourneyTimelineViewModel } from "../../../utils/trustMilestonesLogic";

type TrustJourneyTimelineProps = {
  journey: TrustJourneyTimelineViewModel;
};

export function TrustJourneyTimeline({ journey }: TrustJourneyTimelineProps) {
  const sorted = [...journey.entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="tms-journey-timeline institute-glass">
      <header className="tms-journey-timeline__head">
        <h3>{TRUST_MILESTONES_LABEL}</h3>
        <p>
          {journey.trustJourneyLabel}: {journey.honorTitle}
        </p>
      </header>

      <p className="tms-journey-timeline__label">{TRUST_JOURNEY_LABEL}</p>

      {sorted.length ? (
        <ol className="tms-journey-timeline__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="tms-journey-timeline__item">
              <span className="tms-journey-timeline__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="tms-journey-timeline__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="tms-journey-timeline__empty">
          {TRUST_JOURNEY_LABEL} timelines will celebrate stewardship as milestones are earned.
        </p>
      )}

      <p className="tms-journey-timeline__status">{journey.statusLabel}</p>
    </section>
  );
}
