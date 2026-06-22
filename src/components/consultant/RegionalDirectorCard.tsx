import { REGIONAL_TEAM_ROLE_LABELS } from "../../constants/regionalConsultantTeams";
import type { RegionalTeamDirector } from "../../types/regionalConsultantTeams";

type RegionalDirectorCardProps = {
  director: RegionalTeamDirector | null;
  regionLabel: string;
};

export function RegionalDirectorCard({ director, regionLabel }: RegionalDirectorCardProps) {
  return (
    <section className="regional-director-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Regional Director</h3>
        <p>Institutional lead for {regionLabel} — consultants remain operational stewards.</p>
      </header>
      {!director ? (
        <p className="concierge-consultant__empty">Regional director not assigned yet.</p>
      ) : (
        <div className="regional-director-card__body">
          <div className="regional-director-card__identity">
            <strong>{director.name}</strong>
            <span>{REGIONAL_TEAM_ROLE_LABELS[director.teamRole]}</span>
            <small>{director.email}</small>
          </div>
          <p>{director.narrative}</p>
          <dl className="regional-director-card__stats">
            <div>
              <dt>Members stewarded</dt>
              <dd>{director.stewardCount}</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
