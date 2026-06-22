import { derivePipelinePhases } from "../../../utils/introductionEngineLogic";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";

type IntroductionTimelineProps = {
  record: IntroductionRecord;
};

export function IntroductionTimeline({ record }: IntroductionTimelineProps) {
  const phases = derivePipelinePhases(record);

  return (
    <section className="introduction-timeline concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Introduction pipeline</h3>
        <p>Thoughtful Introduction journey — private consultant workflow.</p>
      </header>
      <ol className="introduction-timeline__list">
        {phases.map((phase) => (
          <li
            key={phase.id}
            className={`introduction-timeline__item${phase.reached ? " introduction-timeline__item--reached" : ""}`}
          >
            <span className="introduction-timeline__dot" aria-hidden />
            <div>
              <p className="introduction-timeline__label">{phase.label}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
