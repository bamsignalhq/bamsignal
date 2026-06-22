import {
  INTRODUCTION_CONFIDENCE_LEVELS,
  INTRODUCTION_CONFIDENCE_TITLE,
  type IntroductionConfidenceLevel
} from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import { updateIntroductionConfidence } from "../../../utils/IntroductionEngine";

type IntroductionConfidenceCardProps = {
  record: IntroductionRecord;
  onUpdated: () => void;
};

export function IntroductionConfidenceCard({ record, onUpdated }: IntroductionConfidenceCardProps) {
  const handleSelect = (level: IntroductionConfidenceLevel) => {
    updateIntroductionConfidence(record.id, level);
    onUpdated();
  };

  return (
    <section className="introduction-confidence concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>{INTRODUCTION_CONFIDENCE_TITLE}</h3>
        <p>Manual consultant assessment — never percentages or algorithmic scores.</p>
      </header>
      <div className="introduction-confidence__grid">
        {INTRODUCTION_CONFIDENCE_LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            className={`introduction-confidence__badge introduction-confidence__badge--${level.id}${
              record.confidenceLevel === level.id ? " is-active" : ""
            }`}
            onClick={() => handleSelect(level.id)}
          >
            {level.label}
          </button>
        ))}
      </div>
    </section>
  );
}
