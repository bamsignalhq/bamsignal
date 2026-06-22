import type { LegacyTimelinePhaseView } from "../../utils/relationshipLegacyIndexLogic";

type LegacyTimelineCardProps = {
  phases: LegacyTimelinePhaseView[];
  celebrate?: boolean;
};

export function LegacyTimelineCard({ phases, celebrate = false }: LegacyTimelineCardProps) {
  return (
    <section
      className={`legacy-timeline-card${celebrate ? " legacy-timeline-card--celebrate" : ""}`}
    >
      <header className="legacy-timeline-card__head">
        <h4>Legacy Timeline</h4>
        <p>Every chapter preserved — from first meeting to legacy archive.</p>
      </header>
      <ol className="legacy-timeline-card__track">
        {phases.map((phase, index) => {
          const isLast = index === phases.length - 1;
          return (
            <li
              key={phase.id}
              className={`legacy-timeline-card__phase${
                phase.reached ? " legacy-timeline-card__phase--reached" : ""
              }`}
            >
              <span className="legacy-timeline-card__label">{phase.label}</span>
              {!isLast ? (
                <span className="legacy-timeline-card__connector" aria-hidden>
                  ↓
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      {celebrate ? (
        <p className="legacy-timeline-card__cheer">Your journey lives on in the Relationship Legacy Index™.</p>
      ) : null}
    </section>
  );
}
