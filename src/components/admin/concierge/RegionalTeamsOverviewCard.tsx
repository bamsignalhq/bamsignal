import { REGIONAL_CONSULTANT_TEAMS_BRAND } from "../../../constants/regionalConsultantTeams";
import type { RegionalConsultantTeamsBundle } from "../../../types/regionalConsultantTeams";

type RegionalTeamsOverviewCardProps = {
  regionalTeams: RegionalConsultantTeamsBundle;
};

export function RegionalTeamsOverviewCard({ regionalTeams }: RegionalTeamsOverviewCardProps) {
  const activeTeams = [...regionalTeams.teams]
    .filter((team) => team.metrics.members > 0 || team.metrics.consultants > 0)
    .sort((left, right) => right.metrics.members - left.metrics.members)
    .slice(0, 6);

  return (
    <section className="regional-teams-overview-card journey-intelligence-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{REGIONAL_CONSULTANT_TEAMS_BRAND}</h3>
        <p>Top regions by active members — linked to institutional consultant structure.</p>
      </header>
      {activeTeams.length === 0 ? (
        <p className="concierge-consultant__empty">No regional team data yet.</p>
      ) : (
        <ul className="regional-teams-overview-card__list">
          {activeTeams.map((team) => (
            <li key={team.regionId}>
              <div>
                <strong>{team.regionLabel}</strong>
                <span>
                  {team.metrics.consultants} consultant{team.metrics.consultants === 1 ? "" : "s"}
                  {team.director ? ` · Director ${team.director.name}` : ""}
                </span>
              </div>
              <dl>
                <div>
                  <dt>Members</dt>
                  <dd>{team.metrics.members}</dd>
                </div>
                <div>
                  <dt>Relationships</dt>
                  <dd>{team.metrics.relationships}</dd>
                </div>
                <div>
                  <dt>Legacy families</dt>
                  <dd>{team.metrics.legacyFamilies}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
