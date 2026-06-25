import {
  WORKFORCE_ACTIVE_REGIONS,
  WORKFORCE_FUTURE_REGIONS
} from "../../../constants/workforceManagement";
import type { RegionalAssignmentRecord, WorkforceProfileRecord } from "../../../types/workforceManagement";

type RegionalTeamCardProps = {
  profiles: WorkforceProfileRecord[];
  regionalAssignments: RegionalAssignmentRecord[];
};

export function RegionalTeamCard({ profiles, regionalAssignments }: RegionalTeamCardProps) {
  const profileNames = Object.fromEntries(profiles.map((profile) => [profile.id, profile.displayName]));

  return (
    <section className="workforce-card regional-team-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Regional teams</h3>
        <p>Regional operations coverage — Nigeria through Australia.</p>
      </header>
      <div className="regional-team-card__grid">
        {WORKFORCE_ACTIVE_REGIONS.map((region) => {
          const assignments = regionalAssignments.filter((item) => item.regionId === region.id);
          return (
            <article key={region.id} className="regional-team-card__region">
              <h4>{region.label}</h4>
              {assignments.length === 0 ? (
                <p className="concierge-consultant__empty">No assignments yet.</p>
              ) : (
                <ul>
                  {assignments.map((assignment) => (
                    <li key={assignment.id}>
                      <strong>{profileNames[assignment.profileId] ?? assignment.profileId}</strong>
                      <span>{assignment.isPrimary ? "Primary" : "Coverage"}</span>
                      <span>{assignment.coverageCities.join(", ")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
      <footer className="regional-team-card__future">
        <h4>Future regions (documented only)</h4>
        <p>
          {WORKFORCE_FUTURE_REGIONS.map((region) => region.label).join(" · ")} — not implemented in
          routing or assignment logic.
        </p>
      </footer>
    </section>
  );
}
