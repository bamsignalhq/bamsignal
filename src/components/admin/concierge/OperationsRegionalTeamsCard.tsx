import { REGIONAL_TEAM_METRIC_LABELS } from "../../../constants/regionalConsultantTeams";
import type { OperationsCenterBundle } from "../../../types/operationsCenter";

type OperationsRegionalTeamsCardProps = {
  bundle: OperationsCenterBundle;
};

export function OperationsRegionalTeamsCard({ bundle }: OperationsRegionalTeamsCardProps) {
  const teams = bundle.regionalTeams.teams.filter((team) => team.metrics.members > 0 || team.metrics.consultants > 0);

  return (
    <section className="operations-regional-teams concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Regional Consultant Teams™</h3>
        <p>
          Institutional regional structure — directors, consultants, and assignments aggregated from
          the regional engine.
        </p>
      </header>
      {teams.length === 0 ? (
        <p className="concierge-consultant__empty">No regional team activity yet.</p>
      ) : (
        <div className="operations-regional-teams__table-wrap">
          <table className="operations-regional-teams__table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Director</th>
                {Object.values(REGIONAL_TEAM_METRIC_LABELS).map((label) => (
                  <th key={label}>{label}</th>
                ))}
                <th>Pending assignments</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.regionId}>
                  <td>
                    <strong>{team.regionLabel}</strong>
                    <small>{team.timezone}</small>
                  </td>
                  <td>{team.director?.name ?? "—"}</td>
                  <td>{team.metrics.members}</td>
                  <td>{team.metrics.consultants}</td>
                  <td>{team.metrics.introductions}</td>
                  <td>{team.metrics.relationships}</td>
                  <td>{team.metrics.engagements}</td>
                  <td>{team.metrics.marriages}</td>
                  <td>{team.metrics.legacyFamilies}</td>
                  <td>{team.assignments.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
