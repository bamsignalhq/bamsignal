import { SAFETY_ACTIONS, SAFETY_ACTION_LABELS } from "../../../constants/safetyCenter";
import type { SafetyActionId } from "../../../constants/safetyCenter";

type SafetyActionCardProps = {
  actionsTaken: SafetyActionId[];
  onSelectAction?: (actionId: SafetyActionId) => void;
};

export function SafetyActionCard({ actionsTaken, onSelectAction }: SafetyActionCardProps) {
  return (
    <section className="safety-action-card concierge-consultant-card--glass cc-reveal">
      <header className="safety-action-card__head">
        <h3>Safety actions</h3>
        <p>Warning, restriction, suspension, ban, and law enforcement referral.</p>
      </header>

      <div className="safety-action-card__grid">
        {SAFETY_ACTIONS.map((action) => {
          const taken = actionsTaken.includes(action.id);
          return (
            <button
              key={action.id}
              type="button"
              className={`safety-action-chip${taken ? " is-taken" : ""}`}
              disabled={!onSelectAction}
              onClick={() => onSelectAction?.(action.id)}
            >
              {SAFETY_ACTION_LABELS[action.id]}
              {taken ? <span>Taken</span> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
