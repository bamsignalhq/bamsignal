import { REGIONAL_TEAM_ROLE_LABELS } from "../../constants/regionalConsultantTeams";
import type { RegionalTeamMember } from "../../types/regionalConsultantTeams";

type RegionalTeamCardProps = {
  regionLabel: string;
  consultants: RegionalTeamMember[];
};

export function RegionalTeamCard({ regionLabel, consultants }: RegionalTeamCardProps) {
  return (
    <section className="regional-team-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{regionLabel} Team</h3>
        <p>Stewards assigned to this region — members belong to BamSignal.</p>
      </header>
      {consultants.length === 0 ? (
        <p className="concierge-consultant__empty">Team forming — consultants will be assigned here.</p>
      ) : (
        <ul className="regional-team-card__roster">
          {consultants.map((consultant) => (
            <li key={consultant.consultantId}>
              <div className="regional-team-card__identity">
                <strong>{consultant.name}</strong>
                <span>{REGIONAL_TEAM_ROLE_LABELS[consultant.teamRole]}</span>
              </div>
              <em className={`regional-team-card__status regional-team-card__status--${consultant.status}`}>
                {consultant.status}
              </em>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
