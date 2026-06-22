import { HOUSE_TIMELINE_LABEL } from "../../../constants/bamSignalHouse";
import type { HouseTimelineViewModel } from "../../../utils/bamSignalHouseLogic";

type HouseTimelinePageProps = {
  timelines: HouseTimelineViewModel[];
};

export function HouseTimelinePage({ timelines }: HouseTimelinePageProps) {
  return (
    <section className="bsho-page__section">
      <header className="bi-section-head">
        <h2>{HOUSE_TIMELINE_LABEL}</h2>
        <p>Founding House rollout — architecture preview, not scheduled openings.</p>
      </header>
      <div className="bsho-page__grid">
        {timelines.map((timeline) => {
          const sorted = [...timeline.entries].sort(
            (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
          );
          return (
            <article key={timeline.id} className="bsho-timeline-card institute-glass">
              <header className="bsho-timeline-card__head">
                <h3>{timeline.title}</h3>
                <span className="bsho-timeline-card__badge">{HOUSE_TIMELINE_LABEL}</span>
              </header>
              <p className="bsho-timeline-card__house">{timeline.houseTitle}</p>
              <p className="bsho-timeline-card__summary">{timeline.summary}</p>
              {sorted.length ? (
                <ol className="bsho-timeline-card__list">
                  {sorted.map((entry) => (
                    <li key={entry.id} className="bsho-timeline-card__item">
                      <span className="bsho-timeline-card__dot" aria-hidden />
                      <div>
                        <strong>{entry.label}</strong>
                        {entry.note ? <p className="bsho-timeline-card__note">{entry.note}</p> : null}
                        <time dateTime={entry.recordedAt}>
                          {new Date(entry.recordedAt).toLocaleDateString()}
                        </time>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="bsho-timeline-card__empty">House timeline reserved — not live yet.</p>
              )}
              <p className="bsho-timeline-card__status">{timeline.statusLabel}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
