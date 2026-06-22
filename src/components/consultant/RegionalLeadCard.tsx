import { REGIONAL_TEAM_ROLE_LABELS } from "../../constants/regionalConsultantTeams";
import type { RegionalTeamLead } from "../../types/regionalConsultantTeams";

type RegionalLeadCardProps = {
  lead: RegionalTeamLead | null;
  regionLabel: string;
};

export function RegionalLeadCard({ lead, regionLabel }: RegionalLeadCardProps) {
  return (
    <section className="regional-lead-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Regional Lead</h3>
        <p>Coordinates stewards and continuity in {regionLabel}.</p>
      </header>
      {!lead ? (
        <p className="concierge-consultant__empty">Regional lead not assigned yet.</p>
      ) : (
        <div className="regional-lead-card__body">
          <div className="regional-lead-card__identity">
            <strong>{lead.name}</strong>
            <span>{REGIONAL_TEAM_ROLE_LABELS[lead.teamRole]}</span>
            <small>{lead.email}</small>
          </div>
          <p>{lead.narrative}</p>
          <dl className="regional-lead-card__stats">
            <div>
              <dt>Members stewarded</dt>
              <dd>{lead.stewardCount}</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
