import { JOURNEY_STAGE_LABELS, JOURNEY_HEALTH_STATUS_LABELS } from "../../../constants/journeyIntegrityAudit";
import type { JourneyRecord } from "../../../types/journeyIntegrityAudit";

type TimelineIntegrityCardProps = {
  journeys: JourneyRecord[];
};

export function TimelineIntegrityCard({ journeys }: TimelineIntegrityCardProps) {
  const stageRows = journeys.flatMap((journey) =>
    journey.stages.map((stage) => ({
      journeyId: journey.journeyId,
      stageId: stage.stageId,
      present: stage.present,
      status: stage.status,
      source: stage.source
    }))
  );

  const missingStages = stageRows.filter((row) => !row.present);

  return (
    <section className="timeline-integrity-card concierge-consultant-card--glass cc-reveal">
      <header className="timeline-integrity-card__head">
        <h3>Timeline integrity</h3>
        <p>
          Stage verification across Application → Events — {missingStages.length} missing stage(s).
        </p>
      </header>

      <div className="timeline-integrity-card__grid">
        {journeys.map((journey) => (
          <article key={journey.id} className="timeline-integrity-card__journey">
            <h4>{journey.journeyId}</h4>
            <ul>
              {journey.stages.map((stage) => (
                <li
                  key={`${journey.id}-${stage.stageId}`}
                  className={`timeline-integrity-card__stage timeline-integrity-card__stage--${stage.status}`}
                >
                  <span>{JOURNEY_STAGE_LABELS[stage.stageId]}</span>
                  <span>{stage.present ? "Present" : JOURNEY_HEALTH_STATUS_LABELS[stage.status]}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
