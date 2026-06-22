import { ASSIGNMENT_CONFIDENCE_LABELS } from "../../../constants/consultantAssignment";
import { CONCIERGE_CONSULTANT_ROLE_LABELS } from "../../../constants/conciergeConsultantRoles";
import type { ConsultantRecommendation } from "../../../types/consultantAssignment";
import { AssignmentHealthBadge } from "./AssignmentHealthBadge";

type ConsultantRecommendationCardProps = {
  recommendation: ConsultantRecommendation;
};

export function ConsultantRecommendationCard({ recommendation }: ConsultantRecommendationCardProps) {
  return (
    <section className="consultant-recommendation concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Recommended consultant</h3>
        <p>Intelligent stewardship recommendation from Consultant Assignment Engine™.</p>
      </header>
      <div className="consultant-recommendation__name">
        <strong>{recommendation.consultantName}</strong>
        <span className={`consultant-recommendation__confidence consultant-recommendation__confidence--${recommendation.confidence}`}>
          {ASSIGNMENT_CONFIDENCE_LABELS[recommendation.confidence]}
        </span>
      </div>
      <div className="consultant-recommendation__meta">
        <div>
          <span>Primary role</span>
          <strong>{CONCIERGE_CONSULTANT_ROLE_LABELS[recommendation.primaryRole]}</strong>
        </div>
        <div>
          <span>Workload</span>
          <AssignmentHealthBadge health={recommendation.workload.health} />
        </div>
      </div>
      <p className="consultant-recommendation__workload">{recommendation.workload.summary}</p>
    </section>
  );
}
