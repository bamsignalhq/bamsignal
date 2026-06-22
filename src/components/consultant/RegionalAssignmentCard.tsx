import type { RegionalAssignmentRow } from "../../types/regionalConsultantTeams";

type RegionalAssignmentCardProps = {
  regionLabel: string;
  assignments: RegionalAssignmentRow[];
};

export function RegionalAssignmentCard({ regionLabel, assignments }: RegionalAssignmentCardProps) {
  return (
    <section className="regional-assignment-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{regionLabel} Assignments</h3>
        <p>Unassigned journeys awaiting regional consultant assignment.</p>
      </header>
      {assignments.length === 0 ? (
        <p className="concierge-consultant__empty">No pending regional assignments.</p>
      ) : (
        <ul className="regional-assignment-card__list">
          {assignments.map((row) => (
            <li key={row.id}>
              <div className="regional-assignment-card__identity">
                <strong>{row.memberName}</strong>
                <span>
                  {row.city} · {row.status}
                </span>
                {row.journeyId ? <small>Journey ID {row.journeyId}</small> : null}
              </div>
              <p>{row.detail}</p>
              {row.recommendedConsultant ? (
                <em>Recommended: {row.recommendedConsultant}</em>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
