import { REGIONAL_CONSULTANT_TEAMS_BRAND } from "../../constants/regionalConsultantTeams";
import type { ConsultantCrmRegionalTeam } from "../../types/consultantCrm";

type ConsultantRegionalTeamCardProps = {
  regionalTeam?: ConsultantCrmRegionalTeam;
};

export function ConsultantRegionalTeamCard({ regionalTeam }: ConsultantRegionalTeamCardProps) {
  if (!regionalTeam) return null;

  return (
    <section className="consultant-regional-team-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{REGIONAL_CONSULTANT_TEAMS_BRAND}</h3>
        <p>Your regional team context within the institutional structure.</p>
      </header>
      <dl className="consultant-regional-team-card__grid">
        <div>
          <dt>Region</dt>
          <dd>{regionalTeam.regionLabel}</dd>
        </div>
        <div>
          <dt>Team size</dt>
          <dd>{regionalTeam.teamSize}</dd>
        </div>
        <div>
          <dt>Regional director</dt>
          <dd>{regionalTeam.directorName ?? "Not assigned"}</dd>
        </div>
        <div>
          <dt>Regional members</dt>
          <dd>{regionalTeam.metrics.members}</dd>
        </div>
      </dl>
    </section>
  );
}
