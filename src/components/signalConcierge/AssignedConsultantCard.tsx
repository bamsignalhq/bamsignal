import type { AssignedConsultantSummary } from "../../types/memberDashboard";

type AssignedConsultantCardProps = {
  consultant: AssignedConsultantSummary;
};

export function AssignedConsultantCard({ consultant }: AssignedConsultantCardProps) {
  return (
    <section className="member-dashboard-card assigned-consultant-card signal-concierge-glass sc-reveal">
      <header className="member-dashboard-card__head">
        <h3>Assigned consultant</h3>
        <p>Your private journey steward.</p>
      </header>
      {consultant.name ? (
        <p className="assigned-consultant-card__name">{consultant.name}</p>
      ) : (
        <p className="assigned-consultant-card__pending">Awaiting steward assignment</p>
      )}
      <p className="assigned-consultant-card__message">{consultant.message}</p>
    </section>
  );
}
