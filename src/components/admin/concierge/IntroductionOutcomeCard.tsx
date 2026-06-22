import {
  INTRODUCTION_OUTCOME_LABELS,
  type IntroductionOutcome
} from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import { setIntroductionOutcome } from "../../../utils/IntroductionEngine";

type IntroductionOutcomeCardProps = {
  record: IntroductionRecord;
  onUpdated: () => void;
};

export function IntroductionOutcomeCard({ record, onUpdated }: IntroductionOutcomeCardProps) {
  const handleOutcome = (outcome: IntroductionOutcome) => {
    setIntroductionOutcome(record.id, outcome);
    onUpdated();
  };

  return (
    <section className="introduction-outcome concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>Outcome</h3>
        <p>Record where this Introduction journey stands today.</p>
      </header>

      {record.outcome ? (
        <p className="introduction-outcome__current">
          Current: <strong>{INTRODUCTION_OUTCOME_LABELS[record.outcome]}</strong>
        </p>
      ) : (
        <p className="concierge-consultant__empty">No outcome recorded yet.</p>
      )}

      <div className="introduction-outcome__grid">
        {(Object.entries(INTRODUCTION_OUTCOME_LABELS) as [IntroductionOutcome, string][]).map(
          ([id, label]) => (
            <button
              key={id}
              type="button"
              className={`introduction-outcome__chip${record.outcome === id ? " is-active" : ""}`}
              onClick={() => handleOutcome(id)}
            >
              {label}
            </button>
          )
        )}
      </div>
    </section>
  );
}
