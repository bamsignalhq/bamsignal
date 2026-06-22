import {
  CELEBRATING_FIRST_STORIES_LABEL,
  FOUNDERS_WALL_PURPOSE_COPY,
  LEGACY_COUPLES_LABEL
} from "../../../../constants/foundersWall";
import type { FoundersCoupleViewModel } from "../../../../utils/foundersWallLogic";
import { LegacyStatusBadge } from "../../../signalConcierge/LegacyStatusBadge";

type FoundersTimelineProps = {
  couples: FoundersCoupleViewModel[];
};

export function FoundersTimeline({ couples }: FoundersTimelineProps) {
  return (
    <section className="founders-timeline concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{LEGACY_COUPLES_LABEL}</h3>
        <p>{FOUNDERS_WALL_PURPOSE_COPY}</p>
      </header>

      <p className="founders-timeline__labels">{CELEBRATING_FIRST_STORIES_LABEL}</p>

      {couples.length ? (
        <ol className="founders-timeline__list">
          {couples.map((couple) => (
            <li key={couple.journeyId} className="founders-timeline__item">
              <span className="founders-timeline__dot" aria-hidden />
              <div>
                <div className="founders-timeline__row">
                  <strong>Founder #{couple.founderOrder}</strong>
                  <span className="founders-timeline__journey">{couple.journeyId}</span>
                </div>
                <div className="founders-timeline__meta">
                  {couple.yearMet ? <span>Met {couple.yearMet}</span> : null}
                  {couple.marriageYear ? <span>Married {couple.marriageYear}</span> : null}
                  <LegacyStatusBadge status={couple.legacyStatus} compact />
                </div>
                {couple.storyCategoryLabels.length ? (
                  <p className="founders-timeline__categories">
                    {couple.storyCategoryLabels.join(" · ")}
                  </p>
                ) : null}
                <time dateTime={couple.honoredAt}>
                  Honored {new Date(couple.honoredAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="concierge-consultant__empty">
          Founder couples will appear here as the earliest Signal Concierge stories are honored.
        </p>
      )}
    </section>
  );
}
