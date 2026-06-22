import { ASSIGNMENT_MATCH_FACTOR_LABELS } from "../../../constants/consultantAssignment";
import type { AssignmentRecommendation } from "../../../types/consultantAssignment";
import { ConsultantCapacityBadge } from "./ConsultantCapacityBadge";
import { ConsultantWorkloadCard } from "./ConsultantWorkloadCard";

type AssignmentRecommendationCardProps = {
  recommendation: AssignmentRecommendation;
  title?: string;
};

export function AssignmentRecommendationCard({
  recommendation,
  title = "Assignment recommendation"
}: AssignmentRecommendationCardProps) {
  return (
    <section className="assignment-recommendation concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{title}</h3>
        <p>Consultant Assignment Engine™ — workload-balanced stewardship intelligence.</p>
      </header>
      <div className="assignment-recommendation__name">
        <strong>{recommendation.consultantName}</strong>
        <ConsultantCapacityBadge level={recommendation.level} workload={recommendation.workload.health} />
      </div>
      <p className="assignment-recommendation__narrative">{recommendation.narrative}</p>
      {recommendation.matchFactors.length > 0 ? (
        <ul className="assignment-recommendation__factors">
          {recommendation.matchFactors.map((factor) => (
            <li key={factor}>{ASSIGNMENT_MATCH_FACTOR_LABELS[factor]}</li>
          ))}
        </ul>
      ) : null}
      <ConsultantWorkloadCard workload={recommendation.workload} compact />
    </section>
  );
}
