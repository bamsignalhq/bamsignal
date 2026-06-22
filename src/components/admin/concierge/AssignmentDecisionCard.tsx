import { useState } from "react";
import { RECOMMENDATION_LEVEL_LABELS } from "../../../constants/consultantAssignment";
import type { AssignmentDecision } from "../../../types/consultantAssignment";
import { AssignmentRecommendationCard } from "./AssignmentRecommendationCard";

type AssignmentDecisionCardProps = {
  decision: AssignmentDecision;
  onConfirm: (decision: AssignmentDecision) => void | Promise<void>;
  confirming?: boolean;
};

export function AssignmentDecisionCard({
  decision,
  onConfirm,
  confirming = false
}: AssignmentDecisionCardProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <section className="assignment-decision concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Assignment decision</h3>
        <p>
          Optional admin action — assignments are never automatic. Confirm before stewarding{" "}
          {decision.memberName}.
        </p>
      </header>

      <dl className="assignment-decision__grid">
        <div>
          <dt>Member</dt>
          <dd>{decision.memberName}</dd>
        </div>
        <div>
          <dt>Recommended steward</dt>
          <dd>{decision.consultantName}</dd>
        </div>
        <div>
          <dt>Recommendation</dt>
          <dd>{RECOMMENDATION_LEVEL_LABELS[decision.level]}</dd>
        </div>
        {decision.journeyId ? (
          <div>
            <dt>Journey ID</dt>
            <dd>{decision.journeyId}</dd>
          </div>
        ) : null}
      </dl>

      <AssignmentRecommendationCard recommendation={decision.recommendation} title="Proposed stewardship" />

      <label className="assignment-decision__confirm">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
        />
        I confirm this steward assignment for {decision.memberName}.
      </label>

      <button
        type="button"
        className="concierge-consultant-btn"
        disabled={!acknowledged || confirming}
        onClick={() => void onConfirm(decision)}
      >
        {confirming ? "Assigning…" : "Confirm assignment"}
      </button>
    </section>
  );
}
